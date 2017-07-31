'use strict';

var Discovery = require('./controller');

module.exports = function (app) {

	app.route('/repository')
        .get(Discovery.renderCollectionsView);

    app.route('/repository/object/codu_70104')
        .get(Discovery.renderObjectView);
};


