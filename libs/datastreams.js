 /**
 * @file 
 *
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	rs = require('request-stream'),
	fs = require('fs'),
	Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
	IIIF = require('../libs/IIIF');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getDatastream = function(object, objectID, datastreamID, part, callback) {
  
  // If there is a part value, retrieve the part data.  Redefine the object data with the part data
  if(part && isNaN(part) === false) {
    var sequence;

    let objectPart = object.display_record.parts[part-1];
    objectPart["object_type"] = "object";

    //  DEV Temporary, unless part object will contain the field 'type' for mime type value
    objectPart["mime_type"] = objectPart.type;

    // Get the datastream for the part object, 
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

      let fileType = "default";
      if(Helper.isParentObject(object)) {
        fileType = "compound";
      }
      else {
        for(var key in config.mimeTypes) {
          if(config.mimeTypes[key].includes(object.mime_type)) {
            fileType = key;
          }
        }
      }

    	var settings = config.thumbnails[object.object_type] || null;
      if(settings && settings.fileTypes) {
        settings = settings.fileTypes[fileType] || null;
      }

      let filePath = null, streamPath = null, uri;
      if(settings == null) {
        callback("Error retrieving datastream for " + objectID + ", can not find configuration settings for object type " + object.object_type, null);
      }
      else {
        uri = settings.uri || "Thumbnail has not been set for " + objectID;
        switch(settings.streamOption || "") {
          case "iiif":
            uri = IIIF.getThumbnailUri(objectID);
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

        if(settings.source == "repository") {
          Repository.streamData(object, "tn", function(error, stream) {
            if(error) {
              callback(error, null);
            }
            else {
              // All is good, return the stream
              if(stream && stream.statusCode == 200) {
                // TODO: Cache the file in local filesystem when retrieved from iiif server?
                callback(null, stream);
              }
              else {
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }
        else {
          streamRemoteData(uri, function(error, status, response) {
            if(error) {
              console.log(error);
            }
            else {
              // All is good, return the stream
              if(response && status == 200) {
                // TODO: Cache the file in local filesystem when retrieved from iiif server?
                callback(null, response);
              }
              else {
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }
      }
    }
    else {
      // Stream thumbnail image from local folder
      getFileStream(path, function(error, thumbnail) {
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
        path = config.objectCachePath + "/" + objectID.match(/[0-9]+/)[0] + sequence + "." + extension;

        if(fs.existsSync(path)) {
          file = path;
        }
      }
    }

    // Stream the local object file if it is found
    if(file) {
      getFileStream(file, function(error, content) {
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

/**
 * 
 *
 * @param 
 * @return 
 */
var streamRemoteData = function(url, callback) {
	rs(url, {}, function(err, res) {
		if(err) {
			callback("Could not open datastream. " + err + " Check connection to repository", null, null);
		}
		else {
			callback(null, res.statusCode, res);
		}
	});
}

/**
 * 
 *
 * @param 
 * @return 
 */
var getFileStream = function(path, callback) {
  	callback(null, fs.createReadStream(path));
}

/**
 * Get fallback path to default thumbnail image
 *
 * @param 
 * @return 
 */
var streamDefaultThumbnail = function(object, callback) {
  let path = config.tnPath + config.defaultThumbnailImage;

  // Check for an object specific default thumbnail image.  If found, use it
  for(var index in config.thumbnailPlaceholderImages) {
    if(config.thumbnailPlaceholderImages[index].includes(object.mime_type)) {
      path = config.tnPath + index;
    }
  }

  // Create the thumbnail stream
  getFileStream(path, function(error, thumbnail) {
      callback(null, thumbnail);
  });
}

