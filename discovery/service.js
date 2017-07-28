'use strict';

const es = require('elasticsearch'),
      config = require('../config/config');

var client = new es.Client({
    host: config.elasticsearchHost + ':' + config.elasticsearchPort
});

exports.getCollections = function(pid) {
	var collections = [];

	// DEV test
	var tn = config.fedoraPath + "/fedora/objects/codu:70104/datastreams/TN/content";
	collections.push({
		pid: "codu:70104",
		tn: tn
	});
	tn = config.fedoraPath + "/fedora/objects/codu:59239/datastreams/TN/content";
	collections.push({
		pid: "codu:59239",
		tn: tn
	});

	// Query ES for all objects with rels-ext/isMemberOfCollection == pid
	// Build collection object, push to array
	client.search({
        index: config.elasticsearchIndex,
        type: "data",
  		q: "rels-ext_isMemberOfCollection:" + pid
    }).then(function (body) {
    	console.log("Body: ", body.hits.hits);
        var id = body.hits.hits._id;
        console.log("ID:", id);

       


    }, function (error) {
        console.log("ERROR: ", error);
    });

	return collections;
}