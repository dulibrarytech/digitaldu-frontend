'use strict'

/*
 * Fedora interface functions
 */

const fedoraPath = "http://librepo01-vlp.du.edu:8080";

// Compose links to Fedora repository
exports.getTNUrl = function(pid) {
	return fedoraPath + "/fedora/objects/" + pid + "/datastreams/TN/content";
};