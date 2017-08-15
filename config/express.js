'use strict';

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser')

module.exports = function () {

    var app = express(),
        server = http.createServer(app);

    if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compress());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());

    app.use(express.static('./public'));
    app.set('views', './views');
    app.set('view engine', 'ejs');

    require('../discovery/routes.js')(app);
    // require('../display/routes.js')(app);
    require('express-template-cache');

    return server;
};