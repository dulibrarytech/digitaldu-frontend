'use strict';

var Discovery = require('../discovery/controller');

module.exports = function (app) {

    app.route('/islandora/object/:pid')
        .get(function(req, res) {
            res.redirect("/object/" + req.params.pid);
    });

	// Render the top level community view (landing page)
    app.route('/')
        .get(Discovery.renderRootCollection);

    // Render collection view, with all collections in the community [:id]
    app.route('/community/:id')
        .get(Discovery.renderCommunity);

    // Render collection view, with all objects in the collection [:id]
    app.route('/collection/:pid')
        .get(Discovery.renderCollection);

    // Render all object views (by content model or type)
    app.route('/object/:pid')
    	.get(Discovery.renderObjectView);

    // Search the discovery index
    app.route('/facets')
        .get(Discovery.getFacets);

    app.route('/datastream/:pid/:datastream')
        .get(Discovery.getDatastream);

    app.route('/datastream/:pid/:datastream/:spoof')
        .get(function(req, res) {
            res.redirect("/datastream/" + req.params.pid + "/" + req.params.datastream);
    });
};


