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

exports.getThumbnailUri = function(objectID, apikey) {
	apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";
	return config.IIIFServerUrl + "/iiif/2/" + objectID + apikey + "/full/" + config.IIIFThumbnailWidth + "," + config.IIIFThumbnailHeight + "/0/default.jpg";
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getManifest = function(container, objects, apikey, callback) {
	var manifest = {},
		mediaSequences = [];

	// Define the manifest
	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";
	manifest["@id"] = config.IIIFUrl + "/" + container.resourceID + "/manifest";
	manifest["@type"] = "sc:Manifest";
	manifest["label"] = container.title;

	manifest['metadata'] = [];
	for(var key in container.metadata) {
		manifest.metadata.push({
			"label": key,
			"value": container.metadata[key]
		});
	}

	manifest['license'] = "https://creativecommons.org/licenses/by/3.0/"; 
	manifest['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";
	manifest['sequences'] = [];
	manifest['structures'] = [];
	manifest['thumbnail'] = {};

	// Define the sequence.  At this time only one sequence can be defined
	manifest.sequences.push({
		"@id": config.IIIFUrl + "/" + container.resourceID + "/sequence/s0",
		"@type": "sc:Sequence",
		"label": "Sequence s0",
		"canvases": []
	});

	mediaSequences.push({
		"@id" : config.IIIFUrl + "/" + container.resourceID + "/xsequence/s0",  
		"@type" : "ixif:MediaSequence",
		"label" : "XSequence 0",
		"elements": []
	});

	var object,
	    images = [],
		imageData, 
		canvases = [], 
		canvas,
	    elements = [],
		element = {},
		thumbnail;

	// Define the canvas objects.  Create a mediaSequence object if a/v or pdf items are present.  For each of these, insert an element object
	for(var object of objects) {
		if(object.type == config.IIIFObjectTypes["largeImage"]) {
			images.push(object);
			canvases.push(getImageCanvas(container, object, apikey));
		}
		else if(object.type == config.IIIFObjectTypes["smallImage"]) {
			images.push(object);
			canvases.push(getImageCanvas(container, object, apikey));
		}
		else if(object.type == config.IIIFObjectTypes["audio"] || 
				object.type == config.IIIFObjectTypes["video"]) {
			elements.push(getObjectElement(object, apikey));
			canvases.push(getThumbnailCanvas(container, object));

		}
		else if(object.type == config.IIIFObjectTypes["pdf"]) {
			elements.push(getPDFElement(object, apikey));
			canvases.push(getPDFCanvas(container, object, apikey));
		}
		else {
			continue;
		}
	}

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
						canvas.images[0].resource.height = imageData.height;
						canvas.images[0].resource.width = imageData.width;
						canvas.images[0].resource.service["@context"] = imageData["@context"];
						canvas.images[0].resource.service.profile = imageData.profile;
					}
				}
			}
			manifest.sequences[0].canvases = canvases;
			if(elements.length > 0) {
				mediaSequences[0].elements = elements;
				manifest["mediaSequences"] = mediaSequences;
			}
			callback(null, manifest);
		}
	});
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
				data.push(JSON.parse(body));
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
	rendering['@id'] = object.resourceUrl + "/" + object.downloadFileName;
	rendering['format'] = object.format;
	rendering['label'] = "Test Label for Download"

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

