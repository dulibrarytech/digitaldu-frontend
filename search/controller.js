  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

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
 * @param {String} req.query.from - Daterange 'search from' date. (YYYY || MM-YYYY || MM-DD-YYYY).  Invalid or incorrect date values will be ignored.  Default value is "0"
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
		page = Math.abs(parseInt(req.query.page)) || 1,
		pageSize = Math.abs(parseInt(req.query.resultsPerPage)) || parseInt(config.maxResultsPerPage),
		sort = req.query.sort || null,
		collection = req.query.collection || null,
		showAll = req.query.showAll || [],
		expandFacets = req.query.expand || [],
		advancedSearch = req.query.advancedSearch && req.query.advancedSearch == "true" ? true : false,
		daterange = (req.query.from || req.query.to) && (parseInt(req.query.from) < parseInt(req.query.to)) ? {
			from: req.query.from || config.defaultDaterangeFromDate,
			to: req.query.to || new Date().getFullYear()
		} : null;
			
	var data = {
		error: null,
		facets: {},
		facet_breadcrumb_trail: null,
		results: [],
		fromDate: config.defaultDaterangeFromDate,
		toDate: new Date().getFullYear(),
		pageData: null,
		page: page,
		root_url: config.rootUrl,
		query: Helper.getResultsLabel(query, facets, bool, field),
		view: req.query.view || config.defaultSearchResultsView || "list",
		sortType: req.query.sort || config.defaultSearchSortField || "relevance",
		isAdvancedSearch: advancedSearch,
		pagination: null,
		options: {}
	};

	let maxPages = config.maxElasticSearchResultCount / pageSize;
	if(page > maxPages) {
		let msg = "Search results are limited to " + config.maxElasticSearchResultCount + ". Please select a page from 1 to " + maxPages;
		data.error = msg;
		return res.render('results', data);
	}
	
	let sortBy = Helper.getSortDataArray(sort);
	let queryData = Helper.getSearchQueryDataObject(query, field, type, bool, true);
	Service.searchIndex(queryData, facets, collection, page, pageSize, daterange, sortBy, advancedSearch, function(error, response) {
		if(error) {
			console.error(error);
			data.error = "Error: There was a problem performing your search";
			data["logMsg"] = error;
			return res.render('error', data);
		}
		else {
			data.options["expandFacets"] = expandFacets;
			data.options["perPageCountOptions"] = config.resultCountOptions || [];
			data.options["resultsViewOptions"] = config.resultsViewOptions || [];
			data.options["sortByOptions"] = config.sortByOptions || {};
			data.options["pageSize"] = pageSize;
			data.options["showDateRange"] = config.showSearchResultsDateRangeLimiter || false;
			data.results = response.results;

			// Create paginator data object, add it to the view data
			let path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);
			data.pagination = Paginator.create(data.results, page, pageSize, response.count, path);
			if(facets) {
				facets = Facets.getSearchFacetObject(facets);
			}

			if(daterange) {
				data.fromDate = daterange.from ? daterange.from : response.minDate;
				data.toDate = daterange.to;
			}
			else if(response.minDate) {
				data.fromDate = response.minDate;
			}

			// Get a normalized list of the facet data returned from the search.  
			let facetList = Facets.getFacetList(response.facets, showAll);
			Format.formatFacetDisplay(facetList, function(error, facetList) {
				Format.formatFacetBreadcrumbs(facets, function(error, facets) {
					data.facets = Facets.create(facetList, config.rootUrl, showAll, expandFacets);
					data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets, daterange, config.rootUrl);
					return res.render('results', data);
				});
			});
		}
	});
} 