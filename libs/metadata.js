 /**
 * @file 
 *
 * Viewer class
 * Get viewer content for the object view templates
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
exports.createMetadataDisplayObject = function(result) {
	var displayObj = {},
	    displayFields = config.metadataDisplay,
		displayRecord = {};

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

	// Manually build the display
	var	creators = [], 
		contributors = [],
		topics = [],
		subjectNames = [],
		subjectGenres = [],
		subjectGeographics = [],
		subjectOccupations = [],
		links = [];

	var tempStr = "",
		anchor = "",
		subjectType = "",
		locationType = "";

	for(var key in displayRecord) {
		tempStr = "";

		// Title
		if(key == "title") {
			displayObj['Title'] = displayRecord[key];
		}

		// Creator, Contributor
		else if(key == "name" && typeof displayRecord[key] == "object") {
			var nameData = displayRecord[key];
			for(var name in nameData) {
				if(nameData[name].role && nameData[name].namePart) {
					if(nameData[name].role == "creator") {
						creators.push(nameData[name].namePart);
					}
					else if(nameData[name].role == "contributor") {
						contributors.push(nameData[name].namePart);
					}
				}
			}
			if(creators.length > 0) {
				displayObj['Creator'] = creators;
			}
			if(contributors.length > 0) {
				displayObj['Contributors'] = contributors;
			}
		}

		// Type of resource
		else if(key == "typeOfResource") {
			displayObj['Type'] = displayRecord[key];
		}

		// Genre
		else if(key == "genre") {
			displayObj['Genre'] = displayRecord[key];
		}

		// Origin Info
		else if(key == "originInfo") {
			var originInfo = displayRecord[key];
			for(var origin in originInfo) {
				for(var info in originInfo[origin]) {
					if(info == "publisher") {
						displayObj['Publisher'] = originInfo[origin][info];
					}
					else if(info == "place") {
						displayObj['Place'] = originInfo[origin][info];
					}
					else if(info == "d_created") {
						displayObj['Date Created'] = originInfo[origin][info];
					}
					else if(info == "d_issued") {
						displayObj['Date Issued'] = originInfo[origin][info];
					}
				}
			}
		}

		// Language
		else if(key == "language") {
			displayObj['Language'] = displayRecord[key];
		}

		// physicalDescription
		else if(key == "physicalDescription") {
			var physicalDescription = displayRecord[key];
			for(var description in physicalDescription) {
				for(var info in physicalDescription[description]) {
					if(info == "form") {
						displayObj['Form'] = physicalDescription[description][info];
					}
					else if(info == "extent") {
						displayObj['Extent'] = physicalDescription[description][info];
					}
					else if(info == "digitalOrigin") {
						displayObj['Digital Origin'] = physicalDescription[description][info];
					}
					else if(info == "note") {
						displayObj['Note'] = physicalDescription[description][info];
					}
				}
			}
		}

		// Access Condition
		else if(key == "accessCondition") {
			displayObj['Access Condition'] = displayRecord[key];
		}

		// Subject, Topic
		else if(key == "subject" && typeof displayRecord[key] == "string") {
			displayObj['Subject'] = displayRecord[key];
		}
		else if(key == "subject" && typeof displayRecord[key] == "object") {
			for(var subject in displayRecord[key]) {
				subjectType = displayRecord[key][subject];
				for(var typeKey in subjectType) {
					if(typeKey == "topic") {
						topics.push(subjectType[typeKey]);
					}
					else if(typeKey == "namePart") {
						subjectNames.push(subjectType[typeKey]);
					}
					else if(typeKey == "genre") {
						subjectGenres.push(subjectType[typeKey]);
					}
					else if(typeKey == "geographic") {
						subjectGeographics.push(subjectType[typeKey]);
					}
					else if(typeKey == "occupation") {
						subjectOccupations.push(subjectType[typeKey]);
					}
				}
			}
			if(topics.length > 0) {
				displayObj['Topics'] = topics;
			}
			if(subjectNames.length > 0) {
				displayObj['Subject Name'] = subjectNames;
			}
			if(subjectGenres.length > 0) {
				displayObj['Subject Genre'] = subjectGenres;
			}
			if(subjectGeographics.length > 0) {
				displayObj['Subject Geographic'] = subjectGeographics;
			}
			if(subjectOccupations.length > 0) {
				displayObj['Subject Occupation'] = subjectOccupations;
			}
		}

		// Links
		else if(key == "location" && typeof displayRecord[key] == "object") {
			for(var location in displayRecord[key]) {
				locationType = displayRecord[key][location];
				for(var typeKey in locationType) {
					if(typeKey == "url") {
						//anchor = '<a href="' + locationType[typeKey] + '">' + locationType[typeKey] + '</a>';
						links.push(locationType[typeKey]);
					}
				}
			}
			if(links.length > 0) {
				displayObj['Link'] = links;
			}
		}

		// Target Audience
		else if(key == "targetAudience") {
			displayObj['Target Audience'] = displayRecord[key];
		}
	}

	if(Object.keys(displayObj).length === 0 && displayObj.constructor === Object) {
		displayObj["No display available"] = "";
	}

	return displayObj;
}