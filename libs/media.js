const async = require('async');
const config = require('../config/config');
const fs = require('fs');

const getStream = require('get-stream');
const got = require('got');
const request = require('request');
const srequest = require('syncrequest');
 
got.stream('sindresorhus.com').pipe(fs.createWriteStream('index.html'));
//const request = require('request-stream');

exports.getFileStream = function(path, callback) {

	//var testpath =  "http://www.google.com";
	var testpath = "http://librepo01-vlp.du.edu:8080/fedora/objects/codu:37703/datastreams/MP4/content";

	// Async
	// request(testpath, function(err, response, body) {
	// 	if(err) {
	// 		console.log("Error: Could not open stream", err);
	// 		callback(null);
	// 	}
	// 	else {
	// 		console.log("TEST GFS pre callback, response status is", response.statusCode);
	// 		//console.log("Stream: ", body);
	// 		callback(body);
	// 	}
	// });

	// Sync
	var result = srequest.sync(testpath);
	return result;
}