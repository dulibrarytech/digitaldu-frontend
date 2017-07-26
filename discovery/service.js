'use strict';

const es = require('elasticsearch'),
      config = require('../config/config');

// var client = new es.Client({
//     host: config.elasticsearchHost + ':' + config.elasticsearchPort
// });

exports.getCollections = function(pid) {
	var collections = [];

	// DEV test
	var tn = config.fedoraPath + "/fedora/objects/codu:70104/datastreams/TN/content";
	collections[0] = {
		pid: "codu:70104",
		tn: tn
	}

	return collections;
}