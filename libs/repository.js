 /**
 * @file 
 *
 * Fedora Repository Interface 
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	  request = require('request'),
	  rs = require('request-stream');

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
 * Datastream request
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
	rs(url, {}, function(err, res) {
		if(err) {
			callback("Could not open datastream. " + err + " Check connection to repository", null);
		}
		else {
			callback(null, res);
		}
	});
}