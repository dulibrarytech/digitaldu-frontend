 /**
 * @file 
 *
 * Search results view controller.  This is the main search function for the () application
 *
 */

'use strict';

const async = require('async'),
    config = require('../config/' + process.env.CONFIGURATION_FILE),
    Service = require('./service.js'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Helper = require('./helper.js'),
    Metadata = require('../libs/metadata'),
    Format = require("../libs/format");

exports.search = function(req, res) {
	var query = req.query.q || [""],
		field = req.query.field || ["all"], 
		type = req.query.type || ["contains"],
		bool = req.query.bool || ["or"],
		facets = req.query.f || null,
		page = req.query.page || 1,
		pageSize = req.query.resultsPerPage || config.maxResultsPerPage,
		sortBy = req.query.sort || null,
		collection = req.query.collection || null,
		showAll = req.query.showAll || [],
		expandFacets = req.query.expand || [],
		daterange = (req.query.from || req.query.to) && (parseInt(req.query.from) < parseInt(req.query.to)) ? {
			from: req.query.from || 0,
			to: req.query.to || new Date().getFullYear()
		} : null;

		// console.log("TEST query", query);
		// console.log("TEST field", field);
		// console.log("TEST type", type);
		// console.log("TEST bool", bool);

	var queryData = Helper.getSearchQueryDataObject(query, field, type, bool);

	Service.searchIndex(queryData, facets, collection, page, pageSize, daterange, function(error, response) {

		// View data
		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			results: [],
			pageData: null,
			page: req.query.page || 1,
			root_url: config.rootUrl,
			collection_scope: "",
			query: Helper.getResultsLabel(req.query.q, facets),
			view: req.query.view || config.defaultSearchResultsView || "list",
			options: {}
		};

		if(error) {
			console.error(error);
			data.error = "An unexpected error has occurred.  Please contact systems support";
			return res.render('results', data);
		}
		else {

			data.options["expandFacets"] = expandFacets;
			data.options["perPageCountOptions"] = config.resultCountOptions;
			data.options["resultsViewOptions"] = config.resultsViewOptions;
			data.options["pageSize"] = pageSize;

			// Don't show the daterange limit option if there is a daterange parameter preent, or if there are no search results
			data.options["showDateRange"] = (daterange || response.count == 0) ? false : config.showDateRangeLimiter;

			// Add the metadata display field from the configuration, then add the results list to the view data
			Metadata.addResultMetadataDisplays(response.results);
			data.results = response.results;
			//data.results = Helper.sortSearchResults(response.results, sortBy.split(","));

			// Create paginator data object, add it to the view data
			let path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);
			data.pagination = Paginator.create(data.results, data.page, pageSize, response.count, path);

			// If facets have been used in the search query, convert the facet fields into a normalized data object for the breadcrumb display
			if(facets) {
				facets = Facets.getSearchFacetObject(facets);
			}

			// Get a normalized list of the facet data returned from the search.  
			let facetList = Facets.getFacetList(response.facets, showAll);
			Format.formatFacetDisplay(facetList, function(error, facetList) {
				Format.formatFacetBreadcrumbs(facets, function(error, facets) {

					// Add facets returned from the search to the view data
					data.facets = Facets.create(facetList, config.rootUrl, showAll, expandFacets);
					data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets, daterange, config.rootUrl); 
											
					return res.render('results', data);
				});
			});
		}
	});
}

exports.advancedSearch = function(req, res) {
	var data = {
		error: null,
		root_url: config.rootUrl,
		searchFields: config.advancedSearchFields,
		typeFields: config.searchTypes,
		boolFields: config.booleanSearchFields
	};
	return res.render('advanced-search', data);
}