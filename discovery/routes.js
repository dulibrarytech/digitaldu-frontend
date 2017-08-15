'use strict';

var Discovery = require('../discovery/controller');

module.exports = function (app) {

	app.route('/')
        .get(function(req, res) {
        	res.redirect('/repository');
        });

	app.route('/repository')
        .get(Discovery.renderCollectionsView);

    app.route('/repository/search')
    	.get(Discovery.search);

    app.route('/repository/object/:pid')
    	.get(Discovery.getObjectData);
};


