'use strict';

var async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator');

/*
 * Get facets for all data (public route)
 */
exports.getFacets = function(req, res) {

    Service.getFacets(function (facets) {
        if(typeof facets == 'string') {
        	console.log("Error");
        }
        res.send(facets);
    });
}

/*
 * Not in use
 */
exports.renderCommunitiesView = function(req, res) {
	var data = {};

	// Get all communities
	Service.getTopLevelCollections(function(response) {
			
		data['base_url'] = config.baseUrl;
		data['error'] = null;

		if(response.status) {
			data['collections'] = response.data;
		}
		else {
			data['collections'] = [];
			data['error'] = "Error: could not retrieve communities.";
		}
		return res.render('collections', data);
	});
}

/*
 * Not in use
 */
exports.renderCommunity = function(req, res) {
	var data = {},
		id = req.params.id;

	// Get all collections in this community
	Service.getCollectionsInCommunity(id, function(response) {
		data['base_url'] = config.baseUrl;
		data['error'] = null;

		if(response.status) {
			data['collections'] = response.data;
		}
		else {
			data['collections'] = [];
			data['error'] = "Error: could not retrieve communities.";
		}
		return res.render('collections', data);
	});
}

/*
 * Get the root level collections, get facet data for all items
 * Render landing page view
 */
exports.renderRootCollection = function(req, res) {
	var data = {
		collections: [],
		searchFields: [],
		facets: {},
		paginator: {},
		typeCount: {},
		error: null,
		base_url: config.baseUrl
	},
	page = req.query.page || 1;

	// Get all root collections
	Service.getTopLevelCollections(page, function(response) {
			console.log("TEST gtlcoll resp", response.data);
		// Get the view data
		if(response.status) {
			data.collections = response.data.list;
			data.searchFields = config.searchFields;
			data.pagination = Paginator.create(response.data.list, page, config.maxCollectionsPerPage, response.data.count, config.rootUrl);
		}
		else {
			data.error = "Error: could not retrieve collections.";
		}

		// Get facets for all data
		Service.getFacets(function(facets) {
			if(typeof facets == "string") {
				console.log("Error retrieving facet data:", facets);
			}
			else {
				data.facets = Facets.create(facets);

				// Totals for the static type facets on the front page
				data.typeCount = Helper.getTypeFacetTotalsObject(facets);
			}
			
			return res.render('collections', data);
		});
	});
}

/*
 * Render the collections page, displaying items in collection
 */
exports.renderCollection = function(req, res) {
	var data = {
			facet_breadcrumb_trail: null,
			current_collection_title: "",
			current_collection: "",
			collections: [],
			facets: {},
			error: null,
			pagination: {},
			base_url: config.baseUrl
		},
		pid = req.params.pid || "",
		page = req.query.page || 1,
		path = config.rootUrl + "/collection/" + pid;

	// Get all collections in this community
	Service.getObjectsInCollection(pid, page, function(response) {
		if(response.status) {
			data.collections = response.data.list;
			data.current_collection = pid;
			data.current_collection_title = response.data.title || "Untitled";
			//data.facet_breadcrumb_trail = ;

			data.pagination = Paginator.create(response.data.list, page, config.maxCollectionsPerPage, response.data.count, path);
			data.facets = Facets.create(response.data.facets);
		}
		else {
			console.log(response.message);
			data.error = "Could not retrieve collections.";
			data.current_collection_title = "Error";
		}

		return res.render('collection', data);
	});
}

/*
 * Render the object view page
 */
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

/*
 * Search the index, render the results view
 */
exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.query.q;
	var facets = req.query.f || null;
	var typeVal = req.query.type || "all", type;
	var page = req.query.page || 1;
	var collection = req.query.coll || null;

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

	// TODO: Get page value from search query
	// Update with ES pagination 
	Service.searchIndex(query, type, facets, collection, page, function(response) {

		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			results: [],
			pageData: null,
			base_url: config.baseUrl,
			root_url: config.rootUrl,
			collection_scope: ""
		},
		page = req.query.page || 1,
		path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);

		if(response.status) {

			// Get data for the view
			data.results = response.data.results;
			data.facets = Facets.create(response.data.facets);	// PROD
			data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params
			data.pagination = Paginator.create(response.data.results, page, config.maxResultsPerPage, response.data.count, path);
		}
		else {
			console.error("Search Error: ", response.message);
			data.results = null;
			data.error = response.message;
		}

		return res.render('results', data);
	});
};