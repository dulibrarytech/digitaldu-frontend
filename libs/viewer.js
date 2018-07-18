'use strict'

var config = require('../config/config');
// var	Repository = require('./repository');
var Repository = require('./repository.fedora');

/*
 * Viewer module
 */

exports.getObjectViewer = function(object, mimeType="") {
 	var viewer = "";
 	//var contentModel = typeof object["rels-ext_hasModel"] != 'string' ? object["rels-ext_hasModel"][0] : object["rels-ext_hasModel"];

 	if(mimeType == "" && typeof object.mime_type != 'undefined') {
 		mimeType = object.mime_type;
 	}

 	switch(mimeType) {
 		case "audio/mpeg":
 		case "audio/x-wav":
 			viewer = getAudioPlayer(object, mimeType);
 			break;

 		case "video/mp4":
 		case "video/quicktime":
 			viewer = getVideoViewer(object);
 			break;

 		case "image/png":
 		case "image/jpeg":
 			//viewer = getSmallImageViewer(object);
 			viewer = getLargeImageViewer(object);
 			break;

 		case "image/tiff":
 		case "image/jp2":
 			viewer = getLargeImageViewer(object);
 			break;

 		case "application/pdf":
 			viewer = getPDFViewer(object);
 			break;

 		default:
 			console.log("Viewer error: invalid content model");
 			viewer = "";
 			break;
 	}

 	return viewer;
}

function getAudioPlayer(objectData, type) {
	var player = '<div id="audio-player" class="viewer-section">', tn, stream;
	var extension = "mp3";

	tn = Repository.getDatastreamUrl("tn", objectData.pid);
	stream = Repository.getDatastreamUrl("mp3", objectData.pid);

	if(config.audioPlayer == "browser") {
		player += '<div id="viewer-content-wrapper"><audio controls><source src="' + stream + '" type="audio/mpeg"></audio></div>';
		player += '</div>';
	}
	else if(config.audioPlayer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		stream += "/file_name_spoof." + extension;

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

function getVideoViewer(objectData) {
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream, url;
	var extension = "mp4";

	tn = Repository.getDatastreamUrl("tn", objectData.pid);
	if(objectData.mime_type == "video/mp4") {
		stream = Repository.getDatastreamUrl("mp4", objectData.pid);
	}
	else if(objectData.mime_type == "video/quicktime") {
		stream = Repository.getDatastreamUrl("mov", objectData.pid);
	}
	else {
		console.log("Error: Incorrect object mime type for object: " + objectData.pid);
	}

	url = config.rootUrl + "/media/" + objectData.pid;

	if(config.videoViewer == "videojs") {
		viewer += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + tn + '" data-setup="{}"><source src="' + stream + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
		viewer += '</div>';
	}
	else if(config.videoViewer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		url += "/file_name_spoof." + extension;
		viewer += '<div id="mediaplayer" class="viewer-content">Loading JW Player...</div>';
		viewer += '</div>';
		viewer += '<script>jwplayer("mediaplayer").setup({'
		viewer +=     'file: "' + url + '",'
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

function getSmallImageViewer(objectData) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">';

	var image = Repository.getDatastreamUrl("jpg", objectData.pid);

	viewer += '<div id="viewer-content-wrapper"><img class="viewer-content" src="' + image + '"/></div>';
	viewer += '</div>';

	return viewer;
}

function getLargeImageViewer(objectData) {
	var viewer = '<div id="large-image-viewer" class="viewer-section">',
		viewerImages = config.openseadragonImagePath;

	if(config.largeImageViewer == "openseadragon") {

		viewer += '<div id="viewer-content-wrapper"><div id="openseadragon1" class="viewer-content" style="width: 96%; margin: 0 auto"><span id="large-image-viewer-loading"></span></div>';
		viewer += '</div>';

		viewer += '<script>var viewer = OpenSeadragon({'
		viewer +=     'id: "openseadragon1",'
		viewer +=     'prefixUrl: "' + config.baseUrl + viewerImages + '",'
		viewer +=     'immediateRender: true,'
		viewer +=     'showNavigator: true,'
		viewer +=     'tileSources: "http://localhost:' + config.cantaloupePort + '/iiif/2/' + objectData.pid + '"'
		viewer += '});</script>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration';
	}

	viewer += '</div>';
	return viewer;
}

function getPDFViewer(objectData) {

	var viewer = '<div id="pdf-viewer" class="viewer-section">';
	var doc = Repository.getDatastreamUrl("pdf", objectData.pid);

	if(config.pdfViewer == "browser") {
		viewer += '<iframe class="viewer-content" src="' + doc + '" height="500px"></iframe>';
		viewer += '</div>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration</div>';
	}

	return viewer;
}	