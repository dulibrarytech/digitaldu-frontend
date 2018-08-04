'use strict'

/*
 * DU Fedora interface functions
 */
 
const protocol = "http://",
	  domain = "librepo01-vlp.du.edu:8080";

const request = require('request');

exports.getDatastreamUrl = function(datastream, pid) {
	var dsID = "";
	switch(datastream) {
		case "tn":
			dsID = "TN";
			break;
		case "small_image":
			dsID = "OBJ";
			break;
		case "large_image":
			dsID = "OBJ";
			break;
		case "audio":
		case "mp3":
			dsID = "PROXY_MP3";
			break;
		case "video":
		case "mp4":
			dsID = "MP4";
			break;
		case "pdf":
			dsID = "OBJ";
			break;
		default: 
			dsID = "OBJ";
			break;
	}

	return protocol + domain + "/fedora/objects/" + pid + "/datastreams/" + dsID + "/content";
}

exports.getRootCollections = function() {
	return new Promise(function(fulfill, reject) {
		fulfill([]);
	});
}

exports.getCollectionObjects = function(collectionID) {
	return new Promise(function(fulfill, reject) {
		fulfill([]);
	});
}

exports.streamData = function(pid, dsid, callback) {
	var url = protocol + domain + "/fedora/objects/" + pid + "/datastreams/" + dsid + "/content";

	// Test
	url = "http://www.pdf995.com/samples/pdf.pdf";

	// NPM Stream
	var rs = require('request-stream');
	rs(url, {}, function(err, res) {
		if(err) {
			console.log("Error: Could not open stream", err);
			callback(null);
		}
		else {
			callback(res);
		}
	});
}




