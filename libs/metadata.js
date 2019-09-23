 /**
 * @file 
 *
 * Object Metadata Display class
 * Generate data for the object template metadata displays
 *
 */

'use strict';


var config = require('../config/' + process.env.CONFIGURATION_FILE),
	metadataConfig = require('../config/config-metadata-displays'),
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
		summaryDisplay = metadataConfig.summaryDisplay["default"] || {},
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
		displayRecord = result[config.displayRecordField] || {};

	let topLevelCollection = collections[1] || null,	// Use the second collection in the list. The first one will be the root collection, which will use the default metadata display
		parentCollectionID = topLevelCollection ? topLevelCollection.pid : "codu:root";

	// Determine object display configuration based on the top level collection of this object (within the root collection)
	let displayID = metadataConfig.collectionDisplays[ parentCollectionID ] || "default",
		metadataDisplay = metadataConfig.metadataDisplay[ displayID ] || {};

	// Include the titles of any parent collections
	let titles = [];
	for(var collection of collections) {
		titles.push('<a href="' + config.rootUrl + '/collection/' + collection.pid + '">' + collection.name + '</a>');
	}
	if(titles.length > 0) {
		displayObj["In Collections"] = titles;
	}

	// Build the metadata display
	let pathArray;
	for(var key in metadataDisplay) {
		let values = [];
		pathArray = metadataDisplay[key].path.split(".") || [];
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
		resultsDisplay,
		metadata,
		pathArray;	// TODO: Determine which display to use based on object, or other specification

	for(var result of resultArray) {
		if(result.objectType == "collection") {
			resultsDisplay = metadataConfig.resultsDisplay["collection"] || {}
		}
		else {
			resultsDisplay = metadataConfig.resultsDisplay["default"] || {}
		}
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

		if(Helper.isObjectEmpty(metadata)) {
			metadata["Description"] = "No data available";
		}
		result["metadata"] = metadata;
	}

	return resultArray;
}