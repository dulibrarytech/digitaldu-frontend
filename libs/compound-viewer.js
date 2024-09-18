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

const Logger = require('./log4js');

/**
 * Get compound object viewer html 
 *
 * @param {Object} object - index document
 * @return {String|boolean} - viewer html string, false if viewer can not be rendered
 */
exports.getCompoundObjectViewer = function(object, page, apikey=null) {
 	var viewer = false,
 	    embedKaltura = false; 

 	if(config.objectTypes.audio.includes(object.mime_type) || config.objectTypes.video.includes(object.mime_type)) {
 		embedKaltura = config.universalViewerKalturaPlayer;
 	}

 	apikey = apikey ? ("?key=" + apikey) : "";
 	if(AppHelper.validateCompoundObject(object)) {
	 	switch(config.compoundObjectViewer) {
	 		case "universalviewer":
	 			viewer = Viewer.getIIIFObjectViewer(object, page, embedKaltura, apikey);
	 			break;
	 		default:
				Logger.module().error('ERROR: ' + "Viewer error: No compound viewer found.  Please check viewer configuration.");
	 			break;
	 	}
 	}
 	else {
		Logger.module().error('ERROR: ' + `Viewer error: Invalid compound object part(s). Pid: ${object.pid}`);
 	}

 	return viewer;
}