/*
 * Helper functions for the Discovery module
 */

'use strict';

var config = require('../config/config');

exports.createSummaryDisplayObject = function(result) {
	var displayObj = {},
	    displayFields = config.summaryDisplay,
		displayRecord = {};

	if(result.display_record) {
		try {
			displayRecord = JSON.parse(result.display_record);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
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
	if(result.display_record) {
		try {
			displayRecord = JSON.parse(result.display_record);
		}
		catch(e) {
			console.log("Error: invalid object display record for object: " + result.pid);
		}
	}

	var key, field;
	for(key in displayFields) {
		field = displayFields[key];
		
		if(typeof displayRecord[field] != 'undefined' && result[field] != '') {
			displayObj[key] = displayRecord[field];
		}
	}

	if(Object.keys(displayObj).length === 0 && displayObj.constructor === Object) {
		displayObj["No display available"] = "";
	}

	return displayObj;
}

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

		//console.log("TEST paginator: Results out", response);

	return response;
}

/*
 * Creates the view object containing the paginator data
 */
exports.getViewPaginatorDataObject = function(items, page) {
	var pagination = {
		page: page,
		beginCount: 0,
		pageHits: 0,
		totalHits: 0
	};

	pagination.beginCount = (config.maxCollectionsPerPage * (page-1)) + 1;
	if(items.list.length < config.maxCollectionsPerPage) {
		pagination.pageHits = (pagination.beginCount - 1) + items.list.length;
	}
	else {	
		pagination.pageHits = items.list.length * page;
	}
	pagination.totalHits = items.count;

	return pagination;
}

/*
 * Get the totals for all type facets, for the front page template (Matches the hard coded type facets)
 */
exports.getTypeFacetTotalsObject = function(facets) {
	
	// Default values
	var totals = {
		stillImage: 1234,
		movingImage: 1234,
		soundRecording: 1234,
		text: 1234,
		map: 1234,
		artReproduction: 1234,
		scrapbook: 1234
	}

	// TODO If necessary, normalize type fields here (ala Blacklight)

	for(var facet of facets.Type.buckets) {
		if(facet.key == "still image") {
			totals.stillImage = facet.doc_count;
		}
		else if(facet.key == "moving image") {
			totals.movingImage = facet.doc_count;
		}
		else if(facet.key == "text") {
			totals.text = facet.doc_count;
		}
	}

	return totals;
}

exports.getSearchResultDisplayFields = function(searchResult) {
	var fields = {
		title: "",
		description: ""
	};

	var displayRecord = {};

	try {
		// Get Display Record data
	    if(searchResult._source.display_record && typeof searchResult._source.display_record == 'string') {
	      displayRecord = JSON.parse(searchResult._source.display_record);
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
	}
	catch(error) {
		console.log("Error: " + error);
	}

    return fields;
}

exports.getFacetAggregationObject = function(facets) {
	var facetAggregations = {}, field;
    for(var key in facets) {
      field = {};
      field['field'] = facets[key] + ".keyword";
      facetAggregations[key] = {
        "terms": field
      };
    }
    return facetAggregations;
}

/*
 * Create an array of facet breadcrumb objects for the view
 */
// exports.getFacetBreadcrumbObject = function(selectedFacets) {

// 	var breadcrumbTrail = [];
// 	for(var key in selectedFacets) {

// 		for(var index of selectedFacets[key]) {
// 			breadcrumbTrail.push({
// 				type: key,
// 				name: index
// 			});
// 		}
// 	}

// 	return breadcrumbTrail;
// };


