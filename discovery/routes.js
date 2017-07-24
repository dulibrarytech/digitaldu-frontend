'use strict';

var Discovery = require('./controller');

module.exports = function (app) {
	// app.route('/')
 //        .get();
	app.route('/repository')
        .get(Discovery.renderCollectionsView);
};


