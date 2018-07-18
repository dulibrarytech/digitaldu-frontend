'use strict';

const async = require('async'),

    config = require('../config/config'),
    Helper = require('../discovery/helper.js'),
    Service = require('../discovery/service.js'),

    Viewer = require('../libs/viewer'),
    Facets = require('../libs/facets'),
    Paginator = require('../libs/paginator'),
    Media = require('../libs/media');

exports.testViewer = function(req, res) {

	var data = {
		base_url: config.baseUrl
	};

	var viewer = Viewer.getObjectViewer({mime_type: "video/mp4", pid: "codu:37703"}, "video/mp4");
	data['viewer'] = viewer;

	// Build viewer, render test.html
	res.render("test", data);
}