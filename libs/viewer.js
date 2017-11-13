'use strict'

var config = require('../config/config'),
	Repository = require('./repository');

/*
 * Viewer module
 */

exports.getObjectViewer = function(object) {
 	var viewer = "";

 	switch(object["rels-ext_hasModel"][0]) {
 		case "videoCModel":
 			viewer = getVideoViewer(object);
 			break;
 		default:
 			console.log("Display error: invalid content model");
 			viewer = "";
 			break;
 	}

 	return viewer;
}

function getVideoViewer(objectData) {
	var viewer = '<div id="video-viewer">';

	var poster = Repository.getTNUrl(objectData.pid.replace('_', ':'));
	var stream = Repository.getMP4Url(objectData.pid.replace('_', ':'));

	viewer += '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="' + poster + '" data-setup="{}"><source src="' + stream + '" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
	viewer += '</div>';

	return viewer;
}