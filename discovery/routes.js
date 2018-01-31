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
        .get(Discovery.renderCommunitiesView);

    // Render collection object view, with all collections in the community [:id]
    app.route('/repository/community/:id')
        .get(Discovery.renderCommunity);

    // Render all object views (by content model or type)
    app.route('/repository/object/:pid')
    	.get(Discovery.renderObjectView);

    // Search the discovery index
    app.route('/repository/search')
        .get(Discovery.search);
};


