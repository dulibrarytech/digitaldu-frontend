 /**
 * @file 
 *
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
  rs = require('request-stream'),
  fetch = require('node-fetch'),
  fs = require('fs'),
  Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
  Cache = require('../libs/cache'),
  IIIF = require('../libs/IIIF'),
  AppHelper = require("../libs/helper");
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
  var mimeType = object.mime_type || object.type || null;
  // If there is a part value, retrieve the part data.  Redefine the object data with the part data
  if(part && isNaN(part) === false) {
    var sequence;

    // Get the data from the part object, set as object for datastream request. If part is not found, part will be ignored and input object will be used to stream data
    let objectPart = AppHelper.getCompoundObjectPart(object, part);
    if(objectPart) {
      objectPart["object_type"] = "object";
      objectPart["mime_type"] = objectPart.type ? objectPart.type : (objectPart.mime_type || null);
      object = objectPart;
      sequence = config.compoundObjectPartID + part;
      objectID = objectID + sequence;
    }
  }

  // If there are no parts in this object, do not append the sequence to the stream url
  else {
    sequence = "";
  }

  // Request a thumbnail datastream
  if(datastreamID == "tn") {
    // Check for a cached image
    if(Cache.exists('thumbnail', objectID) == false) {
      let fileType = "default";
      if(Helper.isParentObject(object)) {
        fileType = "compound";
      }
      else {
        for(let type in config.objectTypes) {
          if(config.objectTypes[type].includes(object.mime_type)) {
            fileType = type;
          }
        }
      }

      // Get the thumbnail configuration settings for this file type
      var settings = config.thumbnails[object.object_type] || null;
      if(settings && settings.fileTypes) {
        settings = settings.fileTypes[fileType] || null;
      }

      // Get the thumbnail uri based on the configuration settings
      let filePath = null, streamPath = null, uri;
      if(settings == null) {
        console.error("Error retrieving datastream for " + objectID + ", can not find configuration settings for object type " + object.object_type, null);
        streamDefaultThumbnail(object, callback);
      }
      else {
        uri = settings.uri || "Thumbnail has not been set for " + objectID;
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
            uri = object.thumbnail || uri;
            break;
          default:
            callback("Error retrieving datastream for " + objectID + ", object type " + object.object_type + "is invalid", null);
            break;
        }

        // Stream the uri from the repository or external source
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
        else {
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
    }

    // Cached thumbnail image found
    else {
      Cache.getFileStream('thumbnail', objectID, null, function(error, stream) {
        if(error) {
          callback(error, null);
        }
        else {
          callback(null, stream);
        }
      })
    }
  }

  // Request a non-thumbnail datastream. Streaming from Kaltura is not yet implemented
  else {
    var extension = AppHelper.getFileExtensionForMimeType(mimeType);

    // File does not exist in local cache. Stream it from remote source
    if(Cache.exists('object', objectID, extension) == false) {

      // Stream data from Kaltura server
      if(object.mime_type && 
        (config.objectTypes["audio"].includes(object.mime_type)) || (object.mime_type && config.objectTypes["video"].includes(object.mime_type)) &&
        (object.entry_id && object.entry_id.length > 0)) {

          let kalturaStreamUri = Kaltura.getStreamingMediaUrl(object.entry_id, extension);
          fetchRemoteData(kalturaStreamUri, function(error, status, stream) {
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
            let isCached = false;
            for(var type in config.objectTypes) {
              if(config.objectTypes[type].includes(object.mime_type)) {
                if(config.cacheTypes.includes(type)) {
                  isCached = true;
                }
              }
            }
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

    // Stream from local cache
    else {
      Cache.getFileStream('object', objectID, extension, function(error, stream) {
        if(error) {
          callback(error, null);
        }
        else {
          callback(null, stream);
        }
      })
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
      console.log("TEST frd request", uri)

    // TODO request is depriciated, replace with another lib?
    // request(uri, function(error, response, body) {
    //   if(error) {
    //       console.log("TEST dsfetch req err", error)
    //     callback(error, null);
    //   }
    //   else {
    //       console.log("TEST dsfetch req ok, returning body", response.headers)
    //     callback(null, response);
    //   }
    // });

    // test
    fetch('https://github.com/')
    .then(res => res.text())
    .then(body => console.log(body));

    //  tream
    fetch('https://assets-cdn.github.com/images/modules/logos_page/Octocat.png')
    .then(res => {
        const dest = fs.createWriteStream('./octocat.png');
        res.body.pipe(dest);
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

