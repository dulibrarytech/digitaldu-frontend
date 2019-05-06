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
		displayRecord = {},
		resultDisplayRecord = result[config.displayRecordField];

	if(resultDisplayRecord && typeof resultDisplayRecord == "string") {
		try {
			displayRecord = JSON.parse(resultDisplayRecord);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}
	else if(resultDisplayRecord && typeof resultDisplayRecord == "object") {
		displayRecord = resultDisplayRecord;
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
		displayRecord = {},
		resultDisplayRecord = result[config.displayRecordField];

	// Get metadata object from result display record json
	if(resultDisplayRecord && typeof resultDisplayRecord == "string") {
		try {
			displayRecord = JSON.parse(resultDisplayRecord);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}
	else if(resultDisplayRecord && typeof resultDisplayRecord == "object") {
		displayRecord = resultDisplayRecord || {};
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

/**
 * 
 *
 * @param 
 * @return 
 */
exports.addResultMetadataDisplays = function(resultArray) {
	var metadata = {},
	    displayFields = config.resultsDisplay,
		displayRecord = {},
		resultDisplayRecord;

	for(var index of resultArray) {
		resultDisplayRecord = index[config.displayRecordField];
		if(resultDisplayRecord && typeof resultDisplayRecord == "string") {
			try {
				displayRecord = JSON.parse(resultDisplayRecord);
			}
			catch(e) {
				console.log("Error: invalid object display record for object: " + result.pid);
			}
		}
		else if(resultDisplayRecord && typeof resultDisplayRecord == "object") {
			displayRecord = resultDisplayRecord || {};
		}
		index["metadata"] = Helper.parseJSONObjectValues(displayFields, displayRecord);
	}

	return resultArray;
}
