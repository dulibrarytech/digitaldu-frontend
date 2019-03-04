 /**
 * @file 
 *
 * Discovery service functions
 *
 * @typedef {Object} Response
 * @property {boolean} status Function has executed successfully, no local or remote errors
 * @property {string} message A message to return to the caller
 * @property {Object} data Object containing the return data
 */

'use strict';

const es = require('../config/index');
const fs = require('fs');
const config = require('../config/config');
const request  = require("request");
const Repository = require('../libs/repository');
const Helper = require("./helper");
const IIIF = require("../libs/IIIF");

/**
 * Return a list of the root (or top) level collections
 *
 * @param {number} pageNum If 0, return all root collections. If >= 1, use elasticsearch page results (TODO)
 * @param {function} callback
 *
 * @typedef (Object) Response.data Collection data
 * @property {number} count Number of root collections found
 * @property {Array} list Array of collection objects
 * @return {Response} 
 */
exports.getTopLevelCollections = function(pageNum=0, callback) {
  Repository.getRootCollections().catch(error => {
    callback(error, null);
  })
  .then( response => {
      var collections = {
        list: [],
        count: 0
      }
      if(response && response.length > 0) {
        var list = Helper.createItemList(JSON.parse(response));

        callback(null, list);
      }
      else {

        // If there are no results from the Repository, use the index to retrieve the top-level collection objects
        var data = {  
          index: config.elasticsearchIndex,
          type: 'data',
          body: {
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
          if(error){
            callback(error, null);
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

            callback(null, collections);
          }
        });
      }
  });
}

/**
 * Return a list of collections in the specified community
 *
 * @param {number} communityID
 * @param {function} callback
 *
 * @typedef (Object) Response.data 
 * @property {Array} list List of collections in the community
 * @return {Response} 
 */
exports.getCollectionsInCommunity = function(communityID, callback) {
  Repository.getCollections(communityID).catch(error => {
    callback(error, null);
  })
  .then( response => {
      if(response) {
        var list = Helper.createItemList(JSON.parse(response));
        callback(null, list);
      }
      else {
        callback("Error retrieving collections", null);
      }
  });
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getObjectsInCollection = function(collectionID, pageNum=1, facets=null, callback) {
  Repository.getCollectionObjects(collectionID).catch(error => {
    callback(error, null);
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
        callback(null, list);
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

        var restrictions = [];
        restrictions.push({
          "exists": {
              "field": "is_child_of"
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
                "bool": {
                  "must": matchFacetFields,
                  "must_not": restrictions
                }
            },
            aggs: facetAggregations
          }
        }

        // Get children objects of this collection
        es.search(data, function (error, response, status) {

          var responseData = {};
          if (error){
            callback(error, null);
          }
          else if(data.body.from > response.hits.total) {
            callback("Invalid page number", null);
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
            fetchObjectByPid(collectionID, function(error, object) {
              if(error) {
                collection.title = "";
                callback(error, []);
              }
              else if(object.object_type != "collection") {
                callback("Invalid collection: " + object.pid, []);
              }
              else {
                collection.title = object.title[0];
                callback(null, collection);
              }
            });
          }
        });
      }
  });
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getTitleString = function(pids, titles, callback) {
  var pidArray = [], pid;
  if(typeof pids == 'string') {
    pidArray.push(pids);
  }
  else {
    pidArray = pids;
  }
  pid = pidArray[ titles.length ];
  
  // Get the title data for the current pid
  fetchObjectByPid(pid, function (error, response) {
    if(error) {
      callback(error, titles);
    }
    else {
      titles.push({
        name: response.title[0],
        pid: pid
      });

      if(titles.length == pidArray.length) {
        // Have found a title for each pid in the input array
        callback(null, titles);
      }
      else {
        // Get the title for the next pid in the pid array
        getTitleString(pidArray, titles, callback);
      }
    }
  });
}

/**
 * 
 *
 * @param 
 * @return 
 */
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
        callback(error, null);
      }
      else if(response.hits.total > 0) {
        objectData = response.hits.hits[0]._source;
        callback(null, objectData);
      }
      else {
        callback("Object not found", null);
      }
  });
}
exports.fetchObjectByPid = fetchObjectByPid;

