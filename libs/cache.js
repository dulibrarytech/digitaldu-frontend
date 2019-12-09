'use strict'

const config = require('../config/' + process.env.CONFIGURATION_FILE), 
	  fs = require ('fs');

/*
 * Write file to backend cache
 */
exports.cacheDatastream = function(objectType, objectID, stream, extension, callback) {
	let filepath;
	if(objectType == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + objectID + config.thumbnailFileExtension;
	}
	else if(objectType == 'object') {
		filepath = config.objectDerivativeCacheLocation + objectID + "." + extension;
	}

	if(typeof stream == 'object' && stream.statusCode) {
		stream.pipe(fs.createWriteStream(filepath)).on('close', function() {
			callback(null);
		});
	}
	else {
		callback("Invalid stream, can not write stream data");
	}
}

/*
 * Check if a file exists in the cache
 */
exports.exists = function(objectType, objectID, extension="") {
	let filepath;	
	if(objectType == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + objectID + config.thumbnailFileExtension;
	}
	else if(objectType == 'object') {
		filepath = config.objectDerivativeCacheLocation + objectID + "." + extension;
	}
	return fs.existsSync(filepath) || false;
}

/*
 * Fetch a file stream
 */
exports.getFileStream = function(objectType, objectID, extension="", callback) {
	let filepath;	
	if(objectType == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + objectID + config.thumbnailFileExtension;
	}
	else if(objectType == 'object') {
		filepath = config.objectDerivativeCacheLocation + objectID + "." + extension;
	}

	let readStream = fs.createReadStream(filepath);
	readStream.on('open', function () {
	    callback(null, readStream);
	});
	readStream.on('error', function(err) {
	    callback(err, null);
	});
}

/*
 * TODO move this to AppHelper lib
 */
var getFileExtensionForMimeType = function(mimeType) {
	var extension = "";
	for(extension in config.fileExtensions) {
      if(config.fileExtensions[extension].includes(mimeType)) {
        break;
      }
    }
    return extension;
}