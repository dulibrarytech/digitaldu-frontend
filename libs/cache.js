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
exports.cacheDatastream = function(cacheName, objectID, stream, extension, callback) {
	let filepath = "";
	if(cacheName == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + "/" + objectID + "." + config.thumbnailFileExtension;
	}
	else {
		filepath = config.objectDerivativeCacheLocation + "/" + objectID + "." + extension;
	}

	if(stream && typeof stream == 'object') {
		try {
			stream.pipe(fs.createWriteStream(filepath)).on('close', function() {
				callback(null);
			});
		}
		catch(e) {
			callback(e);
		}
	}
	else {
		callback("Invalid stream, can not write stream data.");
	}
}

/*
 * Check if a file exists in the cache
 */
exports.exists = function(cacheName, objectID, extension="") {
	let filepath = "";	
	if(cacheName == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + "/" + objectID + "." + config.thumbnailFileExtension;
	}
	else {
		filepath = config.objectDerivativeCacheLocation + "/" + objectID + "." + extension;
	}

	return fs.existsSync(filepath) || false;
}

/*
 * Fetch a file stream
 */
exports.getFileStream = function(cacheName, objectID, extension="", callback) {
	let filepath = "";	
	if(cacheName == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + "/" + objectID + "." + config.thumbnailFileExtension;
	}
	else {
		filepath = config.objectDerivativeCacheLocation + "/" + objectID + "." + extension;
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
 * Remove a cached object
 */
exports.removeObject = function(cacheName, filename, callback) {
	let filepath = "";
	if(cacheName == 'thumbnail') {
		filepath = config.thumbnailImageCacheLocation + "/" + filename;
	}
	else {
		filepath = config.objectDerivativeCacheLocation + "/" + filename;
	}

	fs.unlink(filepath, function(error) {
		if(error) {
			callback("Error removing cache file: " + filename + " " + error, null);
		}
		else {
			callback(null, filepath);
		}
	})
}

/*
 * Returns an array of cached object IDs 
 */
exports.getList = function(cacheName) {
	let list = [];

	if(cacheName == 'thumbnail') {
		list = fs.readdirSync(config.thumbnailImageCacheLocation) || [];
	}
	else {
		list = fs.readdirSync(config.objectDerivativeCacheLocation) || [];
	}

	return list;
}