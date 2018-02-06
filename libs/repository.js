'use strict'

var request = require('request')

/*
 * DU Repository interface functions
 */
const protocol = "http://",
	  domain = process.env.REPOSITORY_HOST || "libspec01-vlp.du.edu:8080";


exports.getDatastreamUrl = function(objectType, datastream, pid) {
	var dsID = "";
	switch(datastream) {
		case "tn":
			dsID = "tn";
			break;
		case "small_image":
			dsID = "small_image";
			break;
		case "large_image":
			dsID = "large_image";
			break;
		case "audio":
			dsID = "audio";
			break;
		case "video":
			dsID = "video";
			break;
		case "pdf":
			dsID = "pdf";
			break;
	}

	return protocol + domain + "/" + objectType + "?pid=" + pid + "&type=" + datastream;
}

exports.getCommunities = function() {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/communities";
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getCommunity = function(communityID) {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/communities?community_id=" + communityID;
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getAllCollections = function() {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/collections";
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
			}
			else {
				fulfill(body);
			}
		});
	});
}

exports.getCollections = function(communityID) {
	return new Promise(function(fulfill, reject) {
		var url = protocol + domain + "/api/collections?community_id=" + communityID;
		request(url, function (error, response, body) {
			if(error) {
				reject(error);
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