/**
 * TODO move to search service
 *
 * @param 
 * @return 
 */
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
        callback(null, body.aggregations);
    }, function (error) {
        callback(error.body.error.reason, null);
    });
}
exports.getFacets = getFacets;

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getDatastream = function(objectID, datastreamID, callback) {
  
  // Find datastream ID by object type
  if(datastreamID == "object") {
    fetchObjectByPid(objectID, function(error, object) {

      // Get the datastream ID from the configuration based on the object mime type
      datastreamID = Helper.getDsType(object.mime_type);
      Repository.streamData(objectID, datastreamID, function(error, stream) {
        if(error) {
          callback(error, null);
        }
        else {
          callback(null, stream);
        }
      });
    });
  }

  // Stream using the requested datastream ID
  else {
    Repository.streamData(objectID, datastreamID, function(error, stream) {
      if(error) {
        callback(error, null);
      }
      else {
        callback(null, stream);
      }
    });
  } 
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getThumbnailPlaceholderStream = function(callback) {
  var rstream = fs.createReadStream(config.tnPlaceholderPath);
  callback(null, rstream);
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getCollectionHeirarchy = function(pid, callback) {
  getParentTrace(pid, [], callback);
}

/**
 * 
 *
 * @param 
 * @return 
 */
var getParentTrace = function(pid, collections, callback) {
  fetchObjectByPid(pid, function(error, response) {
      var title = "",
          url = config.rootUrl + "/collection/" + pid;

      if(error) {
        callback(error, null);
      }
      else {
        // There is > 1 title associated with this object, use the first one
        if(typeof response.title == "object") {
          title = response.title[0];
        }
        else {
          title = response.title || "Untitled Collection";
        }
        collections.push({pid: response.pid, name: title, url: url});

        // There is > 1 collection parents associated with this object.  Use the first one for trace
        if(typeof response.is_member_of_collection == 'object') {
          getParentTrace(response.is_member_of_collection[0], collections, callback);
        }
        else if(response.is_member_of_collection.indexOf("root") >= 0) {
          collections.push({pid: config.topLevelCollectionPID, name: config.topLevelCollectionName, url: config.rootUrl});
          callback(collections.reverse());
        }
        else {
          getParentTrace(response.is_member_of_collection, collections, callback);
        }
      }
  });
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.retrieveChildren = function(object, callback) {
  callback(object.children || []);
}

exports.getManifestObject = function(pid, callback) {
  var object = {}, children = [];
  fetchObjectByPid(pid, function(error, response) {
    if(error) {
      callback(error, JSON.stringify({}));
    }
    else {

      // Create object for IIIF
      var object = response,
      container = {
        resourceID: object.pid,
        title: object.title,
        description: object.abstract,
        metadata: {
          "Title": object.title,
          "Creator": object.creator
        }
      };

      // Create children array for IIIF
      var children = [], resourceUrl;

      // Compound objects
      if(Helper.isParentObject(object)) {
        
        // Add the child objects of the main parent object
        for(var key in object.children) {
          resourceUrl = config.rootUrl + "/datastream/" + object.children[key].url + "/" + Helper.getDsType(object.children[key].mimetype);

          // Add the data
          children.push({
            label: object.children[key].title,
            sequence: object.children[key].sequence || key,
            description: object.children[key].description,
            format: object.children[key].mimetype,
            type: Helper.getIIIFObjectType(object.children[key].mimetype) || "",
            resourceID: object.children[key].url,
            resourceUrl: resourceUrl,
            thumbnailUrl: config.rootUrl + "/datastream/" + object.children[key].url + "/" + Helper.getDsType("thumbnail")
          });
        }
      }

      // Single objects
      else {
        resourceUrl = config.rootUrl + "/datastream/" + object.pid + "/" + Helper.getDsType(object.mime_type);

        // Add the data
        children.push({
          label: object.title,
          sequence: "1",
          description: object.abstract,
          format: object.mime_type,
          type: Helper.getIIIFObjectType(object.mime_type) || "",
          resourceID: object.pid,
          resourceUrl: resourceUrl,
          thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/" + Helper.getDsType("thumbnail")
        });
      }

      IIIF.getManifest(container, children, function(error, manifest) {
        // TODO handle the error
        if(error) {
          callback(error, []);
        }
        else {
          callback(null, manifest);
        }
      });
    }
  });
}