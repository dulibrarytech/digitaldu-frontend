 /**
 * @file 
 *
 * Repository Interface 
 * DU Duraspace Resource Access
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
 * No Duraspace api for this function
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
 * No Duraspace api for this function
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
 * Return the repository domain with or without auth credentials 
 *
 * @return {String} - Duraspace domain url
 */
var getRepositoryUrl = function() {
	var url = "", auth = "";	

	// Add authentication credentials if present
	if((uname && uname != "") && (pword && pword != "")) {
		auth = uname + ":" + pword + "@";
	}
	url = protocol + "://" + auth + domain + path;

	return url;
}


/**
 * Duraspace does not provide datastream api
 * Use DDU app /datastreams route, which will stream data directly from Duraspace
 *
 * @param {String} dsid - The DDU datastream ID
 * @param {String} pid - PID of the object from which to stream data
 * @return {String} - Url to DDU datastream for the object
 */
exports.getDatastreamUrl = function(dsid, pid) {
	return config.rootUrl + "/datastream/" + pid + "/" + datastream;
}

// Get datastream url for Archivespace
exports.getDatastreamUrl = function(dsid, pid=null, object) {
	var url = getRepositoryUrl();
	if(dsid == "tn") {url += "/" + object.thumbnail;}
	else {url += "/" + object.object;}
	return url;
}

/**
 * Datastream request
 * TN datastream will source from 'thumbnail' path in the index
 * Other datastreams will source from 'thumbnail' path in the index
 *
 * @param {Object} object - The object
 * @param {String} dsid - The DDU datastream ID
 *
 * @callback callback 
 * @param {String|null} Error message or null
 * @param {file stream|null} Null if error
 *
 * @return {undefined}
 */
exports.streamData = function(object, dsid, callback) {
	try {
		if(!object) { throw "Object is null" }
		var url = getRepositoryUrl();

		if(dsid == "tn") {url += "/" + object.thumbnail;}
		else {url += "/" + object.object;}

		// Fetch the stream 
		rs(url, {}, function(err, res) {
			if(err) {
				callback("Could not open datastream. " + err + " Check connection to repository", null);
			}
			else {
				if(res.statusCode == 200) {
					callback(null, res);
				} 
				else {
					//console.log("Can not stream data from repository for object " + (object.pid || "") + ", request status " + res.statusCode);
					callback(null, null);
				}
			}
		});
	}
	catch(e) {
		callback(e, null);
	}
}