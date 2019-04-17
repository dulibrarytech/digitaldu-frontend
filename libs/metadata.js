 /**
 * @file 
 *
 * Object Metadata Display class
 * Generate data for the object template metadata displays
 *
 */

'use strict';


var config = require('../config/config');

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

	var key, field, value;
	for(key in displayFields) {
		field = displayFields[key];

		// If object field is null or empty, look for the field in the display record
		if(!result[field] || result[field] == "") {
			value = displayRecord[field];
		}
		else {
			value = result[field];
		}
		displayObj[key] = value;
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
	    displayFields = config.metadataDisplayValues,
		displayRecord = {};

	// Add the collections to the metadata display
	// Add the titles of the parent collections to the mods display, if any
	let titles = [];
	for(var collection of collections) {
		titles.push('<a href="' + config.rootUrl + '/collection/' + collection.pid + '">' + collection.name + '</a>');
	}
	if(titles.length > 0) {
		displayObj["In Collections"] = titles;
	}

	// Get metadata object from result display record json
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

	// Build the disply from the configuration settings
	for(var key in displayFields) {
		var displayFieldsObject, recordItem, insert=true, showValue;

		if(displayFields[key][0] == "{") {
			displayFieldsObject = JSON.parse(displayFields[key]);

			for(var subKey in displayFieldsObject) {	// Should only be 1 at first
				recordItem = displayRecord[subKey];

				if(typeof recordItem[0] == "string") {
					displayObj[key] = recordItem;
				}

				else if(typeof recordItem[0] == "object") {
					showValue = [];
					for(var index in recordItem) {
						for(var data in displayFieldsObject[subKey][0]) {
							if(recordItem[index][data] != displayFieldsObject[subKey][0][data] && displayFieldsObject[subKey][0][data].toLowerCase() != "value") {
								insert = false;
							}

							if(displayFieldsObject[subKey][0][data].toLowerCase() == "value") {
								showValue.push(recordItem[index][data]);
							}
						}
					}
					if(insert) {
						displayObj[key] = showValue;
					}
				}
			}
		}
		else {
			displayObj[key] = displayRecord[displayFields[key]];
		}
	}

	if(Object.keys(displayObj).length === 0 && displayObj.constructor === Object) {
		displayObj["No metadata available"] = "";
	}

	return displayObj;
}