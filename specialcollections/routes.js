'use strict';

var config = require('../config/config');
var data = {
	base_url: config.baseUrl,
	root_url: config.rootUrl
};

module.exports = function (app) {

	// Render the top level community view (landing page)
    app.route('/overview')
        .get(function(req, res) {
        	console.log("D", data);
        	return res.render('static/overview', data);
        });
};


