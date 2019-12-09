 /**
 * @file 
 *
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
  rs = require('request-stream'),
  request = require('request'),
  fs = require('fs'),
  Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
  Cache = require('../libs/cache'),
  IIIF = require('../libs/IIIF'),
  AppHelper = require("../libs/helper");

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
    //var tnPath = config.thumbnailImageCacheLocation + objectID + config.thumbnailFileExtension;
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
        callback("Error retrieving datastream for " + objectID + ", can not find configuration settings for object type " + object.object_type, null);
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
                if(config.thumbnailImageCacheEnabled == true) {
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
              console.error(error);
              streamDefaultThumbnail(object, callback);
            }
            else if(stream == null) {
              console.log("Datastream error: Can not fetch datastream", objectID);
              streamDefaultThumbnail(object, callback);
            }
            else {
              if(status == 200) {
                if(config.thumbnailImageCacheEnabled == true) {
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

  // Request a non-thumbnail datastream
  else {
    var extension = AppHelper.getFileExtensionForMimeType(mimeType);
    if(Cache.exists('object', objectID, extension) == false) {
      Repository.streamData(object, datastreamID, function(error, stream) {
        if(error || !stream) {
          callback("Repository stream data error: " + (error || "Resource not found for " + objectID), null);
        }
        else {
            if(config.objectDerivativeCacheEnabled == true) {
              Cache.cacheDatastream('object', objectID, stream, extension, function(error) {
                if(error) {console.error("Could not create object file for", objectID, error)}
                else {console.log("Object file created for", objectID)}
              });
            }
            callback(null, stream);
          }
      });
    }
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
var streamRemoteData = function(uri, callback) {
  rs(uri, {}, function(err, res) {
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

