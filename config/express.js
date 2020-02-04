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
 * express.js
 * Discovery app express.js bootstrap file
 */

'use strict';

var http = require('http'),
    express = require('express'),
    bodyParser = require('body-parser'),
    config = require('./config.js');

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
    require('../search/routes.js')(app);
    require('../specialcollections/routes.js')(app);

    if(process.env.ENABLE_TEST && process.env.ENABLE_TEST == "true" && process.env.NODE_ENV === 'development') {
            console.log("TEST here")
        require('../test/routes.js')(app);
    }
    
    // Express dependencies
    require('express-template-cache');

    // Root route to landing page
    app.route('/')
        .get(function(req, res) {
            res.redirect(config.rootUrl);
    });

    return server;
};