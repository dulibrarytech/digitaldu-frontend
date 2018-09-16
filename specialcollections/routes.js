'use strict';

var config = require('../config/config');
var data = {
	base_url: config.baseUrl,
	root_url: config.rootUrl
};

module.exports = function (app) {
    app.route('/about/overview')
    .get(function(req, res) {
    	return res.render('static/overview', data);
    });

    app.route('/about/contact')
    .get(function(req, res) {
    	return res.render('static/contact', data);
    });

    app.route('/about/faqs')
    .get(function(req, res) {
    	return res.render('static/faqs', data);
    });
};


