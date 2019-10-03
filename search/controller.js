 /**
 * @file 
 *
 * Discovery View Controller Functions
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

/**
 * Renders the search results view
 * Performs search with request parameters and application settings
 * Formats search result data for the search results view
 * 
 * @param {Object} req - Express.js request object
 * @param {Array.<String>} req.query.q - Query keyword strings, one for each search query
 * @param {Array.<String>} req.query.field - Search fields (defined in the configuration), one for each search query
 * @param {Array.<String>} req.query.type - Search types (defined in the configuration), one for each search query
 * @param {Array.<String>} req.query.bool - Bool to use to combine current query with previous query.  In a single query search, this value has no effect
 * @param {Object} req.query.f - DDU Facet object (ex {"{facet name or ID}": ["{facet value}", "{facet value}", ...]}) Currently selected facets
 * @param {String} req.query.page - Page number of results to return.  Will use this page number in the Elastic search  Must be numeric
 * @param {String} resultsPerPage - Specify number of results per page directly with this value.  Must be numeric
 * @param {String} req.query.sort - (ex "sort field,asc|desc")
 * @param {String} req.query.collection - Collection PID to scope search resuts to.  No longer in use, use collection facet
 * @param {Array.<String>} req.query.showAll - If a list limit has been specified in the configuration for a given facet, adding its name to this array will cancel the limit.  Search will return full facet list
 * @param {Array.<String>} req.query.expand - Include a facet name in this array to force expand the collapsible facet panel in the view.  this keeps the expanded state consistent after view reloads
 * @param {String} req.query.from - Daterange 'search from' date.  Year only (ex YYYY).  Invalid or incorrect date values will be ignored.  Default value is "0"
 * @param {String} req.query.to - Daterange 'search to' date.  Year only (ex YYYY).  Invalid or incorrect date values will be ignored.  Default value is the current year
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.search = function(req, res) {
	var query = req.query.q || [""],
		field = req.query.field || ["all"], 
		type = req.query.type || ["contains"],
		bool = req.query.bool || ["or"],
		facets = req.query.f || null,
		page = req.query.page || 1,
		pageSize = req.query.resultsPerPage || config.maxResultsPerPage,
		sort = req.query.sort || null,
		collection = req.query.collection || null,
		showAll = req.query.showAll || [],
		expandFacets = req.query.expand || [],
		advancedSearch = req.query.advancedSearch && req.query.advancedSearch == "true" ? true : false,
		daterange = (req.query.from || req.query.to) && (parseInt(req.query.from) < parseInt(req.query.to)) ? {
			from: req.query.from || 0,
			to: req.query.to || new Date().getFullYear()
		} : null;

	let sortBy = Helper.getSortDataArray(sort);
	let queryData = Helper.getSearchQueryDataObject(query, field, type, bool);
	Service.searchIndex(queryData, facets, collection, page, pageSize, daterange, sortBy, advancedSearch, function(error, response) {

		// Assign view data
		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			results: [],
			pageData: null,
			page: req.query.page || 1,
			root_url: config.rootUrl,
			query: Helper.getResultsLabel(query, facets, bool),
			view: req.query.view || config.defaultSearchResultsView || "list",
			sortType: req.query.sort || "relevance",
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
			data.options["sortByOptions"] = config.sortByOptions;
			data.options["pageSize"] = pageSize;

			// Don't show the daterange limit option if there is a daterange parameter preent, or if there are no search results
			data.options["showDateRange"] = (daterange || response.count == 0) ? false : config.showDateRangeLimiter;

			// Add the metadata display field from the configuration, then add the results list to the view data
			Metadata.addResultMetadataDisplays(response.results);
			data.results = response.results;

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