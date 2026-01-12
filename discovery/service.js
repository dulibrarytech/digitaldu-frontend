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
const Pdf = require("../libs/pdfUtils");
const Metadata = require("../libs/metadata");

const Logger = require('../libs/log4js');

/**
 * Will write a cache item to store an object's data in local filesystem. 
 * Will use file type (extension) of the file source in the index 'object' field for object source caching
 * 
 * @param {String} objectID - Object pid
 * @param {String} cacheName - 'thumbnail' or 'object'
 * @param {String} updateExisting - If true, will overwrite an existing item in the cache
 */
var addCacheItem = async function(objectID, cacheName, updateExisting=false) {}

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
var fetchObjectByPid = function(index, pid, callback) {}

/**
 * Get the index data for an object
 *
 * @param {String} index - Elastic index from which to retrieve object data
 * @param {String} kalturaId - kalturaId (kaltura 'entry_id')
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Elastic result data for the Object (index document source data) Null if error
 */
var fetchObjectByKalturaId = function(index, kalturaId, callback) {}

/**
 * Returns an array of collection titles including all collections in the repository
 * 
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object} autocompleteData
 * 
 * @typedef {Object} autocompleteData - Data to render view autocomplete suggestions
 * @property {Array.<String>} Collection title
 */
var getAutocompleteData = function(callback) {}

/**
 * 
 */
var getCollectionChildren = function(collectionId, index, callback) {}

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
var getCollectionHeirarchy = function(pid, callback) {}

/**
 * Returns an array of collection titles including all collections in the repository
 * 
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array.<String>} 
 */
var getCollectionList = function(callback) {}

/**
 * Fetch a datastream
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
var getDatastream = function(indexName, objectID, datastreamID, part, authKey, callback) {}

/**
 * Perform empty query Elastic search to get facet (aggregation) data for the entire index
 *
 * @param {String} collection - Collection PID.  If present, will scope the full index facet data to the collection
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Elastic aggregations object Null if error
 */
var getFacets = function (collection=null, callback) {}

/**
 * Gets a IIIF manifest for an object
 *
 * @param {Array} pid - PID of object
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Object|null} Manifest object (JSON) Null if error
 */
var getManifestObject = function(pid, index, page, apikey, callback) {}

/**
 * Get all objects in a collection, including facet data for collection members
 *
 * @param {String} page - Get this page of result objects.  0, return all objects.
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
var getObjectsInCollection = function(collectionId, page=1, facets=null, sort=null, pageSize=10, daterange=null, callback) {}

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
var getParentTrace = function(pid, collections, callback) {}

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
var getTitleString = function(pids, titles, callback) {}

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
var getTopLevelCollections = function(page=1, callback) {}

/**
 * Will remove itms from the cache for objects that are not present in the public index, OR are not found (or otherwise available) in Duracloud
 */
var purgeCache = function(cacheName, refresh=false) {}

/*
 * Will only remove items that are currently in the index
 * Use "purgeCache()" to remove items from the cache that do not exist in the public index
 */
var removeCacheItem = function(objectID, cacheName, callback) {}

var getFieldValues = function(field, callback) {}

/*
 * Implementation
 */

