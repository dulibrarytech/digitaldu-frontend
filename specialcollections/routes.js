'use strict';

var config = require('../config/config');
var Speccoll = require('../discovery/controller');

module.exports = function (app) {

	// Render the top level community view (landing page)
    app.route('/overview')
        .get(Discovery.renderRootCollection);

};


