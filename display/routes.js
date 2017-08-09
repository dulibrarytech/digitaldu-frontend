'use strict';

var Display = require('../display/controller');

module.exports = function (app) {

    app.route('/object/*')
        .get(Display.renderObjectView);
};


