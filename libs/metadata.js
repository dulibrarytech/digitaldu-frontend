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
		if(displayRecord["title"]) {
			displayObj["Title"] = displayRecord["title"];
		}

		for(var index in displayRecord["names"] || {}) {
			if(typeof displayObj["Creator"] == 'undefined') {
				displayObj["Creator"] = [];
			}
			displayObj["Creator"].push(displayRecord["names"][index].title);
		}
		
		for(var index in displayRecord["dates"] || {}) {
			if(displayRecord["dates"][index].label == "creation") {
				displayObj["Creation Date"] = displayRecord["dates"][index].expression || "";
			}

			if(displayRecord["dates"][index].label == "digitization") {
				displayObj["Digitization Date"] = displayRecord["dates"][index].expression || "";
			}
		}

		if(displayRecord["uri"]) {
			displayObj["Resource Uri"] = displayRecord["uri"];
		}

		for(var index in displayRecord["identifiers"] || {}) {
			if(typeof displayObj["AuthorityID"] == 'undefined') {
				displayObj["AuthorityID"] = [];
			}
			if(displayRecord["identifiers"][index].type == "local") {
				displayObj["AuthorityID"].push(displayRecord["identifiers"][index].identifier || "");
			}
		}

		for(var index in displayRecord["subjects"] || {}) {
			if(typeof displayObj["Subjects"] == 'undefined') {
				displayObj["Subjects"] = [];
			}
			if(displayRecord["subjects"][index].terms && displayRecord["subjects"][index].terms.length > 0) {
				let terms = displayRecord["subjects"][index].terms;
				for(var key in terms) {
					if(terms[key].type == "topical") {
						if(typeof displayObj["Topics"] == 'undefined') {
							displayObj["Topics"] = [];
						}
						else {
							displayObj["Topics"].push(terms[key].term);
						}
					}

					if(terms[key].type == "geographic") {
						if(typeof displayObj["Geographic"] == 'undefined') {
							displayObj["Geographic"] = [];
						}
						else {
							displayObj["Geographic"].push(terms[key].term);
						}
					}
				}
			}
			else {
				displayObj["Subjects"].push(displayRecord["subjects"][index].title || "");
			}
		}

		if(displayRecord["extents"]) {
			displayObj["Extents"] = displayRecord["extents"];
		}

		for(var index in displayRecord["notes"]) {
			if(displayRecord["notes"][index].type == "abstract") {
				displayObj["Abstract"] = displayRecord["notes"][index].content;
			}
			else {
				if(typeof displayObj["Notes"] == 'undefined') {
					displayObj["Notes"] = [];
				}
				displayObj["Notes"].push(displayRecord["notes"][index].content);
			}
		}

		for(var index in displayRecord["t_language"]) {
			if(typeof displayObj["Language"] == 'undefined') {
				displayObj["Language"] = [];
			}
			displayObj["Language"].push(displayRecord["t_language"][index].text);
		}

		// Add the collections to the metadata display
		// Add the titles of the parent collections to the mods display, if any
		let titles = [];
		for(var collection of collections) {
			titles.push('<a href="' + config.rootUrl + '/collection/' + collection.pid + '">' + collection.name + '</a>');
		}
		if(titles.length > 0) {
			displayObj["In Collections"] = titles;
		}
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
