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
 * Version 1.2.1
 *
 * Digital-DU index object (json) parse functions
 * @summary Generate data for the object template metadata displays
 *
 */

'use strict'

const config = require('../config/config');

exports.getItemMetadataValues = function(map, item, data = {}) {
	let displayRecord = item || {},
		metadataFields = map,
		values = [],
		pathArray;

	for(var key in metadataFields) {
		values = [];
		pathArray = metadataFields[key].path.split(".") || [];
		extractValues(pathArray, displayRecord, metadataFields[key].matchField || null, metadataFields[key].matchValue || null, metadataFields[key].excludeField || null, metadataFields[key].excludeValue || null, metadataFields[key].condition || "true", values);
		if(values.length > 0) {
			data[key] = values;
		}
	}

	return data;
}

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
					if(typeof object[pathArray] == "object") { object[pathArray] = object[pathArray].toString() }
					bucket.push(object[pathArray]);
				}
			}
			else if(object[pathArray] && 
					condition == "false" && 
					object[matchField] != matchValue) {

				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					if(typeof object[pathArray] == "object") { object[pathArray] = object[pathArray].toString() }
					bucket.push(object[pathArray]);
				}
			}
		}
		else if(object[pathArray]) {

			if(excludeCondition == false) {
				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					if(typeof object[pathArray] == "object") { object[pathArray] = object[pathArray].toString() }
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