'use strict'

const request = require('request'),
	  fs = require ('fs');

/*
 * Write file to backend cache
 */
exports.cacheRemoteData = function(uri, filepath, callback) {
	request.head(uri, function(err, res, body) {
	    if(err) {
			callback(err);
		}
		else if(res.statusCode != 200) {
			console.log('Stream response content-type:', res.headers['content-type']);
	    	console.log('Stream response content-length:', res.headers['content-length']);
			callback("Can not retrieve datastream " + uri + " Status code is " + res.statusCode);
		}
		else {
	    	request(uri).pipe(fs.createWriteStream(filepath)).on('close', callback);
	    }
	});
}