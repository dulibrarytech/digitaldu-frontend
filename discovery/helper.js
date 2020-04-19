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
 * Discovery Helper Functions
 *
 */
'use strict'

var config = require('../config/' + process.env.CONFIGURATION_FILE),
    AppHelper = require('../libs/helper');

/**
 * Create array of 'view data' objects, one for each result item in the input object array
 *
 * @param {Array} objects - Array of Elastic search result _source objects
 *
 * @typedef {Object} viewData - List of 'view data' objects
 * @property {String} pid - Object pid
 * @property {String} tn - Object TN image source path
 * @property {String} title - Object title
 * @property {String} path - Object type path (ex "/object" or "/collection") Used to create the link to the object in the view
 *
 * @return {viewData}
 */
 exports.getObjectLinkDisplayList = function(objects) {
  var objectList = [], tn, pid, title, path;
  for(var object of objects) {

    title = object.title || null;
    if(!title || title == "") {
      title = config.noTitlePlaceholder;
    }

    pid = object.pid || "";
    if(!pid) {
      console.log("Error: Object " + object + " has no pid value");
    }
    tn = config.rootUrl + "/datastream/" + object.pid + "/tn";

    if(!object.object_type) {
      console.log("Error: Object " + object + " has no object_type value");
    }
    path = "/" + object.object_type || "";

    // Push the current object view data to the list
    objectList.push({
        pid: pid,
        tn: tn,
        title: title,
        path: path
      });
  }

  return objectList;
}

 /**
 * Get facet counts by name
 *
 * @param {Array} facets - Elastic aggregations object
 * @return {Object} Object of facet count data
 */
exports.getTypeFacetTotalsObject = function(facets) {
  var totals = {};
  for(var facet of facets.Type.buckets) {
    for(var key in config.facetLabelNormalization.Type) {
      if(config.facetLabelNormalization.Type[key].includes(facet.key)) {
        totals[key] = {
          "count": facet.doc_count,
          "key": facet.key
        };
      }
    }
  }

  return totals;
}

 /**
 * Get normalized facet label
 *
 * @param {String} field - Facet field
 * @param {String} label - Label text to normalize
 * @return {String} Normalized label text, or unchanged label text if it can not be normalized
 */
exports.normalizeLabel = function(field, label) {
  for(var key in config.facetLabelNormalization[field]) {
    if(config.facetLabelNormalization[field][key].includes(label)) {
      label = key;
    }
  }
  return label;
}

 /**
 * Not in use
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
 * Wrapper function for createBreadcrumbLinks
 *
 * @param {Array.<collectionData>}
 *
 * @typedef {Object} collectionData - Data to create one collection breadcrumb link
 * @property {String} pid - The collection pid
 * @property {String} name - The collection name, to be displayed in the breadcrumb
 * @property {String} url - Absolute path to the collection's view
 *
 * @return {String|null} The html string for the breadcrumb list, null if the collections array is empty
 */
exports.getCollectionBreadcrumbObject = function(collections) {
    return createBreadcrumbLinks(collections);
};

/**
 * Creates an html breadcrumb link list for an array of collections
 *
 * @param {Array.<collectionData>}
 *
 * @typedef {Object} collectionData - Data to create one collection breadcrumb link
 * @property {String} pid - The collection pid
 * @property {String} name - The collection name, to be displayed in the breadcrumb
 * @property {String} url - Absolute path to the collection's view
 *
 * @return {String|null} The html string for the breadcrumb list, null if the collections array is empty
 */
function createBreadcrumbLinks(collections) {
    var html = "";
    for (var i = 0; i < collections.length; i++) {
    	if(i>0) {
    		html += '&nbsp&nbsp<span>></span>&nbsp&nbsp';
    	}
        html += '<a class="collection-link" href="' + collections[i].url + '">' + collections[i].name + '</a>';
    }
    return collections.length > 0 ? html : null;
};

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

    return facetAggregations;
}

 /**
 * Finds the IIIF object type that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} IIIF object type
 */
exports.getIIIFObjectType = function(mimeType) {
  let objectTypes = config.IIIFObjectTypes, 
      localObjectTypes = config.objectTypes,
      objectType = null;

  for(var type in localObjectTypes) {
    if(localObjectTypes[type].includes(mimeType)) {
      objectType = objectTypes[type];
    }
  }

  return objectType;
}

 /**
 * Select a IIIF "format" value based on the DDU object type 
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} III "format" mimetype
 */
exports.getIIIFFormat = function(mimeType) {
  let objType = getObjectType(mimeType),
      format = "";
  switch(objType) {
    case "smallImage":
    case "largeImage":
      format = "image/jpg";
      break;
    case "audio":
      format = "audio/mp3";
      break;
    case "video":
      format = "video/mp4";
      break;
    case "pdf":
      format = "application/pdf";
      break;
    default:
      format = "";
      break;
  }
  return format;
}

 /**
 * Finds the DDU datastream ID that corresponds with an object's mime type
 *
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} DDU datastream ID
 */
exports.getDsType = function(mimeType) {
  let datastreams = config.datastreams,
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
 * Returns the HTTP response "content-type" for an object, based on its object file extension
 * All thumbnail datastreams are image/jpg at this point
 *
 * @param {String} datastream - Object datastream ID
 * @param {String} mimeType - Object mime type (ex "audio/mp3")
 * @return {String} HTTP content type
 */
var getContentType = function(datastream, object, mimeType) {
  let contentType = "application/octet-stream";
  if(datastream.toLowerCase() == "tn") {
    contentType = "image/jpg";
  }
  else if(object.object && object.object.length > 0) {
    let extIndex = object.object.lastIndexOf("."),
        ext = object.object.substring(extIndex+1);
        contentType = config.contentTypes[ext] || "";
  }
  return contentType;
}
exports.getContentType = getContentType;

 /**
 * Create an array of citation data objects for the view model
 * TODO (enhancement) define citations in configuration object, update this function to parse index paths and build citation objects dynamically
 */
exports.getCitations = function(object)  {
  let citations = null,
      date = new Date(),
      curDate;

  curDate = AppHelper.getDateMonthString(date.getMonth()) + " " + (date.getDate()) + ", " + date.getFullYear();

  if(object) {
    citations = [];
    let title = object.title || "No title",
        creator = object.display_record.names[0].title || "Unknown",
        date = object.display_record.dates[0].expression || "Unknown",
        accessDate = curDate,
        url = config.rootUrl + "/object/" + object.pid,
        citation;

    citation = creator + ", (" + date + ") " + title + ". Retrieved from " + config.appTitle + ", " + url;
    citations.push({
      format: "APA",
      citation: citation 
    });

    citation = creator + ". (" + date + ") " + title + ". Retrieved from " + config.appTitle + "<" + url + ">.";
    citations.push({
      format: "MLA",
      citation: citation 
    });

    citation = creator + ". " + title + ". " + date + ". Retrieved from " + config.appTitle + ", " + url + ". (Accessed " + accessDate + ".)";
    citations.push({
      format: "Chicago",
      citation: citation 
    });
  }

  return citations;
}



