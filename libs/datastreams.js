 /**
 * @file 
 *
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
  rs = require('request-stream'),
  request = require("request"),
  fetch = require('node-fetch'),
  fs = require('fs'),
  Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
  Cache = require('../libs/cache'),
  IIIF = require('../libs/IIIF');
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
 * Get a datastream for an object
 *
 * @param {Array.<Object>} object - index document source
 * @param {Array.<String>} objectID - object PID
 * @param {Array.<String>} datastreamID - datastream ID
 * @param {Array.<String|null>} part - Part sequence order value if compound object, null if single object
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {datastream|null} Null if error
 *
 * @return {undefined}
 */
exports.getDatastream = function(object, objectID, datastreamID, part, apiKey, callback) {
  var mimeType = object.mime_type || object.type || null,
      fileType = "default";

  // If there is a part value, retrieve the part data.  Redefine the object data with the part data
  if(Helper.isParentObject(object) && part) {
    var sequence;
        fileType = "compound";

    // Get the data from the part object, set as object for datastream request. If part is not found, part will be ignored and input object will be used to stream data
    let objectPart = Helper.getCompoundObjectPart(object, part);
    if(objectPart) {
      objectPart["object_type"] = "object";
      objectPart["mime_type"] = objectPart.type ? objectPart.type : (objectPart.mime_type || null);
      object = objectPart;
      sequence = config.compoundObjectPartID + part;
      objectID = objectID + sequence;
    }
  }
  else {
    sequence = "";
  }

  if(datastreamID == "tn") {
    for(let type in config.objectTypes) {
      if(config.objectTypes[type].includes(object.mime_type)) {
        fileType = type;
      }
    }

    // Get the thumbnail configuration settings
    var settings = config.thumbnails[object.object_type] || null;
    if(!object.mime_type && object.object_type != "collection") {settings = null}
    if(settings) {
      if(settings.type) {
        settings = settings.type[fileType] || null;
      }

      if(settings.cache == false || Cache.exists('thumbnail', objectID) == false) {

        // Get the stream from the repository
        if(settings.source == "repository") {
          Repository.streamData(object, "tn", function(error, stream) {
            if(error) {
              console.error(error);
              streamDefaultThumbnail(object, callback);
            }
            else {
              if(stream) {
                if(config.thumbnailImageCacheEnabled == true && settings.cache == true) {
                  Cache.cacheDatastream('thumbnail', objectID, stream, null, function(error) {
                    if(error) {console.error("Could not create thumbnail image for", objectID, error)}
                    else {console.log("Thumbnail image created for", objectID)}
                  });
                }
                callback(null, stream);
              }
              else {
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }

        // Get the stream from an external source
        else {
          let uri = settings.uri || null;
          switch(settings.streamOption || "") {
            case "iiif":
              uri = IIIF.getThumbnailUri(objectID, apiKey);
              break;
            case "kaltura":
              uri = Kaltura.getThumbnailUrl(object);
              break;
            case "external":
              break;
            case "index":
              uri = getIndexTnUri(object.thumbnail || uri);
              break;
            default:
              callback("Error retrieving datastream for " + objectID + ", object type " + object.object_type + "is invalid", null);
              break;
          }

          streamRemoteData(uri, function(error, status, stream) {
            if(error) {
              if(config.nodeEnv == "devlog") {
                console.log(error);
              }
              streamDefaultThumbnail(object, callback);
            }
            else if(stream == null) {
              console.log("Datastream error: Can not fetch datastream", objectID);
              streamDefaultThumbnail(object, callback);
            }
            else {
              if(status == 200) {
                if(config.thumbnailImageCacheEnabled == true && settings.streamOption != "index") {
                  Cache.cacheDatastream('thumbnail', objectID, stream, null, function(error) {
                    if(error) {console.error("Could not create thumbnail image for", objectID, error)}
                    else {console.log("Thumbnail image created for", objectID)}
                  });
                }
                callback(null, stream);
              }
              else {
                console.log("Datastream error: " + uri + " returns a status of " + status);
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }
      }

      // Cached thumbnail image found
      else {
        Cache.getFileStream('thumbnail', objectID, null, function(error, stream) {
          if(error) {callback(error, null)}
          else {callback(null, stream)}
        });
      }
    }
    else {
      console.error("Error retrieving datastream for " + objectID + ", can not find configuration settings for object type " + object.object_type, null);
      streamDefaultThumbnail(object, callback);
    }
  }

  // Request a non-thumbnail datastream. Streaming from Kaltura has not been implemented
  else {
    var isCached = false;
    for(var type in config.objectTypes) {
      if(config.objectTypes[type].includes(object.mime_type)) {
        if(config.objectDerivativeCacheEnabled && config.cacheTypes.includes(type)) {
          isCached = true;
        }
      }
    }
    var extension = Helper.getFileExtensionForMimeType(mimeType);
    if(!extension) {
      extension = "file";
    }
    if(isCached && Cache.exists('object', objectID, extension) == true) {
      Cache.getFileStream('object', objectID, extension, function(error, stream) {
        if(error) {
          callback(error, null);
        }
        else {
          callback(null, stream);
        }
      })
    }

    else {
      // Stream data from Kaltura server, if this is an a/v object with an entry_id value
      let viewerId = object.entry_id || object.kaltura_id || null;
      if(object.mime_type && 
        (config.objectTypes["audio"].includes(object.mime_type)) || (object.mime_type && config.objectTypes["video"].includes(object.mime_type)) &&
        viewerId) {

          let kalturaStreamUri = Kaltura.getStreamingMediaUrl(viewerId, extension);
          streamKalturaData(kalturaStreamUri, function(error, status, stream) {
            if(error) { callback(error, null) }
            else { 
              let str = stream ? "not null" : "null"
              callback(null, stream) 
            }
          });
      }

      // Stream data from the repository
      else {
        Repository.streamData(object, datastreamID, function(error, stream) {
          if(error || !stream) {
            callback("Repository stream data error: " + (error || "Path to resource not found. Pid:" + objectID), null);
          }
          else {
            if(config.objectDerivativeCacheEnabled == true && isCached) {
              Cache.cacheDatastream('object', objectID, stream, extension, function(error) {
                if(error) { console.error("Could not create object file for", objectID, error) }
                else { console.log("Object file created for", objectID) }
              });
            }
            callback(null, stream);
          }
        });
      }
    }
  }
}

/**
 * Request data stream from uri
 *
 * @param {String} uri - Uri of data source
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {http status code|null} - Response status code, Null if error
 * @param {response|null} Response data, Null if error
 *
 * @return {undefined}
 */
var streamRemoteData = function(uri, callback) {
  if(uri) {
    rs(uri, {followRedirects: true}, function(err, res) {
      if(err) {
        callback("Could not open datastream. " + err, null, null);
      }
      else {
        if(res.socket.bytesRead < 500) {
          callback(null, 204, null);
        }
        else {
          callback(null, res.statusCode, res);
        }
      }
    });
  }
  else {
     callback(null, 404, null);
  }
}

var streamKalturaData = function(uri, callback) {
  if(uri) {
    rs(uri, {followRedirects: true}, function(err, res) {
      if(err) {
        callback("Could not open datastream. " + err, null, null);
      }
      else {
        if(res.statusCode == 200) {
          // Get the redirect path, stream remote data
          let kalturaDownloadUri = res.connection._httpMessage._header.replace("GET ", "");
          kalturaDownloadUri = kalturaDownloadUri.substring(0, kalturaDownloadUri.indexOf("/a.")+6);
          streamRemoteData(kalturaDownloadUri, function(error, status, stream) {
            if(error) { callback(error, 500, null) }
            else { 
              let str = stream ? "not null" : "null"
              callback(null, status, stream) 
            }
          });
        }
        else {
          callback(null, res.statusCode, res);
        }
      }
    });
  }
  else {
     callback(null, 404, null);
  }
}

/**
 * Request data from uri
 *
 * @param {String} uri - Uri of data source
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {http status code|null} - Response status code, Null if error
 * @param {response|null} Response data, Null if error
 *
 * @return {undefined}
 */
var fetchRemoteData = function(uri, callback) {
    request(uri, function(error, response, body) {
      if(error) {callback(error, null)}
      else {callback(null, response)}
    });
}

/**
 * Get a file stream from a local file
 *
 * @param {String} path - Path to file in local folder
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {file stream|null} - Node 'fs' readStream, Null if error
 *
 * @return {undefined}
 */
var getFileStream = function(path, callback) {
    callback(null, fs.createReadStream(path));
}

/**
 * Check for an object-specific default thumbnail image.  If none is found, stream the default generic thumbnail image
 *
 * @param {Object} object - index document source
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {file stream|null} - Node 'fs' readStream, Null if error
 *
 * @return {undefined}
 */
var streamDefaultThumbnail = function(object, callback) {
  let path = config.thumbnailDefaultImagePath + config.defaultThumbnailImage;

  // Check for an object specific default thumbnail image.  If found, use it
  for(var index in config.objectTypes) {
    if(config.objectTypes[index].includes(object.mime_type)) {
      path = config.thumbnailDefaultImagePath + config.thumbnailPlaceholderImages[index];
    }
  }

  // Create the thumbnail stream
  getFileStream(path, function(error, thumbnail) {
    if(error) {callback(error, null);}
    else{callback(null, thumbnail);}
  });
}

var getIndexTnUri = function(uri) {
  // Thumbnail value is assumed to be an object pid
  if(uri && uri.indexOf("http") < 0) {
    uri = config.rootUrl + "/datastream/" + uri + "/tn";
  }

  return uri;
}

