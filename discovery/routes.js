'use strict';

var Discovery = require('./controller');

module.exports = function (app) {

	app.route('/repository')
        .get(Discovery.renderCollectionsView);

    app.route('/object/*')
        .get(Discovery.renderObjectView);
};


