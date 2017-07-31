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
		console.log("Controller receives:", response);

		if(response.status) {
			data['collections'] = response.data;
		}
		else {
			data['collections'] = [];
			data['error'] = "Could not retrieve collections";

		}
		console.log("Rendering:", data);
		return res.render('collections', data);
	});
};