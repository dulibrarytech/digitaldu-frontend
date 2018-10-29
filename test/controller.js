'use strict';

const async = require('async'),

    config = require('../config/config'),
    Helper = require('../discovery/helper.js'),
    Service = require('../discovery/service.js'),

    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    IIIF = require('../libs/IIIF');

exports.testUVViewer = function(req, res) {

	var data = {
		base_url: config.baseUrl,
		pid: "codu:59239"
	};

	let object = {}, children = [];

	object = {
		title: "Title string",
		sequenceID: "codu:59239",
		description: "Description string",
		metadata: {
		  "Title:": "Title string",
		  "Creator": "Creator string"
		}
	};

	children.push({
      label: "Image 1",
      sequence: "1",
      description: "Image 1 description",
      format: "image/jp2",
      type: "Still Image",
      resourceID: "codu:70039"
    });

	children.push({
	  label: "Image 2",
      sequence: "2",
      description: "Image 2 description",
      format: "image/jp2",
      type: "Still Image",
      resourceID: "codu:1239"
	});

	// IIIF.getManifest(object, children, function(manifest) {
	// 	data["pid"] = "codu:59239";
	// 	res.render("test", data);
	// });

	// Build viewer, render test.html
	res.render("test", data);
}

