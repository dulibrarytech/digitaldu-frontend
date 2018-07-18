'use strict';

var Discovery = require('../discovery/controller');

module.exports = function (app) {

	// Root route to landing page
    app.route('/')
        .get(function(req, res) {
        	res.redirect('/repository');
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
    app.route('/repository/search')
        .get(Discovery.search);

    // Search the discovery index
    app.route('/repository/facets')
        .get(Discovery.getFacets);

    // TEST
    // app.route('/repository/media')
    //     .get(Discovery.getMediaStream);
    app.route('/repository/media/:path/:spoof')
        .get(Discovery.getMediaStream);
};


