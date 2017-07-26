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
	data['collections'] = Service.getCollections(config.topLevelCollectionPID);
	console.log(data['collections']);

	return res.render('collections', data);
};