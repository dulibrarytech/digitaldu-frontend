'use strict';

require('dotenv').load();

process.env.NODE_ENV = process.env.NODE_ENV || 'development';

var express = require('./config/express');
var app = express();

app.listen(process.env.APP_PORT);

console.log("Digital-DU application running on port" + process.env.APP_PORT + " in " + process.env.NODE_ENV + " mode.");
console.log("Repository: " + process.env.REPOSITORY);
module.exports = app;