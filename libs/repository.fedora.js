'use strict'

/*
 * DU Repository interface functions
 */
const protocol = "http://",
	  domain = "librepo01-vlp.du.edu:8080";

exports.getDatastreamUrl = function(datastream, pid) {
	var dsID = "";
	switch(datastream) {
		case "tn":
			dsID = "TN";
			break;
		case "small_image":
			dsID = "OBJ";
			break;
		case "large_image":
			dsID = "OBJ";
			break;
		case "audio":
			dsID = "PROXY_MP3";
			break;
		case "video":
			dsID = "MP4";
			break;
		case "pdf":
			dsID = "OBJ";
			break;
	}

	return protocol + domain + "/fedora/objects/" + pid + "/datastreams/" + dsID + "/content";
}

exports.getRootCollections = function() {
  	return [];
}


