'use strict';

const async = require('async'),

config = require('../config/' + process.env.CONFIGURATION_FILE),
util = require('util'),
DiscHelper = require('../discovery/helper.js'),
DiscService = require('../discovery/service.js'),

SearchHelper = require('../search/helper.js'),
SearchService = require('../search/service.js'),

Viewer = require('../libs/viewer'),
Helper = require('../libs/helper'),
Facets = require('../libs/facets'),
Paginator = require('../libs/paginator'),
Metadata = require('../libs/metadata'),
IIIF = require('../libs/IIIF');

exports.test_UVViewer = function(req, res) {

	var data = {
		root_url: config.rootUrl,
		pid: "codu:59239"
	};

	let object = {}, children = [];

	object = {
		title: "Title string",
		sequenceID: "codu:59239",
		description: "Description string",
		metadata: {
		  "Title:": "Title string",
		  "Creator": "Creator string"
		}
	};

	children.push({
      label: "Image 1",
      sequence: "1",
      description: "Image 1 description",
      format: "image/jp2",
      type: "Still Image",
      resourceID: "codu:70039"
    });

	children.push({
	  label: "Image 2",
      sequence: "2",
      description: "Image 2 description",
      format: "image/jp2",
      type: "Still Image",
      resourceID: "codu:1239"
	});

	// IIIF.getManifest(object, children, function(manifest) {
	// 	data["pid"] = "codu:59239";
	// 	res.render("test", data);
	// });

	// Build viewer, render test.html
	res.render("test_UV", data);
}

exports.test_KalturaViewer = function(req, res) {
	var data = {
		root_url: config.rootUrl
	};

	res.render("test_kaltura", data);
}

exports.test_findRecordsNotInRange = function(req, res) {

	var results = [];
	results.push({
		date: "between 1935 and 2012",
		pid: "1"
	});
	// results.push({
	// 	date: "circa 2008",
	// 	pid: "2"
	// });
	// results.push({
	// 	date: "1992",
	// 	pid: "3"
	// });
	// results.push({
	// 	date: "between 1974 and 2014",
	// 	pid: "4"
	// });
	// results.push({
	// 	date: "between 1990 and 2010",
	// 	pid: "5"
	// });

	var range = [1920, 1925];

	var notinrange = SearchHelper.findRecordsNotInRange(results, range);
	console.log("test_findRecordsNotInRange:", notinrange);

	res.send(JSON.stringify(notinrange));
}

exports.test_retrieveNestedObjectValue = function(req, res) {

	let path = "display_record.subjects.terms.term",
	matchKey = "type",
	matchValue = "topical",
	object = {},
	displayRecord = {
		"title": ["The Title", "Title 2"],
		"subjects": []
	};

	displayRecord.subjects.push({
		"authority": "local",
        "title": "Patient Records",
        "terms": []
	});
	displayRecord.subjects.push({
		"authority": "lcnaf",
        "title": "Denver (Colo.)",
        "terms": []
	});
	displayRecord.subjects.push({
		"authority": "lcsnaf",
        "title": "Denver (Colo.)",
        "terms": [],
        "authid": "id"
	});
	displayRecord.subjects.push({
		"authority": "naf",
        "title": "Denver (Colo.)",
        "authid": "id"
	});
	displayRecord.subjects[0].terms.push({
		"type": "topical",
        "term": "Patient Records"
	});
	displayRecord.subjects[1].terms.push({
		"type": "topical",
        "term": "Outpatient Records"
	});
	displayRecord.subjects[2].terms.push({
		"type": "geographic",
        "term": "Denver (Colo.)"
	});
	object["display_record"] = displayRecord;
		console.log("TEST object in:", util.inspect(object, {showHidden: false, depth: null}));

	let pathArray = "display_record.subjects.terms.term".split("."), bucket = [];
	let returnVal = Helper.extractValues(pathArray, object, "type", "topical", bucket);

	res.send(bucket || "ok");
}

exports.test_metadata_createMetadataDisplayObject = function(req, res) {

}