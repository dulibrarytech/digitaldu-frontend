/**
	Copyright 2019 University of Denver

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.

	You may obtain a copy of the License at
	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

 /**
 * @file 
 *
 * Repository Interface 
 * DU Duraspace Resource Access
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	  HttpRequest = require("../libs/http-request.js");

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
	if((uname && uname != "") && (pword && pword != "")) {
		auth = uname + ":" + pword + "@";
	}
	url = protocol + "://" + auth + domain + path;
	return url;
}


/**
 * Get datastream url for Duracloud
 *
 * @param {String} dsid - The DDU datastream ID
 * @param {String} pid - PID of the object from which to stream data
 * @return {String} - Url to DDU datastream for the object
 */
exports.getDatastreamUrl = function(dsid, object) {
	var url = getRepositoryUrl();
	if(dsid == "tn") {url += "/" + object.thumbnail}
	else {url += "/" + object.object}
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

		if(dsid.toLowerCase() == "tn") {url += "/" + object.thumbnail}
		else if(dsid.toLowerCase() !== "object") {
			let objectPath = object.object.substring(0, object.object.lastIndexOf("."));
			objectPath += ("." + dsid);
			url += ("/" + objectPath);
		}
		else {
			if(!object.object) { throw "Object path is null" }
			url += ("/" + object.object);
		}

		if(config.nodeEnv == "devlog") {console.log("Repository data request from url:", url)}
		console.log("Repository fetch url:", url);
		HttpRequest.get_stream(url, {}, function(error, status, data) {
			if(error) {
				callback("Could not open datastream. " + error + " Check connection to repository", null);
			}
			else if(status != 200) {
				console.log("Request to repository received status", status);
				callback(null, null);
			}
			else {
				console.log("Request to repository received status 200");
				callback(null, data);
			}
		});
	}
	catch(e) {
		callback(e, null);
	}
}

exports.getStreamStatus = function(object, dsid, callback) {
	try {
		if(!object) { throw "Object path is null: " + object.pid }
		var url = getRepositoryUrl();

		if(dsid.toLowerCase() == "tn") {url += "/" + object.thumbnail}
		else if(dsid.toLowerCase() !== "object") {
			let objectPath = object.object.substring(0, object.object.length-4);
			objectPath += ("." + dsid);
			url += ("/" + objectPath);
		}
		else {url += ("/" + object.object)}
		
		console.log("Repository fetch head url:", url);
		HttpRequest.head(url, function(error, status, data) {
			if(error) {
				callback(error, 500);
			}
			else {
				callback(null, status);
			}
		});
	}
	catch(e) {
		callback(e, null);
	}
}