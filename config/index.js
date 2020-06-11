  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

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

let esLogType = config.nodeEnv == 'devlogelastic' ? 'trace' : 'warning';
const client = new elasticsearch.Client({
  host: config.elasticsearchHost + ':' + config.elasticsearchPort,
  log: esLogType,
  apiVersion: '_default'  // use the same version of your Elasticsearch instance
});

client.cluster.health({},function(err,resp,status) {  
	if(err) {
		console.log("Elastic connection error:", err);
		console.log("Could not connect to Elastic cluster");
	}
	else if(status == 200 && resp) {
		console.log("Connected to Elastic cluster: " + config.elasticsearchHost + ':' + config.elasticsearchPort);
		console.log("Using Elastic index: " + config.elasticsearchPublicIndex);
	}
	else {
		console.log("Error: Elastic connection status is: " + status + " while contacting index on " + config.elasticsearchHost + ':' + config.elasticsearchPort);
		console.log("Could not connect to Elastic cluster");
	}
});

module.exports = client;
