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
'use strict'

const async = require('async'),
    config = require('../config/' + process.env.CONFIGURATION_FILE),
    Helper = require('./helper.js'),
    AppHelper = require("../libs/helper"),
    Service = require('./service.js'),
    Viewer = require('../libs/viewer'),
    CompoundViewer = require('../libs/compound-viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Metadata = require('../libs/metadata'),
    Search = require('../search/service'),
    Format = require("../libs/format");

/**
 * Renders the front page
 * Retrieves all objects in the root collection
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.query.page - Returns this page of results if pagination is in use
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
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
	page = req.query.page || 1,
	path = config.rootUrl + req._parsedOriginalUrl.path;

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
				data.pagination = Paginator.create(response.list, page, config.maxCollectionsPerPage, response.count, path);
				data.pagination["anchor"] = "#collections";
			}
			
			res.render('collections', data);
		});
	});
}

/**
 * Renders the collection view
 * Retrieves all objects in the requested collection
 * 
 * @param {Object} req - Express.js request object
 * @param {Object} req.query.f - DDU Facet object (ex {"{facet name or ID}": ["{facet value}", "{facet value}", ...]}) Currently selected facets
 * @param {String} req.query.page - If object results for requested collection exceed page limit, show this page of object results
 * @param {Array} req.query.showAll - Array of facet names: If a name is listed, the entire list of facets will be shown in the facet panel. For use if list has been limited
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
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
			path = config.rootUrl + req._parsedOriginalUrl.path,
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

				/* Get the list of facets for this collection, remove the 'Collections' facets (Can re-add this field, if we ever show facets for nested collections: 
				 * ie there will be multiple collections facets present when one collection is open) */
				var facetList = Facets.getFacetList(response.facets, showAll);
				delete facetList.Collections;

				/* This variable should always be null here, as rendering the collection view is separate from a keyword search and no request facets should be present here.  
				 * The below code is to prevent a potential crash of the appication, just in case */
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

/**
 * Gets an array of all collection names
 *
 * @return {undefined}
 */
exports.getCollectionList = function(req, res) {
	Service.getAutocompleteData(function(error, list) {
		if(error) {
			console.log(error);
			res.send([]);
		}
		else {
			res.send(list);
		}
	});
}

/**
 * Renders the object view
 * Retrieves object data for requested object
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.params.pid - PID of the object to be rendered
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.renderObjectView = function(req, res) {
	var data = {
		viewer: null,
		object: null,
		summary: null,
		metadata: {},
		error: null,
		devError: null,
		transcript: null,
		downloadLinks: [],
		root_url: config.rootUrl
	},
	pid = req.params.pid || "";

	Service.fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, response) {
		if(error) {
			data.error = config.viewerErrorMessage;
			data.devError = error;
			console.error(error);
			res.render('object', data);
		}
		else if(response == null) {
			let msg = "Object not found ";
			data.error = msg;
			data.devError = msg + pid;
			console.log(msg + pid);
			res.render('object', data);
		}
		else {
			var object = response,
				part = req.params.index && isNaN(parseInt(req.params.index)) === false ? req.params.index : 0;

			if(object.transcript && object.transcript.length > 0) {
				data.transcript = object.transcript;
			}

			// Render a parent object with child objects
			if(AppHelper.isParentObject(object)) {
				data.viewer = CompoundViewer.getCompoundObjectViewer(object, part);
				if(data.viewer.length <= 0) {
					data.error = config.viewerErrorMessage;
					data.devError = "Compound object viewer error";
				}
			}

			// Render single object
			else {
				if(part > 0) {
					let msg = "Object not found: " + pid;
					data.error = msg;
					console.log(msg)
				}
				else {
	
					// Get viewer
					data.viewer = Viewer.getObjectViewer(object);
					if(data.viewer == "") {
						data.error = config.viewerErrorMessage;
						data.devError = "Object viewer error";
					}
				}
			}

			// Get array of parent collections for the parent collection breadcrumb list
			Service.getCollectionHeirarchy(object.is_member_of_collection, function(collectionTitles) {
				// Define view data and render the view
				data.summary = Metadata.createSummaryDisplayObject(object);
				object.type = Helper.normalizeLabel("Type", object.type || "")
				data.metadata = Object.assign(data.metadata, Metadata.createMetadataDisplayObject(object, collectionTitles));
				data.id = pid;
				data.downloadLinks = AppHelper.getFileDownloadLinks(object);
				res.render('object', data);
			});
		}
	});
}

/**
 * Pipes an object datastream to the client
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.params.datastream - Datastream ID (defined in configuration)
 * @param {String} req.params.pid - Object PID
 * @param {String} req.params.part - If a compound object, fetch datastream for this part index (first part = index 1)
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.getDatastream = function(req, res) {
		console.log("TEST getDatastream() controller")
	var ds = req.params.datastream.toLowerCase() || "",
		pid = req.params.pid || "",
		part = req.params.part || null,
		index = config.elasticsearchPublicIndex,
		key = null;

	// Detect part index appended to a compound object pid.  This is to allow IIIF url resolver to convey part index data by modifying the pid value
	let pidElements;
	if(part == null && pid.indexOf(config.compoundObjectPartID) > 0) {
		part = pid.substring(pid.indexOf(config.compoundObjectPartID)+1, pid.length);	
		pid = pid.split(config.compoundObjectPartID,1)[0];
	}

	// If a valid api key is passed in with the request, get data from the the private index
	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	// Get the datastream and pipe it
	Service.getDatastream(index, pid, ds, part, key, function(error, stream) {
		if(error || !stream) {
			console.log(error || "Can not retrieve datastream");
			res.sendStatus(404);
		}
		else {
			res.set('Accept-Ranges', 'bytes');
			if(stream.headers && stream.headers["content-type"]) {
				res.set('Content-Type', stream.headers["content-type"]);
			}
			stream.pipe(res);
		}
	});
}

/**
 * Gets a IIIF manifest for an object
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.params.pid - Object PID
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.getIIIFManifest = function(req, res) {
	let pid = req.params.pid || "",
		index = config.elasticsearchPublicIndex,
		key = null;

	// If a valid api key is passed in with the request, get data from the the private index
	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	Service.getManifestObject(pid, index, key, function(error, manifest) {
		if(error) {
			console.error(error);
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

/**
 * Gets a Kaltura embedded iframe viewer for an object
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.params.pid - Object PID
 * @param {String} req.params.part - If a compound object, get viewer for this part index (first part = index 1)
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.getKalturaViewer = function(req, res) {
	let pid = req.params.pid || "",
		part = parseInt(req.params.part) || 1;

	// Get the object data
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
			// If the object is found, check if it is a compound object.  If it is, and a part has been requested, get the part object
			if(AppHelper.isParentObject(object) && part) {
				object = AppHelper.getCompoundObjectPart(object, part);
			}

			// Get the iframe html for the object and return it to the client
			res.send(Viewer.getKalturaViewer(object));
		}
	});
}

/**
 * Renders the advanced search view
 * Get form field data from the configuration
 *
 * @param {Object} req - Express.js request object
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.advancedSearch = function(req, res) {
	Service.getAutocompleteData(function(error, acData) {
		if(error) {
			console.log(error);
		}
		
		var data = {
			error: null,
			root_url: config.rootUrl,
			searchFields: config.advancedSearchFields,
			typeFields: config.searchTypes,
			boolFields: config.booleanSearchFields,
			autocompleteData: JSON.stringify(acData)
		};

		return res.render('advanced-search', data);
	});
}

/**
 * Returns the viewer content for an object
 * 
 * @param {Object} req - Express.js request object
 * @param {String} req.params.pid - PID of the object to be rendered
 * @param {Object} res - Express.js response object
 *
 * @return {undefined}
 */
exports.getObjectViewer = function(req, res) {
	var viewer = "<div class='embedded-viewer'>",
		pid = req.params.pid,
		index = config.elasticsearchPublicIndex,
		key = null,
		script = "",
		errors = "";

	// If a valid api key is passed in with the request, get data from the the private index
	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	Service.fetchObjectByPid(index, pid, function(error, object) {
		if(error) {
			console.error(error);
			errors += "Viewer error";
		}
		else if(object == null) {
			console.log("Object not found: " + pid);
			errors += "Object not found";
		}
		else {
			var part = req.params.index && isNaN(parseInt(req.params.index)) === false ? req.params.index : 0;
			// Render a parent object with child objects
			if(AppHelper.isParentObject(object)) {viewer += CompoundViewer.getCompoundObjectViewer(object, part, key)}
			// Render single object
			else {
				if(part > 0) {
					let msg = "Object not found: ", pid;
					console.error(msg)
					errors = msg;
				}
				else {
					let objViewer = Viewer.getObjectViewer(object, null, key);
					if(objViewer.length <= 0) {
						errors = "Can not get object viewer"
					}
					else { viewer += objViewer }
				}
			}

			// Add transcript viewer if a transcript is present in the record
			if(object.transcript && object.transcript.length > 0) {
				viewer += "<div id='transcript-view-wrapper' style='display: block;'><div id='transcript-view'>";
				viewer += object.transcript;
				viewer += "</div></div>";
				script = "$('#uv').css('height', '72%')";
			}
			viewer += "</div>";
		}

		// Render page
		res.render('page', {
			error: errors,
			root_url: config.rootUrl,
			content: viewer,
			script: script
		});
	});
}

exports.downloadObjectFile = function(req, res) {
	var pid = req.params.pid || "",
		part = req.params.part || null,
		index = config.elasticsearchPublicIndex,
		extension = req.params.extension || "file",
		key = null;

	let pidElements;
	if(part == null && pid.indexOf(config.compoundObjectPartID) > 0) {
		part = pid.substring(pid.indexOf(config.compoundObjectPartID)+1, pid.length);	
		pid = pid.split(config.compoundObjectPartID,1)[0];
	}

	// If a valid api key is passed in with the request, get data from the the private index
	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	// Get the datastream and pipe it
	Service.getDatastream(index, pid, ds, part, key, function(error, stream) {
		if(error || !stream) {
			console.log(error || "Can not retrieve datastream");
			res.sendStatus(404);
		}
		else {
			// TODO create filename based on pid and extension
			var filename = "test.tiff";
			//var filename = pid + "." + extension; // Check if extension is valid

			res.set('Accept-Ranges', 'bytes');
			if(stream.headers && stream.headers["content-type"]) {
				res.set('Content-Type', stream.headers["content-type"]);


				res.set('Content-Disposition', 'attachment; filename="' + filename + '"');
			}
				console.log("TEST sending with headers:", res.headers)
			stream.pipe(res);
		}
	});
}

