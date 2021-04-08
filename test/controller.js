'use strict';

const async = require('async'),

config = require('../config/' + process.env.CONFIGURATION_FILE),
es = require('../config/index'),
util = require('util'),
DiscHelper = require('../discovery/helper.js'),
DiscService = require('../discovery/service.js'),

request = require('request'),
rs = require('request-stream'),
fs = require('fs'),

SearchHelper = require('../search/helper.js'),
SearchService = require('../search/service.js'),

Viewer = require('../libs/viewer'),
Helper = require('../libs/helper'),
Facets = require('../libs/facets'),
Paginator = require('../libs/paginator'),
Metadata = require('../libs/metadata'),
IIIF = require('../libs/IIIF'),
Cache = require('../libs/cache');

exports.test_view = function(req, res) {
	console.log("TEST router req headers", req.headers)

	function generalizedGCD(num, arr)
	{
	    // WRITE YOUR CODE HERE
	    var curDivisor, curInt, maxDivisor = 0, count;
	    for(var i=0; i<num; i++) {
	        curDivisor = arr[i];
	        count = 0;
	        for(var j=0; j<arr.length; j++) {
	            curInt = arr[j];
	            if(curInt % curDivisor != 0) {
	                break;
	            }
	            count++;
	            if(count == arr.length) {
	            	maxDivisor = curDivisor;
	            }
	        }
	    }
	    return maxDivisor;
	}

	console.log(generalizedGCD(5, [1,3,5,7,13]))

	res.render('test');
}

exports.test_es_request = function(req, res) {
	var data = {  
      index: config.elasticsearchPublicIndex,
      body: {
        from : (pageNum - 1) * pageSize, 
        size : pageSize,
        query: {

        },
        sort: sortArr,
        aggregations: []
      }
    };
	es.search(data, function (error, response, status) {

	});
}

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

	let pathArray = "display_record.subjects.terms.term".split("."), bucket = [];
	let returnVal = Metadata.extractValues(pathArray, object, "type", "topical", bucket);

	res.send(bucket || "ok");
}

exports.test_metadata_createMetadataDisplayObject = function(req, res) {

}

exports.test_isCompound = function(req, res) {
	var pid = "800002";
	DiscService.fetchObjectByPid("repo_demo", pid, function(error, object) {
		console.log("TEST object", object);
		res.send(Helper.isParentObject(object) == true ? "T" : "F");
	});
}

exports.test_fetchObjectByPid = function(req, res) {
	var pid = "61ed6a68-618b-48eb-b9bd-3e7484e0590a";
	DiscService.fetchObjectByPid("repo_public", pid, function(error, object) {
		console.log("TEST object", object);
		res.send(!object ? "NULL" : object);
	});
}

exports.test_fileDownloader = function(req, res) {
	// Test audio
	//let uri = "https://cdnapisec.kaltura.com/p/2357732/sp/0/playManifest/entryId/0_4up3d6fk/format/url/protocol/https/flavorParamId/0_40uy2cu1/video.mp4"
	//let uri = "http://cfvod.kaltura.com/pd/p/2357732/sp/235773200/serveFlavor/entryId/0_4up3d6fk/v/2/ev/7/flavorId/0_40uy2cu1/name/a.mp4"

	// Test video
	let uri = "https://cdnapisec.kaltura.com/p/2357732/sp/0/playManifest/entryId/0_u131t2ex/format/url/protocol/https/flavorParamId/0_40uy2cu1/video.mp4"

	// Request
    request(uri, function(error, response, body) {
      if(error) {
          console.log("TEST test req err", error)
        res.send(error);
      }
      else {
          console.log("TEST test req ok, returning body")
        res.setHeader("Content-Type", "video/mov")
        res.send(body);
      }
    });
}

exports.test_sanitizeHtml = function(req, res) {
	let queryObj = {
		q: [],
		type: []
	}
	queryObj.q.push("Test query<script>stealData()</script> string");
	queryObj.type.push("Test type <script>malware()</script>string");
	console.log("test_sanitizeHtml QObj pre", queryObj);
	Helper.sanitizeHttpParamsObject(queryObj);
	console.log("test_sanitizeHtml QObj post", queryObj);
	res.send("test_sanitizeHtml OK");
}

exports.test_cache_cacheDatastream = function(req, res) {

}

exports.test_cache_exists = function(req, res) {

}

exports.test_cache_getList = function(req, res) {
	let list = Cache.getList('thumbnail');
	console.log("test_cache_getList() list", list);
	res.send("test_cache_getList OK");
}

exports.test_cache_removeObject = function(req, res) {
	let pid = "00610779-cf59-4479-91ad-796abf95769a.jpg";
	Cache.removeObject('thumbnail', pid, function(error, response) {
		if(error) {
			console.log(error);
			res.send("test_cache_removeObject Errored");
		}
		else {
			console.log(response);
			res.send("test_cache_removeObject OK");
		}
	});
}