 /**
 * @file 
 *
 * discovery.js
 * Discovery app node bootstrap file
 */
 
require('dotenv').config();

var express = require('./config/express');
var app = express();

app.listen(process.env.APP_PORT, () => {
	console.log("Digital-DU application running on port " + process.env.APP_PORT + " in " + process.env.NODE_ENV + " mode.");
	console.log("Repository: " + process.env.REPOSITORY_DOMAIN);
	console.log(`Elastic [host:port]: ${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`);
});
module.exports = app;