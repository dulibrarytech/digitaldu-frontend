 /**
 * @file 
 *
 * Fedora Repository Interface 
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	  request = require('request');

const host = config.repositoryUrl;
//http://archivesdu.duracloud.org/durastore/dip-store/dip-store/ 		// repo url

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getRootCollections = function() {
	return new Promise(function(fulfill, reject) {
		fulfill([]);
	});
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getCollectionObjects = function(collectionID) {
	return new Promise(function(fulfill, reject) {
		fulfill([]);
	});
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getDatastreamUrl = function(datastream, pid) {
	return host + "/" + pid;	
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.streamData = function(object, dsid, callback) {
	var url;

	if(dsid == "tn") {
		url = host + "/" + object.thumbnail;
	}
	else {
		url = host + "/" + object.object;
	}

	// Get the stream 
	var rs = require('request-stream');
	rs(url, {}, function(err, res) {
		if(err) {
			callback("Could not open datastream. " + err + " Check connection to repository", null);
		}
		else {
			callback(null, res);
		}
	});

	// request(url, function(error, res, body) {
	// 	if(error) {
	// 		callback(error, []);
	// 	}
	// 	else {
	// 		callback(null, res);
	// 	}
	// });

	// var fs = require('fs');
	// callback(null,request(url).pipe(fs.createWriteStream('doodle.png')));
}