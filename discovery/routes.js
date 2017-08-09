'use strict';

var Discovery = require('../discovery/controller');

module.exports = function (app) {

	console.log("HERE1");

	app.route('/')
        .get(function(req, res) {
        	res.redirect('/repository');
        });

	app.route('/repository')
        .get(Discovery.renderCollectionsView);

    app.route('/search')
    	.post(Discovery.search);
};