var getPDFCanvas = function(container, object, apikey) {
	let canvas = {},
		content = {},
		items = {};

	let seq = parseInt(object.sequence)-1;
	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + seq;
	canvas["@type"] = "Canvas";
	canvas["thumbnail"] = getThumbnailObject(container, object, apikey)
	canvas["rendering"] = {
		"@id": object.resourceUrl + "/" + container.downloadFileName + ".pdf",
		"format": "application/pdf",
		"label": "Download PDF"
	};
	canvas["content"] = [];

	content["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotationpage/ap" + seq;
	content["@type"] = "AnnotationPage";
	content["items"] = [];

	items["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotation/a" + seq;
	items["@type"] = "Annotation";
	items["motivation"] = "painting";
	items["body"] = {
		id: object.resourceUrl,
		type: "PDF",
		format: object.format,
		label: object.label
	};
	items["target"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + seq;

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
	resource["@type"] = config.IIIFObjectTypes["smallImage"];
	resource["height"] = config.IIIFThumbnailHeight;
	resource["width"] = config.IIIFThumbnailWidth;

	image["@id"] = object.thumbnailUrl;
	image["@type"] = "oa:Annotation";
	image["motivation"] = "sc:painting";
	image["resource"] = resource;

	let seq = parseInt(object.sequence)-1;
	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + seq;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = "Placeholder Image";
	canvas["thumbnail"] = object.thumbnailUrl;
	canvas["height"] = config.IIIFThumbnailHeight;
	canvas["width"] = config.IIIFThumbnailWidth;
	image["on"] = canvas["@id"];
	canvas.images.push(image);

	return canvas;
}

var getThumbnailObject = function(container, object, apikey) {
	let thumbnail = {
		service: {}
	},
	service = {};
	let apiKeyTmp = apikey ? ("?key=" + apikey) : "";
	apikey = apikey ? (config.IIIFAPiKeyPrefix + apikey) : "";

	thumbnail["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID;
	thumbnail["@id"] = config.rootUrl + "/datastream/" + object.resourceID + "/tn" + apikey;
	thumbnail["@type"] = config.IIIFObjectTypes["smallImage"];

	service["@context"] = "http://iiif.io/api/image/2/context.json";
	//service["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + apikey;
	service["@id"] = config.rootUrl + "/datastream/" + object.resourceID + "/tn" + apikey;
	service["protocol"] = "http://iiif.io/api/image";
	service["height"] = config.IIIFThumbnailHeight;
	service["width"] = config.IIIFThumbnailWidth;
	service["profile"] = ['"http://iiif.io/api/image/2/level0.json"'];
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

	let seq = parseInt(object.sequence)-1; 
	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + seq;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = object.label;

	//canvas["thumbnail"] = getThumbnailObject(container, object);
	// canvas["rendering"] = {
	// 	"@id": object.resourceUrl + "/" + object.downloadFileName,
	// 	"format": object.format,
	// 	"label": "Download Image"
	// }
	canvas["thumbnail"] = getThumbnailObject(container, object, apikey);

	canvas["height"] = "";
	canvas["width"] = "";
	canvas['images'] = [];

	image["@context"] = "http://iiif.io/api/presentation/2/context.json";
	image["@id"] = config.IIIFUrl + "/" + container.resourceID + "/image/i" + seq;
	image["@type"] =  "oa:Annotation";
	image["motivation"] = "";

	resource["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + "/full/full/0/default.jpg" + apikey;
	//resource["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + apikey + "/full/full/0/default.jpg";
	resource["@type"] = object.type; 
	resource["format"] = object.format; 

	service["@context"] = "";
	service["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID;	
	service["@id"] = config.IIIFServerUrl + "/iiif/2/" + object.resourceID + apikey;	
	//service["profile"] = [];

	resource["service"] = service;
	resource["height"] = "";
	resource["width"] = "";

	image["resource"] = resource;
	image["on"] = canvas["@id"];

	// image["thumbnail"] = getThumbnailObject(container, object, apikey);

	canvas.images.push(image);
	return canvas;
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getCompoundItemManifest = function(container, children, apikey, callback) {
	var collection = {};

		console.log("gcim children", children)
	// Define the manifest
	collection["@context"] = "http://iiif.io/api/presentation/2/context.json";
	collection["@id"] = config.IIIFUrl + "/collection/" + container.resourceID;
	collection["@type"] = "sc:Collection";
	collection["label"] = container.title;

	collection['metadata'] = [];
	for(var key in container.metadata) {
		collection.metadata.push({
			"label": key,
			"value": container.metadata[key]
		});
	}

	collection['license'] = "https://creativecommons.org/licenses/by/3.0/"; 
	collection['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";
	collection['thumbnail'] = {};
	collection['manifests'] = [];

	for(var child of children) {
		collection.manifests.push({
			"@id":  config.IIIFUrl + "/" + child.id + "/manifest",
			"@type": "sc:Manifest",
			"label": child.title,
			"metadata": []
		});
	}
		console.log("TEST manifests", collection.manifests)
		collection.manifests = collection.manifests.slice(0,1);
	callback(null, collection);
}
