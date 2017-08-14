'use strict';

var Display = require('../display/controller');

module.exports = function (app) {

    app.route('/repository/object/:pid')
        .get(Display.renderObjectView);
};


