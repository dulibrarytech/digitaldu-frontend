 /**
 * @file 
 *
 * index.js
 * Discovery app Elastic bootstrap file
 * npm elasticsearch client
 */

'use strict'

const config = require('../config/' + process.env.CONFIGURATION_FILE);
const elasticsearch = require('elasticsearch');

const client = new elasticsearch.Client( {  
  hosts: [
    config.elasticsearchHost + ':' + config.elasticsearchPort
  ]
});

client.cluster.health({},function(err,resp,status) {  
	if(err) {
		console.log("Elastic connection error:", err);
	}
	else if(status == 200 && resp) {
		console.log("Connected to Elastic cluster: " + config.elasticsearchHost + ':' + config.elasticsearchPort);
		console.log("Using Elastic index: " + config.elasticsearchPublicIndex);
	}
	else {
		console.log("Error: Elastic connection status is: " + status + " while contacting index on " + config.elasticsearchHost + ':' + config.elasticsearchPort);
	}
});

module.exports = client;
