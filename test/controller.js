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
		base_url: config.baseUrl
	};

	let object = {}, children = [];

	object

	data['manifest'] = IIIF.getManifest(object, children);

	// Build viewer, render test.html
	res.render("test", data);
}
