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
		var obj, record, insert=true, showValue;

		if(displayFields[key][0] == "{") {
			obj = JSON.parse(displayFields[key]);

			for(var subKey in obj) {	// Should only be 1 at first
				record = displayRecord[subKey];

				if(typeof record[0] == "string") {
					displayObj[key] = record;
				}

				else if(typeof record[0] == "object") {
					showValue = [];
					for(var index in record) {
						for(var data in obj[subKey][0]) {
							if(record[index][data] != obj[subKey][0][data] && obj[subKey][0][data].toLowerCase() != "value") {
								console.log("OK");
								insert = false;
							}

							if(obj[subKey][0][data].toLowerCase() == "value") {
								showValue.push(record[index][data]);
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