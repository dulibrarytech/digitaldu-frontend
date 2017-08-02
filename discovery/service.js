'use strict';

const es = require('elasticsearch'),
      config = require('../config/config');

var client = new es.Client({
    host: config.elasticsearchHost + ':' + config.elasticsearchPort
});

// Compose links to backend repository
var createCollectionList= function(pidArray) {
	var updatedArray = [], fedoraPid;

	for(var index of pidArray) {
		fedoraPid = index.replace('_', ':');
		updatedArray.push({
			pid: index,
	    	tn: config.fedoraPath + "/fedora/objects/" + fedoraPid + "/datastreams/TN/content"
	    });
	}
	return updatedArray;
};

exports.getCollections = function(pid, callback) {
	var collections = [], collectionList = [];

	// Query ES for all objects with rels-ext/isMemberOfCollection == pid
	client.search({
        index: config.elasticsearchIndex,
        type: "data",
  		q: "rels-ext_isMemberOfCollection:" + pid
    }).then(function (body) {

    	for(var i=0; i<body.hits.total; i++) {
    		collections.push(body.hits.hits[i]._source.pid);
    	}

    	collectionList = createCollectionList(collections);
	    callback({status: true, data: collectionList});

    }, function (error) {
        console.log("Error: ", error);
        callback({status: false, data: null});
    });
};

exports.searchIndex = function(query, type, callback) {

};