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
 * Discovery Routes
 *
 */
'use strict'

var Discovery = require('../discovery/controller');

module.exports = function (app) {

    app.route('/islandora/object/:pid')
        .get(function(req, res) {
            res.redirect("/object/" + req.params.pid);
    });

    app.route('/')
        .get(Discovery.renderRootCollection)

    app.route('/collection/:pid')
        .get(Discovery.renderCollection)

    app.route('/object/:pid')
    	.get(Discovery.renderObjectView)

    app.route('/object/:pid/:index')
        .get(Discovery.renderObjectView)

    app.route('/viewer/:pid')
        .get(Discovery.getObjectViewer)

    app.route('/viewer/:pid/:part')
        .get(Discovery.getObjectViewer)

    app.route('/viewer/kaltura/:pid/:part')
        .get(Discovery.getKalturaViewer)

    app.route('/datastream/:pid/:datastream')
        .get(Discovery.getDatastream)

    app.route('/datastream/:pid/:datastream/:extension')
        .get(Discovery.getDatastream)

    app.route('/datastream/:pid/:datastream/:part')
        .get(Discovery.getDatastream)

    app.route('/iiif/:pid/manifest')
        .get(Discovery.getIIIFManifest)

    app.route('/iiif/:pid/manifest.json')
        .get(Discovery.getIIIFManifest)

    app.route('/advanced-search')
        .get(Discovery.advancedSearch)

    app.route('/download/:pid/:extension')
        .get(Discovery.downloadObjectFile)
};


