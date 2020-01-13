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
 * Kaltura Interface 
 * 
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	domain = "https://cdnapisec.kaltura.com";

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getViewerContent = function(object) {
	const partner_id = config.kalturaPartnerID,
		uiconf_id = config.kalturaUI_ID,
		entry_id = object.entry_id,
		unique_object_id = config.kalturaUniqueObjectID,
		title = object.title;

	const cache_st = "1559751114",
 		height = config.kalturaPlayerHeight,
 		width = config.kalturaPlayerWidth;

 	var html = "<div class='kaltura-viewer'>";
 	if(title && title != "" && config.showTitle == "true") {
 		html += "<h3>" + title + "</h3>";
 	}
 	html += "<iframe id='kaltura_player_1559861164' src='" + domain + "/p/" + partner_id + "/sp/" + partner_id + '00' + "/embedIframeJs/uiconf_id/" + uiconf_id + "/partner_id/" + partner_id + "?iframeembed=true&playerId=" + unique_object_id + "&entry_id=" + entry_id + "&flashvars[leadWithHTML5]=true' width='" + width + "' height='" + height + "' allowfullscreen webkitallowfullscreen mozAllowFullScreen allow='autoplay *; fullscreen *; encrypted-media *' frameborder='0'></iframe>";
 	html += "</div>";
 	return html;
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getThumbnailUrl = function(object) {
	const entry_id = object.entry_id,
		partner_id = config.kalturaPartnerID,
		width = config.kalturaThumbnailWidth,
		height = config.kalturaThumbnailHeight;

	return domain + "/p/" + partner_id + "/thumbnail/entry_id/" + entry_id + "/width/" + width + "/height/" + height;
}