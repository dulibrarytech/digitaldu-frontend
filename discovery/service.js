'use strict';

const es = require('elasticsearch'),
      config = require('../config/config');

var client = new es.Client({
    host: config.elasticsearchHost + ':' + config.elasticsearchPort
});

exports.getCollections = function(pid, callback) {
	var collections = [];

	// Query ES for all objects with rels-ext/isMemberOfCollection == pid
	client.search({
        index: config.elasticsearchIndex,
        type: "data",
  		q: "rels-ext_isMemberOfCollection:" + pid
    }).then(function (body) {

    	for(var i=0; i<body.hits.total; i++) {
			collections.push({
		    	pid: body.hits.hits[i]._source.pid
		    });
    	}
	    callback({status: true, data: collections});

    }, function (error) {
        console.log("Error: ", error);
        callback({status: false, data: null});
    });
}