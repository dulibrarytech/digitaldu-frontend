/*
 * Helper functions for the Discovery module
 */

'use strict';

var config = require('../config/config');

exports.createSummaryDisplayObject = function(result) {
	var displayObj = {};
	var displayFields = config.summaryDisplay;

	var key, field;
	for(key in displayFields) {
		field = displayFields[key];
		
		if(typeof result[field] != 'undefined' && result[field] != '') {
			displayObj[key] = result[field];
		}
	}

	return displayObj;
}

exports.createMetadataDisplayObject = function(result) {
	var displayObj = {};
	var displayFields = config.metadataDisplay;

	// Get metadata object from result display record json
	var displayRecord = JSON.parse(result.display_record)

	var key, field;
	for(key in displayFields) {
		field = displayFields[key];
		
		if(typeof displayRecord[field] != 'undefined' && result[field] != '') {
			displayObj[key] = displayRecord[field];
		}
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

	console.log("TEST Results out", response);

	return response;
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


