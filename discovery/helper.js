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

/**
 * 
 *
 * @param 
 * @return 
 */
exports.isParentObject = function(object) {
  var isParent = false;
  if(object.type == "compunnd" ||
      object.type == "book") {
    isParent = true;
  }
  return isParent;
}


