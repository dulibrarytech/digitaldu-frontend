'use strict';

var async = require('async'),
    config = require('../config/config'),
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

	console.log("Render object view function:");
	return res.render('collections', data);
};