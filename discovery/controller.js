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
    Metadata = require('../libs/metadata'),
    Search = require('../search/service');

exports.getFacets = function(req, res) {
    Service.getFacets(function(error, facets) {
    	let response = {};
        if(error) {
        	console.log("Error");
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
			data['error'] = "Error: could not retrieve communities.";
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
		Service.getFacets(function(error, facets) {
			if(error) {
				console.log(error);
			}
			else {
				data.facets = Facets.create(facets, config.rootUrl);
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
			root_url: config.rootUrl
		};
			
		var	pid = req.params.pid || "",
			page = req.query.page || 1,
			path = config.baseUrl + req._parsedOriginalUrl.path,
			reqFacets = req.query.f || null;

		// Get all collections in this community
		Service.getObjectsInCollection(pid, page, reqFacets, function(error, response) {
			if(error) {
				console.log(error);
				data.error = "Could not open collection.";
				data.current_collection_title = "Error";
			}
			else {
				// Add collections and collection data	
				data.collections = response.list;
				data.current_collection = pid;
				data.current_collection_title = response.title || "Untitled";

				// Add view data
				data.pagination = Paginator.create(response.list, page, config.maxCollectionsPerPage, response.count, path);
				data.facets = Facets.create(response.facets, config.rootUrl);
				data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets);
				data.collection_breadcrumb_trail = Helper.getCollectionBreadcrumbObject(parentCollections);
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
		mods: {},
		error: null,
		root_url: config.rootUrl
	};

	// let regex = /[a-zA-Z]*[:_][0-9]*/;
	// if(!req.params.pid || /[a-zA-Z]*[:_][0-9]*/.test(req.params.pid) === false) {
	// 	return res.sendStatus(400);
	// }

	const renderView = function(data) {
		return res.render('object', data);
	};

	Service.fetchObjectByPid(req.params.pid, function(error, response) {
		if(error) {
			data.error = error;
			renderView(data);
		}
		else {
			var object = response,
				index = req.params.index && isNaN(parseInt(req.params.index)) === false ? req.params.index : 0;

			// Render a parent object with child objects
			if(Helper.isParentObject(object)) {
				switch(object.object_type) {
					case "compound":
						data.viewer = Viewer.getCompoundObjectViewer(object, index);
						break;
					case "book":
						//data.viewer = CompoundViewer.getBookViewer(...);
						break;	
					default:
						data.error = "Object not found";
						break;
				}

				data.summary = Metadata.createSummaryDisplayObject(object);
				data.mods = Metadata.createMetadataDisplayObject(object);
				renderView(data);
			}

			// Render singular object
			else {
				// Can't lookup index of a non-parent object
				if(index > 0) {
					data.error = "Object not found";
					renderView(data);
				}
				else {
					let object = response;
					data.object = object;

					// Get viewer
					data.viewer = Viewer.getObjectViewer(object);
					if(data.viewer == "") {
						data.error = "Viewer is unavailable for this object.";
					}

					// Get titles of any collection parents
					Service.getTitleString(object.is_member_of_collection, [], function(error, titleData) {
						if(error) {
							console.log(error);
						}
						// Add the titles of the parent collections to the mods display, if any
						let titles = [];
						for(var title of titleData) {
							titles.push('<a href="' + config.rootUrl + '/collection/' + title.pid + '">' + title.name + '</a>');
						}
						if(titles.length > 0) {
							data.mods = {
								'In Collections': titles
							}
						}

						// Add summary data and object metadata to the mods display
						data.summary = Metadata.createSummaryDisplayObject(object);
						data.mods = Object.assign(data.mods, Metadata.createMetadataDisplayObject(object));
						renderView(data);
					});
				}
			}
		}
	});
};

exports.getDatastream = function(req, res) {
	var ds = req.params.datastream || "",
		pid = req.params.pid || "";

	Service.getDatastream(pid, ds, function(error, stream) {
		if(error) {
			console.log(error);
			if(ds.toLowerCase() == "tn") {
				Service.getThumbnailPlaceholderStream(function(error, stream) {
					if(error) {
						console.log(error);
						res.sendStatus(500);
					}
					else {
						stream.pipe(res);
					}
				});
			}
			else {
				stream.pipe(res);
			}
		}
		else {
			if(stream.headers['content-type'] == "text/plain" && ds.toLowerCase() == "tn") {
				Service.getThumbnailPlaceholderStream(function(error, stream) {
					if(error) {
						console.log(error);
						res.sendStatus(500);
					}
					else {
						stream.pipe(res);
					}
				});
			}
			else {
				stream.pipe(res);
			}
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