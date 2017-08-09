'use strict';

var Display = require('../display/controller');

module.exports = function (app) {

	console.log("HERE2");

    app.route('/object/*')
        .get(Display.renderObjectView);
};


