'use strict';

const es = require('../config/index');
const config = require('../config/config');
const request  = require("request");
//const Repository = require('../libs/repository');
const Repository = require('../libs/repository.fedora');
const Helper = require("./helper");


/*
 * Normalizes item data for the view model
 *
 * @param int page: If null, creates list with 
 */
var createItemList= function(items) {
  var itemList = [], tn, pid, title, description, display, path;
  for(var item of items) {
      
    // 
    if(item.title && item.title != "") {
      title = item.title;
      description = item.description || "";
    }
    else if(item.display_record && typeof item.display_record == 'string') {
        try {
          display = JSON.parse(item.display_record);
        }
        catch(e) {
          console.log("Error: invalid display record JSON on object: " + item.pid);
          continue;
        }

        title = display.title || "Untitled";
        description = display.description || display.abstract || "";
    }
    else {
      title = "Untitled";
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

    if(item.mime_type == config.collectionMimeType) {
      path = "/repository/collection";
    }
    else {
      path = "/repository/object";
    }

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
            from : (pageNum - 1) * config.maxCollectionsPerPage, 
            size : config.maxDisplayResults,
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

            collections.count = response.hits.total;
            collections.list = createItemList(results);
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

exports.getObjectsInCollection = function(collectionID, pageNum=1, callback) {
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
         
        // Use local index to find the collection children
        var data = {  
          index: config.elasticsearchIndex,
          type: 'data',
          body: {
            from : (pageNum - 1) * config.maxCollectionsPerPage,
            size : config.maxCollectionsPerPage,
            query: {
                "match": {
                  //"pid": "codu:*" 
                  "is_member_of_collection": collectionID.substring(config.institutionPrefix.length) 
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
            });
          }
        });
      }
  });
}

exports.searchIndex = function(query, type, facets=null, collection=null, page=null, callback) {
      console.log("TEST type", type);
    // Build elasticsearch matchfields object for query: this object enables field specific searching
    var field = { match: "" };
    var matchFields = [], results = [];

    // Type specific search (if a searchfield is selected)
    if(Array.isArray(type)) {
        //query = "*" + query + "*";
        type.forEach(function(type) {
          var q = {};
          q[type] = query;
          matchFields.push({
              "match": q
          });
        })
    }

    // Search all fields (searchfield == All)
    else {

        var q = {};
        q[type] = query;
        matchFields.push({
          "match": q
        });
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

    // Build elasticsearch aggregations object from config facet list
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Elasticsearch query object
    var data = {  
      index: config.elasticsearchIndex,
      type: 'data',
      body: {
        from : 0, 
        size : config.maxDisplayResults,
        query: {
            "bool": {
              "should": matchFields,
              "must": matchFacetFields
            }
        },
        aggregations: facetAggregations
      }
    }

    // If a collection id is present, scope search to that collection
    if(collection) {
      // TODO add collection condition to search query?
    }

      console.log("TEST query search data", data.body.query.bool.should);
      console.log("TEST search facet data", data.body.query.bool.must);
    // Query the index
    es.search(data, function (error, response, status) {
      var responseData = {};
      if (error){
        callback({status: false, message: error, data: null});
      }
      else {
          console.log("TEST search res2", response);
        // Return the aggs for the facet display
        responseData['facets'] = response.aggregations;

        try {
          // Build the search results objects
          var results = [], tn, resultData;
          for(var result of response.hits.hits) {

            // Omit collection objects from the search results 
            if(result._source.mime_type.trim() == config.collectionMimeType) {
              continue;
            }

            tn = Repository.getDatastreamUrl("tn", result._source.pid.replace('_', ':'));

            // Get the title and description data for the result listing
            resultData = Helper.getSearchResultDisplayFields(result);

            // Push a new result object to the results array
            results.push({
              title: resultData.title || "",
              namePersonal: result._source.namePersonal,
              abstract: resultData.description || "",
              tn: tn,
              pid: result._source.pid
            });
          }
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
  
  // Remove prefix for index id
  pid = pid.replace(config.institutionPrefix + "_", "");
  pid = pid.replace(config.institutionPrefix + ":", "");
  es.get({
      index: config.elasticsearchIndex,
      type: "data",
      id: pid
  }, function (error, response) {

      if(error) {
        callback({status: false, message: error, data: null});
      }
      else if(response.found) {
        objectData = response._source;
        callback({status: true, data: objectData});
      }
      else {
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
      aggs[key] = {
        terms: field
      };
    }

    es.search({
        body: {
            "size": 0,
            "query": {
                "match_all": {}
            },
            "aggregations": aggs
        }
    }).then(function (body) {
        callback(body.aggregations);
    }, function (error) {
        callback(error);
    });
};
exports.getFacets = getFacets;

exports.searchFacets = function (query, facets, page, callback) {

    client.search({
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