'use strict';

const es = require('../config/index');
const config = require('../config/config');
const request  = require("request");
//const Repository = require('../libs/repository');
const Repository = require('../libs/repository.fedora'),
      LibRepo = require('../libs/repository');
const Helper = require("./helper");


/*
 * Create view model data object for display items
 *
 * @param object items  The items to include in the list
 */
var createItemList= function(items) {
  var itemList = [], tn, pid, title, description, display, path;
  for(var item of items) {
      
    // Get the title and description data from the item
    if(item.title && item.title != "") {
      title = item.title || config.noTitlePlaceholder;
      description = item.description || "";
    }

    // If the title field is absent from this item, try to get the title from the display record
    else if(item.display_record && typeof item.display_record == 'string') {
        try {
          display = JSON.parse(item.display_record);
        }
        catch(e) {
          console.log("Error: invalid display record JSON on object: " + item.pid);
          continue;
        }

        title = display.title || config.noTitlePlaceholder;
        description = display.description || display.abstract || "";
    }

    // Use the default values
    else {
      title = config.noTitlePlaceholder;
      description = "";
    }
      
    // This is a list of communities
    if(item.pid) {
      // tn = Repository.getCollectionTN(item.pid);
      tn = Repository.getDatastreamUrl("tn", item.pid);
      pid = item.pid
    }
    // This is a list of objects
    else if(item.mime_type) {
      tn = Repository.getDatastreamUrl("tn", item.pid);
      pid = item.pid
    }
    // This is a list of collections
    else {
      tn = Repository.getDatastreamUrl("tn", item.pid);
      pid = item.id
    }

    // Add collection or object path
    if(item.object_type && item.object_type == config.collectionMimeType) {
      path = "/repository/collection";
    }
    else {
      path = "/repository/object";
    }

    // Pusg the current item to the list
    itemList.push({
        pid: pid,
        tn: tn,
        title: title,
        description: description,
        path: path
      });
  }
  return itemList;
}

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
        var list = createItemList(JSON.parse(response));
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
            collections.list = createItemList(sorted);
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
        var list = createItemList(JSON.parse(response));
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

        var list = createItemList(JSON.parse(response));
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

            collection.list = createItemList(results);
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

exports.searchIndex = function(query, type, facets=null, collection=null, pageNum=1, callback) {

    // Build elasticsearch matchfields object for query: this object enables field specific searching
    var field = { match: "" };
    var matchFields = [], results = [];
    var queryType;

    // This is a string literal search if the query is contained by parentheses.  Use 'match_phrase'
    if(query[0] == '"' && query[ query.length-1 ] == '"') {
      query = query.replace(/"/g, '');
      queryType = "match_phrase";
    }

    // This is a wildcard search.  Use 'wildcard'
    else if(query.indexOf('*') >= 0) {
      queryType = "wildcard";
    }

    // This is a regular term search.  Use 'match'  Query will be tokenized searched with an AND operator
    else  {
      var qtemp = query;
      query = {
        "query": qtemp,
        "operator": "and"
      }
      queryType = "match";
    }

    // Search specified field (type) (if a searchfield is selected)
    if(Array.isArray(type)) {
        //query = "*" + query + "*";
        type.forEach(function(type) {
          var q = {}, tempObj = {};

          type = config.searchFieldNamespace + type;
          q[type] = query;

          tempObj[queryType] = q;
          matchFields.push(tempObj);
        })
    }

    // Search all available fields (searchfield == All)
    else {

        var q = {}, tempObj = {};
        q[type] = query;

        tempObj[queryType] = q;
        matchFields.push(tempObj);
    }

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

    // If a collection id is present, scope search to that collection
    if(collection) {
      matchFacetFields.push({
          "match_phrase": {
            "is_member_of_collection": collection
          }
      });
    }

    // Build query data object.  If query is empty, search for all items that are not collections. 
    var queryObj = {};
    if(query != "" || facets) {
      queryObj = {
        "bool": {
          "should": matchFields,
          "must": matchFacetFields,
          "must_not": {
            "match": {
              "object_type": "collection"
            }
          }
        }
      }
    }
    else {
      queryObj = {
        "bool": {
          "must": matchFacetFields,
          "must_not": {
            "match": {
              "object_type": "collection"
            }
          }
        }
      }
    }

    // Build elasticsearch aggregations object from config facet list.
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Build elasticsearch query object.
    var data = {  
      index: config.elasticsearchIndex,
      type: 'data',
      body: {
        from : (pageNum - 1) * config.maxResultsPerPage, 
        size : config.maxResultsPerPage,
        query: queryObj,
        aggregations: facetAggregations
      }
    }

    // Query the index.
    es.search(data, function (error, response, status) {
      var responseData = {};
      if (error){
        callback({status: false, message: error, data: null});
      }
      else {

        // Return the aggs for the facet display
        responseData['facets'] = response.aggregations;
        responseData['count'] = response.hits.total;

        try {

          // Build the search results objects
          var results = [], tn, resultData;
          for(var result of response.hits.hits) {

            // Get the thumbnail
            tn = Repository.getDatastreamUrl("tn", result._source.pid.replace('_', ':'));

            // Get the title and description data for the result listing
            resultData = Helper.getSearchResultDisplayFields(result);

            // Push a new result object to the results array
            results.push({
              title: resultData.title || "Untitled",
              creator: resultData.creator || "Unknown",
              abstract: resultData.description || "No Description",
              tn: tn,
              pid: result._source.pid
            });
          }

          // Add results array
          responseData['results'] = results;

          callback({status: true, data: responseData});
        }
        catch (e) {
          callback({status: false, message: e, data: responseData});
        }
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
      else {
        objectData = response.hits.hits[0]._source;
        callback({status: true, data: objectData});
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
      console.log("TEST aggs for fp facets:", aggs);
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
};
exports.getFacets = getFacets;

exports.searchFacets = function (query, facets, page, callback) {
    client.search({
            index: config.elasticsearchIndex,
            type: 'data',
            body: {
                "query": {
                    "bool": {
                        "must": {
                            "multi_match": {
                                "operator": "and",
                                "fields": facets,
                                "query": query // q
                            }
                        }
                    }
                }
            }
        }
    ).then(function (body) {
        callback(body);
    }, function (error) {
        callback(error);
    });
};