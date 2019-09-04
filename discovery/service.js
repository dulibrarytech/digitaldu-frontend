 /**
 * @file 
 *
 * Discovery Service Functions
 *
 */

'use strict';

const es = require('../config/index');
const fs = require('fs');
const config = require('../config/' + process.env.CONFIGURATION_FILE);
const Repository = require('../libs/repository');
const Helper = require("./helper");
const AppHelper = require("../libs/helper");
const Datastreams = require("../libs/datastreams");
const IIIF = require("../libs/IIIF");

/**
 * Create a list of the root level collections
 *
 * @param {number} pageNum - If 0, return all root collections. If >= 1, use elasticsearch page results (TODO)
 *
 * @typedef (Object) collections - Collection data
 * @property {Array} list - Array of collection objects
 * @property {Number} count - Number of collections in top level colletion
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {collections|null} Null if error
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
        collections.list = Helper.createItemList(JSON.parse(response));
        collections.count = collections.list.length;
        callback(null, collections);
      }
      else {

        // If there are no results from the Repository, use the index to retrieve the top-level collection objects
        var data = {  
          index: config.elasticsearchPublicIndex,
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

        //Query the index for root collection members
        getObjectsInCollection(config.topLevelCollectionPID, pageNum, null, function(error, collections) {
          if(error) {
            callback(error, null);

          }
          else {
            callback(null, collections);
          }
        });
      }
  });
}

/**
 * Create a list of the objects in a collection
 *
 * @param {number} pageNum - Get this page of result objects.  0, return all collections.
 *
 * @typedef (Object) collection - Collection data
 * @property {String} title - Title of the collection to be displayed in the view
 * @property {Number} count - Number of objects in the collection
 * @property {Object} facets - Elastic response aggregations object
 * @property {Array} list - List of collection 'view data' objects
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {collection|null} Null if error 
 */
var getObjectsInCollection = function(collectionID, pageNum=1, facets=null, callback) {
  Repository.getCollectionObjects(collectionID, facets).catch(error => {
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
        collection.count = response.list.length;
        collection.list = Helper.createItemList(JSON.parse(response.list));
        collection.facets = response.facets || {};
        collection.title = response.title || "";
        callback(null, collection);
      }
      else {

        // If facet data is present, add it to the search
        var matchFacetFields = [];
        if(facets) {
          let facetKey, count=0;
          for(let facet in facets) {
            for(let value of facets[facet]) {
              let query = {};
              count++;

              // Get the facet key from the configuration, using the facet name
              facetKey = config.facets[facet];

              // Add to filters
              query[facetKey] = value;
              matchFacetFields.push({
                "match_phrase": query 
              });
            }
          }
        }

        matchFacetFields.push({
            "match_phrase": {
              "is_member_of_collection": collectionID
            }
        });

        // Do not show children of parent objects
        var restrictions = [];
        restrictions.push({
          "exists": {
              "field": "is_child_of"
          }
        });

        // Sort collections by title a-z
        let sortArr = [],
            sortField = {};
        sortField["title.keyword"] = {
          "order": "asc"
        }
        sortArr.push(sortField);

        // Use local index to find the collection children
        var data = {  
          index: config.elasticsearchPublicIndex,
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
            sort: sortArr,
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

            // Create the results array
            for(var index of response.hits.hits) {
              results.push(index._source);
            }

            // Assign data to the response object
            collection.list = Helper.createItemList(results); // Get the view data list from the elastic results array
            collection.facets = response.aggregations;
            collection.count = response.hits.total;

            if(collectionID != config.topLevelCollectionPID) {
              // Get this collection's title
              fetchObjectByPid(config.elasticsearchPublicIndex, collectionID, function(error, object) {
                if(error) {
                  collection.title = "";
                  callback(error, []);
                }
                else if(!object) {
                  callback("Object not found", []);
                }
                else if(object.object_type != "collection") {
                  callback("Invalid collection: " + object.pid, []);
                }
                else {
                  collection.title = object.title;
                  callback(null, collection);
                }
              });
            }
            else {
                collection.title = config.topLevelCollectionName || "";
                callback(null, collection);
            }
          }
        });
      }
  });
}
exports.getObjectsInCollection = getObjectsInCollection;

/**
 * Get the index data for an object
 *
 * @param {String} index - Elastic index from which to retrieve object data
 * @param {String} pid - PID of the object
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Elastic result data for the Object (index document source data) Null if error
 */
var fetchObjectByPid = function(index, pid, callback) {
  var objectData = {
    pid: null
  };

  // Get an exact match on the id and the namespace.  Extract both segments of the id, and require a match on both
  var temp, fields, matchFields = [], segments = pid.split(":");
  for(var i in segments) {
    temp = {}, fields = {};
    temp['pid'] = segments[i];
    fields['match'] = temp;
    matchFields.push(fields);
  }

  // Search for the pid segments as an "and" search.  This should only return one result.
  es.search({
      index: index,
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
        callback(null, null);
      }
  });
}
exports.fetchObjectByPid = fetchObjectByPid;

/**
 * Perform empty query Elastic search to get facet (aggregation) data for the entire index
 *
 * @param {String} collection - Collection PID.  If present, will scope the full index facet data to the collection
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Elastic aggregations object Null if error
 */
