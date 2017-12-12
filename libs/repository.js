'use strict'

/*
 * DU Repository interface functions
 */
const protocol = "http://",
	  domain = "libspec01-vlp.du.edu:8080";

exports.getDatastreamUrl = function(datastream, pid) {
	var dsID = "";
	switch(datastream) {
		case "tn":
			dsID = "tn";
			break;
		case "small_image":
			dsID = "small_image";
			break;
		case "large_image":
			dsID = "large_image";
			break;
		case "audio":
			dsID = "audio";
			break;
		case "video":
			dsID = "video";
			break;
		case "pdf":
			dsID = "pdf";
			break;
	}

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

