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
 * IIIF Functions
 *
 */

'use strict';

const 	config = require('../config/' + process.env.CONFIGURATION_FILE),
	 	request  = require("request"),
		IIIF = require('../libs/IIIF');

exports.getManifest = function(container, objects, apikey, callback) {
	if(config.IIIFEnablePdfPaging && container.objectType == "pdf" && container.isCompound) {
		getCollectionManifest(container, objects, apikey, callback);
	}
	else {
		getObjectManifest(container, objects, apikey, callback);
	}
}

exports.getThumbnailUri = function(objectID, apikey) {
	apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";
	let width = config.IIIFThumbnailWidth || "";
	let height = config.IIIFThumbnailHeight || "";
	return config.IIIFServerUrl + "/iiif/2/" + objectID + apikey + "/full/" + width + "," + height + "/0/default.jpg";
}

/**
 * 
 *
 * @param 
 * @return 
 */
var getObjectManifest = function(container, objects, apikey, callback) {
		console.log("IIIF key in", apikey)
	var manifest = {},
		mediaSequences = [];

	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";
	manifest["@id"] = config.IIIFUrl + "/" + container.resourceID + "/manifest";
	manifest["@type"] = "sc:Manifest";
	manifest["label"] = container.title || "No title";
	manifest['metadata'] = [];
	for(var key in container.metadata) {
		manifest.metadata.push({
			"label": key,
			"value": container.metadata[key] || ""
		});
	}
	manifest['license'] = "https://creativecommons.org/licenses/by/3.0/"; 
	manifest['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";

	manifest['sequences'] = [];
	manifest.sequences.push({
		"@id": config.IIIFUrl + "/" + container.resourceID + "/sequence/s0",
		"@type": "sc:Sequence",
		"label": "Sequence s0",
		"canvases": []
	});

	var object,
	    images = [],
		imageData, 
		canvases = [], 
		canvas,
	    elements = [],
		element = {},
		thumbnail;

	for(var object of objects) {
		if(object.type == config.IIIFObjectTypes["still image"]) {
			images.push(object);
			canvases.push(getImageCanvas(container, object, apikey));

			if(config.IIIFUseGenericImageData) {
				for(let canvas of canvases) {
					if(canvas.images && typeof canvas.images[0].resource.service != "undefined" && canvas.images[0].resource.service.profile != "undefined") {
						apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";
						canvas["height"] = config.IIIFDefaultCanvasHeight || 1000;
						canvas["width"] = config.IIIFDefaultCanvasWidth || 750;
						canvas.images[0].resource.service["@context"] = "http://iiif.io/api/image/2/context.json";
						canvas.images[0].resource.service.profile = "http://iiif.io/api/image/2/level1.json";
					}
				}
				
				manifest.sequences[0].canvases = canvases;
			}

			else {
				// Get the image data for the item from the iiif server, if any images are present in this manifest.
				getImageData(images, [], apikey, function(error, data) {
					if(error) {
						callback(error, manifest);
					}
					else {
						if(images.length > 0) {
							let imageData;
							for(let canvas of canvases) {
								if(canvas.images && typeof canvas.images[0].resource.service != "undefined" && canvas.images[0].resource.service.profile != "undefined") {
									imageData = data.shift();
									canvas.height = imageData.height;
									canvas.width = imageData.width;
									canvas.images[0].resource["height"] = imageData.height;
									canvas.images[0].resource["width"] = imageData.width;
									canvas.images[0].resource.service["@context"] = imageData["@context"];
									canvas.images[0].resource.service.profile = imageData.profile;
									canvas.images[0].resource.service.profile = "http://iiif.io/api/image/2/level1.json";
								}
							}
						}
						manifest.sequences[0].canvases = canvases;
					}
				});
			}
		}

		else if(object.type == config.IIIFObjectTypes["audio"] || 
				object.type == config.IIIFObjectTypes["video"]) {

			elements.push(getObjectElement(object, apikey));
			canvases.push(getThumbnailCanvas(container, object));
			manifest.sequences[0].canvases = canvases;

			if(elements.length > 0) {
				mediaSequences.push({
					"@id" : config.IIIFUrl + "/" + container.resourceID + "/xsequence/s0",  
					"@type" : "ixif:MediaSequence",
					"label" : "XSequence 0",
					"elements": elements
				});
			}
			manifest["mediaSequences"] = mediaSequences;
		}

		else if(object.type == config.IIIFObjectTypes["pdf"]) {
			let sequenceIndex = parseInt(object.sequence)-1;
			if(object.pageCount == null) {
				elements.push(getPDFElement(object, apikey));
				canvases.push(getPDFCanvas(container, object, apikey));
				manifest.sequences[0].canvases = canvases;
			}
			else {
				for(let page=1; page <= object.pageCount; page++) {
					canvases.push(getPDFPageCanvas(container, object, apikey, page.toString()));
				}

				// let structure = {
				// 	"@id": config.IIIFUrl + "/" + container.resourceID + "/range/r-0",
				// 	"@type": "sc:Range",
				// 	"label": "Front Cover",
				// 	"canvases": []
				// };
				// structure.canvases.push(canvases[0]["@id"]);
				// manifest["structures"] = [];
				// manifest.structures.push(structure);

				if(sequenceIndex == 0) {
					manifest.sequences[0].canvases = canvases;
				}
				else {
					manifest.sequences.push({
						"@id": config.IIIFUrl + "/" + container.resourceID + "/sequence/s" + sequenceIndex,
						"@type": "sc:Sequence",
						"label": "Sequence s" + sequenceIndex,
						"canvases": canvases,
					});
				}
			}
		}
		else {
			continue;
		}
	}
	callback(null, manifest);
}

var getImageData = function(objects, data=[], apikey, callback) {
	let index = data.length;
		apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";
	
	if(index == objects.length) {
		callback(null, data);
	}
	else {
		let object = objects[index],
			url = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + apikey; 

		request(url, function(error, response, body) {
			if(error) {
				callback(error, []);
			}
			else if(body[0] != '{') {
				data.push({});
				getImageData(objects, data, apikey, callback);
			}
			else {
				let object = JSON.parse(body);
				data.push(object);
				getImageData(objects, data, apikey, callback);
			}
		});
	}
}

var getImageElement = function(object) {
	// The element array has a resources [].
	// create service object, has empty profile array
	// create a resource element, attach the service object, push to service.resources []
}

var getObjectElement = function(object, apikey) {
	apikey = apikey ? ("?key=" + apikey) : "";

	// Create the rendering data
	let rendering = {};
	rendering['@id'] = object.resourceUrl;
	rendering['format'] = object.format;
	rendering['label'] = "Test Label for Download";

	let element = {};
	element["@id"] = object.resourceUrl + apikey;
	element["@type"] = object.type;
	element["format"] = object.format; 
	element["label"] = object.label;
	element["metadata"] = [];
	element["thumbnail"] = object.thumbnailUrl;
	element["rendering"] = rendering;

	element.metadata.push({
		title: object.label,
		description: object.description
	});

	return element;
}

var getPDFElement = function(object, apikey) {
	let element = {};
		apikey = apikey ? ("?key=" + apikey) : "";

	element["@id"] = object.resourceUrl + apikey;
	element["@type"] = object.type;
	element["format"] = object.format; 
	element["label"] = object.label;
	element["metadata"] = [];
	element["thumbnail"] = object.thumbnailUrl;

	element.metadata.push({
		title: object.label,
		description: object.description
	});

	return element;
}

var getPDFPageCanvas = function(container, object, apikey, page="1") {
	let canvas = {},
		image = {},
		resource = {};

	apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + page;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = "Page " + page;
	canvas["height"] = 4;	//config.IIIFDefaultCanvasHeight || 1000;
	canvas["width"] = 3;	//config.IIIFDefaultCanvasWidth || 750;
	canvas["images"] = [];

	image["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotation/p" + page;
	image["@type"] = "oa:Annotation";
	image["motivation"] = "sc:painting";
		
	resource["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + apikey + "/full/full/0/default.jpg" + "?page=" + page;
	resource["@type"] = "dctypes:Image";
	resource["format"] = "image/jpeg"; 
	resource["height"] = 750;
	resource["width"] = 1000;
	resource["on"] = canvas["@id"];

	image["resource"] = resource;
	image["on"] = canvas["@id"];
	canvas["images"].push(image);
	canvas["thumbnail"] = getThumbnailObject(container, object, apikey, null);

	return canvas;
}

var getPDFCanvas = function(container, object, apikey) {
	let canvas = {},
		content = {},
		items = {};

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = object.label || (container.title + " Part " + object.sequence) || "No Title";
	canvas["height"] = config.IIIFDefaultCanvasHeight || 1000;
	canvas["width"] = config.IIIFDefaultCanvasWidth || 750;
	let thumbnailApiKey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";
	canvas["thumbnail"] = getThumbnailObject(container, object, thumbnailApiKey)

	apikey = apikey ? ("?key=" + apikey) : "";
	canvas["rendering"] = {
		"@id": object.resourceUrl + "/" + container.downloadFileName + ".pdf" + apikey,
		"format": "application/pdf",
		"label": "Download PDF",
		"height": 1000,
		"width": 750
	};
	canvas["content"] = [];

	// One per page?
	content["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotationpage/ap" + object.sequence;
	content["@type"] = "AnnotationPage";
	content["items"] = [];

	items["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotation/a" + object.sequence;
	items["@type"] = "Annotation";
	items["motivation"] = "sc:painting";
	items["body"] = {
		id: object.resourceUrl + apikey,
		type: "PDF",
		format: object.format,
		label: object.label
	};
	items["target"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;

	content.items.push(items);
	canvas.content.push(content);

	return canvas;
}

var getThumbnailCanvas = function(container, object) {
	let canvas = {
		images: []
	},
	image = {},
	resource = {};

	resource["@id"] = object.thumbnailUrl;
	resource["@type"] = config.IIIFObjectTypes["still image"];
	if(config.IIIFThumbnailHeight) {resource["height"] = config.IIIFThumbnailHeight}
	if(config.IIIFThumbnailWidth) {resource["width"] = config.IIIFThumbnailWidth}

	image["@id"] = object.thumbnailUrl;
	image["@type"] = "oa:Annotation";
	image["motivation"] = "sc:painting";
	image["resource"] = resource;

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = "Placeholder Image";
	canvas["thumbnail"] = object.thumbnailUrl;

	if(config.IIIFDefaultCanvasHeight) {canvas["height"] = config.IIIFDefaultCanvasHeight}
	if(config.IIIFDefaultCanvasWidth) {canvas["width"] = config.IIIFDefaultCanvasWidth}
	image["on"] = canvas["@id"];
	canvas.images.push(image);

	return canvas;
}

var getThumbnailObject = function(container, object, apikey, page=null) {
	let thumbnail = {},
		service = {},
		imageServerUrl = (object.extension == "tif" || object.extension == "tiff") ? config.IIIFTiffServerUrl : config.IIIFServerUrl;

	if(page) {
		page = page ? ("?page=" + page) : "";
		apikey = apikey ? ("&key=" + apikey) : "";
	}
	else {
		page = "";
		apikey = apikey ? apikey : "";
	}

	thumbnail["@id"] = imageServerUrl + "/iiif/2/" + object.resourceID + apikey + "/full/" + config.IIIFThumbnailWidth + ",/0/default.jpg" + page;
	thumbnail["@type"] = config.IIIFObjectTypes["still image"];
	if(config.IIIFThumbnailHeight) {thumbnail["height"] = config.IIIFThumbnailHeight}
	if(config.IIIFThumbnailWidth) {thumbnail["width"] = config.IIIFThumbnailWidth}

	service["@context"] = "http://iiif.io/api/image/2/context.json";
	service["@id"] = imageServerUrl + "/iiif/2/" + object.resourceID + apikey;
	service["protocol"] = "http://iiif.io/api/image";

	if(config.IIIFThumbnailHeight) {service["height"] = config.IIIFThumbnailHeight}
	if(config.IIIFThumbnailWidth) {service["width"] = config.IIIFThumbnailWidth}
	service["profile"] = "http://iiif.io/api/image/2/level0.json";
	thumbnail["service"] = service;

	return thumbnail;
}

/*
 * Retrieving image tile data from IIIF image server
 */
var getImageCanvas = function(container, object, apikey) {
	let canvas = {},
	image = {},
	resource = {},
	service = {};
	apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = object.label;
	canvas["thumbnail"] = getThumbnailObject(container, object, apikey);
	canvas['images'] = [];

	image["@id"] = config.rootUrl + "/datastream/" + container.resourceID + "/object/" + container.resourceID + ".jp2" + apikey;
	image["@type"] =  "oa:Annotation";
	image["motivation"] = "sc:painting";

	let imageServerUrl = (object.extension == "tif" || object.extension == "tiff") ? config.IIIFTiffServerUrl : config.IIIFServerUrl;
	resource["@id"] = imageServerUrl + "/iiif/2/" + object.resourceID + "/full/!1024,1024/0/default.jpg" + apikey;

	resource["@type"] = object.type; 
	resource["format"] = object.format; 

	service["@context"] = "";
	service["@id"] = imageServerUrl + "/iiif/2/" + object.resourceID + apikey

	resource["service"] = service;

	image["resource"] = resource;
	image["on"] = canvas["@id"];

	canvas.images.push(image);
	return canvas;
}

/**
 * 
 *
 * @param 
 * @return 
 */
var getCollectionManifest = function(container, objects, apikey, callback) {
	let manifest = {};
	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";
	manifest["@id"] = config.IIIFUrl + "/" + container.resourceID + "/manifest";
	manifest["@type"] = "sc:Collection";
	manifest["label"] = container.title || "No title";
	manifest['metadata'] = [];
	for(var key in container.metadata) {
		manifest.metadata.push({
			"label": key,
			"value": container.metadata[key] || ""
		});
	}
	manifest['license'] = "https://creativecommons.org/licenses/by/3.0/"; 
	manifest['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";
	manifest["service"] = {
		"@context": "http://universalviewer.io/context.json",
		"@id": config.rootUrl + "/object/" + container.resourceID,
		"profile": "http://universalviewer.io/tracking-extensions-profile"
	};
	manifest['manifests'] = [];

	let canvases;
	for(var object of objects) {
		canvases = [];
		canvases.push(config.rootUrl + "/iiif/" + object.resourceID + "/canvas/c1");

		manifest.manifests.push({
			"@id": config.rootUrl + "/iiif/" + object.resourceID + "/manifest",
			"@type": "sc:Manifest",
			"label": object.label || "No Title",
			"canvases": canvases
		});
	}

	callback(null, manifest);
}