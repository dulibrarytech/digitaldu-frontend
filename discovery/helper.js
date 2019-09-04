 /**
 * @file 
 *
 * Discovery Helper Functions
 *
 */

'use strict'

var config = require('../config/' + process.env.CONFIGURATION_FILE);

/**
 * Create array of 'view data' objects, one for each result item in the input results array
 *
 * @param {Array} results - Array of Elastic search results
 * @return {Array} List of 'view data' objects
 */
 exports.createItemList = function(results) {
  var itemList = [], tn, pid, title, description, display, path;
  for(var item of results) {
      
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
    if(item.object_type && item.object_type == "collection") {
      path = "/collection";
    }
    else {
      path = "/object";
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
 * @param {Array.<{pid: String - The collection pid, name: String - The collection name, url: String - Absolute path to the collection's view}>} collections
 * @return {String|null} The html string, null if the collections array is empty
 */
exports.getCollectionBreadcrumbObject = function(collections) {
    return createBreadcrumbLinks(collections);
};

/**
 * Creates an html breadcrumb link list for an array of collections
 *
 * @param {Array.<{pid: String - The collection pid, name: String - The collection name, url: String - Absolute path to the collection's view}>} collections
 * @return {String|null} The html string, null if the collections array is empty
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
      field['field'] = facets[key] + ".keyword";
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
exports.getObjectType = function(mimeType) {
  let type = "";
  for(var key in config.objectTypes) {
    if(config.objectTypes[key].includes(mimeType)) {
      type = key;
    }
  }
  return type;
}


