 /**
 * @file 
 *
 * discovery.js
 * Discovery app node bootstrap file
 */
 
require('dotenv').config();

const Logger = require('./libs/log4js');

var express = require('./config/express');
var app = express();

app.listen(process.env.APP_PORT, () => {
	Logger.module().info('INFO: ' + `Digital-DU application running on port ${process.env.APP_PORT} in ${process.env.NODE_ENV} mode.`);
	Logger.module().info('INFO: ' + `Repository: ${process.env.REPOSITORY_DOMAIN}`);
	Logger.module().info('INFO: ' + `Elastic host: ${process.env.ELASTICSEARCH_HOST}:${process.env.ELASTICSEARCH_PORT}`);
});
module.exports = app;