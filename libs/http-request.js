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

'use strict'

const fetch = require("node-fetch");

exports.get = async function(url, callback) {
    let response,
        body = null, 
        error = null;

    try {
        response = await fetch(url);
    }
    catch(e) {
        error = e;
    }

    if(error) {
        callback(error, 500, null)
    }
    else {
        if(response.ok == false) {
            error = response.statusText;
        }
        else if(response.status == 200) {
            body = response.body;
        }
        callback(error, response.status, body)
    }
}