addCacheItem = async function(objectID, cacheName, updateExisting=false) {
  return new Promise(function(resolve, reject) {
    Logger.module().info('INFO: ' + `Adding ${cacheName} cache item for object ${objectID}`);

    fetchObjectByPid(config.elasticsearchPublicIndex, objectID, function (error, object) {
      if(error) {
        Logger.module().error('ERROR: ' + error);
        reject(error);
      }
      else {
        var items = [];

        // Is a compound object
        if(AppHelper.isParentObject(object)) {
          let parts = AppHelper.getCompoundObjectPart(object, -1);
          for(var part of parts) {
            items.push({
              pid: objectID + config.compoundObjectPartID + (part.order || part.sequence || "1"),
              mime_type: part.type || null,
              object_type: object.object_type || "",
              sequence: (part.order || part.sequence || "1"),
              thumbnail: part.thumbnail || null,
              object: part.object || null
            });
          }
        }

        // Is a collection object, add a cache item for each collection member
        else if(AppHelper.isCollectionObject(object)) {
          getCollectionChildren(objectID, config.elasticsearchPublicIndex, async function(error, pids) {
            Logger.module().info('INFO: ' + `Caching ${pids.length} objects in collection ${objectID}...`);

            if(error) {
              Logger.module().error('ERROR: ' + error);
            }
            for(var i in pids) {
              Logger.module().info('INFO: ' + `Creating cache item for ${pids[i]}...`);

              error = await addCacheItem(pids[i], cacheName, updateExisting);
              if(error) {
                Logger.module().error('ERROR: ' + error);
              }
              else {
                Logger.module().info('INFO: ' + "Done");
              }
            }
            resolve(false);
          });
        }

        // Is a single object
        else if(object) {
          items.push(object);
        }

        // Null object == not in index
        else {
          Logger.module().error('ERROR: ' + "Object not found");
        }

        // Get the datastream for each item to be added to the cache, store the data
        for(var item of items) {
          if(!item.object) {
            Logger.module().error('ERROR: ' + `Object path missing for object: ${objectID} Part: ${item.sequence} Skipping cache write`);
            continue;
          }

          let extension;
          if (cacheName == "thumbnail") {
            extension = config.thumbnailFileExtension;
          }
          else if (cacheName == "object") {
            extension = AppHelper.getFileExtensionFromFilePath(item.object) || AppHelper.getFileExtensionForMimeType(item.mime_type);
          }
          else {
            extension = AppHelper.getFileExtensionForMimeType(item.mime_type || null)
          }
          let filename = item.pid+"."+extension;

          if(Cache.exists(cacheName, item.pid, extension) == false || updateExisting === true) {

            let datastreamID = cacheName == "thumbnail" ? "tn" : "object";
            Datastreams.getDatastream(item, datastreamID, function(error, stream, objectData, isPlaceholder=false) {
              if(error) {
                Logger.module().error('ERROR: ' + error);
                reject(error);
              }
              else if(!stream) {
                Logger.module().error('ERROR: ' + `Could not create cache file for ${objectData.pid}, Error retrieving datastream`);
                reject(error);
              }
              else if(isPlaceholder) {
                Logger.module().error('ERROR: ' + `Could not create cache file for ${objectData.pid}, datastream returned placeholder image`);
                reject(error);
              }
              else {
                Logger.module().info('INFO: ' + `Writing ${objectData.pid}.${extension} to ${cacheName} cache...`);
                Cache.cacheDatastream(cacheName, objectData.pid, stream, extension, function(error) {
                  if(error) { 
                    Logger.module().error('ERROR: ' + `Could not create object file for ${objectData.pid}, Error: ${error}`);
                    reject(error);
                  }
                  else { 
                    Logger.module().info('INFO: ' + `Added item ${objectData.pid} to ${cacheName} cache`);
                    resolve(null);
                  }
                });
              }
            }, null);
          }
          else {
            Logger.module().info('INFO: ' + `${filename} already exists in cache. Update existing cache is disabled.`);
            resolve(false);
          }
        }
      }
    });
  });
}
exports.addCacheItem = addCacheItem;

fetchObjectByPid = async function(index, pid, callback = () => {}) {
  let response;

  try {
    response = await es.get({id: pid, index});

    if(response) {
      callback(null, response._source);
      return response._source;
    }
    else {
      callback(null, null);
      return null;
    }
  }
  catch(error) {
    if(error.meta?.statusCode == 404) {
      callback(null, null);
    }
    else {
      callback(error, null);
      throw error;
    }
  }
}
exports.fetchObjectByPid = fetchObjectByPid;

fetchObjectByKalturaId = async function(index, kalturaId, callback = () => {}) {
  let response;

  try {
    response = await es.search({
      index,
      body: {
        query: {
          match: {
            "entry_id": kalturaId
          }
        }
      }
    });

    if(response && response.hits?.hits.length > 0) {
      let object = response.hits.hits[0]._source;
      callback(null, object);
    }
    else {
      callback(null, null);
    }
  }
  catch(error) {
    if(error.meta?.statusCode == 404) {
      callback(null, null);
    }
    else {
      callback(error, null);
    }
  }
}
exports.fetchObjectByKalturaId = fetchObjectByKalturaId;

getAutocompleteData = function(callback) {
  var data = {};
  getCollectionList(function(error, list) {
    if(error) {callback(error, data)}
    else {data["collectionData"] = list};
    callback(null, data);
  })
}
exports.getAutocompleteData = getAutocompleteData;

getCollectionChildren = function(collectionId, index, callback) {
  let data = {
    index: index,
    _source: ["pid"],
    body: {
      query: {
        match_phrase: {
          "is_member_of_collection": collectionId
        }
      },
      size: 10000
    }
  }

  es.search(data).then(function (response) {
    let results = response.hits.hits || [], pids = [];

    for(let i in results) {
      pids.push(results[i]._source.pid);
    }

    callback(null, pids);

  }, function (error) {
    callback(error, null);
  });
}

