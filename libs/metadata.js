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
 *
 * Object Metadata Display class
 * Generate data for the object template metadata displays
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
var extractValues = function(pathArray, object, matchField, matchValue, condition, bucket) {
	var nextKey,
		nextObject,
		nextArray;

	// We have drilled into the specified field.  Locate the value
	if(pathArray.length == 1) {
		if(matchField) {
			if(object[pathArray] && 
				condition == "true" && 
				object[matchField] == matchValue) {

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

			if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
				bucket.push(object[pathArray]);
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
				extractValues(nextArray, nextObject[index], matchField, matchValue, condition, bucket);
			}
		}
		else {
			extractValues(nextArray, nextObject, matchField, matchValue, condition, bucket);
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
		extractValues(pathArray, displayRecord, summaryDisplay[key].matchField || null, summaryDisplay[key].matchValue || null, summaryDisplay[key].condition || "true", values);
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
		displayObj["Mimetype"] = result.mime_type;
	}

	// Add the fields and values to the display, apply config options and formatting to the field values
	let pathArray;
	for(var key in metadataDisplay) {
		let values = [];
		pathArray = metadataDisplay[key].path.split(".") || [];
		extractValues(pathArray, displayRecord, metadataDisplay[key].matchField || null, metadataDisplay[key].matchValue || null, metadataDisplay[key].condition || "true", values);
		if(values.length > 0) {

			// Truncate the text, add hidden section containing the full text, and a link to show the hidden section
			if(metadataDisplay[key].truncateText) {
				let cullLength = parseInt(metadataDisplay[key].truncateText), 
					content = "", hiddenText, length;

				for(var index in values) {
					content += (values[index] + "<br><br>");
				}
				length = content.length;
				hiddenText = '<a aria-label="show all text" class="metadata-in-text-link" style="margin-left: 10px" onclick="javascript:this.nextSibling.style.display = \'inline\'; this.style.display = \'none\'">Show all text</a><span style="display: none">' + content.substring(cullLength, length) + '</span>';
				content = content.substring(0, cullLength) + hiddenText;
				values = content;
			}

			// Convert values to links, per configuration
			if(metadataDisplay[key].link) {
				for(var index in values) {

					// Facet search option
					if(metadataDisplay[key].link.facetSearch) {
						let facet = metadataDisplay[key].link.facetSearch;
						values[index] = '<a href="' + config.rootUrl + '/search?q=&f[' + facet + '][]=' + values[index] + '">' + values[index] + '</a>';
					}
				}
			}

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

			extractValues(pathArray, displayRecord, resultsDisplay[key].matchField || null, resultsDisplay[key].matchValue || null, resultsDisplay[key].condition || "true", values);
			if(values.length > 0) {
				metadata[key] = values;
			}
		}

		if(result.itemType || result.objectType) {
			metadata["Type"] = result.objectType == "collection" ? "Collection" : result.itemType;
		}

		if(Helper.isObjectEmpty(metadata)) {
			metadata["Description"] = "No data available";
		}
		result["metadata"] = metadata;
	}

	return resultArray;
}