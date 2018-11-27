 /**
 * @file 
 *
 * Viewer class
 * Get viewer content for the object view templates
 *
 */

'use strict';


var config = require('../config/config');
var Repository = require('./repository');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getObjectViewer = function(object, mimeType="") {
 	var viewer = "";
	if(mimeType == "" && typeof object.mime_type != 'undefined') {
 		mimeType = object.mime_type;
 	}

 	var dataType = null;
 	for(var key in config.mimeTypes) {
 		if(config.mimeTypes[key].includes(mimeType)) {
 			dataType = key;
 		}
 	}

 	// Get viewer for object mime type:
 	switch(dataType) {
 		case "audio":
 			viewer = getAudioPlayer(object, mimeType);
 			break;

 		case "video":
 			viewer = getVideoViewer(object);
 			break;

 		case "smallImage":
 			//viewer = getSmallImageViewer(object);
 			//viewer = getLargeImageViewer(object);
 			viewer = this.getIIIFObjectViewer(object);
 			break;

 		case "largeImage":
 			//viewer = getLargeImageViewer(object);
 			viewer = this.getIIIFObjectViewer(object);
 			break;

 		case "pdf":
 			viewer = getPDFViewer(object);
 			break;

 		default:
 			console.log("Viewer error: invalid content model:", mimeType, "for pid:", object.pid);
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
exports.getIIIFObjectViewer = function(object, index=null) {
	let viewer = '<div id="uv" class="uv"></div>';
		viewer += '<script>';
		viewer += 'window.addEventListener("uvLoaded", function (e) {';
		viewer += 'createUV("#uv", {';
		viewer += 'iiifResourceUri: "' + config.IIIFUrl + '/' + object.pid + '/manifest",';
		viewer += 'configUri: "' + config.rootUrl + '/libs/universalviewer/uv-config.json",';
		viewer += 'root: "../..' + config.rootRoute + '/libs/universalviewer/uv",';
		viewer += '}, new UV.URLDataProvider());';
		viewer += '}, false);';
		viewer += '</script>';
	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getAudioPlayer(objectData, type) {
	var player = '<div id="audio-player" class="viewer-section">', tn, stream;
	var extension = "mp3";

	tn = config.rootUrl + "/datastream/" + objectData.pid + "/tn";
	stream = config.rootUrl + "/datastream/" + objectData.pid + "/mp3";

	if(config.audioPlayer == "browser") {
		player += '<div id="viewer-content-wrapper"><audio controlsList="nodownload" controls><source src="' + stream + '" type="' + objectData.mime_type + '"></audio></div>';
		player += '</div>';
	}
	else if(config.audioPlayer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		stream += "/file_name_spoof." + extension;
		player += '<script src="' + config.rootUrl + '/libs/jwplayer_du/jwplayer-du.js"></script>';
		player += '<div id="mediaplayer" class="viewer-content">Loading JW Player...</div>';
		player += '</div>';
		player += '<script>jwplayer("mediaplayer").setup({'
		player +=     'file: "' + stream + '",'
		player +=     'image: "' +  tn + '",'
		player +=     'width: 500,'
		player +=     'height: 300,'
		player +=     'aspectratio: "16:9",'
		player +=     'primary: "flash",'
		player +=     'androidhls: "true"'
		player += '});</script>';
	}
	else {
		player += 'Viewer is down temporarily.  Please check configuration</div>';
	}

	return player;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getVideoViewer(objectData) {
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream, url;
	var extension = "", datastreamID = "";

	tn = config.rootUrl + "/datastream/" + objectData.pid + "/tn";
	if(objectData.mime_type == "video/mp4") {
		extension = "mp4";
		datastreamID = "mp4";
	}
	else if(objectData.mime_type == "video/quicktime") {
		extnsion = "mov";
		datastreamID = "mov";
	}
	else {
		console.log("Error: Incorrect object mime type for object: " + objectData.pid);
	}
	stream = config.rootUrl + "/datastream/" + objectData.pid + "/" + datastreamID;

	if(config.videoViewer == "videojs") {
		viewer += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + tn + '" data-setup="{}"><source src="' + stream + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
		viewer += '</div>';
	}
	else if(config.videoViewer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		url += "/file_name_spoof." + extension;
		viewer += '<script src="' + config.rootUrl + '/libs/jwplayer_du/jwplayer-du.js"></script>';
		viewer += '<div id="mediaplayer" class="viewer-content">Loading JW Player...</div>';
		viewer += '</div>';
		viewer += '<script>jwplayer("mediaplayer").setup({'
		viewer +=     'file: "' + stream + '",'
		viewer +=     'image: "' +  tn + '",'
		viewer +=     'width: 500,'
		viewer +=     'height: 300,'
		viewer +=     'aspectratio: "16:9",'
		viewer +=     'primary: "flash",'
		viewer +=     'androidhls: "true"'
		viewer += '});</script>';
	}
	else {
		viewer += 'No video viewer is enabled.  Please check configuration</div>';
	}

	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getSmallImageViewer(objectData) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">';

	var image = Repository.getDatastreamUrl("jpg", objectData.pid);

	viewer += '<div id="viewer-content-wrapper" class="small-image"><img class="viewer-content" src="' + image + '"/></div>';
	viewer += '</div>';

	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getLargeImageViewer(objectData) {
	var viewer = '<div id="large-image-viewer" class="viewer-section">',
		viewerImages = config.openseadragonImagePath;

	viewer += "<span id='display-message' >Loading image, please wait...</span>";
	if(config.largeImageViewer == "openseadragon") {

		viewer += '<div id="viewer-content-wrapper"><div id="openseadragon1" class="viewer-content" style="width: 96%; margin: 0 auto"><span id="large-image-viewer-loading"></span></div>';
		viewer += '</div>';
		viewer += '<script src="' + config.rootUrl + '/libs/openseadragon/openseadragon.min.js"></script>';
		viewer += '<script>var viewer = OpenSeadragon({'
		viewer +=     'id: "openseadragon1",'
		viewer +=     'prefixUrl: "' + config.rootUrl + viewerImages + '",'
		viewer +=     'immediateRender: true,'
		viewer +=     'showNavigator: true,'
		viewer +=     'tileSources: "' + config.cantaloupeUrl + '/iiif/2/' + objectData.pid + '"'
		viewer += '});'
		viewer += 'viewer.addHandler("tile-loaded", function(event) {document.getElementById("display-message").style.display = "none"})'
		viewer += '</script>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration';
	}

	viewer += '</div>';
	return viewer;
}

/**
 * 
 *
 * @param 
 * @return 
 */
function getPDFViewer(objectData) {
	var viewer = '<div id="pdf-viewer" class="viewer-section">';
	var doc = config.rootUrl + "/datastream/" + objectData.pid + "/OBJ";

	if(config.pdfViewer == "browser") {
		viewer += '<iframe class="viewer-content" src="' + doc + '" height="500px" type="application/pdf" ></iframe>';
		viewer += '</div>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration</div>';
	}

	return viewer;
}	