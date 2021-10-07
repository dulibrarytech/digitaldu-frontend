  /**
    Copyright 2021 University of Denver

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
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

exports.head = async function(url, callback) {
    let response,
        body = null, 
        error = null;

    try {
        response = await fetch(url, {method: "HEAD"});
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
        callback(error, response.status, response.headers.raw())
    }
}

exports.get = async function(url, data, callback) {
    let response,
        body = null, 
        error = null;

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

    try {
        response = await fetch(url, {method: "GET"});
    }
    catch(e) {
        error = e;
    }

    if(error) {
        callback(error, 500, null, null)
    }
    else {
        if(response.ok == false) {
            error = response.statusText;
        }
        else if(response.status == 200) {
            body = response.body;
        }
        callback(error, response.status, body, response.headers.raw())
    }
}