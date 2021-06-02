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

const config = require('../config/' + process.env.CONFIGURATION_FILE);
const Kaltura = require('../libs/kaltura');
const sanitizeHtml = require('sanitize-html');

/*
 * 
 */
exports.testObject = function(object) {
	return (object && typeof object != "undefined");
}

/*
 * 
 */
exports.getDateMonthString = function(monthVal) {
  const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
  ];
  return monthNames[monthVal];
}

/*
 * True if object is a compound object
 */
exports.isParentObject = function(object) {
  return (object && (object.is_compound == true || object.object_type == "compound" || object.type == "compound"));
}

/*
 * True if object is a collection object
 */
exports.isCollectionObject = function(object) {
  return (object && (object.object_type && object.object_type == "collection"));
}

/*
 * 
 */
exports.isObjectEmpty = function(object) {
	for(var key in object) {
        if(object.hasOwnProperty(key))
            return false;
    }
    return true;
}

/*
 * 
 */
exports.removeHtmlEntities = function(string) {
	return string.replace(/&amp;/g, "").replace(/&lt;/g, "").replace(/&gt;/g, "").replace(/&quot;/g, "");
}

/*
 * data can be a string or an array of strings, single or multi dimension 
 */
var stripHtmlTags = function(data) {
	if(typeof data == "string") {
		data = data.replace(/<\/{0,1}[a-zA-Z]+>/g, "");
	}
	else if(typeof data == "object") {
		for(var index in data) {
			if(typeof data[index] == "string") {
				data[index] = data[index].replace(/<\/{0,1}[a-zA-Z]+>/g, "");
			}
			else if(typeof data[index] == "object") {
				stripHtmlTags(data[index]);
			}
		}
	}

	return data;
}
exports.stripHtmlTags = stripHtmlTags;

/*
 * 
 */
exports.sanitizeHttpParamsObject = function(object) {
	for(var key in object) {
		if(typeof object[key] == 'object') {
			for(index in object[key]) {
				if(key == "f") {
					for(facet in object[key][index]) {
						object[key][index][facet] = sanitizeHtml(object[key][index][facet]);
					}
				}
				else {
					object[key][index] = sanitizeHtml(object[key][index]);
				}
			}
		}
		else {
			object[key] = sanitizeHtml(object[key]);
		}
	}
}

var getCompoundObjectPart = function(object, partIndex) {
	var parts = [],
		objectPart = null;
		
	// Get the parts array	
	if(object.parts) {
		parts = object.parts;
	}
	else if(object.compound) {
		parts = object.compound;
	}
	else if(object[config.displayRecordField] && object[config.displayRecordField].parts) {
		parts = object[config.displayRecordField].parts;
	}

	if(partIndex == -1) {
		objectPart = parts;
	}
	else if(parts.length > 0 && parts[partIndex-1]) {
		objectPart = parts[partIndex-1];
	}

	return objectPart;
}
exports.getCompoundObjectPart = getCompoundObjectPart;

/**
 * Determines if a compound object's children meet a certain criteria
 * Currently, only audio and video objects, or small and large images can be combined in a compound object.  All other combinations of child object types are invalid
 *
 * @param {Object} object - index document
 * @return {Boolean} - true if valid, false if not
 */
var validateCompoundObject = function(object) {
	var isValid = false,
		mimeType = "";

	var parts = getCompoundObjectPart(object, -1) || [];

	// If the compound object has no mime type data, get mime type of first part, use that for compound object mime type
	if(!object.mime_type || object.mime_type == "") {
		if(parts && parts.length > 0) {
			if(parts[0].mime_type || parts[0].type) {
				mimeType = parts[0].mime_type || parts[0].type;
			}
		}
	}

	// Use the compound object's mime type
	else {
		mimeType = object.mime_type;
	}
	
	// Validate the compound object parts' mime types against the compound object's allowed mime types
	if(config.objectTypes["audio"].includes(mimeType) || config.objectTypes["video"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["audio", "video"]);
	}
	else if(config.objectTypes["pdf"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["pdf"]);
	}
	else if(config.objectTypes["still image"].includes(mimeType)) {
		isValid = validateCompoundObjectParts(parts || [], ["still image"]);
	}
	else {
		console.log("Invalid compound object mime type");
	}

	return isValid;
}
exports.validateCompoundObject = validateCompoundObject;

/**
 * Validate an array of object parts against a list of object types
 *
 * @param {Array.<Object>} parts - Array of part objects
 * @param {Array.<String>} objectTypes - Array of object type strings
 * @return {Boolean} - true if combination of parts is valid, false if not
 */
var validateCompoundObjectParts = function(parts, objectTypes) {
	var acceptedMimeTypes = [], 
		mimeType = "",
		isValid = false;

	// Build an array of accepted mime types for this compound object
	for(var type of objectTypes) {
		acceptedMimeTypes = acceptedMimeTypes.concat(config.objectTypes[type]);
	}

	// Determine if any of the object's parts are of an unacceptable mimetype
	if(parts && parts.length > 0) {
		isValid = true;
		for(var part of parts) {
			if(typeof part.object == 'undefined' || !part.object) {
				isValid = false;
				break;
			}

			mimeType = part.mime_type || part.type || "";
			if(acceptedMimeTypes.includes(mimeType) == false) {
				isValid = false;
				break;
			}
		}
	}

	return isValid;
}

