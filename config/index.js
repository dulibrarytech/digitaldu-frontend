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
 const { Client } = require('@elastic/elasticsearch');

 const Logger = require('../libs/log4js');
 
 let elastic_client = null;
 let elasticDomain = `${config.elasticsearchHost}:${config.elasticsearchPort}`;

 Logger.module().info('INFO: ' + `Connecting to Elastic server at domain: ${elasticDomain}...`);
 
 try {
     elastic_client = new Client({
         node: elasticDomain,
     });
 }
 catch (error) {
     Logger.module().error('ERROR: ' + `Could not connect to Elastic server. Error: ${error}`);
 }

 if(elastic_client) {

    elastic_client.info().then(function (response) {
      Logger.module().info('INFO: ' + `Connected to Elastic server. Server info: ${response}`);

    }, function (error) {
      Logger.module().error('ERROR: ' + `Could not connect to Elastic server. Error: ${error}`);
    });
 }
 else {
    Logger.module().error('ERROR: ' + "Cound not connect to Elastic server");
 }
 
 module.exports = elastic_client;
 