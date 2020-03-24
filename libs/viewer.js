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
 * Viewer class
 * Get viewer content for the object view templates
 *
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	 Repository = require('./repository'),
	 Kaltura = require('./kaltura'),
	 AppHelper = require("../libs/helper");

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getObjectViewer = function(object, mimeType="", apikey=null) {
 	var viewer = "";
 	apikey = apikey ? ("?key=" + apikey) : "";

 	if(object == null) {
 		console.log("Null object, viewer can not render");
 		return viewer;
 	}

	if(!mimeType || mimeType == "") {
 		mimeType = object.mime_type;
 	}

 	var dataType = null;
 	for(let type in config.objectTypes) {
 		if(config.objectTypes[type].includes(mimeType)) {
 			dataType = type;
 		}
 	}

 	// Get viewer for object mime type:
 	switch(dataType) {
 		case "audio":
 			viewer += getAudioPlayer(object, mimeType, apikey);
 			break;

 		case "video":
 			viewer += getVideoViewer(object, apikey);
 			break;

 		case "smallImage":
 			viewer += getLargeImageViewer(object, apikey);
 			break;

 		case "largeImage":
 			viewer += getLargeImageViewer(object, apikey);
 			break;

 		case "pdf":
 			viewer += getPDFViewer(object, apikey);
 			break;

 		default:
 			console.log("Viewer error: invalid mimetype:", mimeType, "for pid:", object.pid);
 			viewer = "";
 			break;
 	}

 	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getAudioPlayer(object, type, apikey) {
	var player = '<div id="audio-player" class="viewer-section">', tn, stream;
	var extension = "mp3";

	tn = config.rootUrl + "/datastream/" + object.pid + "/tn" + apikey;
	stream = config.rootUrl + "/datastream/" + object.pid + "/mp3" + apikey;

	switch(config.audioPlayer) {
		case "browser":
			player += getHTMLAudioPlayer(tn, stream, object.mime_type);
			break;
		case "jwplayer":
			player += getJWPlayer(tn, stream, extension, config.jwplayerPathToLibrary);
			break;
		case "universalviewer":
			player += getIIIFObjectViewer(object, null, config.universalViewerKalturaPlayer, apikey);
			break;
		case "kaltura":
			player += getKalturaViewer(object);
			break;
		default:
			player += 'Viewer is down temporarily.  Please check configuration</div>';
			break;
	}

	player += '</div>';
	return player;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getVideoViewer(object, apikey) {
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream, url;
	var extension = "", datastreamID = "";

	tn = config.rootUrl + "/datastream/" + object.pid + "/tn" + apikey;
	if(object.mime_type == "video/mp4") {
		extension = "mp4";
		datastreamID = "mp4";
	}
	else if(object.mime_type == "video/quicktime") {
		extension = "mov";
		datastreamID = "mov";
	}
	else {
		console.log("Error: Incorrect object mime type for object: " + object.pid);
	}
	stream = config.rootUrl + "/datastream/" + object.pid + "/" + datastreamID + apikey;

	switch(config.videoViewer) {
		case "videojs":
			viewer += getVideojsViewer(tn, stream, object.mime_type);
			break;
		case "jwplayer":
			viewer += getJWPlayer(tn, stream, extension, config.jwplayerPathToLibrary);
			break;
		case "universalviewer":
			viewer += getIIIFObjectViewer(object, null, config.universalViewerKalturaPlayer, apikey);
			break;
		case "kaltura":
			viewer += getKalturaViewer(object);
			break;
		default:
			viewer += 'No video viewer is enabled.  Please check configuration</div>';
			break;
	}

	viewer += "</div>";
	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getSmallImageViewer(object, apikey) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">',
		// image = Repository.getDatastreamUrl("jpg", object.pid);
		image = config.rootUrl + "/datastream/" + object.pid + "/jpg" + apikey;

	viewer += '<div id="viewer-content-wrapper" class="small-image"><img class="viewer-content" src="' + image + '"/></div>';
	viewer += '</div>';

	viewer += '</div>';
	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getLargeImageViewer(object, apikey) {
	var viewer = "";

	switch(config.largeImageViewer) {
		case "browser":
			viewer += getSmallImageViewer(object, apikey);
			break;

		case "openseadragon":
			viewer += getOpenSeadragonViewer(object, apikey);
			break;

		case "universalviewer":
			viewer += getIIIFObjectViewer(object, null, false, apikey);
			break;

		default:
			viewer += 'Viewer is down temporarily.  Please check configuration';
			break;
	}

	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getPDFViewer(object, apikey) {
	var viewer = '<div id="pdf-viewer" class="viewer-section">';
	var doc = "/datastream/" + object.pid + "/object" + apikey;

	switch(config.pdfViewer) {
		case "browser":
			viewer += '<iframe class="viewer-content" src="' + doc + '" height="500px" type="application/pdf" ></iframe>';
			break;
		case "universalviewer": 
			viewer += getIIIFObjectViewer(object, null, false, apikey);
			break;
		default:
			viewer += 'Viewer is down temporarily.  Please check configuration</div>';
			break;
	}

	viewer += '</div>';
	return viewer;
}

function getHTMLAudioPlayer(thumbnailUrl, streamUrl, mimeType) {
	return '<div id="viewer-content-wrapper"><audio controlsList="nodownload" controls><source src="' + streamUrl + '" type="' + mimeType + '"></audio></div>';
}

function getVideojsViewer(thumbnailUrl, streamUrl, mimeType) {
	return '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + thumbnailUrl + '" data-setup="{}"><source src="' + streamUrl + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
}

function getJWPlayer(thumbnailUrl, streamUrl, fileExtension, jwPlayerPath) {
	var player = "";
	streamUrl += "/file_name_spoof." + fileExtension;
	player += '<script src="' + jwPlayerPath + '"></script>';
	player += '<div id="mediaplayer" class="viewer-content">Loading JW Player...</div>';
	player += '</div>';
	player += '<script>jwplayer("mediaplayer").setup({'
	player +=     'file: "' + streamUrl + '",'
	player +=     'image: "' +  thumbnailUrl + '",'
	player +=     'width: 500,'
	player +=     'height: 300,'
	player +=     'aspectratio: "16:9",'
	player +=     'primary: "flash",'
	player +=     'androidhls: "true"'
	player += '});</script>';

	return player;
}	

/**
 * 
 *
 * @param 
 * @return 
 */
function getIIIFObjectViewer(object, page=null, embedKalturaViewer=false, apikey="") {
	var params = {},
		relativePath = "./../..",
		eventTriggers = "";

	// Add page links for compound object viewer
	if(object.is_compound) {
		let parts = AppHelper.getCompoundObjectPart(object, -1) || [];
		if(page && parts.length > 0) {
			let pageVal = parseInt(page),
			    offset = (config.IIIFManifestPageSize || 10) * pageVal,
				prev = (pageVal > 1) ? pageVal-1 : null, 
				next = (parts.length > offset) ? pageVal+1 : null;
				params["prevLink"] = prev ? config.rootUrl + "/object/" + object.pid + "/" + prev.toString() : null;
				params["nextLink"] = next ? config.rootUrl + "/object/" + object.pid + "/" + next.toString() : null;
				relativePath = "./../../..";
		}
	}

	params["embedKalturaViewer"] = embedKalturaViewer;
	params["objectID"] = object.pid;
	params["universalViewerMediaElement"] = config.universalViewerMediaElement || "";
	params["pageSize"] = config.IIIFManifestPageSize || 10;

	// Option to embed the Kaltura player into the Universalviewer instance
	if(embedKalturaViewer) {
		let objectData = object;
		params["viewerContent"] = getKalturaViewer(objectData);
	}

	eventTriggers += '$( "#uv").trigger( "uvloaded", ' + JSON.stringify(params) + ' );';
	page = page ? ("/" + page) : "";
	let viewer = '<div id="uv" class="uv"></div>';
		viewer += '<script>';
		viewer += 'window.addEventListener("uvLoaded", function (e) {';
		viewer += 'createUV("#uv", {';
		viewer += 'iiifResourceUri: "' + config.IIIFUrl + '/' + object.pid + '/manifest' + page + apikey + '",';
		viewer += 'configUri: "' + config.rootUrl + '/libs/universalviewer/uv-config.json",';
		viewer += 'root: "' + relativePath + config.appPath + '/libs/universalviewer/uv",';
		viewer += '}, new UV.URLDataProvider());';
		viewer += eventTriggers;
		viewer += '}, false);';
		viewer += '</script>';
	return viewer;
}
exports.getIIIFObjectViewer = getIIIFObjectViewer;

/**
 * 
 *
 * @param 
 * @return 
 */
 function getKalturaViewer(object) {
 	return Kaltura.getViewerContent(object);
 }
 exports.getKalturaViewer = getKalturaViewer;

 /**
 * 
 *
 * @param 
 * @return 
 */
 function getOpenSeadragonViewer(object, apikey="") {
	var viewer = "";

 	viewer += "<span id='display-message' >Loading image, please wait...</span>";
	viewer += '<div id="large-image-viewer" class="viewer-section">'
	viewer += '<div id="viewer-content-wrapper"><div id="openseadragon1" class="viewer-content" style="width: 96%; margin: 0 auto"><span id="large-image-viewer-loading"></span></div>';
	viewer += '</div>';
	viewer += '<script src="' + config.openseadragonPathToLibrary + '"></script>';
	viewer += '<script>var viewer = OpenSeadragon({'
	viewer +=     'id: "openseadragon1",'
	viewer +=     'prefixUrl: "' + config.openseadragonImagePath + '",'
	viewer +=     'immediateRender: true,'
	viewer +=     'showNavigator: true,'
	viewer +=     'tileSources: "' + config.IIIFServerUrl + '/iiif/2/' + object.pid + apikey + '/info.json"'
	viewer += '});'
	viewer += 'viewer.addHandler("tile-loaded", function(event) {document.getElementById("display-message").style.display = "none"})'
	viewer += '</script>';
	viewer += '</div>';

	return viewer;
 }