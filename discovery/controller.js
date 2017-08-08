'use strict';

var async = require('async'),
    config = require('../config/config'),
    Helper = require('../discovery/helper'),
    Service = require('../discovery/service'),
    Facets = require('../libs/facets');

function getFacets(data, callback) {

    Service.getFacets(function (facets) {
        var facetObj = Facets.create(facets);
        data.push(facetObj);
        callback(data);
    });
}

exports.renderCollectionsView = function(req, res) {
	var data = {};
	// Get list from discovery service
	Service.getCollections(config.topLevelCollectionPID, function(response) {
		if(response.status) {
			data['collections'] = response.data;
			data['base_url'] = config.baseUrl;
		}
		else {
			data['collections'] = [];
			data['error'] = "Could not retrieve collections";
		}
		return res.render('collections', data);
	});
};

exports.renderObjectView = function(req, res) {

	var data = {};
	data['pid'] = Helper.extractPidFromUrl(req.originalUrl);

	// Get content model

	// Get viewer content

	// Get mods data


	return res.render('object', data);
};

exports.search = function(req, res) {

	console.log("Search receives params:", req.body);

	// Verify / sanitize
	var query = req.body.q;
	var type = req.body.type.toLowerCase();

	Service.searchIndex(query, type, function(response) {
		var data = {};
		if(response.status) {
			data['results'] = response.data;
			console.log("Sending results:", data['results'] );
		}
		else {
			console.log("Error: ", response.message);
			data['results'] = null;
			data['error'] = response.message;
		}
		return res.render('results', data);
	});
};