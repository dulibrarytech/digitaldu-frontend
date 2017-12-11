'use strict'

/*
 * DU Repository interface functions
 */
const protocol = "http://",
	  domain = "libspec01-vlp.du.edu:8080";

exports.getDatastreamUrl = function(datastream, pid) {
	return protocol + domain + "/object?pid=" + pid + "&type=" + datastream;
}

exports.getRootCollections = function() {
	return new Promise(function(resolve, reject) {

		var request = require('request'), url = protocol + domain + "/collections?type=root";
		request(url, function (error, response, body) {

			resolve(body);
		});
	});
}

