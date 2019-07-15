 /**
 * @file 
 *
 * Search module router
 *
 */

'use strict';

var Search = require('../search/controller');

module.exports = function (app) {

    app.route('/search')
        .get(Search.search);

    app.route('/advanced-search')
        .get(Search.advancedSearch);
};