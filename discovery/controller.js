'use strict';

var async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),
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
	Service.getCollections(config.topLevelCollectionPID, function(response) {
		if(response.status) {
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
	var page = req.query.page || 0;

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
				console.log("Search Response:", response);

			// Get data for the view
			data['results'] = response.data.results;
			data['base_url'] = config.baseUrl;
			data['facets'] = Facets.create(response.data.facets);
			data['facet_breadcrumb_trail'] = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params

			//data['results'] = Helper.paginateResults(response.data.length, 1);
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
		console.log("SVC pointer:", Service);
	Service.fetchObjectByPid(req.params.pid, function(response) {
		var data = {};

		// Determine content model type

		// Get viewer
		data['viewer'] = "<h4>Viewer</h4>";

			console.log("DEV fetchObject() service response:", response);

		data['base_url'] = config.baseUrl;
		return res.render('object', data);
	});
};