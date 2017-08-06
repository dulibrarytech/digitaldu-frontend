'use strict'

const config = require('../config/config');

var elasticsearch = require('elasticsearch');
var client = new elasticsearch.Client( {  
  hosts: [
    config.elasticsearchHost + ':' + config.elasticsearchPort
  ]
});

module.exports = client;
