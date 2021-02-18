/**
	Copyright 2019 University of Denver

	Licensed under the Apache License, Version 2.0 (the "License");
	you may not use this file except in compliance with the License.

	You may obtain a copy of the License at
	http://www.apache.org/licenses/LICENSE-2.0

	Unless required by applicable law or agreed to in writing, software
	distributed under the License is distributed on an "AS IS" BASIS,
	WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
	See the License for the specific language governing permissions and
	limitations under the License.
*/

 /**
 * @file 
 * Version 1.1.0
 *
 * Digital-DU index object (json) parse functions
 * @summary Generate data for the object template metadata displays
 *
 */

'use strict';


var config = require('../config/' + process.env.CONFIGURATION_FILE),
	metadataConfig = require('../config/config-metadata-displays'),
	Discovery = require('../discovery/service.js'),
	Helper = require('./helper');

/*
 * 
 */
var extractValues = function(pathArray, object, matchField, matchValue, excludeField, excludeValue, condition, bucket) {
	var nextKey,
		nextObject,
		nextArray;

	// We have drilled into the specified field.  Locate the value
	if(pathArray.length == 1) {
		let excludeCondition = false;
		if(excludeField) {
			if(excludeField.indexOf('.') > 0) {
				let path = excludeField.split('.'), 
					currentPath, 
					temp,
					tempObject = {};

				tempObject = Object.assign(tempObject, object);
				for(var index in path) {
					currentPath = path[index];
					if(!tempObject[currentPath]) {
						continue;
					}

					if(typeof tempObject[currentPath] == 'string') {
						excludeCondition = excludeValue.includes(tempObject[currentPath]);
					}
					else if(typeof tempObject[currentPath].length != "undefined") {
						tempObject = tempObject[currentPath][0];
					}
					else {
						tempObject = tempObject[currentPath];
					}
				}
			}
			else {
				excludeCondition = excludeField ? excludeValue.includes(object[excludeField]) : false;  // TODO update redundancy
			}
		}

		if(matchField) {
			if(object[pathArray] && 
				condition == "true" && 
				object[matchField] == matchValue &&
				excludeCondition == false) {

				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					bucket.push(object[pathArray]);
				}
			}
			else if(object[pathArray] && 
					condition == "false" && 
					object[matchField] != matchValue) {

				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					bucket.push(object[pathArray]);
				}
			}
		}
		else if(object[pathArray]) {

			if(excludeCondition == false) {
				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					bucket.push(object[pathArray]);
				}
			}
		}
	}

	// Keep digging
	else {
		nextArray = pathArray.slice();
		nextKey = nextArray.shift();
		nextObject = object[nextKey];

		if(!nextObject) {
			return 0;
		}
		else if(nextObject.length) {
			for(var index in nextObject) {
				extractValues(nextArray, nextObject[index], matchField, matchValue, excludeField, excludeValue, condition, bucket);
			}
		}
		else {
			extractValues(nextArray, nextObject, matchField, matchValue, excludeField, excludeValue, condition, bucket);
		}
	}
}
exports.extractValues = extractValues;

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
		pathArray;

	// Build the summary display
	for(var key in summaryDisplay) {
		let values = [];
		pathArray = summaryDisplay[key].path.split(".");
		extractValues(pathArray, displayRecord, summaryDisplay[key].matchField || null, summaryDisplay[key].matchValue || null, summaryDisplay[key].excludeField || null, summaryDisplay[key].excludeValue || null, summaryDisplay[key].condition || "true", values);
		if(values.length > 0) {
			displayObj[key] = Helper.stripHtmlTags(values);
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
		parentCollectionID = topLevelCollection ? topLevelCollection.pid : "root";

	// Determine object display configuration based on the top level collection of this object (within the root collection)
	let displayID = metadataConfig.collectionDisplays[ parentCollectionID ] || "default",
		metadataDisplay = metadataConfig.metadataDisplay[ displayID ] || {};

	// Include the titles of any parent collections
	let titles = [];
	for(var collection of collections) {
		if(collection.name != config.topLevelCollectionName) {
			titles.push('<a href="' + config.rootUrl + '/object/' + collection.pid + '">' + collection.name + '</a>');
		}
	}
	if(titles.length > 0) {
		displayObj["In Collections"] = titles;
	}

	// Add fields external to the main display configuration
	if(result.type) {
		displayObj["Item Type"] = result.type;
	}
	if(result.mime_type) {
		if(!displayObj["Item Type"]) {
			displayObj["Item Type"] = Helper.getObjectType(result.mime_type);
		}
		displayObj["Mimetype"] = result.mime_type;
	}

	// Add the fields and values to the display, apply config options and formatting to the field values
	// "path" can be an array with multiple path mappings to various data in the index. If it is an array, loop all tha paths, retrieving data from each location in the index. 
	let pathArray, fields = [], values = [];
	for(var key in metadataDisplay) {
		values = [];
		fields = [];

		// Only one field is specified in the configuration for this display item
		if(typeof metadataDisplay[key].field.length == "undefined") {
			fields.push(metadataDisplay[key].field)
		}
		// Multiple fields are present
		else {
			fields = metadataDisplay[key].field;
		}

		// Retrieve data from each field in the index document, add it to the display
		for(var field of fields) {
			pathArray = field.path.split(".") || [];
			extractValues(pathArray, displayRecord, field.matchField || null, field.matchValue || null, field.excludeField || null, field.excludeValue || null, field.condition || "true", values);
			
			// Loop display object by key
			if(values.length > 0) {
				// Remove html elements 
				if(config.removemetadataDisplayHtml) {
					Helper.stripHtmlTags(values);
				}

				// Truncate the text, add hidden section containing the full text, and a link to show the hidden section
				if(field.truncateText) {
					let cullLength = parseInt(field.truncateText), 
						content = "", hiddenText, length;

					// Concat the values into one string
					for(var index in values) {
						content += (values[index] + "<br><br>");
					}

					// Truncate the string if its length exceeds the threshold by a small amount
					length = content.length;
					if(length > (field.truncateText + 20)) {
						hiddenText = '<a aria-label="show all text" class="metadata-in-text-link" style="margin-left: 10px" onclick="javascript:this.nextSibling.style.display = \'inline\'; this.style.display = \'none\'">Show all text</a><span style="display: none">' + content.substring(cullLength, length) + '</span>';
						content = content.substring(0, cullLength) + hiddenText;
					}
					values = content;
				}
			}
		}

		// Create display links 
		if(metadataDisplay[key].link) {
			for(var index in values) {
				
				// Facet search option
				if(metadataDisplay[key].link.facetSearch) {
					let facet = metadataDisplay[key].link.facetSearch;
					values[index] = '<a href="' + config.rootUrl + '/search?q=&f[' + facet + '][]=' + values[index] + '">' + values[index] + '</a>';
				}

				// External link option
				else if(metadataDisplay[key].link.type == "external") {
					let prefix = metadataDisplay[key].link.prefix || "",
						suffix = metadataDisplay[key].link.suffix || "",
						url = prefix + values[index] + suffix;
					values[index] = '<a href="' + url + '" target="_blank">' + url + '</a>';
				}

				// Internal link option
				else if(metadataDisplay[key].link.type == "internal") {
					let prefix = metadataDisplay[key].link.prefix || "",
						suffix = metadataDisplay[key].link.suffix || "",
						url = config.rootUrl + prefix + values[index] + suffix;
					values[index] = '<a href="' + url + '" target="_blank">' + url + '</a>';
				}
			}
		}

		// Add the values to the display
		if(values.length > 0) {
			displayObj[key] = values;
		}
	}

	// Fields external to the main display configuration (these will appear after the display record)
	if(result.pid) {
		let manifestUrl = config.rootUrl + "/iiif/" + result.pid + "/manifest";
		displayObj["IIIF Manifest"] = '<a href="' + manifestUrl + '">' + manifestUrl + '</a>';
		displayObj["IIIF Manifest"] += '<a id="copy-manifest-link"><img src="' + config.rootUrl + '/assets/img/cut-copy-and-paste.jpg" width="40" height="25" style="margin-left: 6px"/></a>';
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
		pathArray,
		parentCollection = null;

	for(var result of resultArray) {
		metadata = {};
		if(result.objectType == "collection") {
			resultsDisplay = metadataConfig.resultsDisplay["collection"] || {};
		}
		else {
			resultsDisplay = metadataConfig.resultsDisplay["default"] || {};
		}

		displayRecord = result[config.displayRecordField] || {};
		parentCollection = result.collection || null;

		// Build the resuts display
		for(var key in resultsDisplay) {
			let values = [];
			pathArray = resultsDisplay[key].path.split(".");

			extractValues(pathArray, displayRecord, resultsDisplay[key].matchField || null, resultsDisplay[key].matchValue || null, resultsDisplay[key].excludeField || null, resultsDisplay[key].excludeValue || null, resultsDisplay[key].condition || "true", values);
			if(values.length > 0) {
				metadata[key] = Helper.stripHtmlTags(values);
			}
		}

		if(result.objectType && result.objectType.toLowerCase() == "collection") {
			metadata["Type"] = "Collection";
		}
		else if(result.itemType) {
			metadata["Type"] = result.itemType;
		}
		else if(result.mimeType) {
			metadata["Type"] = Helper.getObjectType(result.mimeType);
		}

		if(Helper.isObjectEmpty(metadata)) {
			metadata["Description"] = "No data available";
		}
		result["metadata"] = metadata;
	}

	return resultArray;
}

var getMetadataFieldValues = function(object) {
		var dataObj = {},
			displayRecord = object[ config.displayRecordField ] || {},
			displayID = metadataConfig.collectionDisplays[ "root" ] || "default",
			metadataDisplay = metadataConfig.metadataDisplay[ displayID ] || {},
			pathArray = [], 
			fields = [], 
			values = [];

		for(var key in metadataDisplay) {
			values = []; fields = [];

			// Only one field is specified in the configuration for this display item
			if(typeof metadataDisplay[key].field.length == "undefined") {
				fields.push( metadataDisplay[key].field )
			}
			// Multiple fields are present
			else {
				fields = metadataDisplay[key].field;
			}

			// Retrieve data from each field in the index document, add it to the display
			for(var field of fields) {
				pathArray = field.path.split(".") || [];
				extractValues( pathArray, displayRecord, field.matchField || null, field.matchValue || null, field.excludeField || null, field.excludeValue || null, field.condition || "true", values );
			}

			// Add the values to the display
			if(values.length > 0) {
				dataObj[key] = values;
			}
		}

		return dataObj;
}
exports.getMetadataFieldValues = getMetadataFieldValues;