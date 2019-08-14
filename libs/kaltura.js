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