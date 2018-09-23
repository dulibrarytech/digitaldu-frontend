'use strict';

var Search = require('../discovery/controller');

module.exports = function (app) {

    // Search the discovery index
    app.route('/search')
        .get(Search.search);
};