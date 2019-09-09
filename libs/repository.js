 /**
 * @file 
 *
 * Fedora Repository Interface 
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	  rs = require('./request-stream'),
	  fs = require('fs');

const domain = config.repositoryDomain,
	  path = config.repositoryPath,
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
exports.getCollectionObjects = function(collectionID, facets) {
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
	var url = "", auth = "";

	try {
		if(!object) { throw "Object is null" }

		// Add authentication credentials if present
		if((uname && uname != "") && (pword && pword != "")) {
			auth = uname + ":" + pword + "@";
		}
		url = protocol + "://" + auth + domain + path;

		if(dsid == "tn") {
			url += "/" + object.thumbnail;
		}
		else {
			url += "/" + object.object;
		}

		// Get the stream 
		rs(url, {}, function(err, res) {
			if(err) {
				callback("Could not open datastream. " + err + " Check connection to repository", null);
			}
			else {
				if(res.statusCode == 200) {
					callback(null, res);
				} 
				else {
					console.log("Can not stream data from repository for object " + (object.pid || "") + ", request status " + res.statusCode);
					callback(null, null);
				}
			}
		});
	}
	catch(e) {
		callback(e, null);
	}
}