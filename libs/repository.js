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

/**
 * Get the Fedora datastream ID corresponding to the DigitalDU ID
 * Construct Fedora datastream url
 *
 * @param string datastream 	The digital du datstream identifier
 * @param string pid 	The object identifier
 * @return string 	The path to Fodora datastream 
 */
exports.getFedoraDatastreamUrl = function(datastream, pid) {
	var dsID = "";
	datastream = datastream.toLowerCase();

	switch(datastream) {
		case "tn":
			dsID = "TN";
			break;
		case "smallimage":
		case "jpg":
			dsID = "OBJ";
			break;
		case "largeimage":
		case "tiff":
		case "jp2":
			dsID = "JP2";
			break;
		case "audio":
		case "mp3":
			dsID = "PROXY_MP3";
			break;
		case "video":
		case "mp4":
			dsID = "MP4";
			break;
		case "mov":
			dsID = "MOV";
			break;
		case "pdf":
			dsID = "OBJ";
			break;
		default: 
			dsID = "OBJ";
			break;
	}

	return host + "/fedora/objects/" + pid + "/datastreams/" + dsID + "/content";
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getDatastreamUrl = function(datastream, pid) {
	return this.getFedoraDatastreamUrl(datastream, pid);
}

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
exports.streamData = function(object, dsid, callback) {

	// Fedora
	var url = this.getFedoraDatastreamUrl(dsid, object.pid);

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
}




