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

exports.search = function(req, res) {

	// Verify / sanitize
	var query = req.body.q;
	var typeVal = req.body.type, type;
	var page = req.body.page || 0;
	var facets = req.body.facets || null;

		console.log("Req Facets in:", req.body.facetTerms);

	// If search all, build array of types from config settings.  If type search, 'type'is passed into search function as a string.
	if(typeVal == 'All') {
		type = [];
		config.searchFields.forEach(function(field) {
			for(var key in field) {
				type.push(field[key]);
			}
		});
	}
	else {
		config.searchFields.forEach(function(field) {
			for(var key in field) {
				if(key == typeVal) {
					type = field[key];
				}
			}
		});
	}

	// TODO: Get page value from search query
	// Update with ES pagination 
	facets = {
		namePersonal: ["Creator 1"]
	};

	Service.searchIndex(query, type, facets, page, function(response) {
		var data = {};
		if(response.status) {
			data['results'] = response.data;	// DEMO

			//data['results'] = Helper.paginateResults(response.data.length, 1);
			// console.error("Test error!");
		}
		else {
			console.error("Error: ", response.message);
			data['results'] = null;
			data['error'] = response.message;
		}
		return res.render('results', data);
	});
};