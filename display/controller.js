'use strict'

var async = require('async'),
    config = require('../config/config'),
    Helper = require('../display/helper'),
    Service = require('../display/service'),
    Facets = require('../libs/facets');

exports.renderObjectView = function(req, res) {

	var data = {};

	data['base_url'] = config.baseUrl;

	// data['pid'] = Helper.extractPidFromUrl(req.originalUrl);
	data['pid'] = req.params.pid;
		console.log("Object view receives pid:", data.pid);

	// Get content model

	// Get viewer content

	// Get mods data


	return res.render('object', data);
};