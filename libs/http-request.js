  /**
    Copyright 2021 University of Denver

    Wrapper for npm axios functions to interface with digital-du discovery layer application

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

const axios = require('axios');

exports.head = async function(url, callback) {
    axios.head(url).then(function(response) {
        callback(null, response.status, response.headers)
    }).catch(function(error) {
        if(error.response) {
            console.log("Url:", url);
            console.log("Response status text:", error.response.statusText);

            if(error.response.status == 500) {
                callback(error.response.statusText, 500, null);
            }
            else {
                callback(null, error.response.status, error.response.headers)
            }
        }
        else {
            callback(error, 500, null)
        }
    }); 
}

exports.get_stream = function(url, data, callback) {
    if(Object.keys(data).length !== 0) {
        let qstring = "?", count = 0;
        for(var key in data) {
            count++;
            if(count > 1) {
                qstring += "&";
            }
            qstring += (key + "=" + data[key]); 
        }
        url += qstring;
    }

    axios({
        method: 'get',
        url: url,
        responseType: 'stream'
    })
    .then(function (response) {
        if(response.status == 200) {
            callback(null, response.status, response.data, response.headers);
        }
        else {
            callback(null, response.status, null, response.headers)
        }
        
    }).catch(function (error) {
        if(error.response) {
            console.log("Url:", url);
            console.log("Response status text:", error.response.statusText);

            if(error.response.status == 500) {
                callback(error.response.statusText, 500, null);
            }
            else {
                callback(null, error.response.status, null, error.response.headers)
            }
        }
        else {
            callback(error, 500, null);
        }
    });
}