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

const config = require('../config/' + process.env.CONFIGURATION_FILE),
    http = require('http'),
    express = require('express'),
    compression = require('compression'),
    helmet = require('helmet'),
    bodyParser = require('body-parser'),
    noCache = require('nocache');

module.exports = function () {
    var app = express(),
        server = http.createServer(app);

    if (process.env.NODE_ENV === 'development') {
        process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;
    } else if (process.env.NODE_ENV === 'production') {
        app.use(compression());
    }

    app.use(bodyParser.urlencoded({
        extended: true
    }));
    app.use(bodyParser.json());
    app.use(helmet());
    app.use(noCache());
    app.use(helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'", (config.webSocketDomain+":"+config.webSocketPort), config.IIIFServerDomain, config.IIIFDomain, config.repositoryDomain, 'www.google-analytics.com', 'cdnapisec.kaltura.com', 'data:', 'blob:', 'www.du.edu', 'fonts.gstatic.com', 'use.fontawesome.com'],
        styleSrc: ["'self'", "'unsafe-inline'", 'maxcdn.bootstrapcdn.com', 'use.fontawesome.com', 'vjs.zencdn.net', 'code.jquery.com', 'fonts.googleapis.com'],
        scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'", 'www.google-analytics.com', 'vjs.zencdn.net', 'use.fontawesome.com', 'code.jquery.com'],
        fontSrc: ["'self'", 'data:', 'fonts.gstatic.com', 'use.fontawesome.com']
      }
    }))
    app.disable('x-powered-by');

    app.use(express.static('./public'));
    app.set('views', './views');
    app.set('view engine', 'ejs');

    require('../discovery/routes.js')(app);
    require('../search/routes.js')(app);
    require('../specialcollections/routes.js')(app);

    if(process.env.ENABLE_TEST && process.env.ENABLE_TEST == "true" && process.env.NODE_ENV === 'development') {
        console.log("Test route enabled");
        require('../test/routes.js')(app);
    }
    
    require('express-template-cache');
    //require('../libs/socket.js');

    app.route('/')
        .get(function(req, res) {
            res.redirect(config.rootUrl);
    });

    return server;
};