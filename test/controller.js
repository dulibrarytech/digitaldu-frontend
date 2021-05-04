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