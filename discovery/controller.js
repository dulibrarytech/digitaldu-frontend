 /**
 * @file 
 *
 * Discovery view controller functions
 *
 */

'use strict'

const async = require('async'),
    config = require('../config/' + process.env.CONFIGURATION_FILE),
    Helper = require('./helper.js'),
    AppHelper = require("../libs/helper"),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Metadata = require('../libs/metadata'),
    Search = require('../search/service'),
    Format = require("../libs/format");

exports.getFacets = function(req, res) {
    Service.getFacets(null, function(error, facets) {
    	let response = {};
        if(error) {
        	console.log(error);
        }
        else {
        	response = facets;
        }
        res.send(response);
    });
}

exports.renderCommunitiesView = function(req, res) {
	var data = {
		root_url: config.rootUrl
	};

	Service.getTopLevelCollections(function(error, response) {
		if(error) {
			console.log(error);
			data['collections'] = [];
			data['error'] = "Error: could not retrieve communities. " + error;
		}
		else {
			data['collections'] = response;
		}
		return res.render('collections', data);
	});
}

exports.renderCommunity = function(req, res) {
	var data = {
		root_url: config.rootUrl
	},
	id = req.params.id;

	Service.getCollectionsInCommunity(id, function(error, response) {
		if(error) {
			data['collections'] = [];
			data['error'] = "Error: could not retrieve communities.";
		}
		else {
			data['collections'] = response;
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
		root_url: config.rootUrl
	},
	page = req.query.page || 0;	// Render all collecions, do not paginate

	// Get all root collections
	Service.getTopLevelCollections(page, function(error, response) {

		// Get the view data
		if(error) {
			console.log(error);
			data.error = "Error: could not retrieve collections.";
		}
		else {
			data.collections = response.list;
			data.searchFields = config.searchFields;
		}

		// Get facets for all data
		Service.getFacets(null, function(error, facets) {
			if(error) {
				console.log(error);
			}
			else {
				var facetList = Facets.getFacetList(facets, []);

				// Only show the specified front page display facets, remove others here
				for(var key in facetList) {
					if(config.frontPageFacets.includes(key) === false) {
						delete facetList[key];
					}
				}

				data.facets = Facets.create(facetList, config.rootUrl);
				data.typeCount = Helper.getTypeFacetTotalsObject(facets);
				data.facetThumbnails = config.facetThumbnails;
			}
			
			return res.render('collections', data);
		});
	});
}

exports.renderCollection = function(req, res) {
	
	Service.getCollectionHeirarchy(req.params.pid, function(parentCollections) {
		var data = {
			error: null,
			facets: {},
			facet_breadcrumb_trail: null,
			collection_breadcrumb_trail: null,
			current_collection_title: "",
			current_collection: "",
			pagination: {},
			root_url: config.rootUrl,
			searchFields: config.searchFields,
			options: {}
		};
			
		var	pid = req.params.pid || "",
			page = req.query.page || 1,
			path = config.baseUrl + req._parsedOriginalUrl.path,
			reqFacets = req.query.f || null,
			showAll = req.query.showAll || [];

		data.collectionID = pid;
		data.options["expandFacets"] = [];
		data.options["perPageCountOptions"] = config.resultCountOptions;

		// Get all collections in this community
		Service.getObjectsInCollection(pid, page, reqFacets, function(error, response) {
			if(error) {
				console.log(error);
				data.error = "Could not open collection.";
				data.current_collection_title = "Error";
				return res.render('collection', data);
			}
			else {
				data.collections = response.list;
				data.current_collection = pid;
				data.current_collection_title = response.title || "Untitled";

				// Get the list of facets for this collection, remove the 'Collections' facets (Can re-add this field, if we ever show facets for nested collections: 
				// ie there will be multiple collections facets present when one collection is open)
				var facetList = Facets.getFacetList(response.facets, showAll);
				delete facetList.Collections;

				// This variable should always be null here, as rendering the collection view is separate from a keyword search and no request facets should be present here.  
				// The below code is to prevent a potential crash of the appication, just in case
				if(reqFacets) {
					reqFacets = Facets.getSearchFacetObject(reqFacets);
				}

				Format.formatFacetDisplay(facetList, function(error, facetList) {
					// Add collections and collection data	
					data.pagination = Paginator.create(response.list, page, config.maxCollectionsPerPage, response.count, path);
					data.facets = Facets.create(facetList, config.rootUrl);
					data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets, null, config.rootUrl);
					data.collection_breadcrumb_trail = Helper.getCollectionBreadcrumbObject(parentCollections);

					// If there are no facets to display, set to null so the view does not show the facets section
					if(AppHelper.isObjectEmpty(data.facets)) {
						data.facets = null;
					}

					return res.render('collection', data);
				});
			}
		});
	});
}

exports.renderObjectView = function(req, res) {

	var data = {
		viewer: null,
		object: null,
		summary: null,
		mods: {},
		error: null,
		root_url: config.rootUrl
	};

	// if(!req.params.pid || /[a-zA-Z]*[:_][0-9]*/.test(req.params.pid) === false) {
	// 	return res.sendStatus(400);
	// }

	Service.fetchObjectByPid(config.elasticsearchPublicIndex, req.params.pid, function(error, response) {
		if(error) {
			data.error = error;
			res.render('object', data);
		}
		else if(response == null) {
			data.error = "Object not found: " + req.params.pid;
			res.render('object', data);
		}
		else {
			var object = response,
				part = req.params.index && isNaN(parseInt(req.params.index)) === false ? req.params.index : 0;

			// Render a parent object with child objects
			if(AppHelper.isParentObject(object)) {
				data.viewer = Viewer.getCompoundObjectViewer(object, part);
			}

			// Render singular object
			else {
				// Can't lookup part of a non-parent object
				if(part > 0) {
					data.error = "Object not found";
					res.render('object', data);
				}
				else {
	
					// Get viewer
					data.viewer = Viewer.getObjectViewer(object);
					if(data.viewer == "") {
						data.error = "Viewer is unavailable for this object.";
					}
				}
			}

			// Get array of parent collections for the parent collection breadcrumb list
			Service.getCollectionHeirarchy(object.is_member_of_collection, function(collectionTitles) {

				// Get metadata displays and render the view
				data.summary = Metadata.createSummaryDisplayObject(object);
				data.mods = Object.assign(data.mods, Metadata.createMetadataDisplayObject(object, collectionTitles));
				res.render('object', data);
			});
		}
	});
};

exports.getDatastream = function(req, res) {
	var ds = req.params.datastream.toLowerCase() || "",
		pid = req.params.pid || "",
		part = req.params.part || null,
		index = config.elasticsearchPublicIndex;

	// Detect part index appended to a compound object pid.  This is to allow IIIF url resolver to convey part index data by modifying the pid value
	if(part == null && pid.indexOf("-") > 0) {
		part = pid.substring(pid.indexOf("-")+1, pid.length);	
		pid.split("-",1)[0];
	}

	// If a valid api key is passed in with the request, get data from the the private index
	if(req.headers["x-api-key"] && req.headers["x-api-key"] == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
	}

	//Datastreams.getDatastream(pid, ds, part, function(error, stream) {
	Service.getDatastream(index, pid, ds, part, function(error, stream) {
		if(error) {
			console.log(error);
			res.sendStatus(404);
		}
		else {
			res.set('Accept-Ranges', 'bytes');
			stream.pipe(res);
		}
	});
}

exports.getIIIFManifest = function(req, res) {
	let pid = req.params.pid || "";
	Service.getManifestObject(pid, function(error, manifest) {
		if(error) {
			console.log(error);
			res.sendStatus(500);
		}
		else if(manifest){
			res.setHeader('Content-Type', 'application/json');
			res.setHeader('Access-Control-Allow-Origin', '*');
			res.send(JSON.stringify(manifest));
		}
		else {
			res.send("Item not found");
		}
	});
}

exports.getKalturaViewer = function(req, res) {
	let pid = req.params.pid || "",
		part = req.params.part || "1",
		entryID = "";

	Service.fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, object) {
		if(error) {
			console.log(error, pid);
			res.send("<h4>Error loading viewer");
		}
		else if(object == null) {
			console.log("Object not found", pid);
			res.send("<h4>Error loading viewer, object not found");
		}
		else {

			if(AppHelper.isParentObject(object)) {
				object = object.display_record.parts[part-1]
			}

			res.send(Viewer.getKalturaViewer(object));
		}
	});
}