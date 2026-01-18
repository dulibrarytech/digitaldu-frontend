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
 * Specialcollections module router
 *
 */

var config = require('../config/' + process.env.CONFIGURATION_FILE);
var data = {
	base_url: config.baseUrl,
	root_url: config.rootUrl
};

module.exports = function (app) {
    app.route('/content/copyright-information')
    .get(function(req, res) {
    	return res.render('static/copyright-information', data)
    });
};


