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

  	// Switch object type, calling function for each : collection, compound, object














    // Check for a local thumbnail image
    let path = config.tnPath + objectID.match(/[0-9]+/)[0] + sequence + config.thumbnailFileExtension;
    if(fs.existsSync(path) == false) {

      // If type is collection
      // Get tn 

      // If not video: url = IIIF.getThumbnailUri(objectID)
      // If video: url = [kaltura endpoint for video tn]

      // No local image found, stream the thumbnail image from iiif api
      streamRemoteData(IIIF.getThumbnailUri(objectID), function(error, status, response) {
        
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
          getFileStream(path, function(error, thumbnail) {
              callback(null, thumbnail);
          });
        }
      });
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
        path = config.objectFilePath + objectID.match(/[0-9]+/)[0] + sequence + "." + extension;

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

