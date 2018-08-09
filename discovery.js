'use strict';

require('dotenv').load();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('./config/express');
var app = express();

app.listen(process.env.APP_PORT);

console.log("Digital-DU application running at http://" + process.env.APP_HOST + ":" + process.env.APP_PORT + " in " + process.env.NODE_ENV + " mode.");
console.log("Repository: " + process.env.REPOSITORY_HOST);
module.exports = app;