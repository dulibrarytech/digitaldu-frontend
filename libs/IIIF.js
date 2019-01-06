 /**
 * @file 
 *
 * IIIF Functions
 *
 */

'use strict';

const 	config = require('../config/config'),
	 	request  = require("request"),
		IIIF = require('../libs/IIIF');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getManifest = function(container, objects, callback) {
	var manifest = {},
		mediaSequences = [];

	// Define the manifest
	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";	// OK (standard)
	manifest["@id"] = config.IIIFUrl + "/" + container.resourceID + "/manifest";	// OK  
	manifest["@type"] = "sc:Manifest";	// OK standard
	manifest["label"] = container.title;	// OK

	manifest['metadata'] = [];
	for(var key in container.metadata) {
		manifest.metadata.push({
			"label": key,
			"value": container.metadata[key]
		});
	}

	manifest['description'] = [];  // Push one description object, use container.description
	manifest.description.push({
		"@value": container.description,
		"@language": "en"
	});

	manifest['license'] = "https://creativecommons.org/licenses/by/3.0/";	// OK  
	manifest['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";	// INPUT THIS
	manifest['sequences'] = [];
	manifest['structures'] = []; 	// push the selectable structures object
	manifest['thumbnail'] = {};    // If used... Get thumbnail url somewhere.  Leave empty for testing

	// Define the sequence.  At this time only one sequence can be defined
	manifest.sequences.push({
		"@id": config.IIIFUrl + "/" + container.resourceID + "/sequence/s0",	// OK  
		"@type": "sc:Sequence",
		"label": "Sequence s0",
		"canvases": []
	});

	mediaSequences.push({
		"@id" : config.IIIFUrl + "/" + container.resourceID + "/xsequence/s0",	// OK  
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
			canvases.push(getImageCanvas(container, object));
		}
		else if(object.type == config.IIIFObjectTypes["smallImage"]) {
			images.push(object);
			canvases.push(getImageCanvas(container, object));
		}
		else if(object.type == config.IIIFObjectTypes["audio"] || 
				object.type == config.IIIFObjectTypes["video"]) {

			elements.push(getObjectElement(object));
			canvases.push(getThumbnailCanvas(container, object));

		}
		else if(object.type == config.IIIFObjectTypes["pdf"]) {
			canvases.push(getPDFCanvas(container, object));
		}
		else {
			console.log("Invalid IIIF object type");
			continue;
		}
	}

	// Get the image data for the item from the iiif server, if any images are present in this manifest.
	getImageData(images, [], function(error, data) {
		if(error) {
			callback(error, manifest);
		}
		else {
			if(images.length > 0) {
				let imageData;
				for(let canvas of canvases) {
					if(typeof canvas.images[0].resource.service != "undefined" && canvas.images[0].resource.service.profile != "undefined") {
						imageData = data.shift();
						canvas.height = imageData.height;
						canvas.width = imageData.width;
						canvas.images[0].resource.height = imageData.height;
						canvas.images[0].resource.width = imageData.width;
						canvas.images[0].resource.service["@context"] = imageData["@context"];
						canvas.images[0].resource.service.profile = imageData.profile;

						// set service and profile data in corresponding elements[] element
						// This is set for the index of which the image canvas appears in the canvas array
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

var getImageData = function(objects, data=[], callback) {
	let index = data.length;
	
	if(index == objects.length) {
		callback(null, data);
	}
	else {
		let object = objects[index],
			url = config.cantaloupeUrl + "/iiif/2/" + object.resourceID; 	// *** INPUT the path to each child, same as with the tn's ***
			//url = 

		request(url, function(error, response, body) {
			if(error) {
				callback(error, []);
			}
			else if(body[0] != '{') {	// TODO: find a better way to verify the object
				data.push({});
				getImageData(objects, data, callback);
			}
			else {
				data.push(JSON.parse(body));
				getImageData(objects, data, callback);
			}
		});
	}
}

var getImageElement = function(object) {
	// The element array has a resources [].
	// create service object, has empty profile array
	// create a resource element, attach the service object, push to service.resources []
}

var getObjectElement = function(object) {
	// Create the rendering data
	let rendering = {};
	rendering['@id'] = object.resourceUrl;
	rendering['format'] = object.format;

	let element = {};
	element["@id"] = object.resourceUrl;
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

var getPDFElement = function(object) {
	let element = {};
	element["@id"] = object.resourceUrl;
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

var getPDFCanvas = function(container, object) {
	let canvas = {},
		content = {},
		items = {};

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "Canvas";
	canvas["thumbnail"] = object.thumbnailUrl;
	canvas["content"] = [];

	content["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotationpage/ap" + object.sequence;
	content["@type"] = "AnnotationPage";
	content["items"] = [];

	items["@id"] = config.IIIFUrl + "/" + container.resourceID + "/annotation/a" + object.sequence;
	items["@type"] = "Annotation";
	items["motivation"] = "painting";
	items["body"] = {
		id: object.resourceUrl,
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
	resource["@type"] = config.IIIFObjectTypes["smallImage"];
	resource["height"] = config.IIIFThumbnailHeight;
	resource["width"] = config.IIIFThumbnailWidth;

	image["@id"] = object.thumbnailUrl;
	image["@type"] = "oa:Annotation";
	image["motivation"] = "sc:painting";
	image["resource"] = resource;

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = "Placeholder Image";
	canvas["thumbnail"] = object.thumbnailUrl;
	canvas["height"] = config.IIIFThumbnailHeight;
	canvas["width"] = config.IIIFThumbnailWidth;
	image["on"] = canvas["@id"];
	canvas.images.push(image);

	return canvas;
}

/*
 * Retrieving image tile data from IIIF image server
 */
var getImageCanvas = function(container, object) {
	let canvas = {},
	image = {},
	resource = {},
	service = {};

	canvas["@id"] = config.IIIFUrl + "/" + container.resourceID + "/canvas/c" + object.sequence;
	canvas["@type"] = "sc:Canvas";
	canvas["label"] = object.label;
	canvas["height"] = "";
	canvas["width"] = "";
	canvas['images'] = [];

	image["@context"] = "http://iiif.io/api/presentation/2/context.json";
	image["@id"] = config.IIIFUrl + "/" + container.resourceID + "/image/i" + object.sequence;
	image["@type"] =  "oa:Annotation";
	image["motivation"] = "";

	resource["@id"] = object.resourceUrl;
	//resource["@id"] = 
	resource["@type"] = object.type; 
	resource["format"] = object.format; 

	service["@context"] = "";
	service["@id"] = config.cantaloupeUrl + "/iiif/2/" + object.resourceID;	
	//service["@id"] = 
	service["profile"] = [];

	resource["service"] = service;
	resource["height"] = "";
	resource["width"] = "";

	image["resource"] = resource;
	image["on"] = canvas["@id"];

	canvas.images.push(image);
	return canvas;
}
