'use strict';

var async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets');

function getFacets(data, callback) {

    Service.getFacets(function (facets) {
        var facetObj = Facets.create(facets);
        data.push(facetObj);
        callback(data);
    });
}

exports.renderCollectionsView = function(req, res) {
	var data = {};

	// Get list from discovery service
	Service.getTopLevelCollections(function(response) {
		if(response.status) {
				console.log("TEST collections rx:", response.data);
			data['collections'] = response.data;
			data['base_url'] = config.baseUrl;
		}
		else {
			data['collections'] = [];
			data['error'] = "Could not retrieve collections";
		}
		return res.render('collections', data);
	});
};

exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.query.q;
	var facets = req.query.f || null;
	var typeVal = req.query.type, type;
	var page = req.query.page || 1;

	// If search all, build array of types from config settings.  If type search, 'type'is passed into search function as a string.
	if(typeVal == 'All') {
		type = [];
		config.searchFields.forEach(function(field) {	// TODO: Convert to for loop
			for(var key in field) {
				type.push(field[key]);
			}
		});
	}
	else {
		config.searchFields.forEach(function(field) {	// TODO: Convert to for loop
			for(var key in field) {
				if(key == typeVal) {
					type = field[key];
				}
			}
		});
	}

	// TODO: Get page value from search query
	// Update with ES pagination 

	Service.searchIndex(query, type, facets, page, function(response) {
		var data = {};
		if(response.status) {

			// Get data for the view
			var pagination = Helper.paginateResults(response.data.results, page);
			//data['results'] = response.data.results;
			data['base_url'] = config.baseUrl;
			data['facets'] = Facets.create(response.data.facets);
			data['facet_breadcrumb_trail'] = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params

			data['results'] = pagination.results;
			data['pageData'] = pagination.data;
			// console.error("Test error!");  createBreadcrumbTrail
		}
		else {
			console.error("Error: ", response.message);
			data['results'] = null;
			data['error'] = response.message;
		}

		return res.render('results', data);
	});
};

exports.renderObjectView = function(req, res) {
	var data = {
		viewer: null,
		object: null,
		mods: null
	};

	// Get the object data
	Service.fetchObjectByPid(req.params.pid, function(response) {

		if(response.status) {

			var object;
			if(response.data.pid) {
				object = response.data;
				data['object'] = object;

				// Get viewer
				data['viewer'] = Viewer.getObjectViewer(object);
				data['summary'] = Helper.createSummaryDisplayObject(object);
				data['mods'] = Helper.createMetadataDisplayObject(object);
			}	
			else {
				data['error'] = "Error rendering object, object not found";
			}
		}
		else {
			console.error("Index error: ", response.message);
			data['error'] = "Error rendering object, object not found";
		}
		
		data['base_url'] = config.baseUrl;
		return res.render('object', data);
	});
};