 /**
 * @file 
 *
 * Discovery service functions
 */

'use strict';

const es = require('../config/index');
const fs = require('fs');
const config = require('../config/' + process.env.CONFIGURATION_FILE);
const Repository = require('../libs/repository');
const Helper = require("./helper");
const AppHelper = require("../libs/helper");
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
        });
      }
  });
}

/**
 * Finds all child collections within a parent collection, and its children (recursive)
 *
 * @param 
 * @return 
 */
var geChildCollectionPids = function(pid, callback) {

}

/**
 * 
 *
 * @param 
 * @return 
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
 * 
 *
 * @param 
 * @return 
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
 * 
 *
 * @param 
 * @return 
 */
exports.getDatastream = function(indexName, objectID, datastreamID, part, callback) {

  // Get the object data
  fetchObjectByPid(indexName, objectID, function(error, object) {
    if(object) {

      // If there is a part value, retrieve the part data.  Redefine the object data with the part data
      if(part && isNaN(part) === false) {
        var sequence;
        let objectPart = {
          mime_type: object.display_record.parts[part-1].type,
          object: object.display_record.parts[part-1].object,
          thumbnail: object.display_record.parts[part-1].thumbnail
        }
        object = objectPart;
        sequence = "-" + part;
      }

      // If there are no parts in this object, do not append the sequence to the stream url
      else {
        sequence = "";
      }

      // Request a thumbnail datastream
      if(datastreamID == "tn") {
        // Check for a local thumbnail image
        let path = config.tnPath + objectID.match(/[0-9]+/)[0] + sequence + config.thumbnailFileExtension;
        if(fs.existsSync(path) == false) {

          // If not video: url = IIIF.getThumbnailUri(objectID)
          // If video: url = [kaltura endpoint for video tn]

          // No local image found, stream the thumbnail image from iiif api
          AppHelper.streamRemoteData(IIIF.getThumbnailUri(objectID), function(error, status, response) {
            
            // All is good, return the stream
            if(response && status == 200) {
              // TODO: Cache the file in local filesystem when retrieved from iiif server?
              callback(null, response);
            }

            // Can not retrieve thumbnail image from iiif server
            else {
              if(error) {
                console.log(error);
              }

              // Get fallback path to default thumbnail image
              path = config.tnPath + config.defaultThumbnailImage;

              // Check for an object specific default thumbnail image.  If found, use it
              for(var index in config.thumbnailPlaceholderImages) {
                if(config.thumbnailPlaceholderImages[index].includes(object.mime_type)) {
                  path = config.tnPath + index;
                }
              }

              // Create the thumbnail stream
              AppHelper.getFileStream(path, function(error, thumbnail) {
                  callback(null, thumbnail);
              });
            }
          });
        }

        else {
          // Stream thumbnail image from local folder
          AppHelper.getFileStream(path, function(error, thumbnail) {
              callback(null, thumbnail);
          });
        }
      }

      // Request a non thumbnail datastream
      else {

        // Check for a local object file
        let file = null, path;
        for(var extension in config.fileExtensions) {
          if(config.fileExtensions[extension].includes(object.mime_type)) {
            path = config.objectFilePath + objectID.match(/[0-9]+/)[0] + sequence + "." + extension;

            if(fs.existsSync(path)) {
              file = path;
            }
          }
        }

        // Stream the local object file if it is found
        if(file) {
          AppHelper.getFileStream(file, function(error, content) {
              if(error) {
                callback(error, null);
              }
              else {
                callback(null, content);
              }
          }); 
        }

        // If no local file is found, stream the object data from the repository
        else {
          Repository.streamData(object, datastreamID, function(error, stream) {
            if(error) {
              callback(error, null);
            }
            else {
              callback(null, stream);
            }
          });
        }
      }
    }

    // Object data could not be retrieved
    else {
      callback("Object not found, can not stream data", null);
    }
  });
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
 * 
 *
 * @param 
 * @return 
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

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getManifestObject = function(pid, callback) {
  var object = {}, children = [];
  fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, response) {
    if(error) {
      callback(error, JSON.stringify({}));
    }
    else if(response) {
      // Create object for IIIF
      var object = response,
      container = {
        resourceID: object.pid,
        downloadFileName: object.pid.replace(":", "_"), // Temporarily use pid for filename, replacing ':'' with '_'
        title: object.title,
        description: object.abstract,
        metadata: {
          "Title": object.title,
          "Creator": object.creator
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