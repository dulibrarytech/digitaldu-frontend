'use strict';

var async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets');

exports.getFacets = function(req, res) {

    Service.getFacets(function (facets) {
        if(typeof facets == 'string') {
        	console.log("Error");
        }
        res.send(facets);
    });
}

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

// 2.0 ok
exports.renderRootCollection = function(req, res) {
	var data = {
		collections: [],
		searchFields: [],
		facets: {},
		typeCount: {},
		error: null,
		base_url: config.baseUrl
	},
	page = req.query.page || 1;

	// Get all root collections
	Service.getTopLevelCollections(page, function(response) {

		Service.getFacets(function(facets) {

			if(response.status) {
				data.collections = response.data;
				data.searchFields = config.searchFields;
				data.facets = Facets.create(facets);
				data.typeCount = Helper.getTypeFacetTotalsObject(facets);
			}
			else {
				data.error = "Error: could not retrieve collections.";
			}
			return res.render('collections', data);
		});
	});
}

// 2.0 ok
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
		page = req.query.page || 1;

	// Get all collections in this community
	Service.getObjectsInCollection(pid, page, function(response) {
		if(response.status) {
			data.collections = response.data.list;
			data.current_collection = pid;
			data.current_collection_title = response.data.title || "Untitled";
			//data['facet_breadcrumb_trail'] = ;

			if(page) {
				data.pagination = Helper.getViewPaginatorDataObject(response.data, page);
			}
			//data.pagination = Helper.getViewPaginatorDataObject(response.data, page);

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

exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.query.q;
	var facets = req.query.f || null;
	var typeVal = req.query.type, type;
	var page = req.query.page || 1;
	var collection = req.query.coll || null;

	// "Search field selection": If "search all", build array of types from config settings.  If type search, 'type'is passed into search function as a string.
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
	Service.searchIndex(query, type, facets, collection, page, function(response) {
		var data = {
			facets: null,
			facet_breadcrumb_trail: null,
			results: null,
			pageData: null
		};

		data['base_url'] = config.baseUrl;
		if(response.status) {

			// Get data for the view
			var pagination = Helper.paginateResults(response.data.results, page);
			data['facets'] = Facets.create(response.data.facets);	// PROD
			//data['facets'] = Facets.create(dummyFacets);			// DEV

			data['facet_breadcrumb_trail'] = Facets.getFacetBreadcrumbObject(facets);  // Param: the facets from the search request params
			//data['collection_scope'] = pop collection stack

			data['results'] = pagination.results;
			data['pageData'] = pagination.data;
			// console.error("Test error!");  createBreadcrumbTrail
		}
		else {
			console.error("Search Error: ", response.message);
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