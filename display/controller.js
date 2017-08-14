'use strict'

var async = require('async'),
    config = require('../config/config'),
    Helper = require('../display/helper'),
    Service = require('../display/service'),
    Facets = require('../libs/facets');

var getViewer = function(pid) {
	return "<div id='viewer'><img src='/assets/img/mockup/sample-basic-image2.jpg'></div>";
} 

exports.renderObjectView = function(req, res) {

	var data = {};

	data['base_url'] = config.baseUrl;

	// data['pid'] = Helper.extractPidFromUrl(req.originalUrl);
	data['pid'] = req.params.pid;
		console.log("Object view receives pid:", data.pid);

	// Get content model

	// Get viewer content
	data['viewer'] = getViewer(req.params.pid);

	// Get mods data


	return res.render('object', data);
};