getCollectionHeirarchy = function(pid, callback) {
  if(pid && pid.length > 0) {
    getParentTrace(pid, [], callback);
  }
  else {
    callback([])
  }
}
exports.getCollectionHeirarchy = getCollectionHeirarchy;

getCollectionList = function(callback) {
  let data = {
    index: config.elasticsearchPublicIndex,
    _source: ["pid"],
    body: {
      query: {
        match_phrase: {
          "object_type": "collection"
        }
      },
      size: 1000
    }
  }

  es.search(data).then(function (response) {
    if(response) {
      let results = response.hits.hits || [], pids = [];

      for(let i in results) {
        pids.push(results[i]._source.pid);
      }

      getTitleString(pids, [], function(error, response) {
        callback(null, response);
      });
    }
  }, function (error) {
    callback(error, {});
  });
}

getDatastream = function(indexName, objectID, datastreamID, part, authKey, callback) {
  fetchObjectByPid(indexName, objectID, function(error, object) {
    if(object) {
      let contentType = AppHelper.getContentType(datastreamID, object, part);

      if(AppHelper.isParentObject(object)) {
        // This is a compound object: Add the compound part data to the main data object
        if(!part) part = "1";
        let objectPart = AppHelper.getCompoundObjectPart(object, part);

        if(objectPart) {
          objectPart["pid"] = objectID;
          objectPart["object_type"] = "object";
          objectPart["mime_type"] = objectPart.type ? objectPart.type : (objectPart.mime_type || "");
          object = objectPart;
          object["isCompound"] = true;
          objectID = objectID + (config.compoundObjectPartID + objectPart.order);
        }

        // Invalid part, or no data for part index.
        else {
          part = null;
          object["isCompound"] = true;
        }
      }

      // Non-compound object
      else {
        part = null;
        object["isCompound"] = false;
      }

      if(object.isCompound && part == null) {
        callback(null, null);
      }
      else {
        // Get cache settings
        let settings = null,
            cacheName = datastreamID == "tn" ? "thumbnail" : "object",
            cacheEnabled = false;

        // Get the file extension to use for caching
        let extension = datastreamID;;
        if (datastreamID == "tn") {
          extension = config.thumbnailFileExtension;
        }
        else if (datastreamID == "object") {
          extension = object.object ? AppHelper.getFileExtensionFromFilePath(object.object) : AppHelper.getFileExtensionForMimeType(object.mime_type || "");
        }

        // Collection objects
        if(AppHelper.isCollectionObject(object)) {
          if(cacheName == "thumbnail") {
            settings = config.thumbnailDatastreams.collection;
          }
          else {
            settings = config.objectDatastreams.collection;
          }
        }

        else {
          let type = AppHelper.getObjectType(object) || "";

          if(cacheName == "thumbnail") {
            settings = config.thumbnailDatastreams.object.type[type] || null;
          }
          else {
            // Get the settings for the object by object type
            let typeSettings = config.objectDatastreams.object.type;

            // Check for file type specific settings for this object type (e.g. 'jpg' settings for image type, etc)
            if(typeSettings[type] && typeSettings[type].file_type) {
              settings = typeSettings[type].file_type[extension] || null;
              if(settings?.extension) contentType = config.mimeTypes[settings.extension];
            }
            else {
              settings = typeSettings[type] || null;
            }
          }
        }

        // If settings object is null, cache will default to disabled (cacheEnabled == false)
        if(settings) {
          cacheEnabled = settings.cache;

          // Stream data from the cache, if the cache is enabled and a cache item is present
          if(cacheEnabled && Cache.exists(cacheName, objectID, extension) == true) {
            if(config.nodeEnv == "devlog") {
              Logger.module().info('INFO: ' + `Loading object resource from cache source: ${objectID || 'null'}`);
            }
            Cache.getFileStream(cacheName, objectID, extension, function(error, stream) {
              if(error) {callback(error, null)}
              else {callback(null, stream, contentType)}
            });
          }

          // Fetch datastream
          else {
            if(config.nodeEnv == "devlog") {
              Logger.module().info('INFO: ' + `Datastream source: ${objectID || 'null'}`);
            }
            Datastreams.getDatastream(object, datastreamID, function(error, stream, objectData, isPlaceholder=false) { 
              if(error) {
                callback(error, null);
              }
              else {
                if(isPlaceholder == false) {
                  if(cacheEnabled && Cache.exists(cacheName, objectID, extension) == false) {
                    Cache.cacheDatastream(cacheName, objectID, stream, extension, function(error) {
                      if(error) { 
                        Logger.module().error('ERROR: ' + `Could not create object file for ${objectID}. Error: ${error}`);
                      }
                      else { 
                        Logger.module().info('INFO: ' + `Added object ${objectID} to ${cacheName} cache`);
                      }
                    });
                  }
                }
                callback(null, stream, contentType);
              }
            }, authKey);
          }
        }
        else {
          Logger.module().error('ERROR: ' + `No configuration available for datastream "${datastreamID}" streaming "${extension}" file. Object id: ${objectID}.`);
          callback(null, null);
        }
      }
    }
    else {
      callback(null, null);
    }
  });
}
exports.getDatastream = getDatastream;

