 /**
 * @file 
 *
 * Search results view controller.  This is the main search function for the () application
 *
 */

'use strict';

const async = require('async'),
    config = require('../config/config'),
    Service = require('./service.js'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator');

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

	// Get the search type
	if(typeVal.toLowerCase() == 'all') {

		// Non-scoped search: Use fulltect search fields
		if(config.fulltextMetadataSearch === true) {
			type = config.metadataKeywordFields;
		}

		// Non-scoped search: Search in all of the fields in the search type dropdown
		else {
			type = [];
			for(var field of config.keywordFields) {
				for(var key in field) {
					type.push(field[key]);
				}
			}
		}
	}

	// Scoped search.  Use the selected type in the search type dropdown
	else {
		
		for(var field of config.searchFields) {
			for(var key in field) {
				if(key == typeVal) {
					type = field[key];
				}
			}
		}
	}

	//Service.searchIndex(query, type, facets, collection, page, function(response) {
	Service.searchIndex(query, type, facets, collection, page, function(error, response) {

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

		if(error) {
			console.error("Search Error: ", error);
			data.results = null;
			data.error = error;
		}
		else {
			data.results = response.results;
			data.facets = Facets.create(response.facets, config.rootUrl);	// PROD
			data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params
			data.pagination = Paginator.create(response.results, data.page, config.maxResultsPerPage, response.count, path);
		}

		return res.render('results', data);
	});
};