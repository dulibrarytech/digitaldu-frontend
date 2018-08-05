'use strict'

/*
 * DU Fedora interface functions
 */
 
const protocol = "http://",
	  domain = "librepo01-vlp.du.edu:8080";

const config = require('../config/config');

const request = require('request');

exports.getFedoraDatastreamUrl = function(datastream, pid) {
	var dsID = "";
	datastream = datastream.toLowerCase();
	console.log("TEST ds in is", datastream);
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

	return protocol + domain + "/fedora/objects/" + pid + "/datastreams/" + dsID + "/content";
}

exports.getDatastreamUrl = function(datastream, pid) {

	// Temp
	return this.getFedoraDatastreamUrl(datastream, pid);

	// TODO local repo api
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

	// Fedora
	var url = this.getFedoraDatastreamUrl(dsid, pid);
	// Repo
	//var url = this.getDatastreamUrl(dsid, pid);
		console.log("TEST stream path", url);
	// Test
	//url = "http://www.pdf995.com/samples/pdf.pdf";
	//url = "http://librepo01-vlp.du.edu:8080/fedora/objects/codu:65237/datastreams/OBJ/content";

	// Get the stream 
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




