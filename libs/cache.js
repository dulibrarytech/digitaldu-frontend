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