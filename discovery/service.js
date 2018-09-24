'use strict';

const es = require('../config/index');
const fs = require('fs');
const config = require('../config/config');
const request  = require("request");
const Repository = require('../libs/repository');
const Helper = require("./helper");

/*
 * Create array of items for the collection view's object display
 */
exports.getTopLevelCollections = function(pageNum=1, callback) {
  Repository.getRootCollections().catch(error => {
    console.log(error);
    callback({status: false, message: error, data: null});
  })
  .then( response => {
      var collections = {
        list: [],
        count: 0
      }
      if(response && response.length > 0) {
        var list = Helper.createItemList(JSON.parse(response));
        callback({status: true, data: list});
      }
      else {

        // No data from repository:
        // Use the index to retrieve the top-level collection objects
        var data = {  
          index: config.elasticsearchIndex,
          type: 'data',
          body: {
            // from : (pageNum - 1) * config.maxCollectionsPerPage, 
            // size : config.maxCollectionsPerPage,
            from: 0,
            size: 1000,
            query: {
                "match": {
                  "is_member_of_collection": config.topLevelCollectionPID
                }
            }
          }
        }

        // Query the index for root collection members
        es.search(data, function (error, response, status) {
          var responseData = {};
          if (error){
            callback({status: false, message: error, data: null});
          }
          else {
            var results = [];

            // Create the result list
            for(var index of response.hits.hits) {
              results.push(index._source);
            }

            // Sort the results by title string in alphabetic order
            var sorted = Helper.sortSearchResultObjects(results);

            collections.count = response.hits.total;
            collections.list = Helper.createItemList(sorted);
            callback({status: true, data: collections});
          }
        });
      }
  });
}

// Obsolete
exports.getCollectionsInCommunity = function(communityID, callback) {
  Repository.getCollections(communityID).catch(error => {
    callback({status: false, message: error, data: null});
  })
  .then( response => {
      if(response) {
        var list = Helper.createItemList(JSON.parse(response));
        callback({status: true, data: list});
      }
  });
}

exports.getObjectsInCollection = function(collectionID, pageNum=1, facets=null, callback) {
  Repository.getCollectionObjects(collectionID).catch(error => {
    callback({status: false, message: error, data: null});
  })
  .then( response => {
      var collection = {
        list: [], 
        title: "",
        facets: {},
        count: 0
      };

      // Get facets for this collection
      var facetAggregations = Helper.getFacetAggregationObject(config.facets);

      // Validate repository response
      if(response && response.length > 0) {
        collection.count = response.length;

        var list = Helper.createItemList(JSON.parse(response));
        callback({status: true, data: list});
      }
      else {

        // If facet data is present, add it to the search
        var matchFacetFields = [];
        if(facets) {
          var indexKey, count=0;
          for(var key in facets) {
            for(var index of facets[key]) {
              var q = {};
              count++;

              // Get the index key from the config facet list, using the stored facet name
              indexKey = config.facets[key];

              // Add to the main ES query object
              q[indexKey] = index;
              matchFacetFields.push({
                "match_phrase": q
              });
            }
          }
        }

        matchFacetFields.push({
            "match_phrase": {
              "is_member_of_collection": collectionID
            }
        });

        // Use local index to find the collection children
        var data = {  
          index: config.elasticsearchIndex,
          type: 'data',
          body: {
            from : (pageNum - 1) * config.maxCollectionsPerPage,
            size : config.maxCollectionsPerPage,
            query: {
                // "match": {
                //   //"pid": "codu:*" 
                //   "is_member_of_collection": collectionID.substring(config.institutionPrefix.length) 
                // }
                "bool": {
                  "must": matchFacetFields
                }
            },
            aggs: facetAggregations
          }
        }
 
        // Get children objects of this collection
        es.search(data, function (error, response, status) {

          var responseData = {};
          if (error){
            callback({status: false, message: error, data: null});
          }
          else if(data.body.from > response.hits.total) {
            callback({status: false, message: "Invalid page number", data: null});
          }
          else {
            var results = [];

            // Create the result list
            for(var index of response.hits.hits) {
              results.push(index._source);
            }

            collection.list = Helper.createItemList(results);
            collection.facets = response.aggregations;
            collection.count = response.hits.total;

            // Get this collection's title
            fetchObjectByPid(collectionID, function(response) {
              if(response.status) {
                collection.title = response.data.title;
                callback({status: true, data: collection});
              }
              else {
                collection.title = "";
                callback({status: false, message: response.message, data: []});
              }
            });
          }
        });
      }
  });
}

var fetchObjectByPid = function(pid, callback) {
  var objectData = {
    pid: null
  };

  // Get an exact match on the id and the namespace.  Extract both segments of the id, and require a match on both
  var temp, fields, matchFields = [], segments = pid.split(":");
  for(var index in segments) {
    temp = {}, fields = {};
    temp['pid'] = segments[index];
    fields['match'] = temp;
    matchFields.push(fields);
  }

  // Search for the pid segments as an "and" search.  This should only return one result.
  es.search({
      index: config.elasticsearchIndex,
      type: "data",
      body: {
        query: {
          "bool": {
            "must": matchFields
          }
        }
      }
  }, function (error, response) {
      if(error) {
        callback({status: false, message: error, data: null});
      }
      else if(response.hits.total > 0) {
        objectData = response.hits.hits[0]._source;
        callback({status: true, data: objectData});
      }
      else {
        callback({status: true, message: "Item not found", data: {}});
      }
  });
}
exports.fetchObjectByPid = fetchObjectByPid;

var getFacets = function (callback) {

    // Build elasticsearch aggregations object from config facet list
    var aggs = {}, field;
    for(var key in config.facets) {
      field = {};
      field['field'] = config.facets[key] + ".keyword";
      field['size'] = config.facetLimit;
      aggs[key] = {
        terms: field
      };
    }

    es.search({
        index: config.elasticsearchIndex,
        type: 'data',
        body: {
            "size": 0,
            "aggregations": aggs
        }
    }).then(function (body) {
        callback(body.aggregations);
    }, function (error) {
        callback(error.body.error.reason);
    });
}
exports.getFacets = getFacets;

exports.getDatastream = function(objectID, datastreamID, callback) {
  Repository.streamData(objectID, datastreamID, function(stream) {
    callback(stream);
  }) 
}

exports.getThumbnailPlaceholderStream = function(callback) {
  var rstream = fs.createReadStream(config.tnPlaceholderPath);
  callback(rstream, null);
}

exports.getCollectionHeirarchy = function(pid, callback) {
  getParentData(pid, [], callback);
}

/*
 * Recursively trace the current collection's heirarchy.  Builds an array of object data, for the current object and its parent trace.  Terminates if the parent is [root]
 */
var getParentData = function(pid, collections, callback) {
  fetchObjectByPid(pid, function(response) {
    var title = "",
        url = config.rootUrl + "/collection/" + pid;
    if(typeof response.data.title == "object") {
      title = response.data.title[0];
    }
    else {
      title = response.data.title || "Untitled Collection";
    }
    collections.push({pid: response.data.pid, name: title, url: url});

    if(response.data.is_member_of_collection.indexOf("root") >= 0) {
      collections.push({pid: config.topLevelCollectionPID, name: config.topLevelCollectionName, url: config.rootUrl});
      callback(collections.reverse());
    }
    else {
      getParentData(response.data.is_member_of_collection, collections, callback);
    }
  });
}