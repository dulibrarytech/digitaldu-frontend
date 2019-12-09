'use strict'

const request = require('request'),
	  fs = require ('fs');

/*
 * Write file to backend cache
 */
exports.cacheRemoteData = function(stream, filepath, callback) {
	stream.pipe(fs.createWriteStream(filepath)).on('close', function() {
		// Test file size
		callback(null);
	});
}