exports.getCompoundObjectItemCount = function(object) {
	let count = null;
	if(object[config.displayRecordField].parts && object[config.displayRecordField].parts.length) {
		count = object[config.displayRecordField].parts.length;
	}
	else if(object.compound && object.compound.length) {
		count = object.compound.length;
	}
	else if(object.parts && object.parts.length) {
		count = object.parts.length;
	}
	return count;
}

var getFileExtensionFromFilePath = function(filename) {
  filename = filename ? filename : "";	
  let extension = null, 
  	  extIndex = filename.lastIndexOf("."),
      pathExtension = filename.substring(extIndex);

	if(/\.\w\w\w\w?$/g.test(pathExtension)) {
		extension = pathExtension.substring(1);
	}
  return extension;
}
exports.getFileExtensionFromFilePath = getFileExtensionFromFilePath;

/**
 * Return the file extension that a mimetype is associated with
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} file extension
 */
var getFileExtensionForMimeType = function(mimeType) {
	var extension = null;
	for(key in config.fileExtensions) {
      if(config.fileExtensions[key].includes(mimeType)) {
      	extension = key;
        break;
      }
    }
    return extension;
}
exports.getFileExtensionForMimeType = getFileExtensionForMimeType;

 /**
 * Finds the DDU object type that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} DDU object type
 */
var getObjectType = function(mimeType) {
  let type = "";
  for(var key in config.objectTypes) {
    if(config.objectTypes[key].includes(mimeType)) {
      type = key;
    }
  }
  return type;
}
exports.getObjectType = getObjectType;

 /**
 * Finds the DDU object type that corresponds with an object's mime type
 *
 * @param {String} extension - a file extension (no '.' prefix)
 * @return {Boolean} true if extension is valid (in configuration) false if not recognized 
 */
var isValidExtension = function(extension) {
	let isValid = false;
	for(var key in config.fileExtensions) {
		if(extension == key) {
			isValid = true;
		}
	}
	return isValid;
}
exports.isValidExtension = isValidExtension;

 /**
 * Returns the HTTP response "content-type" for an object, based on its object file extension TODO: move to AH
 *
 * @param {String} datastream - Object datastream ID
 * @return {String} HTTP content type
 */
var getContentType = function(datastream, object, part) {
  // Default content type
  var contentType = "application/octet-stream",
  	  pid = object.pid || "";

  if(part && object.display_record.parts) {
    part = parseInt(part);
    object = object.display_record.parts[part-1] || null;
  }
  // Thumbnail datastream, use specified file type
  if(datastream.toLowerCase() == "tn") {
    contentType = "image/" + config.thumbnailFileExtension || "jpeg";
  }
  // File type specific datastream (mp3, jpg, etc)
  else if(datastream.toLowerCase() != "object") {
    contentType = config.contentTypes[datastream] || "";
  }
  // Determine the file type via the object path file extension
  else if(object && object.object) {
    let ext = getFileExtensionFromFilePath(object.object);
    contentType = config.contentTypes[ext] || "";

  }
  else {
  	console.log("Invalid compound object data. Object ID: " + pid)
  }
  return contentType;
}
exports.getContentType = getContentType;

 /**
 * Finds the DDU datastream ID that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} DDU datastream ID
 */
exports.getDsType = function(mimeType) {
  let datastreams = config.fileExtensions,
      datastream = "",
      objectType = null;

  for(var key in datastreams) {
    if(datastreams[key].includes(mimeType)) {
      datastream = key;
    }
  }

  return datastream;
}


/**
 * Creates an Elastic 'aggs' query for an Elastic query object 
 *
 * @param {Object} facets - DDU facet fields configuration
 * @return {Object} Elastic DSL aggregations query object
 */
exports.getFacetAggregationObject = function(facets) {
  var facetAggregations = {}, field;
    for(var key in facets) {
      field = {};
      field['field'] = facets[key].path + ".keyword";
      field['size'] = config.facetLimit;
      facetAggregations[key] = {
        "terms": field
      };
    }

    // Temp: Add non-keyword facet fields
    facetAggregations["Compound Object"].terms = {
      field: "is_compound",
      size: 200
    }

    facetAggregations["datefieldStats"] = {
      "nested": {
      	"path": config.nestedDateField
      },
      "aggs": {
      	"stats": {
      		"extended_stats": {
      			"field": config.beginDateField
      		}
      	}
      }
    };
    
    return facetAggregations;
}

exports.validateDateParameters = function(query) {
  var isValid = true;
  const	year = /^[0-9][0-9][0-9][0-9]$/;

  if(query.from) {
  	if(query.from.match(year) == null) {
  		isValid = false;
  	}
  }

  if(isValid && query.to) {
  	if(query.to.match(year) == null) {
  		isValid = false;
  	}
  }

  return isValid;
}

exports.sanitizePid = function() {
	
}