  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

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
const Kaltura = require('../libs/kaltura');
const IIIF = require("../libs/IIIF");
const util = require('util');
const Search = require("../search/service");
const Cache = require('../libs/cache');
const Pdf = require("../libs/pdfUtils")

/**
 * Create a list of the root level collections
 *
 * @param {String} page - Get this page of result collections
 *
 * @typedef {Object} collections - Collection data
 * @property {Array} list - Array of collection objects
 * @property {Number} count - Number of collections in top level collection
 *
 * @typedef {Object} viewData - List of 'view data' objects
 * @property {String} pid - Object pid
 * @property {String} tn - Object TN image source path
 * @property {String} title - Object title
 * @property {String} path - Object type path (ex "/object" or "/collection") Used to create the link to the object in the view
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {collections|null} Null if error
 */
exports.getTopLevelCollections = function(page=1, callback) {
  Repository.getRootCollections().catch(error => {
    callback(error, null);
  })
  .then( response => {
      var collections = {
        list: [],
        count: 0
      }
      if(response && response.length > 0) {
        collections.list = Helper.getObjectLinkDisplayList(JSON.parse(response));
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
        getObjectsInCollection(config.topLevelCollectionPID, page, null, {"field": "Title", "order": "asc"}, 12, null, function(error, collections) {
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
 * Get all objects in a collection, including facet data for collection members
 *
 * @param {String} page - Get this page of result objects.  0, return all collections.
 *
 * @typedef {Object} collection - Collection data
 * @property {String} title - Title of the collection to be displayed in the view
 * @property {String} count - Number of objects in the collection
 * @property {Object} facets - Elastic response aggregations object
 * @property {Array.<viewData>} list - List of collection 'view data' objects
 *
 * @typedef {Object} viewData - List of 'view data' objects
 * @property {String} pid - Object pid
 * @property {String} tn - Object TN image source path
 * @property {String} title - Object title
 * @property {String} path - Object type path (ex "/object" or "/collection") Used to create the link to the object in the view
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {collection|null} Null if error 
 */
var getObjectsInCollection = function(collectionId, page=1, facets=null, sort=null, pageSize=10, daterange=null, callback) {
  Repository.getCollectionObjects(collectionId, facets).catch(error => {
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
      var facetAggregations = AppHelper.getFacetAggregationObject(config.facets);

      // Validate repository response
      if(response && response.length > 0) {
        collection.count = response.list.length;
        collection.list = Helper.getObjectLinkDisplayList(JSON.parse(response.list));
        collection.facets = response.facets || {};
        collection.title = response.title || "";
        callback(null, collection);
      }
      else {
        var queryData = [];
        queryData.push({
          terms: "",
          field: "all",
          type: "contains",
          bool: "or"
        });

        pageSize = pageSize || config.defaultCollectionsPerPage || 10;
        var from = (page - 1) * pageSize;
        Search.searchIndex(queryData, facets, collectionId, page, pageSize, daterange, sort, null, function(error, response) {
          if(error) {
            callback(error, null);
          }
          else {
            var responseData = {};
            response = response.elasticResponse;
            if (error){
              callback(error, null);
            }
            else if(from > response.hits.total) {
              callback("Invalid page number ", null);
            }
            else {
              var results = [];
              for(var index of response.hits.hits) {
                results.push(index._source);
              }

              collection.list = Helper.getObjectLinkDisplayList(results);
              collection.facets = response.aggregations;
              collection.count = response.hits.total;

              if(collectionId != config.topLevelCollectionPID) {
                fetchObjectByPid(config.elasticsearchPublicIndex, collectionId, function(error, object) {
                  if(error) {
                    collection.title = "";
                    callback(error + ". Pid: " + collectionId, []);
                  }
                  else if(!object) {
                    callback("Collection not found. Pid: " + collectionId, null);
                  }
                  else if(object.object_type != "collection") {
                    callback("Invalid collection. Pid: " + collectionId, []);
                  }
                  else {
                    collection.title = object.title || "No Title";
                    collection.abstract = (object.abstract && typeof object.abstract == "object") ? object.abstract[0] : object.abstract || "";
                    callback(null, collection);
                  }
                });
              }
              else {
                  collection.title = config.topLevelCollectionName || "";
                  callback(null, collection);
              }
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
  es.search({
      index: index,
      type: config.searchIndexType,
      body: {
        query: {
          "bool": {
            "filter": [
              {"match_phrase": {"pid": pid}}
            ]
          }
        }
      }
  }, function (error, response) {
      if(error) {
        callback(error, null);
      }
      else if(response.hits.total > 0) {
        callback(null, response.hits.hits[0]._source);
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
    var field, matchFacetFields = [], restrictions = [];
    var aggs = AppHelper.getFacetAggregationObject(config.facets);

    var searchObj = {
        index: config.elasticsearchPublicIndex,
        type: config.searchIndexType,
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
exports.getDatastream = function(indexName, objectID, datastreamID, part, authKey, callback) {
  fetchObjectByPid(indexName, objectID, function(error, object) {
    if(object) {
      let contentType = AppHelper.getContentType(datastreamID, object, part, (object.mime_type || null));
      Datastreams.getDatastream(object, objectID, datastreamID, part, authKey, function(error, stream) {   
        callback(error, stream, contentType);
      });
    }
    else {
      callback("Object not found, can not stream data: " + objectID, null);
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
  if(pid && pid.length > 0) {
    getParentTrace(pid, [], callback);
  }
  else {
    callback([])
  }
}

/**
 * Returns array of parent collection titles in heirarchical order (index 0 = top level collection)
 *
 * @param {Array} pids - Array of object PIDs to retrieve title strings for
 * @param {Array} titles - Array to fill with collection titles.  Must begin with an empty array
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array|null} Array of parent collection titles ({pid: pid, name: title, url: url}).  The order of titles in this array will match order of input pids array Null if error
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
        callback(null, titles);
      }
      else {
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
          url = config.rootUrl + "/object/" + pid;

      if(error) {
        callback(error, null);
      }
      else if(response == null) {
        callback("Object not found:", pid, null);
      }
      else {
        if(typeof response.title == "object") {
          title = response.title[0];
        }
        else {
          title = response.title || "Untitled Collection";
        }
        collections.push({pid: response.pid, name: title, url: url});

        if(typeof response.is_member_of_collection == 'object') {
          getParentTrace(response.is_member_of_collection[0], collections, callback);
        }
        else if(response.is_member_of_collection == config.topLevelCollectionPID) {
          collections.push({pid: config.topLevelCollectionPID, name: config.topLevelCollectionName, url: config.rootUrl + "#collections"});
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
exports.getManifestObject = function(pid, index, page, apikey, callback) {
  var object = {}, children = [], part = null;

  if(pid.indexOf(config.compoundObjectPartID) > 0) {
    part = pid.substr(pid.indexOf(config.compoundObjectPartID)+1);
    pid = pid.substr(0, pid.indexOf(config.compoundObjectPartID));
  }

  fetchObjectByPid(index, pid, function(error, response) {
    if(error) {
      callback(error, JSON.stringify({}));
    }
    else if(response) {
      var object = response;
      var parts = [], resourceUrl;

      if(part) {
        let partData = AppHelper.getCompoundObjectPart(object, part),
            partObj = {};

        partObj.pid = pid + config.compoundObjectPartID + part;
        partObj.title = partData.title || "No Title";
        partObj.abstract = partData.caption || object.abstract || "";
        partObj.mime_type = partData.type || null;

        var container = {
          resourceID: partObj.pid,
          downloadFileName: partObj.pid,
          title: object.title,
          metadata: {
            "Title": partObj.title,
            "Creator": partObj.creator || object.creator || "",
            "Description": partObj.abstract || object.abstract || ""
          },
          protocol: /https/.test(config.IIIFUrl) ? "https" : "http",
          objectType: AppHelper.getDsType(object.mime_type),
          isCompound: false
        };

        object = partObj;
      }
      else {
        var container = {
          resourceID: object.pid,
          downloadFileName: object.pid,
          title: object.title,
          metadata: {
            "Title": object.title,
            "Creator": object.creator,
            "Description": object.abstract
          },
          protocol: /https/.test(config.IIIFUrl) ? "https" : "http",
          objectType: AppHelper.getDsType(object.mime_type),
          isCompound: AppHelper.isParentObject(object)
        };
      }

      // Compound objects
      if(container.isCompound) {
        // Add the child objects of the main parent object
        let parts = AppHelper.getCompoundObjectPart(object, -1) || [];

        // Get the page of object parts. Only if IIIF manifest pagination is enabled 
        if(config.IIIFManifestPageSize && page && page > 0) {
          let size = config.IIIFManifestPageSize || 10,
              offset = (page-1) * size;
          if(parts.length > offset+size) {
            parts = parts.slice(offset, offset+size);
          }
          else {
            parts = parts.slice(offset, parts.length);
          }
        }

        for(var key in parts) {
          let pageCount = null;
          resourceUrl = config.rootUrl + "/datastream/" + object.pid + "/" + AppHelper.getDsType(parts[key].type) + "/" + parts[key].order;

          // pdf page count
          if(config.IIIFEnablePdfPaging && AppHelper.getDsType(parts[key].type) == "pdf") {

            let objectID = object.pid + (parts[key].order ? ("_" + parts[key].order) : ""),
                cacheFileName = objectID + ".pdf",
                cacheFilePath = config.objectDerivativeCacheLocation;

            if(Cache.exists("object", objectID, "pdf")) {
              pageCount = Pdf.getPageCountSync(cacheFilePath + "/" + cacheFileName);
            }
            else {
              console.log(cacheFileName + " not found in cache. Generating single page pdf manifest");
            }
          }

          children.push({
            label: parts[key].title,
            sequence: parts[key].order || key,
            description: parts[key].caption,
            format: Helper.getIIIFFormat(parts[key].type),
            type: Helper.getIIIFObjectType(parts[key].type) || "",
            resourceID: object.pid + config.compoundObjectPartID + parts[key].order || "",
            downloadFileName: parts[key].title,
            resourceUrl: resourceUrl,
            thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/tn/" + parts[key].order,
            pageCount: pageCount
          });
        }

        IIIF.getManifest(container, children, apikey, function(error, manifest) {
          if(error) {
            callback(error, []);
          }
          else {
            callback(null, manifest);
          }
        });
      }

      // Single objects
      else {
        let pageCount = null;
        resourceUrl = config.rootUrl + "/datastream/" + object.pid + "/" + AppHelper.getDsType(object.mime_type);

        // pdf page count
        if(config.IIIFEnablePdfPaging && AppHelper.getDsType(object.mime_type) == "pdf") {
          let objectID = object.pid,
              cacheFileName = objectID + ".pdf",
              cacheFilePath = config.objectDerivativeCacheLocation;

          if(Cache.exists("object", objectID, "pdf")) {
            pageCount = Pdf.getPageCountSync(cacheFilePath + "/" + cacheFileName);
          }
          else {
            console.log(cacheFileName + " not found in cache. Generating single page pdf manifest");
          }
        }

        children.push({
          label: object.title,
          sequence: "1",
          description: object.abstract,
          format: Helper.getIIIFFormat(object.mime_type),
          type: Helper.getIIIFObjectType(object.mime_type) || "",
          resourceID: object.pid,
          resourceUrl: resourceUrl,
          thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/tn",
          pageCount: pageCount
        });

        IIIF.getManifest(container, children, apikey, function(error, manifest) {
          if(error) {
            callback(error, []);
          }
          else {
            callback(null, manifest);
          }
        });
      }
    }
    else {
      callback(null, null);
    }
  });
}

exports.getAutocompleteData = function(callback) {
  var data = {};
  getCollectionList(function(error, list) {
    if(error) {callback(error, data)}
    else {data["collectionData"] = list};
    callback(null, data);
  })
}

var getCollectionList = function(callback) {
  es.search({
      index: config.elasticsearchPublicIndex,
      type: config.searchIndexType,
      _source: ["pid"],
      body: {
        "query": {
          "match_phrase": {
            "object_type": "collection"
          }
        },
        "size": 1000
      }
  }, function (error, response) {
      if(error) {
        callback(error, null);
      }
      else {
        let results = response.hits.hits || [], pids = [], titles = [];
        for(let i in results) {
          pids.push(results[i]._source.pid);
        }

        getTitleString(pids, [], function(error, response) {
          callback(null, response);
        });
      }
  });
}

exports.refreshCache = function(cacheName) {
  let cacheFiles = Cache.getList(cacheName),
      pid = "", 
      url = "";

  console.log("Refreshing " + cacheName + " cache...");
  for(let file of cacheFiles) {
    pid = file.substring(0, file.lastIndexOf("."));

    // If the parent is found in the index, do not purge the part object from the cache. Only check for the parent object
    if(pid.indexOf(config.compoundObjectPartID) > 0) {
      pid = pid.substring(0, pid.indexOf(config.compoundObjectPartID));
    }

    fetchObjectByPid(config.elasticsearchPublicIndex, pid, function (error, object) {
      if(error) {
        console.log(error);
      }
      // Object not found in index
      else if(object == null) {
        Cache.removeObject(cacheName, file, function(error) {
          if(error) {console.log("Error removing cache file " + file + ": " + error)}
          else {console.log("Removed " + file)}
        });
      }
      else {
        Datastreams.verifyObject(object, "object", function(error, isValid) {
          if(error) {console.log(error)}
          // Object index record is present, but is not found (200) in DuraCloud
          else if(isValid == false) {
            Cache.removeObject(cacheName, file, function(error) {
              if(error) {console.log("Error removing cache file " + file + ": " + error)}
              else {console.log("Removed " + file + ". Object not found in repository")}
            });
          }
        })
      }
    });
  }

  return 0;
}

exports.removeCacheItem = function(objectID, cacheName) {
  fetchObjectByPid(config.elasticsearchPublicIndex, objectID, function (error, object) {
    if(error) {
      console.log(error);
    }
    else if (object) {
      var items = [];
      if(AppHelper.isParentObject(object)) {
        items.push({
          pid: objectID,
          mimeType: object.mime_type || null
        });
        for(var part of AppHelper.getCompoundObjectPart(object, -1)) {
          items.push({
            pid: objectID + config.compoundObjectPartID + (part.order || part.sequence || "1"),
            mimeType: part.type || null
          });
        }
      }
      else {
        items.push({
          pid: objectID,
          mimeType: object.mime_type || null
        });
      }

      for(var item of items) {
        var extension = (cacheName == "thumbnail") ? config.thumbnailFileExtension : AppHelper.getFileExtensionForMimeType(item.mimeType || null),
            filename = item.pid + "." + extension;
        if(Cache.exists(cacheName, item.pid, extension)) {
          Cache.removeObject(cacheName, filename, function(error, filepath) {
            if(error) {
              console.log(error);
            }
            else {
              console.log(filepath + " removed from the " + cacheName + " cache");
            }
          });
        }
        else {
          console.log(filename + " does not exist in cache");
        }
      }
    }
    else {
      console.log("Object not found. Use '/cache/purgeInvalidItems' to remove cache items that are no longer in the public index");
    }
  });
  return false;
}

exports.addCacheItem = function(objectID, cacheName) {
  fetchObjectByPid(config.elasticsearchPublicIndex, objectID, function (error, object) {
    if(error) {
      console.log(error);
    }
    else {
      var items = [];

      if(AppHelper.isParentObject(object)) {
        for(var part of AppHelper.getCompoundObjectPart(object, -1)) {
          items.push({
            pid: objectID + config.compoundObjectPartID + (part.order || part.sequence || "1"),
            mimeType: part.type || null,
            sequence: (part.order || part.sequence || "1")
          });
        }
      }
      else if(object) {
        items.push({
          pid: objectID,
          mimeType: object.mime_type || null,
          sequence: "1"
        });
      }
      else {
        console.log("Object not found. Only objects that are present in the public index can be cached");
      }

      for(var item of items) {
        var extension = (cacheName == "thumbnail") ? config.thumbnailFileExtension : AppHelper.getFileExtensionForMimeType(item.mimeType || null),
            filename = item.pid + "." + extension;
        if(Cache.exists(cacheName, item.pid, extension) == false) {
          if(cacheName == "thumbnail") {cacheName = "tn"}
          Datastreams.getDatastream(object, objectID, cacheName, item.sequence, null, function(error, stream) {
            if(error) {
              console.log(error);
            }
          });
        }
        else {
          console.log(filename + " already exists in cache")
        }
      }
    }
  });
  return false;
}