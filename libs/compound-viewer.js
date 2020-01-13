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
 * Compound Object Viewer class
 *
 */

'use strict';

const 	config = require('../config/' + process.env.CONFIGURATION_FILE),
		IIIF = require('./IIIF'),
		Viewer = require('./viewer'),
    	AppHelper = require("../libs/helper");

/**
 * Get compound object viewer html 
 *
 * @param {Object} object - index document
 * @return {String} - viewer html string
 */
exports.getCompoundObjectViewer = function(object, part, apikey=null) {
 	var viewer = "";

 	// If not an a/v object, do not embed the Kaltura player
 	let embedKaltura = false;
 	if(config.objectTypes.audio.includes(object.mime_type) || config.objectTypes.video.includes(object.mime_type)) {
 		embedKaltura = config.universalViewerKalturaPlayer;
 	}

 	apikey = apikey ? ("?key=" + apikey) : "";

 	if(validateCompoundObject(object)) {
 		// Get viewer for object mime type:
	 	switch(config.compoundObjectViewer) {
	 		case "universalviewer":
	 			viewer += Viewer.getIIIFObjectViewer(object, "1", embedKaltura, apikey);
	 			break;
	 		default:
	 			console.log("Viewer error: No compound viewer found.  Please check configuration");
	 			viewer += "No viewer is available for this object";
	 			break;
	 	}
 	}
 	else {
 		console.log("Viewer error: Invalid compound object parts");
 	}

 	return viewer;
}

/**
 * Determines if a compound object's children meet a certain criteria
 * Currently, only audio and video objects, or small and large images can be combined in a compound object.  All other combinations of child object types are invalid
 *
 * @param {Object} object - index document
 * @return {Boolean} - true if valid, false if not
 */
var validateCompoundObject = function(object) {
	var isValid = false,
		mimeType = "";

	var parts = AppHelper.getCompoundObjectPart(object, -1) || [];

	// If the compound object has no mime type data, get mime type of first part, use that for compound object mime type
	if(!object.mime_type || object.mime_type == "") {
		if(parts && parts.length > 0) {
			if(parts[0].mime_type || parts[0].type) {
				mimeType = parts[0].mime_type || parts[0].type;
			}
		}
	}

	// Use the compound object's mime type
	else {
		mimeType = object.mime_type;
	}
	
	// Validate the compound object parts' mime types against the compound object's allowed mime types
	if(config.objectTypes["audio"].includes(mimeType) || config.objectTypes["video"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["audio", "video"]);
	}
	else if(config.objectTypes["pdf"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["pdf"]);
	}
	else if(config.objectTypes["smallImage"].includes(mimeType) || config.objectTypes["largeImage"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["smallImage", "largeImage"]);
	}
	else {
		console.log("Invalid compound object mime type");
	}

	return isValid;
}
exports.validateCompoundObject = validateCompoundObject;

/**
 * Validate an array of object parts against a list of object types
 *
 * @param {Array.<Object>} parts - Array of part objects
 * @param {Array.<String>} objectTypes - Array of object type strings
 * @return {Boolean} - true if combination of parts is valid, false if not
 */
var validateCompoundObjectParts = function(parts, objectTypes) {
	var acceptedMimeTypes = [], 
		mimeType = "",
		isValid = false;

	// Build an array of accepted mime types for this compound object
	for(var type of objectTypes) {
		acceptedMimeTypes = acceptedMimeTypes.concat(config.objectTypes[type]);
	}

	// Determine if any of the object's parts are of an unacceptable mimetype
	if(parts && parts.length > 0) {
		isValid = true;
		for(var part of parts) {
			mimeType = part.mime_type || part.type || "";
			if(acceptedMimeTypes.includes(mimeType) == false) {
				isValid = false;
			}
		}
	}

	return isValid;
}