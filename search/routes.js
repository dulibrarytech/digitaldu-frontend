 /**
 * @file 
 *
 * Search module router
 *
 */

'use strict';

var Search = require('../search/controller');

module.exports = function (app) {

    // Search the discovery index
    app.route('/search')
        .get(Search.search);
};