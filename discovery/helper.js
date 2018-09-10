/*
 * Helper functions for the Discovery module
 */

'use strict';

var config = require('../config/config');

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

/* 
 * TODO Move to Paginator lib
 */
exports.paginateResults = function(results, page) {
	var index = page < 1 ? 0 : page-1;
	var response = {}, maxResults = config.maxDisplayResults;
	var offset = index * maxResults;

	response['results'] = [];
	response['data'] = {};

	for(var i=offset; i<(maxResults + offset); i++) {
		if(typeof results[i] != 'undefined') {
			response.results.push(results[i]);
		}
	}

	if(response.results.length < 1) {
		response.data['total'] = "";
		response.data['pageTotal'] = "";
		response.data['pageStart'] = "";
	}
	else {
		response.data['total'] = results.length;
		response.data['pageTotal'] = response.results.length + offset;
		response.data['pageStart'] = offset + 1;
	}

	return response;
}

/*
 * Get the totals for all type facets, for the front page template (Matches the hard coded type facets)
 */
exports.getTypeFacetTotalsObject = function(facets) {

	var totals = {
		stillImage: 0,
		movingImage: 0,
		soundRecording: 0,
		soundRecordingMusical: 0,
		soundRecordingNonMusical: 0,
		text: 0,
		map: 0,
		mixedMaterial: 0,
		threeDObject: 0
	}

	// TODO If necessary, normalize type fields here (ala Blacklight)

	for(var facet of facets.Type.buckets) {
		if(facet.key == "still image") {
			totals.stillImage = facet.doc_count;
		}
		else if(facet.key == "moving image") {
			totals.movingImage = facet.doc_count;
		}
		else if(facet.key == "sound recording") {
			totals.soundRecording = facet.doc_count;
		}
		else if(facet.key == "sound recording-musical") {
			totals.soundRecordingMusical = facet.doc_count;
		}
		else if(facet.key == "sound recording-nonmusical") {
			totals.soundRecordingNonMusical = facet.doc_count;
		}
		else if(facet.key == "text") {
			totals.text = facet.doc_count;
		}
		else if(facet.key == "cartographic") {
			totals.map = facet.doc_count;
		}
		else if(facet.key == "mixed material") {
			totals.mixedMaterial = facet.doc_count;
		}
		else if(facet.key == "three dimensional object") {
			totals.threeDObject = facet.doc_count;
		}
	}

	return totals;
}

exports.getSearchResultDisplayFields = function(searchResult) {
	var fields = {
		title: "",
		description: "",
		creator: ""
	};

	var displayRecord = {};

	try {
		// Get Display Record data
	    if(searchResult._source.display_record && typeof searchResult._source.display_record == 'string') {
	      displayRecord = JSON.parse(searchResult._source.display_record);
	    }
	    else if(searchResult._source.display_record && typeof searchResult._source.display_record == 'object') {
	    	displayRecord = searchResult._source.display_record;
	    }

	    // Find the title
	    if(searchResult._source.title && searchResult._source.title != "") {
	      fields.title = searchResult._source.title;
	    }
	    else if(displayRecord.title &&  displayRecord.title != "") {
	      fields.title = displayRecord.title;
	    }

	    // Find the description
	    if(searchResult._source.modsDescription && searchResult._source.modsDescription != "") {
	      fields.description = searchResult._source.modsDescription;
	    }
	    else if(displayRecord.abstract && displayRecord.abstract != "") {
	      fields.description = displayRecord.abstract;
	    }

	    // Find the creator
	    if(searchResult._source.creator && searchResult._source.creator != "") {
	      fields.creator = searchResult._source.creator;
	    }
	    else if(displayRecord.creator && displayRecord.creator != "") {
	      fields.creator = displayRecord.creator;
	    }
	}
	catch(error) {
		console.log("Error: " + error);
	}

    return fields;
}

/* 
 * TODO Move to Facets lib
 */
exports.getFacetAggregationObject = function(facets) {
	var facetAggregations = {}, field;
    for(var key in facets) {
      field = {};
      field['field'] = facets[key] + ".keyword";
      field['size'] = config.facetLimit;
      facetAggregations[key] = {
        "terms": field
      };
    }
    return facetAggregations;
}

/* 
 * TODO Move to Search lib
 */
exports.sortSearchResultObjects = function(objects) {
	var titles = [], sorted = [];

	// Sort the titles alphabetically
	for(var object of objects) {
		titles.push(object.title[0]);
	}
	titles.sort();
	
	// Sort the objects based on the sorted titles.
	for(var title of titles) {
		for(object of objects) {
			if(object.title[0] == title) {
				sorted.push(object);
			}
		}
	}
	return sorted;
}

exports.getCollectionBreadcrumbObject = function(collections) {
    return createBreadcrumbLinks(collections);
};

function createBreadcrumbLinks(data) {
    var html = '<a class="collection-link" href="/">' + config.topLevelCollectionName + '</a>';
    for (var i = 0; i < data.length; i++) {
        html += '&nbsp&nbsp<span>></span>&nbsp&nbsp<a class="collection-link" href="' + data[i].url + '">' + data[i].name + '</a>';
    }
    return data.length > 0 ? html : null;
};


