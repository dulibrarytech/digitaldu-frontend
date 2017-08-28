/*
 * Helper functions for the Discovery module
 */

'use strict';

var config = require('../config/config');

/*
 * Create an array of facet breadcrumb objects for the view
 */
exports.getFacetBreadcrumbObject = function(selectedFacets) {

	var breadcrumbTrail = [];
	for(var key in selectedFacets) {

		for(var index of selectedFacets[key]) {
			breadcrumbTrail.push({
				type: key,
				name: index
			});
		}
	}

	return breadcrumbTrail;
};


