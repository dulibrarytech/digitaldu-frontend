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
    Format = require("../libs/format"),
    Download = require("../libs/download"),
    File = require("../libs/file");

var webSocketServer = require("../libs/socket.js");
webSocketServer.startServer(config.webSocketPort || 9007);
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
		typeList: {},
		typeLabel: config.typeLabel || "Type",
		error: null,
		root_url: config.rootUrl,
		options: {}
	},
	page = req.query.page || 1,
	path = config.rootUrl + req._parsedOriginalUrl.path;

	Service.getTopLevelCollections(page, function(error, response) {
		if(error) {
			data["logMsg"] = error;
			data.error = "Error: could not retrieve collections.";
			res.render('collections', data);
		}
		else {
			data.collections = response.list;
			data.searchFields = config.searchFields;
			data.options["perPageCountOptions"] = config.defaultHomePageCollectionsCount;

			Service.getFacets(null, function(error, facets) {
				if(error) {
					data["logMsg"] = error;
				}
				else {
					var facetList = Facets.getFacetList(facets, []);
					for(var key in facetList) {
						if(config.frontPageFacets.includes(key) === false) {
							delete facetList[key];
						}
					}

					data.facets = Facets.create(facetList, config.rootUrl);
					data.typeList = Helper.getTypeDisplayList(facets);
					data.pagination = Paginator.create(data.collections, page, config.defaultHomePageCollectionsCount, response.count, path);
					data.pagination["anchor"] = "#collections";
				}
				res.render('collections', data);
			});
		}
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
var renderCollection = function(req, res) {
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
			options: {},
			sortType: req.query.sort || config.defaultCollectionSortField || "Title",
			fromDate: config.defaultDaterangeFromDate,
			toDate: new Date().getFullYear()
		};
			
		var	pid = req.params.pid || "",
			page = req.query.page || 1,
			pageSize = req.query.resultsPerPage || config.defaultCollectionsPerPage || 12,
			path = config.rootUrl + req._parsedOriginalUrl.path,
			reqFacets = req.query.f || null,
			showAll = req.query.showAll || [],
			daterange = (req.query.from || req.query.to) && (parseInt(req.query.from) < parseInt(req.query.to)) ? {
				from: req.query.from || config.defaultDaterangeFromDate,
				to: req.query.to || new Date().getFullYear()
			} : null;

		data.collectionID = pid;
		data.options["expandFacets"] = [];
		data.options["perPageCountOptions"] = config.resultCountOptions || [];
		data.options["pageSize"] = pageSize;
		data.options["sortByOptions"] = config.collectionSortByOptions || {};
		data.options["showDateRange"] = config.showCollectionViewDateRangeLimiter || false;

		let sortBy = Helper.getSortDataArray(data.sortType);
		Service.getObjectsInCollection(pid, page, reqFacets, sortBy, pageSize, daterange, function(error, response) {
			if(error) {
				if(response) {
					console.log(error);
					data.error = "Could not open collection: " + error;
					data["logMsg"] = error;
					return res.render('error', data);
				}
				else {
					console.log(error);
					data.error = "Could not open collection: " + error;
					data["logMsg"] = error;
					return res.render('page-not-found', data);
				}
			}
			else {
				data.results = response.list;
				data.current_collection = pid;
				data.current_collection_title = response.title || "Untitled";
				data.current_collection_abstract = response.abstract || "";

				/* Get the list of facets for this collection, remove the 'Collections' facets (Can re-add this field, if we ever show facets for nested collections: 
				 * ie there will be multiple collections facets present when one collection is open) */
				var facetList = Facets.getFacetList(response.facets, showAll);
				delete facetList.Collections;

				if(reqFacets) {
					reqFacets = Facets.getSearchFacetObject(reqFacets);
				}
				if(daterange) {
					data.fromDate = daterange.from;
					data.toDate = daterange.to;
				}

				Format.formatFacetDisplay(facetList, function(error, facetList) {
					data.pagination = Paginator.create(response.list, page, pageSize, response.count, path);
					data.facets = Facets.create(facetList, config.rootUrl);
					data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets, null, config.rootUrl);
					data.collection_breadcrumb_trail = Helper.getCollectionBreadcrumbObject(parentCollections);

					if(AppHelper.isObjectEmpty(data.facets)) {
						data.facets = null;
					}

					Format.formatFacetBreadcrumbs(reqFacets, function(error, facets) {
						data.facet_breadcrumb_trail = Facets.getFacetBreadcrumbObject(reqFacets, daterange, config.rootUrl);		
						return res.render('collection', data);
					});
				});
			}
		});
	});
}
exports.renderCollection = renderCollection;

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
 * Retrieve object data for requested object
 * Render the object view
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
		title: null,
		summary: null,
		metadata: {},
		citations: null,
		downloads: null,
		transcript: null,
		root_url: config.rootUrl,
		error: null
	},
	pid = req.params.pid || "",
	part = null,
	page = req.params.page && isNaN(parseInt(req.params.page)) === false ? req.params.page : null;
	
	Service.fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, response) {
		if(error) {
			let msg = error + ". Pid: " + pid;
			data["logMsg"] = msg;
			console.error(msg);
			res.status(500);
			res.render('error', {
				error: config.viewerErrorMessage,
				root_url: config.rootUrl,
				logMsg: error
			});
		}
		else if(response == null) {
			let msg = "Object not found";
			console.log(msg + ". Pid: " + pid);
			res.status(404);
			res.render('page-not-found', {
				error: msg,
				root_url: config.rootUrl,
				logMsg: msg + ". Pid: " + pid
			});
		}
		else {
			if(response.object_type == "collection") {
				renderCollection(req, res);
			}
			else {
				var object = response;
				if(AppHelper.isParentObject(object)) {
					let viewerContent = CompoundViewer.getCompoundObjectViewer(object, page);
					if(viewerContent) { 
						data.viewer = viewerContent;
						part = "1"; 
					}
				}
				else {
					data.viewer = Viewer.getObjectViewer(object);
				}

				if(data.viewer == null) {
					let msg = "Object viewer error: Can not retrieve viewer content. Pid: " + pid;
					console.log(msg);
					res.status(500);
					res.render('error', {
						error: config.viewerErrorMessage,
						root_url: config.rootUrl,
						logMsg: msg
					});
				}
				else {
					if(object.transcript && object.transcript.length > 0) {
						data.transcript = object.transcript;
					}

					data["returnLink"] = (req.header('Referer') && req.header('Referer').indexOf(config.rootUrl + "/search?") >= 0) ? req.header('Referer') : false;
					Service.getCollectionHeirarchy(object.is_member_of_collection, function(collectionTitles) {
						data.id = pid;
						data.title = object.title || null;
						object.type = Helper.normalizeLabel("Type", object.type || "")
						data.summary = Metadata.createSummaryDisplayObject(object);
						data.metadata = Object.assign(data.metadata, Metadata.createMetadataDisplayObject(object, collectionTitles));
						data.downloads = config.enableFileDownload ? Helper.getFileDownloadLinks(object, AppHelper.getDsType(object.mime_type || ""), part) : null; // PROD
						data.citations = Helper.getCitations(object);
						res.render('object', data);
					});
				}
			}
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
	var ds = req.params.datastream.toLowerCase() || "",
		pid = req.params.pid || "",
		part = req.params.part || null,
		index = config.elasticsearchPublicIndex,
		key = null;

	let pidElements;
	part = part == "0" ? null : part;
	if(part == null && pid.indexOf(config.compoundObjectPartID) > 0) {
		part = pid.substring(pid.indexOf(config.compoundObjectPartID)+1, pid.length);	
		pid = pid.split(config.compoundObjectPartID,1)[0];
	}

	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	Service.getDatastream(index, pid, ds, part, key, function(error, stream, contentType=null) {
		if(error || !stream) {
			if(config.nodeEnv == "devlog") {
				console.log(error || "Can not retrieve datastream");
			}
			res.sendStatus(404);
		}
		else {
			res.set('Accept-Ranges', 'bytes');
			if(contentType) {
				res.set('Content-Type', contentType);
			}
			else if(stream.headers && stream.headers["content-type"]) {
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
		page = req.params.page || null,
		index = config.elasticsearchPublicIndex,
		key = null;

	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}

	Service.getManifestObject(pid, index, page, key, function(error, manifest) {
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
			res.status(404).send("Item not found");
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
			if(AppHelper.isParentObject(object) && part) {
				object = AppHelper.getCompoundObjectPart(object, part);
			}
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
	var viewer = "",
		pid = req.params.pid,
		index = config.elasticsearchPublicIndex,
		key = null,
		transcript = null,
		script = "",
		errors = null;

	if(req.query.key && req.query.key == config.apiKey) {
		index = config.elasticsearchPrivateIndex;
		key = req.query.key;
	}
	Service.fetchObjectByPid(index, pid, function(error, object) {
		if(error) {
			console.error(error + ". Pid: " + pid);
			errors = "Viewer error";
			res.status(500);
		}
		else if(object == null) {
			console.log("Object not found. Pid:" + pid);
			errors = "Object not found";
			res.status(404);
		}
		else {
			var page = req.params.page && isNaN(parseInt(req.params.page)) === false ? req.params.page : "1";
			if(AppHelper.isParentObject(object)) {
				let viewerContent = CompoundViewer.getCompoundObjectViewer(object, page, key);
				if(viewerContent) { 
					viewer += viewerContent 
				}
				else {
					errors = "Null viewer content for compound object";
				}
			}
			else {
				if(page != "1") {
					let msg = "Object not found: " + pid;
					console.log(msg)
					errors = msg;
				}
				else {
					let viewerContent = Viewer.getObjectViewer(object, null, key);
					if(viewerContent) { 
						viewer += viewerContent 
					}
					else { 
						errors = "Null viewer content for object"; 
					}
				}
			}

			if(!errors && object.transcript && object.transcript.length > 0) {
				transcript = object.transcript;
				script = "$('#uv').css('height', '72%')";
			}
		}

		if(errors) {
			console.log(errors + ". Pid: " + pid)
			res.render('error', {
				error: config.viewerErrorMessage,
				root_url: config.rootUrl,
				logMsg: errors + ". Pid: " + pid
			});
		}

		else {
			res.render('viewer-page', {
				error: null,
				root_url: config.rootUrl,
				content: viewer,
				transcript: transcript,
				script: script
			});
		}
	});
}

exports.downloadObjectFile = function(req, res) {
	var pid = req.params.pid || "",
		clientHost = req.hostname || "";

	Service.fetchObjectByPid(config.elasticsearchPublicIndex, pid, function(error, object) {
		if(error) {
			console.error(error + ". Pid: " + pid);
			res.sendStatus(500);
		}
		else if(object == null) {
			console.log("Object not found. Pid: " + pid);
			res.sendStatus(404);
		}
		else {
			if(AppHelper.isParentObject(object) == true) {
					let webSocketClient = webSocketServer.getLastClient();
					if(webSocketClient) {
						console.log("Client connected to socket server. Downloading object files for", object.pid)
						let msg = {
						  status: "1",
						  message: "Client connected",
						  itemCount: AppHelper.getCompoundObjectItemCount(object) || 0
						};
						webSocketClient.send(JSON.stringify(msg));

						// Handle messages from the client
						webSocketClient.on('message', function incoming(data) {
				  			if(JSON.parse(data).abort == true) {
				  				console.log("File download aborted by client");
				  				webSocketClient["abort"] = true;
				  			}
						});

						Download.downloadCompoundObjectFiles(object, function(error, filepath) {
							if(error) {
								let errorMsg = "Error downloading object files: " + error;
								console.log(errorMsg);
								let msg = {
								  status: "5",
								  message: errorMsg
								};
								webSocketClient.send(JSON.stringify(msg));
								webSocketClient.close();
								if(res._headerSent == false) {
									res.sendStatus(500);
								}
							}
							else {
								let msg = {
								  status: "3",
								  message: "File download complete. Transferring files..."
								};
								webSocketClient.send(JSON.stringify(msg));
								
								if(res._headerSent == false) {
									res.download(filepath, function(error) { 
										if(typeof error != 'undefined' && error) {
											let err = "Error sending file to client: " + error + " Filepath: " + filepath;
											console.log(err);
											let msg = {
											  status: "5",
											  message: err
											};
											webSocketClient.send(JSON.stringify(msg));
										}
										else {
											let msg = {
											  status: "4",
											  connection: "disconnect",
											  message: "Disconnecting..."
											};
											webSocketClient.send(JSON.stringify(msg));
										}
										Download.removeDownloadTempFolder(filepath);
										webSocketClient.close();
								    });
								}
							}
						}, webSocketClient);
					}
					else {
						console.log("Error establishing connection to websocket")
						res.sendStatus(500);
					}
			}
			else {
				res.sendStatus(501);
			}
		}
	});
}

exports.renderHandleErrorPage = function(req, res) {
	res.render('handle-error', {
		root_url: config.rootUrl
	});
}

exports.purgeInvalidItems = function(req, res) {
	let cacheName = req.params.cache || null;
	if(cacheName) {
		Service.refreshCache(cacheName);
		res.sendStatus(200);
	}
	else {
		res.sendStatus(400);
	}
}

