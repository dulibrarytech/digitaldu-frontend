'use strict'

var config = require('../config/config'),
	Repository = require('./repository');
var FedoraRepository = require('./repository.fedora');

/*
 * Viewer module
 */

exports.getObjectViewer = function(object) {
 	var viewer = "";
 	//var contentModel = typeof object["rels-ext_hasModel"] != 'string' ? object["rels-ext_hasModel"][0] : object["rels-ext_hasModel"];

 	var mimeType = "";
 	if(typeof object.mime_type != 'undefined') {
 		mimeType = object.mime_type;
 	}

 	switch(mimeType) {
 		case "audio/mpeg":
 			viewer = getAudioPlayer(object);
 			break;

 		case "video/mp4":
 		case "video/quicktime":
 			viewer = getVideoViewer(object);
 			break;

 		case "image/png":
 		case "image/jpeg":
 			viewer = getSmallImageViewer(object);
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

function getAudioPlayer(objectData) {
	var player = '<div id="audio-player" class="viewer-section">', tn, stream;
	var extension = "mp3";

	tn = FedoraRepository.getDatastreamUrl("tn", objectData.pid);
	//tn = Repository.getObjectTN(objectData.pid);
	stream = Repository.getDatastreamUrl("mp3", objectData.pid, "audio");

	// Local test data
	// tn = 'http://localhost:9006/assets/img/dev/MY_VIDEO_POSTER.jpg';
	// stream = 'http://localhost:9006/assets/img/dev/small.mp4';

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
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream;
	var extension = "mp4";

	tn = FedoraRepository.getDatastreamUrl("tn", objectData.pid);
	//tn = Repository.getDatastreamUrl("tn", objectData.pid);
		console.log("TEST tn", tn);
		console.log("TEST object data", objectData);

	if(objectData.mime_type == "video/mp4") {
		stream = Repository.getDatastreamUrl("mp4", objectData.pid, "video");
		//stream = FedoraRepository.getDatastreamUrl("video", objectData.pid);
	}
	
	else if(objectData.mime_type == "video/quicktime") {
		stream = Repository.getDatastreamUrl("mov", objectData.pid, "video");
	}
	else {
		console.log("Error: Incorrect object mime type for object: " + objectData.pid);
	}
	//stream = FedoraRepository.getDatastreamUrl("video", objectData.pid);
		console.log("TEST video stream", stream);

	if(config.videoViewer == "videojs") {
		viewer += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + tn + '" data-setup="{}"><source src="' + stream + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
		viewer += '</div>';
	}
	else if(config.videoViewer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		stream += "/file_name_spoof." + extension;

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
		console.log("TEST viewer: ", viewer);

	return viewer;
}

function getSmallImageViewer(objectData) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">';

	var image = Repository.getDatastreamUrl("jpg", objectData.pid, "image");

	viewer += '<div id="viewer-content-wrapper"><img class="viewer-content" src="' + image + '"/></div>';
	viewer += '</div>';

	return viewer;
}

function getLargeImageViewer(objectData) {
	var viewer = '<div id="large-image-viewer" class="viewer-section">',
		viewerImages = config.openseadragonImagePath;

	if(config.largeImageViewer == "openseadragon") {

		viewer += '<div id="viewer-content-wrapper"><div id="openseadragon1" class="viewer-content" style="width: 96%; height: 420px; margin: 0 auto"><span id="large-image-viewer-loading">Loading image...</span></div>';
		viewer += '</div>';

		viewer += '<script>var viewer = OpenSeadragon({'
		viewer +=     'id: "openseadragon1",'
		viewer +=     'prefixUrl: "/libs/openseadragon/images/",'
		viewer +=     'immediateRender: true,'
		viewer +=     'showNavigator: true,'
		viewer +=     'tileSources: "http://localhost:' + config.cantaloupePort + '/iiif/2/' + objectData.pid + '"'
		viewer += '});</script>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration/div>';
	}

	return viewer;
}

function getPDFViewer(objectData) {

	var viewer = '<div id="pdf-viewer" class="viewer-section">';
	var doc = FedoraRepository.getDatastreamUrl("pdf", objectData.pid);

	if(config.pdfViewer == "browser") {
		viewer += '<embed class="viewer-content" src="' + doc + '" height="500px" />';
		viewer += '</div>';
	}
	else {
		viewer += 'Viewer is down temporarily.  Please check configuration</div>';
	}

	return viewer;
}	