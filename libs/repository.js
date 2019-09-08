/**
 * @file 
 *
 * Fedora Repository Interface 
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	  rs = require('request-stream');

const path = config.repositoryPath,
	  protocol = config.repositoryProtocol,
	  uname = config.repositoryUser,
	  pword = config.repositoryPassword;

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

	try {
		if(!object) { throw "Object is null" }

		if(dsid == "tn") {
			//if(!object.thumbnail || object.thumbnail.length < 1) { throw "Object thumbnail uri not set " + object.pid }
			url = host + "/" + object.thumbnail;
		}
		else {
			//if(!object.object || object.object.length < 1) { throw "Object source uri not set " + object.pid }
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
	catch(e) {
		callback(e, null);
	}
}