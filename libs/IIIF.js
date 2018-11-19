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
	var manifest = {};

	// Define the manifest
	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";	// OK (standard)
	manifest["@id"] = config.IIIFUrl + "/" + container.resourceID + "/manifest";	// OK  IF url is [speccoll/iiif/]
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

	manifest['license'] = "https://creativecommons.org/licenses/by/3.0/";
	manifest['logo'] = "https://www.du.edu/_resources/images/nav/logo2.gif";
	manifest['sequences'] = [];
	manifest['structures'] = []; 	// push the selectable structures object
	manifest['thumbnail'] = {};    // If used... Get thumbnail url somewhere.  Leave empty for testing

	// Define the sequence.  At this time only one sequence can be defined
	let sequence = {
		"@id": config.IIIFUrl + "/" + container.resourceID + "/sequence/s0",
		"@type": "sc:Sequence",
		"label": "Sequence s0",
		"canvases": []
	}
	manifest.sequences.push(sequence);

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
		if(object.type == config.IIIFObjectTypes["smallImage"] || object.type == config.IIIFObjectTypes["largeImage"]) {
			images.push(object);
			elements.push({});	// To keep in step with the sequences array.  No media sequence elements are required for an image object

			canvases.push(getImageCanvas(container, object));
		}
		else if(object.type == config.IIIFObjectTypes["audio"] || object.type == config.IIIFObjectTypes["video"]) {
			// Define the media sequence object if it has not been defined yet
			if(typeof manifest.mediaSequences == "undefined") {
				manifest["mediaSequences"] = [];
				manifest.mediaSequences.push({
					"@id" : config.IIIFUrl + "/" + container.resourceID + "/xsequence/s0",
					"@type" : "ixif:MediaSequence",
					"label" : "XSequence 0",
					"elements": []
				});
			}

			element = getObjectElement(object);
			elements.push(element);
			thumbnail = getThumbnailCanvas(container, object);
			canvases.push(thumbnail);

		}
		else if(object.type == config.IIIFObjectTypes["pdf"]) {

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
					}
				}
			}

			manifest.sequences[0].canvases = canvases;
			if(typeof manifest.mediaSequences != "undefined") {
				manifest.mediaSequences[0].elements = elements;
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
			url = config.cantaloupeUrl + "/iiif/2/" + object.resourceID;

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

var getObjectElement = function(object) {
	// Create the rendering data
	let rendering = {};
	rendering['@id'] = object.resourceUrl;
	rendering['format'] = object.format;

	// Push the mediaSequence element
	let element = {};
	element["@id"] = object.resourceUrl += "#identity";
	element["@type"] = object.type;
	element["format"] = object.format; 
	element["label"] = object.label;
	element["metadata"] = [];
	element["thumbnail"] = object.thumbnailUrl;
	element["rendering"] = rendering;

	return element;
}

var getThumbnailCanvas = function(container, object) {
	let canvas = {
		images: []
	},
	image = {},
	resource = {};

	resource["@id"] = object.thumbnailUrl;
	resource["@type"] = config.IIIFObjectTypes["smallImage"];
	resource["height"] = config.IIIFThumbnailHeight;	// config.IIIF.ThumbnailWidth
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

var getImageCanvas = function(container, object) {
	let canvas = {},
	image = {},
	resource = {},
	service = {};
		console.log("TEST obj seq", object.sequence);
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

	resource["@id"] = config.cantaloupeUrl + "/iiif/2/" + container.resourceID + "/full/full/0/default.jpg";
	resource["@type"] = object.type; 
	resource["format"] = object.format; 

	service["@context"] = "";
	service["@id"] = config.cantaloupeUrl + "/iiif/2/" + object.resourceID;		// If using the entire url here, just insert it
	service["profile"] = [];

	resource["service"] = service;
	resource["height"] = "";
	resource["width"] = "";

	image["resource"] = resource;
	image["on"] = canvas["@id"];

	canvas.images.push(image);
	return canvas;
}