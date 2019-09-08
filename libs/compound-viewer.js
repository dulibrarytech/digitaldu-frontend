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
 * 
 *
 * @param {}
 *
 * @return {}
 */
exports.getCompoundObjectViewer = function(object) {
 	var viewer = "";

 	// If not an a/v object, do not embed the Kaltura player
 	let embedKaltura = false;
 	if(config.objectTypes.audio.includes(object.mime_type) || config.objectTypes.video.includes(object.mime_type)) {
 		embedKaltura = config.universalViewerKalturaPlayer;
 	}

 	if(validateCompoundObject(object)) {

 		// Get viewer for object mime type:
	 	switch(config.compoundObjectViewer) {
	 		case "universalviewer":
	 			viewer += Viewer.getIIIFObjectViewer(object, "1", embedKaltura);
	 			break;

	 		default:
	 			console.log("Viewer error: No compound viewer found.  Please check configuration");
	 			viewer = "";
	 			break;
	 	}
 	}
 	else {
 		console.log("Viewer error: Invalid compound object parts");
 	}

 	return viewer;
}

/**
 * 
 *
 * @param {}
 *
 * @return {}
 */
exports.getBookViewer = function(object, index) {

}

/**
 * 
 *
 * @param {}
 *
 * @return {}
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
 * 
 *
 * @param {}
 *
 * @return {}
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