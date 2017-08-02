'use strict';

var Discovery = require('./controller');

module.exports = function (app) {

	app.route('/')
        .get(function(req, res) {
        	res.redirect('/repository');
        });

	app.route('/repository')
        .get(Discovery.renderCollectionsView);

    app.route('/object/*')
        .get(Discovery.renderObjectView);

    app.route('/search')
    	.post(Discovery.search);
};


