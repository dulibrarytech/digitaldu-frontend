 /**
 * @file 
 *
 * Discovery helper functions
 *
 */

'use strict'

var config = require('../config/config');

/**
 * Create view model data object for display items
 *
 * @param {object} items  The items to include in the list.  Item attributes must match index attributes.
 * @return 
 */
 exports.createItemList = function(items) {
  var itemList = [], tn, pid, title, description, display, path;
  for(var item of items) {
      
    // Get the title and description data from the item
    if(item.title && item.title != "") {
      title = item.title || config.noTitlePlaceholder;
      description = item.description || "";
    }

    // If the title field is absent from this item, try to get the title from the display record
    else if(item.display_record && typeof item.display_record == 'string') {
        try {
          display = JSON.parse(item.display_record);
        }
        catch(e) {
          console.log("Error: invalid display record JSON on object: " + item.pid);
          continue;
        }

        title = display.title || config.noTitlePlaceholder;
        description = display.description || display.abstract || "";
    }

    // Use the default values
    else {
      title = config.noTitlePlaceholder;
      description = "";
    }
      
    // This is a list of communities
    if(item.pid) {
      //tn = Repository.getDatastreamUrl("tn", item.pid);
      tn = config.rootUrl + "/datastream/" + item.pid + "/tn";
      pid = item.pid
    }

    // This is a list of objects
    else if(item.mime_type) {
      //tn = Repository.getDatastreamUrl("tn", item.pid);
      tn = config.rootUrl + "/datastream/" + item.pid + "/tn";
      pid = item.pid
    }

    // This is a list of collections
    else {
      //tn = Repository.getDatastreamUrl("tn", item.pid);
      tn = config.rootUrl + "/datastream/" + item.pid + "/tn";
      pid = item.id
    }

    // Add collection or object path
    if(item.object_type && item.object_type == config.collectionMimeType) {
      path = config.rootRoute + "/collection";
    }
    else {
      path = config.rootRoute + "/object";
    }

    // Push the current item to the list
    itemList.push({
        pid: pid,
        tn: tn,
        title: title,
        description: description,
        path: path
      });
  }
  return itemList;
}

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

 /**
 * Get the totals for all type facets, for the front page template (Matches the hard coded type facets)
 *
 * @param 
 * @return 
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

/**
 * 
 *
 * @param 
 * @return 
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

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getCollectionBreadcrumbObject = function(collections) {
    return createBreadcrumbLinks(collections);
};

/**
 * 
 *
 * @param 
 * @return 
 */
function createBreadcrumbLinks(data) {
    //var html = '<a class="collection-link" href="/">' + config.topLevelCollectionName + '</a>';
    var html = "";
    for (var i = 0; i < data.length; i++) {
    	if(i>0) {
    		html += '&nbsp&nbsp<span>></span>&nbsp&nbsp';
    	}
        html += '<a class="collection-link" href="' + data[i].url + '">' + data[i].name + '</a>';
    }
    return data.length > 0 ? html : null;
};

/**
 * 
 *
 * @param 
 * @return 
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


