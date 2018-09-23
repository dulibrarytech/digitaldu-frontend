'use strict';

var Discovery = require('../discovery/controller');

module.exports = function (app) {

    app.route('/islandora/object/:pid')
        .get(function(req, res) {
            res.redirect("/repository/object/" + req.params.pid);
    });

	// Render the top level community view (landing page)
    app.route('/repository')
        .get(Discovery.renderRootCollection);

    // Render collection view, with all collections in the community [:id]
    app.route('/repository/community/:id')
        .get(Discovery.renderCommunity);

    // Render collection view, with all objects in the collection [:id]
    app.route('/repository/collection/:pid')
        .get(Discovery.renderCollection);

    // Render all object views (by content model or type)
    app.route('/repository/object/:pid')
    	.get(Discovery.renderObjectView);

    // Search the discovery index
    app.route('/repository/facets')
        .get(Discovery.getFacets);

    app.route('/repository/datastream/:pid/:datastream')
        .get(Discovery.getDatastream);

    app.route('/repository/datastream/:pid/:datastream/:spoof')
        .get(function(req, res) {
            res.redirect("/repository/datastream/" + req.params.pid + "/" + req.params.datastream);
    });
};


