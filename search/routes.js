  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

/**
 * @file 
 *
 * Search Routes
 *
 */

'use strict';

var Search = require('../search/controller');
var Helper = require('../libs/helper');

module.exports = function (app) {
    app.use(function (req, res, next) {
      Helper.sanitizeHttpParamsObject(req.query);
      next()
    })

    app.use(function (req, res, next) {
      if(Helper.validateDateParameters(req.query)) {
        next()
      }
      else {
        res.sendStatus(400)
      }
    })

    app.route('/search')
        .get(Search.search)

    app.route('/repository/search')
        .get(Search.luceneSearch)
};