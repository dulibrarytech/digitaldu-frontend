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
    path = "/object";

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
 * Get data for frontpage type list
 *
 * @param {Array} facets - Elastic aggregations object
 * @return {Object} Object of facet count data
 */
exports.getTypeDisplayList = function(facets) {
  var totals = {},
      typeLabel = config.typeLabel || "Type";
  for(var facet of facets[typeLabel].buckets) {
    for(var key in config.facetLabelNormalization[typeLabel]) {
      if(config.facetLabelNormalization[typeLabel][key].includes(facet.key)) {
        totals[key] = {
          "count": facet.doc_count,
          "key": facet.key
        }; 

        if(config.facetThumbnails[typeLabel][key]) {
          totals[key]["thumbnail"] = config.facetThumbnails[typeLabel][key];
        }
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
  let objType = AppHelper.getObjectType(mimeType),
      format = "";

  switch(objType) {
    case "still image":
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
 * Create an array of citation data objects for the view model
 * TODO (enhancement) define citations in configuration object, update this function to parse index paths and build citation objects dynamically
 */
exports.getCitations = function(object)  {
  let citations = null,
      date = new Date(),
      curDate;

  curDate = AppHelper.getDateMonthString(date.getMonth()) + " " + (date.getDate()) + ", " + date.getFullYear();

  if(object && object.display_record) {
    citations = [];
    let title = (object.title) || "Untitled",
        creator = object.creator || title,
        date = (object.display_record.dates && object.display_record.dates[0]) ? (object.display_record.dates[0].expression || "n.d.") : "n.d.",
        accessDate = curDate,
        url = config.rootUrl + "/object/" + object.pid,
        citation;

    title = title + ".";
    citation = creator + ", (" + date + ") " + title + " Retrieved from " + config.appTitle + ", " + url;
    citations.push({
      format: "APA",
      citation: citation 
    });

    citation = creator + ". (" + date + ") " + title + " Retrieved from " + config.appTitle + " <" + url + ">.";
    citations.push({
      format: "MLA",
      citation: citation 
    });

    citation = creator + ". " + title + " " + date + ". Retrieved from " + config.appTitle + ", " + url + ". (Accessed " + accessDate + ".)";
    citations.push({
      format: "Chicago",
      citation: citation 
    });

    // citation = creator + '. "' + title + '." ' + config.appTitle + ', ' + date + '. Accessed ' + curDate + '. ' + url + '.';
    // citations.push({
    //   format: "Turabian",
    //   citation: citation 
    // });
  }

  return citations;
}

/*
 * Slice the array elements to current page and page size
 */
exports.getArrayPage = function(array, pageNum, pageSize) {
  let from = (pageNum-1) * pageSize;
  let to = from + pageSize;
  return array.slice(from, to);
}

/**
 * Convert the sort params array into a data array for the search function
 * Sorting by "relevance" will return null, no sorting is required
 *
 * @param {String} sort - The sort string: two terms delimited by "," (ex "sort field,sort type" or "Title,asc")
 *
 * @typedef {Object} sortData
 * @property {String} field - First value of comma delimited "sort" string
 * @property {String} order - Second value of comma delimited "sort" string
 *
 * @return {sortData|null} - The sort data object.  Null will be returned if the sort value is "relevance"
 */
exports.getSortDataArray = function(sort) {
  let sortData = null;
  if(sort && sort != "") {
    sort = sort.split(",");

    // If the sort field value is "relevance", do not assign the sort data, this is the default search
    if(sort[0].toLowerCase() != "relevance") {
      sortData = {
        field: sort[0],
        order: sort[1].replace(/\W/g, '') || null
      }
    }
  }
  return sortData;
}

 /**
 * Return an array of links to download the object file 
 * Currently only single link option, creates link to download file extension registered to the object's mime type
 *
 * @param {Object} object - DDU Elastic index doc
 * @return {Array.<String>} Array of download link uris
 */
exports.getFileDownloadLinks = function(object, part=null) {
  let links = [],
      pid = object.pid || "";
  
  if(AppHelper.isParentObject(object) && 
    config.enableCompoundObjectBatchDownload == true &&
    AppHelper.validateCompoundObject(object)) {

    let link = {
      uri: config.rootUrl + "/download/" + pid + "/" + pid + ".zip",
      filename: pid + ".zip",
      extension: "zip",
      isBatch: true
    };
    links.push(link);

    object = AppHelper.getCompoundObjectPart(object, 1);
  }

  if(object.object) {
    let extension = null;
    if(object.object) {
      extension = AppHelper.getFileExtensionFromFilePath(object.object);
    }

    if(extension) {
      if(config.downloadFiletypes[extension]) {
        for(var filetype of config.downloadFiletypes[extension]) {
          let link = {
            uri: config.rootUrl + "/datastream/" + pid + "/" + filetype.extension + "/" + part + "/" + pid + "." + filetype.extension,
            filename: pid + "." + filetype.extension,
            extension: filetype.extension,
            label: filetype.label,
            isBatch: false
          };
          links.push(link);
        }
      }
      else {
        let link = {
          uri: config.rootUrl + "/datastream/" + pid + "/" + extension + "/" + part + "/" + pid + "." + extension,
          filename: pid + "." + extension,
          extension: extension,
          label: extension,
          isBatch: false
        };
        links.push(link);
      }
    }
    else {console.log("Can not determine download file type(s) for object " + pid)}
  }
  else {
    console.log("Can not create download links for object " + pid + ", object path does not exist");
  }
  return links;
}

 /**
 * Validate the cache name
 *
 * @param {String} name - The cache name
 * @return {Boolean} True if valid False if invalid
 */
exports.validateCacheName = function(name) {
  return name && (name == 'thumbnail' || name == 'object');
}



