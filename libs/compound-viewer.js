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
 * Compound Object Viewer class
 *
 */

'use strict';

const 	config = require('../config/' + process.env.CONFIGURATION_FILE),
		IIIF = require('./IIIF'),
		Viewer = require('./viewer'),
    	AppHelper = require("../libs/helper");

/**
 * Get compound object viewer html 
 *
 * @param {Object} object - index document
 * @return {String} - viewer html string
 */
exports.getCompoundObjectViewer = function(object, page, apikey=null) {
 	var viewer = "",
 	    embedKaltura = false; 
 	if(config.objectTypes.audio.includes(object.mime_type) || config.objectTypes.video.includes(object.mime_type)) {
 		embedKaltura = config.universalViewerKalturaPlayer;
 	}

 	apikey = apikey ? ("?key=" + apikey) : "";
 	if(AppHelper.validateCompoundObject(object)) {
 		page = page ? page : "1";
	 	switch(config.compoundObjectViewer) {
	 		case "universalviewer":
	 			viewer += Viewer.getIIIFObjectViewer(object, page, embedKaltura, apikey);
	 			break;
	 		default:
	 			console.log("Viewer error: No compound viewer found.  Please check viewer configuration.");
	 			viewer += "<h3>Sorry, this object can not be displayed. Please contact technical support</h3>";
	 			break;
	 	}
 	}
 	else {
 		console.log("Viewer error: Invalid compound object part(s). Pid: " + object.pid);
 		viewer += "<h3>Sorry, this object can not be displayed. Please contact technical support</h3>";
 	}

 	return viewer;
}