getFacets = function (collection=null, callback) {
    var matchFacetFields = [], restrictions = [];
    var aggs = AppHelper.getFacetAggregationObject(config.facets);

    var searchObj = {
        index: config.elasticsearchPublicIndex,
        body: {
            "size": 0,
            "aggregations": aggs
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

getManifestObject = async function(pid, index, page, apikey, callback) {
  var object = {}, children = [], part = null;

  if(pid.indexOf(config.compoundObjectPartID) > 0) {
    part = pid.substr(pid.indexOf(config.compoundObjectPartID)+1);
    pid = pid.substr(0, pid.indexOf(config.compoundObjectPartID));
  }

  try {
    object = await fetchObjectByPid(index, pid);
  }
  catch (error) {
    callback(error, JSON.stringify({}));
  }

  if(object) {
    var container = null,
        metadata = {},

    metadata = Metadata.getMetadataFieldValues(object, "universalviewer");
    if(metadata["License"]) {
      AppHelper.addHyperlinks(metadata["License"]);
    }
    
    if(part) {
      let partData = AppHelper.getCompoundObjectPart(object, part);
      if(partData) {
        let partObj = {};
        partObj.pid = pid + config.compoundObjectPartID + part;
        partObj.title = partData.title || "No Title";
        partObj.abstract = partData.caption || object.abstract || "";
        partObj.mime_type = partData.type || null;

        container = {
          resourceID: partObj.pid,
          downloadFileName: partObj.pid,
          title: object.title,
          metadata: metadata,
          protocol: /https/.test(config.IIIFUrl) ? "https" : "http",
          objectType: AppHelper.getDsType(object.mime_type),
          isCompound: false
        };

        object = partObj;
      }
    }
    else {
      container = {
        resourceID: object.pid,
        downloadFileName: object.pid,
        title: object.display_record.title,
        metadata: metadata,
        protocol: /https/.test(config.IIIFUrl) ? "https" : "http",
        objectType: AppHelper.getDsType(object.mime_type),
        isCompound: AppHelper.isParentObject(object)
      };
    }

    if(!container) {
      callback(null, null);
    }

    // Compound objects
    else if(container.isCompound) {
      let parts = AppHelper.getCompoundObjectPart(object, -1) || [];

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
        let pageCount = null,
            filename = "";

        if(config.IIIFUseLocalFilesource) {
          let path = AppHelper.getDuracloudFilenameFromObjectPath(parts[key]);
          filename = path ? config.IIIFFilesourceImageFilenamePrefix + path : "";
        }

        // Get pdf page count
        if(config.IIIFEnablePdfPaging && AppHelper.getDsType(parts[key].type) == "pdf") {
          let objectID = object.pid + (parts[key].order ? ("_" + parts[key].order) : ""),
              cacheFileName = objectID + ".pdf",
              cacheFilePath = config.objectDerivativeCacheLocation;

          if(Cache.exists("object", objectID, "pdf")) {
            pageCount = await Pdf.getPageCountSync(cacheFilePath + "/" + cacheFileName);
          }
          else {
            Logger.module().info('INFO: ' + `${cacheFileName} not found in cache. Generating single page pdf manifest`);
          }
        }
        
        children.push({
          label: parts[key].title,
          sequence: parts[key].order || key,
          description: parts[key].caption,
          format: Helper.getIIIFFormat(parts[key].type),
          type: Helper.getIIIFObjectType(parts[key].type) || "",
          resourceID: object.pid + config.compoundObjectPartID + (parts[key].order || ""),
          downloadFileName: parts[key].title,
          resourceUrl: config.rootUrl + "/datastream/" + object.pid + "/" + AppHelper.getFileExtensionFromFilePath(parts[key].object || "undefined") + "/" + parts[key].order,
          thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/tn/" + parts[key].order,
          pageCount: pageCount,
          extension: AppHelper.getFileExtensionFromFilePath(parts[key].object),
          filename: filename
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
      let pageCount = null,
          filename = "";

      if(config.IIIFUseLocalFilesource) {
        let path = AppHelper.getDuracloudFilenameFromObjectPath(object);
        filename = path ? config.IIIFFilesourceImageFilenamePrefix + path : "";
      }

      // pdf page count
      if(AppHelper.getDsType(object.mime_type) == "pdf" && config.IIIFEnablePdfPaging) {
        let objectID = object.pid,
            cacheFileName = objectID + ".pdf",
            cacheFilePath = config.objectDerivativeCacheLocation;

        if(Cache.exists("object", objectID, "pdf")) {
          pageCount = await Pdf.getPageCountSync(cacheFilePath + "/" + cacheFileName);
        }
        else {
          Logger.module().info('INFO: ' + `${cacheFileName} not found in cache. Generating single page pdf manifest`);
        }
      }

      children.push({
        label: object.display_record.title,
        sequence: "1",
        description: object.abstract,
        format: Helper.getIIIFFormat(object.mime_type),
        type: Helper.getIIIFObjectType(object.mime_type) || "",
        resourceID: object.pid,
        resourceUrl: config.rootUrl + "/datastream/" + object.pid + "/" + AppHelper.getDsType(object.mime_type),
        thumbnailUrl: config.rootUrl + "/datastream/" + object.pid + "/tn",
        pageCount: pageCount,
        extension: AppHelper.getFileExtensionFromFilePath(object.object),
        filename: filename
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
}
exports.getManifestObject = getManifestObject;

getObjectsInCollection = function(collectionId, page=1, facets=null, sort=null, pageSize=10, daterange=null, callback) {
  let maxPages = config.maxElasticSearchResultCount / pageSize;
  if(page > maxPages) {
    let error = "Page number is out of range.";
    callback(error, []);
  }
  else {
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

        // Validate repository response
        if(response && response.length > 0) {
          collection.count = response.list.length;
          collection.list = Helper.getObjectLinkDisplayList(JSON.parse(response.list));
          collection.facets = response.facets || {};
          collection.title = response.display_record?.title || "";
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
              response = response.elasticResponse;
              
              if (error){
                callback(error, null);
              }
              else if(from > response.hits.total.value) {
                callback("Invalid page number ", null);
              }
              else {
                var results = [];
                for(var index of response.hits.hits) {
                  results.push(index._source);
                }

                collection.list = Helper.getObjectLinkDisplayList(results);
                collection.facets = response.aggregations;
                collection.count = response.hits.total.value;

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
                      collection.title = object.display_record.title || "No Title";
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
}
exports.getObjectsInCollection = getObjectsInCollection;

getParentTrace = function(pid, collections, callback) {
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
        if(typeof response.display_record.title == "object") {
          title = response.display_record.title[0];
        }
        else {
          title = response.display_record.title || "Untitled Collection";
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

getTitleString = function(pids, titles, callback) {
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
    else {
      titles.push({
          name: response ? response.display_record.title : pid,
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

getTopLevelCollections = function(page=1, callback) {
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
        getObjectsInCollection(config.topLevelCollectionPID, page, null, {"field": "Title", "order": "asc"}, 1000, null, function(error, collections) {
          if(error) {
            Logger.module().error('ERROR: ' + `Error retrieving collections: ${error}`);
            callback(error, null);
          }
          else {
            callback(null, collections);
          }
        });
      }
  })
}
exports.getTopLevelCollections = getTopLevelCollections;

purgeCache = function(cacheName, refresh=false) {
  let cacheFiles = Cache.getList(cacheName),
      pid = "", 
      url = "";

  Logger.module().info('INFO: ' + `Purging ${cacheName} cache...`);
  for(let file of cacheFiles) {

    // Extract the object pid from the filename
    pid = file.substring(0, file.lastIndexOf("."));
    if(pid.indexOf(config.compoundObjectPartID) > 0) {
      pid = pid.substring(0, pid.indexOf(config.compoundObjectPartID));
    }

    Logger.module().info('INFO: ' + `Verifying cache item for object ${pid}...`);
    fetchObjectByPid(config.elasticsearchPublicIndex, pid, function (error, object) {
      if(error) {
        Logger.module().error('ERROR: ' + error);
      }

      // Object not found in public index
      else if(object == null) {
        Cache.removeObject(cacheName, file, function(error) {
          if(error) {
            Logger.module().error('ERROR: ' + `Error removing cache file: ${file}, Error: ${error}`);
          }
          else {
            Logger.module().info('INFO: ' + `Removed ${file}. Object not found in index.`);
          }
        });
      }
      else if(AppHelper.isCollectionObject(object) == false) {
        Datastreams.verifyObject(object, "object", function(error, isValid, objectID="") {
          if(error) {
            Logger.module().error('ERROR: ' + error);
          }

          // Object not found in DuraCloud
          else if(isValid == false) {
            Cache.removeObject(cacheName, file, function(error) {
              if(error) {
                Logger.module().error('ERROR: ' + `Error removing cache file: ${file}, Error: ${error}`);
              }
              else {
                Logger.module().info('INFO: ' + `Removed ${file}. Object not found in repository.`);
              }
            });
          }
          else {
            if(refresh) {
              addCacheItem(objectID, cacheName, true);
            }
          }
        })
      }
      else {
        Logger.module().info('INFO: ' + `Skipping repository stream verification for collection object: ${pid}`);
      }
    });
  }

  return 0;
}
exports.purgeCache = purgeCache;

removeCacheItem = function(objectID, cacheName, callback) {
  Logger.module().info('INFO: ' + `Removing ${cacheName} cache item for object: ${objectID}`);

  fetchObjectByPid(config.elasticsearchPublicIndex, objectID, function (error, object) {
    if(error) {
      Logger.module().error('ERROR: ' + error);
    }

    else if (object) {
      var items = [];

      // Is a compound object. Remove all compound object part items from the cache
      if(AppHelper.isParentObject(object)) {
        for(var part of AppHelper.getCompoundObjectPart(object, -1)) {
          items.push({
            pid: objectID + config.compoundObjectPartID + (part.order || part.sequence || "1"),
            mime_type: part.type || null,
            object: part.object || ""
          });
        }
      }

      // Is a collection object. Remove all cache items for the collection
      else if(AppHelper.isCollectionObject(object)) {
        getCollectionChildren(objectID, config.elasticsearchPublicIndex, function(error, pids) {
          for(var i in pids) {
            removeCacheItem(pids[i], cacheName);
          }
        });
      }

      // Is a single object
      else {
        items.push({
          pid: objectID,
          mime_type: object.mime_type || null,
          object: object.object || ""
        });
      }

      for(var item of items) {
        let extension;
        if (cacheName == "thumbnail") {
          extension = config.thumbnailFileExtension;
        }
        else if (cacheName == "object") {
          extension = AppHelper.getFileExtensionFromFilePath(item.object) || AppHelper.getFileExtensionForMimeType(item.mime_type);
        }
        else {
          extension = AppHelper.getFileExtensionForMimeType(item.mime_type || null)
        }
        let filename = item.pid + "." + extension;

        if(Cache.exists(cacheName, item.pid, extension)) {
          Logger.module().info('INFO: ' + `Removing cache file for object: ${item.pid}...`);

          Cache.removeObject(cacheName, filename, function(error, filepath) {
            if(error) {
              Logger.module().error('ERROR: ' + error);
            }
            else {
              Logger.module().info('INFO: ' + `has been removed from the ${cacheName} cache`);
            }
          });
        }
        else {
          Logger.module().info('INFO: ' + `${filename} does not exist in cache`);
        }
      }
    }

    else {
      Logger.module().info('INFO: ' + `Object not found. Pid: ${objectID}`);
    }
  });
  return false;
}
exports.removeCacheItem = removeCacheItem;

getFieldValues = function(fieldName, callback) {

  let {field} = config.searchAllFields.find(({id}) =>{
    return id == fieldName;
  });
  
  let data = {
    index: config.elasticsearchPublicIndex,
    _source: [field],
    
    body: {
      query: {
        match_all: {}
      },
      aggs: {
        [fieldName]: {
          "terms": {
            "field": `${field}.keyword`,
            "size": 10000
          }
        }
      },
      size: 10000
    }
  }

  es.search(data).then(function ({aggregations}) {

    let values = aggregations[fieldName].buckets.map(({key}) => {
      return key.trim();
    }).sort()

    callback(null, values);

  }, function (error) {
    callback(error, null);
  });
}
exports.getFieldValues = getFieldValues;