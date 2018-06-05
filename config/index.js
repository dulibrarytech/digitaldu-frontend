'use strict'

const config = require('../config/config');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client( {  
  hosts: [
    config.elasticsearchHost + ':' + config.elasticsearchPort
  ]
});

client.cluster.health({},function(err,resp,status) {  
	if(err) {
		console.log("Elasticsearch connection error:", err);
	}
	else if(status == 200 && resp) {
		console.log("Connected to Elasticsearch index: " + config.elasticsearchHost + ':' + config.elasticsearchPort);
	}
	else {
		// Try local?
		console.log("Error: Elasticsearch connection status is: " + status + " while contacting index on " + config.elasticsearchHost + ':' + config.elasticsearchPort);
	}
});

module.exports = client;
