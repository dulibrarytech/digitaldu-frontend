 /**
 * @file 
 *
 * Discovery router
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
        .get(Discovery.renderRootCollection);

    app.route('/community/:id')
        .get(Discovery.renderCommunity);

    app.route('/collection/:pid')
        .get(Discovery.renderCollection);

    app.route('/object/:pid')
    	.get(Discovery.renderObjectView);

    app.route('/object/:pid/:index')
        .get(Discovery.renderObjectView);

    app.route('/facets')
        .get(Discovery.getFacets);

    app.route('/datastream/:pid/:datastream')
        .get(Discovery.getDatastream);

    app.route('/datastream/:pid/:datastream/:spoof')
        .get(Discovery.getDatastream);

    app.route('/iiif/:pid/manifest')
        .get(Discovery.getIIIFManifest);

    app.route('/iiif/:pid/manifest.json')
        .get(Discovery.getIIIFManifest);
};


