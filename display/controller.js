'use strict'

var async = require('async'),
    config = require('../config/config'),
    Helper = require('../display/helper'),
    Service = require('../display/service'),
    Facets = require('../libs/facets');

exports.renderObjectView = function(req, res) {

	var data = {};
	data['pid'] = Helper.extractPidFromUrl(req.originalUrl);

	// Get content model

	// Get viewer content

	// Get mods data


	return res.render('object', data);
};