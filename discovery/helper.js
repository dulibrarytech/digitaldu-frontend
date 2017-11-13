/*
 * Helper functions for the Discovery module
 */

'use strict';

var config = require('../config/config');

exports.createMetadataDisplayObject = function(result) {
	var displayObj = {};
	var displayFields = config.metadataDisplay;

	var key, field;
	for(key in displayFields) {
		field = displayFields[key];
		
		if(typeof result[field] != 'undefined') {
			displayObj[key] = result[field];
		}
	}

	return displayObj;
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


