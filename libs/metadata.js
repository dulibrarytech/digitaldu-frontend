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
		displayRecord = result[config.displayRecordField] || {},
		summaryDisplay = config.summaryDisplay["Default"] || {},
		pathArray;	// TODO: Determine which display to use based on object, or other specification

	// Build the summary display
	for(var key in summaryDisplay) {
		let values = [];
		pathArray = summaryDisplay[key].path.split(".");
		Helper.extractValues(pathArray, displayRecord, summaryDisplay[key].matchField || null, summaryDisplay[key].matchValue || null, summaryDisplay[key].condition || "true", values);
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
exports.createMetadataDisplayObject = function(result, collections=[]) {
	var displayObj = {},
		displayRecord = result[config.displayRecordField] || {},
		metadataDisplay = config.metadataDisplay["Default"] || {},
		pathArray;	// TODO: Determine which display to use based on object, or other specification

	// Include the titles of any parent collections
	let titles = [];
	for(var collection of collections) {
		titles.push('<a href="' + config.rootUrl + '/collection/' + collection.pid + '">' + collection.name + '</a>');
	}
	if(titles.length > 0) {
		displayObj["In Collections"] = titles;
	}

	// Build the metadata display
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
	var displayObj = {},
		displayRecord,
		resultsDisplay = config.resultsDisplay["Default"] || {},
		metadata,
		pathArray;	// TODO: Determine which display to use based on object, or other specification

	for(var result of resultArray) {
		metadata = {};
		displayRecord = result[config.displayRecordField] || {};

		// Build the resuts display
		for(var key in resultsDisplay) {
			let values = [];
			pathArray = resultsDisplay[key].path.split(".");
			Helper.extractValues(pathArray, displayRecord, resultsDisplay[key].matchField || null, resultsDisplay[key].matchValue || null, resultsDisplay[key].condition || "true", values);
			if(values.length > 0) {
				metadata[key] = values;
			}
		}

		result["metadata"] = metadata;
	}

	return resultArray;
}