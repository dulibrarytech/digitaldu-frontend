 /**
 * @file 
 *
 * Object Metadata Display class
 * Generate data for the object template metadata displays
 *
 */

'use strict';


var config = require('../config/' + process.env.CONFIGURATION_FILE),
	Helper = require('./helper');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.createSummaryDisplayObject = function(result) {
	var displayObj = {},
		displayRecord = result[config.displayRecordField];

	// Get metadata object from result display record json
	if(displayRecord && typeof displayRecord == "string") {
		try {
			displayRecord = JSON.parse(displayRecord);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}
	else if(displayRecord && typeof displayRecord == "object") {
		displayRecord = displayRecord || null;
	}

	if(displayRecord) {
		// Title
		displayObj["Title"] = displayRecord["title"] || "";

		// Description
		for(var index in displayRecord["notes"] || {}) {
			if(displayRecord["notes"][index].type == "abstract") {
				displayObj["Description"] = displayRecord["notes"][index].content || "";
			}
		}
	}

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
		displayRecord = result[config.displayRecordField] || {},
		metadataDisplay = config.metadataDisplay["Default"] || {},
		pathArray;	// TODO: Determine which display to use based on object, or other specification

	for(var key in metadataDisplay) {
		let values = [];
		pathArray = metadataDisplay[key].path.split(".");
		Helper.extractValues(pathArray, displayRecord, metadataDisplay[key].matchField || null, metadataDisplay[key].matchValue || null, metadataDisplay[key].condition || "true", values);
		if(values.length > 0) {
			displayObj[key] = values;
		}
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
	var metadata,
	    displayFields = config.resultsDisplay,
		displayRecord = {},
		resultDisplayRecord;

	for(var index of resultArray) {
		metadata = {}
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

		if(displayRecord) {

			// Creation date
			for(let index in displayRecord["dates"] || {}) {
				if(displayRecord["dates"][index].label == "creation") {
					metadata["Creation Date"] = displayRecord["dates"][index].expression || "";
				}
			}

			// Creator
			for(let index in displayRecord["names"] || {}) {
				if(typeof metadata["Creator"] == 'undefined') {
					metadata["Creator"] = [];
				}
				metadata["Creator"].push(displayRecord["names"][index].title);
			}

			// Description
			for(let index in displayRecord["notes"]) {
				if(displayRecord["notes"][index].type == "abstract") {
					metadata["Description"] = displayRecord["notes"][index].content;
				}
			}

			index["metadata"] = metadata;
		}
	}
	return resultArray;
}
