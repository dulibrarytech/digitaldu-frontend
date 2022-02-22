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
 * @param {Array.<Object>} object - index document source Required fields: "object", "thumbnail" 
 * @param {Array.<String>} datastreamID - datastream ID
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {datastream|null} Null if error
 * 
 * @param {<String>} apikey - Api key to use private (admin) index to fetch unpublished datastreams
 *
 * @return {undefined}
 */
exports.getDatastream = function(object, datastreamID, callback, apikey=null) {
  let settings = null;

  datastreamID == "thumbnail" ? "tn" : datastreamID;
  if(datastreamID == "tn") {
    if(Helper.isCollectionObject(object)) {
      settings = config.thumbnailDatastreams.collection || null;
    }
    else {
      if(object.isCompound) {
        objectType = "compound";
      }
      else {
        let extension = object.object ? AppHelper.getFileExtensionFromFilePath(object.object) : AppHelper.getFileExtensionForMimeType(object.mime_type || ""),
            mimeType = extension ? Helper.getMimeType(extension) : object.mime_type || null,
            objectType = Helper.getObjectType(mimeType);
      }
      settings = config.thumbnailDatastreams.object.type[objectType] || null;

      if(settings) {
        let uri = null;
        if(settings.source == "auto") {
          let data = getAutoStreamSource(datastreamID, object);
          uri = data.uri;
          settings.source = data.source;
        }

        else {
          switch(settings.source) {
            case "iiif":
              uri = IIIF.getThumbnailUri(objectID, apiKey);
              break;
            case "kaltura":
              uri = Kaltura.getThumbnailUrl(object);
              break;
            case "repository":
              uri = object.thumbnail;
              break;
            case "remote":
              uri = object.thumbnail;
              break;
            default:
              console.log("Invalid source setting, could not detrmine uri");
              break;
          }
        }
        if(config.nodeEnv == "devlog") {console.log("Thumbnail image stream uri:", uri || "null")}

        if(uri == null || uri == "") {
          callback(`Could not construct uri for datastream request. uri field is null. Check object source fields. Stream option: ${(settings.source || "null")} Pid: ${object.pid}`, null, object);
        }
        else {
          if(settings.source == "repository") {
            Repository.streamData(object, "tn", function(error, stream) {
              if(error) {
                console.log(`Repository fetch error: ${error} Object: ${object.pid}`);
                streamDefaultThumbnail(object, callback);
              }
              else {
                if(stream) {
                  callback(null, stream, object);
                }
                else {
                  console.log(`Repository fetch error: Source not available. Object: ${object.pid}`)
                  streamDefaultThumbnail(object, callback);
                }
              }
            });
          }
          else {
            streamRemoteData(uri, function(error, status, stream) {
              if(error) {
                console.log(`Remote stream error: ${error} Object: ${object.pid}`);
                streamDefaultThumbnail(object, callback);
              }
              else if(stream == null) {
                console.log(`Remote stream error: Source not available. Object: ${object.pid}`);
                streamDefaultThumbnail(object, callback);
              }
              else {
                if(status == 200) {
                  callback(null, stream, object);
                }
                else {
                  console.log(`Remote stream error: Response status: ${status} Object: ${object.pid}`);
                  streamDefaultThumbnail(object, callback);
                }
              }
            });
          }
        }
      }
      else {
        callback(`Could not determine datastream settings for object ${object.pid}. Check configuration or object source data. Object path: ${object.object || "null"} Mime type: ${object.mime_type || "null"}`, null, object);
      }
    }
  }
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

      // Get jpg derivative from Cantaloupe
      else if(Helper.getObjectType(mimeType) == "still image" &&
              extension == "jpg" &&
              datastreamID != "object") {

        uri = config.IIIFServerUrl + "/iiif/2/" + objectID + "/full/full/0/default.jpg";
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
  console.log("Streaming default thumbnail for object " + objectID);
  let path = config.thumbnailDefaultImagePath + config.defaultThumbnailImage;

  // Check for an object specific default thumbnail image.  If found, use it
  for(var index in config.objectTypes) {
    if(config.objectTypes[index].includes(object.mime_type)) {
      path = config.thumbnailDefaultImagePath + config.thumbnailPlaceholderImages[index];
    }
  }

  // Create the thumbnail stream
  // TODO: Replace with File module function
  getFileStream(path, function(error, thumbnail) {
    if(error) {callback("Error fetching default thumbnail image: " + error, null, object)}
    else{callback(null, thumbnail, object, true)}
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

var getAutoStreamSource = function(dsid, object) {
  let data = {
    uri: null,
    source: "repository"
  }



  return data;
}