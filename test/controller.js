'use strict';

const async = require('async'),

    config = require('../config/config'),
    Helper = require('../discovery/helper.js'),
    Service = require('../discovery/service.js'),

    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator');

exports.testViewer = function(req, res) {

	var data = {
		base_url: config.baseUrl
	};

	var viewer = Viewer.getObjectViewer({mime_type: "image/tiff", pid: "codu:58211"}, "image/tiff");
	data['viewer'] = viewer;

	// Build viewer, render test.html
	res.render("test", data);
}
