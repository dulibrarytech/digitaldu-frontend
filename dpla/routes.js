'use strict'

const DPLAController = require('./controller');

module.exports = function(app) {
    app.route('/dpla/items')
        .get(DPLAController.getDPLAFeed);
};