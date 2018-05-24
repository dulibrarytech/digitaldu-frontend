'use strict'

/*
 * DU Repository interface functions
 */

var request = require('request')

const protocol = "http://",
	  domain = process.env.REPOSITORY_HOST || "libspec01-vlp.du.edu:8080";


exports.getDatastreamUrl = function(datastream, pid) {

	var dsID = "", objectType = "";
	switch(datastream) {
		case "tn":
			dsID = "tn";
			break;
		case "mp3":
			dsID = "mp3";
			objectType = "audio";
			break;
		case "jpg":
			dsID = "jpg";
			objectType = "image";
			break;
		case "jp2":
			dsID = "jp2";
			objectType = "image";
			break;
		case "tiff":
			dsID = "tiff";
			objectType = "image";
			break;
		case "pdf":
			dsID = "pdf";
			break;
		case "mp4":
			dsID = "mp4";
			objectType = "video";
			break;
		case "mov":
			dsID = "mov";
			objectType = "video";
			break;
		default:
			console.log("Unsupported datastream (repository)");
			return "";
			break;
	}
	objectType = objectType == "" ? "" : objectType + "/";

	return protocol + domain + "/api/object/" + objectType + dsID + "?pid=" + pid;
}

/* Obsolete */
exports.getCommunities = function() {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/communities";
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else if(response.statusCode !== 200) {
				reject("Repository returns status " + response.statusCode);
			}
			else {
				fulfill(body);
			}
		});
	});
}

/* Obsolete */
exports.getCommunity = function(communityID) {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/communities?community_id=" + communityID;
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else if(response.statusCode !== 200) {
				reject("Repository returns status " + response.statusCode);
			}
			else {
				fulfill(body);
			}
		});
	});
}

/* Test to make sure this will return root collections */
exports.getRootCollections = function() {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/collections";
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else if(response.statusCode !== 200) {
				reject("Repository returns status " + response.statusCode);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getCollectionsByCommunity = function(communityID) {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/collections?community_id=" + communityID;
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else if(response.statusCode !== 200) {
				reject("Repository returns status " + response.statusCode);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getCollectionObjects = function(collectionID) {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/objects?pid=" + collectionID;
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else if(response.statusCode !== 200) {
				reject("Repository returns status " + response.statusCode);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getCollectionTN = function(collectionID) {
	return protocol + domain + "/api/collection/tn?collection_id=" + collectionID;
}

exports.getCommunityTN = function(communityID) {
	return protocol + domain + "/api/community/tn?community_id=" + communityID;
}

exports.getObjectTN = function(objectID) {
	return protocol + domain + "/api/object/tn?pid=" + objectID;
}