var getFacets = function (collection=null, callback) {

    // Build elasticsearch aggregations object from config facet list
    var aggs = {}, field;
    var matchFacetFields = [], restrictions = [];
    for(var key in config.facets) {
      field = {};
      field['field'] = config.facets[key] + ".keyword";
      field['size'] = config.facetLimit;
      aggs[key] = {
        terms: field
      };
    }

    var searchObj = {
        index: config.elasticsearchPublicIndex,
        type: 'data',
        body: {
            "size": 0,
            "aggregations": aggs,
            "query": {}
        }
    };

    if(collection) {
      matchFacetFields.push({
          "match_phrase": {
            "is_member_of_collection": collection
          }
      });

      restrictions.push({
        "exists": {
            "field": "is_child_of"
        }
      });

      searchObj.body.query["bool"] = {
        "must": matchFacetFields,
        "must_not": restrictions
      }
    }

    es.search(searchObj).then(function (body) {
        callback(null, body.aggregations);
    }, function (error) {
        callback(error.body.error.reason, null);
    });
}
exports.getFacets = getFacets;

/**
 * Requests a datastream
 *
 * @param {String} indexName - Name of index to retrieve object from
 * @param {String} objectID - Object PID
 * @param {String} datastreamID - DDU Datastream ID (defined in configuration)
 * @param {String} part - Stream data for a compound object part
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Data stream Null if error
 */
exports.getDatastream = function(indexName, objectID, datastreamID, part, callback) {
  // Get the object data
  fetchObjectByPid(indexName, objectID, function(error, object) {
    if(object) {
      Datastreams.getDatastream(object, objectID, datastreamID, part, function(error, stream) {
        callback(error, stream);
      });
    }

    // Object data could not be retrieved
    else {
      callback("Object not found, can not stream data", null);
    }
  });
}

/**
 * Wrapper function for getParentTrace()
 * Returns array of parent collection titles in heirarchical order (index 0 = top level collection)
 *
 * @param {String} pid - Object PID
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array|null} Array of parent object titles Null if error
 */
exports.getCollectionHeirarchy = function(pid, callback) {
  getParentTrace(pid, [], callback);
}

/**
 * Returns array of parent collection titles in heirarchical order (index 0 = top level collection)
 *
 * @param {Array} pids - Array of object PIDs to retrieve title strings for
 * @param {Array} titles - Array to fill with collection titles.  Must begin with an empty array
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array|null} Array of parent collection titles.  The order of titles in this array will match order of input pids array Null if error
 */
var getTitleString = function(pids, titles, callback) {
  var pidArray = [], pid;
  if(typeof pids == 'string') {
    pidArray.push(pids);
  }
  else {
    pidArray = pids;
  }
  pid = pidArray[ titles.length ];

  // Get the title data for the current pid
  fetchObjectByPid(config.elasticsearchPublicIndex, pid, function (error, response) {
    if(error) {
      callback(error, titles);
    }
    else if(response == null) {
      callback("Object not found: ", pid, titles);
    }
    else {
      titles.push({
        name: response ? response.title : pid,
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
exports.getTitleString = getTitleString;

/**
 * Returns array of parent collection titles in heirarchical order (index 0 = top level collection)
 *
 * @param {String} pid - Object PID
 * @param {Array} collections - Array to fill with parent collection titles.  Must begin with an empty array
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array|null} Array of parent object titles Null if error
 */
var getParentTrace = function(pid, collections, callback) {
  fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, response) {
      var title = "",
          url = config.rootUrl + "/collection/" + pid;

      if(error) {
        callback(error, null);
      }
      else if(response == null) {
        callback("Object not found:", pid, null);
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
        else if(response.is_member_of_collection == config.topLevelCollectionPID) {
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
 * Gets a IIIF manifest for an object
 *
 * @param {Array} pid - PID of object
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Manifest object (JSON) Null if error
 */
exports.getManifestObject = function(pid, callback) {
  var object = {}, children = [];
  fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, response) {
    if(error) {
      callback(error, JSON.stringify({}));
    }
    else if(response) {

      // Create object for IIIF
      var object = response;
      
      var container = {
        resourceID: object.pid,
        downloadFileName: object.pid.replace(":", "_"), // Temporarily use pid for filename, replacing ':'' with '_'
        title: object.title,
        metadata: {
          "Title": object.title,
          "Creator": object.creator,
          "Description": object.abstract
        }
      };

      // Create children array for IIIF
      var parts = [], resourceUrl;

      // Compound objects
      if(AppHelper.isParentObject(object)) {
        // Add the child objects of the main parent object
        for(var key in object.display_record.parts) {
          resourceUrl = config.rootUrl + "/datastream/" + object.pid + "/" + Helper.getDsType(object.display_record.parts[key].type) + "/" + object.display_record.parts[key].order;

          // Add the data
          children.push({
            label: object.display_record.parts[key].title,
            sequence: object.display_record.parts[key].order || key,
            description: object.display_record.parts[key].caption,
            format: object.display_record.parts[key].type,
            type: Helper.getIIIFObjectType(object.display_record.parts[key].type) || "",
            //resourceID: object.display_record.parts[key].object,
            resourceID: object.pid + config.compoundObjectPartID + object.display_record.parts[key].order,
            downloadFileName: object.display_record.parts[key].title,
            resourceUrl: resourceUrl,
            thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/" + Helper.getDsType("thumbnail") + "/" + object.display_record.parts[key].order
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
        if(error) {
          callback(error, []);
        }
        else {
          callback(null, manifest);
        }
      });
    }
    else {
      callback(null, null);
    }
  });
}