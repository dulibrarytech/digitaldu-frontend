 /**
 * @file 
 *
 * Object Metadata Display class
 * Generate data for the object template metadata displays
 *
 */

'use strict';


var config = require('../config/config'),
	Helper = require('./helper');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.createSummaryDisplayObject = function(result) {
	var displayObj = {},
	    displayFields = config.summaryDisplay,
		displayRecord = {};

	if(result.display_record && typeof result.display_record == "string") {
		try {
			displayRecord = JSON.parse(result.display_record);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}
	else if(result.display_record && typeof result.display_record == "object") {
		displayRecord = result.display_record;
	}

	displayObj = Helper.parseJSONObjectValues(displayFields, displayRecord);

	return displayObj;
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.createMetadataDisplayObject = function(result, collections=[]) {
	var displayObj = {},
	    displayFields = config.metadataDisplayValues,
		displayRecord = {};

	// Get metadata object from result display record json
	if(result[config.displayRecordField] && typeof result[config.displayRecordField] == "string") {
		try {
			displayRecord = JSON.parse(result[config.displayRecordField]);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}
	else if(result[config.displayRecordField] && typeof result[config.displayRecordField] == "object") {
		displayRecord = result[config.displayRecordField] || {};
	}

	// Get the display fields object from the metadata configurtion
	displayObj = Helper.parseJSONObjectValues(displayFields, displayRecord);

	// Add the collections to the metadata display
	// Add the titles of the parent collections to the mods display, if any
	let titles = [];
	for(var collection of collections) {
		titles.push('<a href="' + config.rootUrl + '/collection/' + collection.pid + '">' + collection.name + '</a>');
	}
	if(titles.length > 0) {
		displayObj["In Collections"] = titles;
	}

	if(Object.keys(displayObj).length === 0 && displayObj.constructor === Object) {
		displayObj["No metadata available"] = "";
	}

	return displayObj;
}