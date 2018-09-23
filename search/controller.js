'use strict';

const async = require('async'),
    config = require('../config/config'),
    Service = require('./service.js'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator');

/*
 * Search the index, render the results view
 */
exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.query.q;
	var facets = req.query.f || null;
	var typeVal = req.query.type || "all", type;
	var page = req.query.page || 1;
	var collection = req.query.collection || null;

	// Allow empty search to return all results in the repository
	if(query == "") {
		query = '*';
	}

	// "Search field selection": If "search all", build array of types from config settings.  If type search, 'type'is passed into search function as a string.
	if(typeVal.toLowerCase() == 'all') {
		type = [];
		for(var field of config.searchFields) {
			for(var key in field) {
				type.push(field[key]);
			}
		}
	}
	else {
		for(var field of config.searchFields) {
			for(var key in field) {
				if(key == typeVal) {
					type = field[key];
				}
			}
		}
	}

	Service.searchIndex(query, type, facets, collection, page, function(response) {

		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			results: [],
			pageData: null,
			page: req.query.page || 1,
			base_url: config.baseUrl,
			root_url: config.rootUrl,
			collection_scope: "",
			query: query
		},
		path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);

		if(response.status) {

			// Get data for the view
			data.results = response.data.results;
			data.facets = Facets.create(response.data.facets, config.rootUrl);	// PROD
			data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params
			data.pagination = Paginator.create(response.data.results, data.page, config.maxResultsPerPage, response.data.count, path);
		}
		else {
			console.error("Search Error: ", response.message);
			data.results = null;
			data.error = response.message;
		}

		return res.render('results', data);
	});
};