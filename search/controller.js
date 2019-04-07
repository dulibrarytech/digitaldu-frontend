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
    Paginator = require('../libs/paginator'),
    Helper = require('./helper.js'),
    Format = require("../libs/format");

exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.query.q;
	var facets = req.query.f || null;
	var typeVal = req.query.type || "all", type;
	var page = req.query.page || 1;
	var collection = req.query.collection || null;
	var showAll = req.query.showAll || [];

	// Allow empty search to return all results in the repository
	if(query == "") {
		query = '*';
	}

	// Get the search type
	// TODO move to helper function
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

	Service.searchIndex(query, type, facets, collection, page, function(error, response) {

		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			results: [],
			pageData: null,
			page: req.query.page || 1,
			root_url: config.rootUrl,
			collection_scope: "",
			query: Helper.getResultsLabel(req.query.q, facets)
		},
		path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);

		if(error) {
			console.error(error);
			data.results = null;
			data.error = error;
		}
		else {
			var facetList = Facets.getFacetList(response.facets, showAll);
			if(facets) {
				facets = Facets.getSearchFacetObject(facets);
			}

			Format.formatFacetDisplay(facetList, function(error, facetList) {
				Format.formatFacetBreadcrumbs(facets, function(error, facets) {
					data.results = response.results;
					data.facets = Facets.create( facetList, config.rootUrl );	// DEV
					data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params
					data.pagination = Paginator.create(response.results, data.page, config.maxResultsPerPage, response.count, path);

					return res.render('results', data);
				});
			});
		}
	});
};