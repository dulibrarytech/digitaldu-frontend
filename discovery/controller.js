'use strict';

const async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),

    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Media = require('../libs/media');

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
		base_url: config.baseUrl,
		rootUrl: config.rootUrl
	},
	page = req.query.page || 1;

	// Get all root collections
	Service.getTopLevelCollections(page, function(response) {

		// Get the view data
		if(response.status) {
			data.collections = response.data.list;
			data.searchFields = config.searchFields;
			//data.pagination = Paginator.create(response.data.list, page, config.maxCollectionsPerPage, response.data.count, config.rootUrl);
		}
		else {
			console.log("Error:", response.message);
			data.error = "Error: could not retrieve collections.";
		}

		// Get facets for all data
		Service.getFacets(function(facets) {
			if(typeof facets == "string") {
				console.log("Error retrieving facet data:", facets);
			}
			else {
				data.facets = Facets.create(facets, config.rootUrl);
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
			base_url: config.baseUrl,
			rootUrl: config.rootUrl
		},
		pid = req.params.pid || "",
		page = req.query.page || 1,
		// path = config.rootUrl + "/collection/" + pid,
		path = config.baseUrl + req._parsedOriginalUrl.path,
		reqFacets = req.query.f || null;

	// Get all collections in this community
	Service.getObjectsInCollection(pid, page, reqFacets, function(response) {
		if(response.status) {
				
			data.collections = response.data.list;
			data.current_collection = pid;
			data.current_collection_title = response.data.title || "Untitled";
			//data.facet_breadcrumb_trail = ;

			data.pagination = Paginator.create(response.data.list, page, config.maxCollectionsPerPage, response.data.count, path);
			data.facets = Facets.create(response.data.facets, config.rootUrl);
			data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets);
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
		summary: null,
		mods: null,
		error: null,
		base_url: config.baseUrl,
		rootUrl: config.rootUrl
	};

	// Get the object data
	Service.fetchObjectByPid(req.params.pid, function(response) {

		if(response.status) {
				//console.log("TEST renderObjectView: fetchObject response", response.data);
			var object;
			if(response.data.pid) {
				object = response.data;
				data.object = object;

				// Get viewer
				data.viewer = Viewer.getObjectViewer(object);
				data.summary = Helper.createSummaryDisplayObject(object);
				data.mods = Helper.createMetadataDisplayObject(object);

				if(data.viewer == "") {
					data.viewer = "Viewer is unavailable for this object."
				}
			}	
			else {
				console.error("Index error: ", response.message);
				data.error = response.message;
			}
		}
		else {
			console.error("Index error: ", response.message);
			data.error = response.message;
		}
	
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
			rootUrl: config.rootUrl,
			collection_scope: "",
			query: query
		},
		page = req.query.page || 1,
		path = config.rootUrl + req.url.substring(req.url.indexOf('search')-1);

		if(response.status) {

			// Get data for the view
			data.results = response.data.results;
			data.facets = Facets.create(response.data.facets, config.rootUrl);	// PROD
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

/*
 * Test media stream
 */
exports.getMediaStream = function(req, res) {

	//var path = req.query.path || "testpath";
	var path = req.params.path || "testpath";

	var stream = Media.getFileStream(path, function(stream) {
		if(stream) {
			console.log("Sending stream ajax");
			res.send(stream);
		}
		else {
			res.sendStatus(404);
		}
	});
	console.log("Sending stream");
	//console.log("Stream:", stream);
	res.send(stream);
}