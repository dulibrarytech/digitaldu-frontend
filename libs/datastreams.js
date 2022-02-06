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
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
  HttpRequest = require("../libs/http-request"),
  fetch = require('node-fetch'),
  fs = require('fs'),
  Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
  IIIF = require('../libs/IIIF');

/**
 * Get a datastream for an object
 * Return a placeholder image if the requested datastream is not available (thumbnail datastreams only)
 *
 * @param {Array.<Object>} object - index document source Required 
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
exports.getDatastream = function(object, objectID, datastreamID, partIndex=null, apiKey, callback) { // TODO remove partIndex param, then remove from all function calls
  var fileType = "default";
  if(Helper.isParentObject(object)) {
     fileType = "compound";
  }

  if(datastreamID == "tn") {
    for(let type in config.objectTypes) {
      if(config.objectTypes[type].includes(object.mime_type)) {
        fileType = type;
      }
    }

    var settings = config.thumbnails[object.object_type] || null;
    if(settings) {
      if(settings.type && settings.type[fileType]) {
        settings = settings.type[fileType];
      }

      if(settings.source == "repository") {
        Repository.streamData(object, "tn", function(error, stream) {
          if(error) {
            console.error(error);
            streamDefaultThumbnail(object, callback);
          }
          else {
            if(stream) {
              callback(null, stream, object);
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
            uri = getIndexTnUri(object.pid, object.thumbnail || uri);
            break;
          default:
            console.log("Error retrieving datastream for", objectID);
            break;
        }

        if(config.nodeEnv == "devlog") {console.log("Thumbnail image stream uri:", uri || "null")}
        if(uri == null || uri == "") {
          console.log("Could not construct uri for datastream request. uri field is null. Stream option: " + (settings.streamOption || "null") + " Pid: " + objectID);
        }
        streamRemoteData(uri, function(error, status, stream) {
          if(error) {
            console.log(error);
            streamDefaultThumbnail(object, callback);
          }
          else if(stream == null) {
            console.log("Datastream error: Can not fetch datastream for object " + objectID);
            streamDefaultThumbnail(object, callback);
          }
          else {
            if(status == 200) {
              callback(null, stream, object);
            }
            else {
              console.log("Datastream error: " + uri + " returns a status of " + status);
              console.log("Using default thumbnail for object " + objectID);
              streamDefaultThumbnail(object, callback);
            }
          }
        });
      }
    }
    else {
      console.log("Error retrieving datastream for " + objectID + ", can not find configuration settings for object type " + object.object_type);
      streamDefaultThumbnail(object, callback);
    }
  }

  // Request a non-thumbnail datastream
  else {
    let extension = "file",
        mimeType = Helper.getContentType("object", object); 

    if(datastreamID == "object") {
      extension = object.object ? Helper.getFileExtensionFromFilePath(object.object) : Helper.getFileExtensionForMimeType(object.mime_type || null);
    }
    else {
      extension = datastreamID;
    }

    if(object.object) {
      let objectType = Helper.getObjectType(mimeType),
          viewerId = object.entry_id || object.kaltura_id || null;

      // Stream from Kaltura api
      if(config.streamSource[objectType] == "kaltura" && viewerId) {
        let kalturaStreamUri = Kaltura.getStreamingMediaUrl(viewerId, extension);
        if(config.nodeEnv == "devlog") {console.log("Kaltura stream uri:", kalturaStreamUri)}

        if(datastreamID == "object" || datastreamID == Helper.getFileExtensionFromFilePath(object.object)) {
          streamKalturaData(kalturaStreamUri, function(error, status, stream) {
            if(error) { callback(error, null, object) }
            else { 
              callback(null, stream, object) 
            }
          });
        }
        else {
          callback(null, null, object);
        }
      }

      // Get jpg
      else if(Helper.getObjectType(mimeType) == "still image" &&
              extension == "jpg" &&
              datastreamID != "object") {

        // Get cantaloupe uri for jpg
        let server = Helper.getFileExtensionFromFilePath(object.object) == "tif" ? config.IIIFTiffServerUrl : config.IIIFServerUrl,
            uri = server + "/iiif/2/" + objectID + "/full/full/0/default.jpg";

        streamRemoteData(uri, function(error, status, stream) {
          if(error) {
            if(config.nodeEnv == "devlog") {console.log(error)}
            callback(error, null, object);
          }
          else if(stream == null) {
            let msg = "Datastream error: Can not fetch Cantaloupe derivative for object/uri ", objectID, uri;
            console.log(msg);
            callback(msg, null, object);
          }
          else {
            if(status == 200) {
              callback(null, stream, object);
            }
            else {
              let msg = "Cantaloupe source error: " + uri + " returns a status of " + status;
              console.log(msg);
              callback(msg, null, object);
            }
          }
        });
      }

      else {
        Repository.streamData(object, datastreamID, function(error, stream) {
          if(error || !stream) {
            console.log("Repository stream data error: " + (error || "Path to resource not found. Pid: " + objectID));
            callback(null, null, object);
          }
          else {
            callback(null, stream, object);
          }
        });
      }
    }
    else {
      console.log("'object' path not found in index. Pid: " + objectID);
      callback(null, null, object);
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
    HttpRequest.get_stream(uri, {}, function(error, status, data) {
      if(error) {
        callback("HTTP request error: " + error, null, null);
      }
      else if(status != 200) {
        console.log("Request for data received status", status);
        callback(null, status, null);
      }
      else {
        callback(null, status, data);
      }
    });
  }
  else {
     callback(null, 404, null);
  }
}

var streamKalturaData = function(uri, callback) {
  if(uri) {
    HttpRequest.get_stream(uri, {followRedirects: true}, function(error, status, stream) {
      if(error) {
        callback("Could not open Kaltura datastream. Uri: " + uri + " Error: " + error, null, null);
      }
      else {
        if(status == 200) { 
          callback(null, status, stream) 

        }
        else {
          callback(null, status, null);
        }
      }
    });

  }
  else {
     callback(null, 404, null);
  }
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
 * @param {Object} object - index document object
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
    if(error) {callback("Error fetching default thumbnail image: " + error, null, object)}
    else{callback(null, thumbnail, object, true)}
  });
}

var getIndexTnUri = function(objectID, uri) {
  // Thumbnail value is assumed to be an object pid. If thumbnail pid == this object, do not use it (infinite loop)
  if(uri && uri.indexOf("http") < 0) {
    uri = (objectID == uri) ? null : config.rootUrl + "/datastream/" + uri + "/tn";
  }

  return uri;
}

/**
 * Sends a head request to the repository to verify that a specified datastream is available for an object
 *
 * @param {Object} object - index document object
 * @param {String} datastreamID - type of datastream to verify
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {Boolean} - true if object request status is 200, false if not 200
 *
 * @return {undefined}
 */
exports.verifyObject = function(object, datastreamID, callback) {
  if(datastreamID != "tn" && datastreamID != "object") {
    datastreamID = "object";
  }

  Repository.getStreamStatus(object, datastreamID, function(error, status) {
    if(error) {
      callback(error, null);
    }
    else {
      if(status == "200") {
        callback(null, true, object.pid);
      }
      else {
        callback(null, false);
      }
    }
  });
}

