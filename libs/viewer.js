'use strict'

var config = require('../config/config'),
	Repository = require('./repository');

/*
 * Viewer module
 */

exports.getObjectViewer = function(object) {
 	var viewer = "";
 	var contentModel = typeof object["rels-ext_hasModel"] != 'string' ? object["rels-ext_hasModel"][0] : object["rels-ext_hasModel"];

 	switch(contentModel) {
 		case "videoCModel":
 			viewer = getVideoViewer(object);
 			break;

 		case "basicImageCModel":
 		case "smallImageCModel":
 			viewer = getSmallImageViewer(object);
 			break;

 		case "pdfCModel":
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
	var player = '';

	return player;
}

function getVideoViewer(objectData) {
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream;
	var extension = "mp4";

	tn = Repository.getDatastream("TN", objectData.pid.replace('_', ':'));
	stream = Repository.getDatastream("MP4", objectData.pid.replace('_', ':'));

	// Local test data
	// tn = 'http://localhost:9006/assets/img/dev/MY_VIDEO_POSTER.jpg';
	// stream = 'http://localhost:9006/assets/img/dev/small.mp4';

	if(config.videoViewer == "videojs") {
		viewer += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + tn + '" data-setup="{}"><source src="' + stream + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
		viewer += '</div>';
	}
	else if(config.videoViewer == "jwplayer") {
		// JWPlayer needs a filename in the path.  
		stream += "/file_name_spoof." + extension;

		viewer += '<div id=\"mediaplayer\">Loading JW Player...</div>';
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
		viewer += '</div>';
	}

	return viewer;
}

function getSmallImageViewer(objectData) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">';

	var image = Repository.getDatastream("MEDIUM_IMAGE", objectData.pid.replace('_', ':'));

	viewer += '<img src="' + image + '"/>';
	viewer += '</div>';

	return viewer;
}

function getLargeImageViewer(objectData) {
	var viewer = '';

	return viewer;
}

function getPDFViewer(objectData) {
		console.log("TEST pdf view function");
	var viewer = '<div id="pdf-viewer" class="viewer-section">';

	var doc = Repository.getDatastream("OBJ", objectData.pid.replace('_', ':'));

	if(config.pdfViewer == "browser") {
		viewer += '<embed src="' + doc + '"/>';
		viewer += '</div>';
	}
	else {
		viewer += '</div>';
	}

		console.log("TEST viewer", viewer);

	return viewer;
}	