 /**
 * @file 
 *
 * IIIF Interface Functions
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
exports.getManifest = function(container, images, callback) {
	var manifest = {};
		console.log("TEST images in", images);
	// Set container object info fields
	manifest["@context"] = "http://iiif.io/api/presentation/2/context.json";	// OK (standard)
	manifest["@id"] = config.IIIFUrl + "/" + container.containerID + "/manifest";	// OK  IF url is [speccoll/iiif/]
	manifest["@type"] = "sc:Manifest";	// OK standard
	manifest["label"] = container.title;	// OK

	// Set container object metadata for viewer display
	manifest['metadata'] = [];
	for(var key in container.metadata) {
		manifest.metadata.push({
			"label": key,
			"value": container.metadata[key]
		});
	}

	// Container object data
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

	// One sequence, multiple canvases
	let sequence = {
		"@id": config.IIIFUrl + "/" + container.containerID + "/sequence/s0",
		"@type": "sc:Sequence",
		"label": "Sequence s0",
		"canvases": []
	}
	manifest.sequences.push(sequence);

	// Build a canvas object for each image
	getImageData(images, [], function(error, data) {
		let imageData, 
			imageDataObject, 
			resourceObject, 
			serviceObject,
			canvases = [], 
			canvas;

		for(var index in data) {
			imageData = data[index];
				
			// Reset the containers
			canvas = {
				images: []
			};
			imageDataObject = {};
			resourceObject = {};
			serviceObject = {};

			canvas["@id"] = config.IIIFUrl + "/" + container.containerID + "/canvas/c" + index;
			canvas["@type"] = "sc:Canvas";
			canvas["label"] = images[index].label;
			canvas["height"] = imageData.height;
			canvas["width"] = imageData.width;

			imageDataObject["@context"] = "http://iiif.io/api/presentation/2/context.json";
			imageDataObject["@id"] = config.IIIFUrl + "/" + container.containerID + "/image/i" + index;
			imageDataObject["@type"] =  "oa:Annotation";
			imageDataObject["motivation"] = "";

			resourceObject["@id"] = config.cantaloupeUrl + "/iiif/2/" + container.containerID + "/full/full/0/default.jpg";
			resourceObject["@type"] = images[index].type; 
			resourceObject["format"] = images[index].format; 

			serviceObject["@context"] = imageData["@context"];
			serviceObject["@id"] = imageData["@id"];
			serviceObject["profile"] = imageData.profile;

			resourceObject["service"] = serviceObject;
			resourceObject["height"] = imageData.height;
			resourceObject["width"] = imageData.width;

			imageDataObject["resource"] = resourceObject;
			imageDataObject["on"] = canvas["@id"];

			canvas.images.push(imageDataObject);
			canvases.push(canvas);
		}

		manifest.sequences[0].canvases = canvases;

		// Structures
		callback(manifest);
 	});
}

var getImageData = function(images, data=[], callback) {
	let index = data.length;
	
	if(index == images.length) {
		callback(null, data);
	}
	else {
		let image = images[index],
			url = config.cantaloupeUrl + "/iiif/2/" + image.resourceID;

		request(url, function(error, response, body) {
				console.log("TEST body", url);
			if(error) {
				callback(error, []);
			}
			else if(body[0] != '{') {	// TODO: find a better way to verify the object
				data.push({});
				getImageData(images, data, callback);
			}
			else {
				data.push(JSON.parse(body));
				getImageData(images, data, callback);
			}
		});
	}
}