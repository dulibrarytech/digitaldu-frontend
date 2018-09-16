'use strict';

var config = require('../config/config');

module.exports = function (app) {

	// Render the top level community view (landing page)
    app.route('/overview')
        .get(function(req, res) {
        	return res.render('static/overview');
        });
};


