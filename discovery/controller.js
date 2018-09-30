 /**
 * @file 
 *
 * Discovery view controller functions
 *
 */

'use strict'

const async = require('async'),
    config = require('../config/config'),
    Helper = require('./helper.js'),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Search = require('../search/service');

exports.getFacets = function(req, res) {
    Service.getFacets(function (facets) {
        if(typeof facets == 'string') {
        	console.log("Error");
        }
        res.send(facets);
    });
}

exports.renderCommunitiesView = function(req, res) {
	var data = {
		base_url: config.baseUrl
	};

	Service.getTopLevelCollections(function(response) {
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
	var data = {
		base_url: config.baseUrl
	},
	id = req.params.id;

	Service.getCollectionsInCommunity(id, function(response) {
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

exports.renderRootCollection = function(req, res) {
	var data = {
		collections: [],
		searchFields: [],
		facets: {},
		paginator: {},
		typeCount: {},
		error: null,
		base_url: config.baseUrl,
		root_url: config.rootUrl
	},
	page = req.query.page || 0;	// Render all collecions, do not paginate

	// Get all root collections
	Service.getTopLevelCollections(page, function(response) {

		// Get the view data
		if(response.status) {
			data.collections = response.data.list;
			data.searchFields = config.searchFields;
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

exports.renderCollection = function(req, res) {

	Service.getCollectionHeirarchy(req.params.pid, function(parentCollections) {
		var data = {
			facet_breadcrumb_trail: null,
			collection_breadcrumb_trail: null,
			current_collection_title: "",
			current_collection: "",
			facets: {},
			error: null,
			pagination: {},
			base_url: config.baseUrl,
			root_url: config.rootUrl
		};
			
		var	pid = req.params.pid || "",
			page = req.query.page || 1,
			path = config.baseUrl + req._parsedOriginalUrl.path,
			reqFacets = req.query.f || null;

		// Get all collections in this community
		Service.getObjectsInCollection(pid, page, reqFacets, function(response) {
			if(response.status) {

				// Add collections and collection data	
				data.collections = response.data.list;
				data.current_collection = pid;
				data.current_collection_title = response.data.title || "Untitled";

				// Add view data
				data.pagination = Paginator.create(response.data.list, page, config.maxCollectionsPerPage, response.data.count, path);
				data.facets = Facets.create(response.data.facets, config.rootUrl);
				data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets);
				data.collection_breadcrumb_trail = Helper.getCollectionBreadcrumbObject(parentCollections);
			}
			else {
				console.log(response.message);
				data.error = "Could not retrieve collections.";
				data.current_collection_title = "Error";
			}
			return res.render('collection', data);
		});
	});
}

exports.renderObjectView = function(req, res) {
	var data = {
		viewer: null,
		object: null,
		summary: null,
		mods: null,
		error: null,
		base_url: config.baseUrl,
		root_url: config.rootUrl
	};

	// Get the object data
	Service.fetchObjectByPid(req.params.pid, function(response) {
		if(response.status) {
			var object;
			if(response.data.pid) {
				object = response.data;
				data.object = object;

				// Get viewer
				data.viewer = Viewer.getObjectViewer(object);
				if(data.viewer == "") {
					data.viewer = "Viewer is unavailable for this object."
				}

				// Get titles of any collection parents
				Service.getTitleString(object.is_member_of_collection, [], function(titleData) {
					var titles = [];
					for(var title of titleData) {
						titles.push('<a href="' + config.rootUrl + '/collection/' + title.pid + '">' + title.name + '</a>');
					}
					data.mods = {
						'In Collections': titles
					}

					// Get metadata
					data.summary = Helper.createSummaryDisplayObject(object);
					data.mods = Object.assign(data.mods, Helper.createMetadataDisplayObject(object));
					return res.render('object', data);
				});
			}	
			else {
				console.error("Index error: ", response.message);
				data.error = "Sorry, this item can not be displayed";
				return res.render('object', data);
			}
		}
		else {
			console.error("Index error: ", response.message);
			data.error = "Sorry, this item can not be displayed";
			return res.render('object', data);
		}
	});
};

exports.getDatastream = function(req, res) {
	var ds = req.params.datastream || "",
		pid = req.params.pid || "";

	Service.getDatastream(pid, ds, function(stream, error) {
		if(error) {
			console.log(error);

			if(ds.toLowerCase() == "tn") {
				Service.getThumbnailPlaceholderStream(function(stream, error) {
					stream.pipe(res);
				});
			}
			else {
				stream.pipe(res);
			}
		}
		else {
			if(stream.headers['content-type'] == "text/plain" && ds.toLowerCase() == "tn") {
				Service.getThumbnailPlaceholderStream(function(stream, error) {
					stream.pipe(res);
				});
			}
			else {
				stream.pipe(res);
			}
		}
	});
}