'use strict'

var config = require('../config/config');

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
	var viewer = "<div>[Viewer Here...]</div>";	// TEST viewer

	viewer = '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="http://localhost:9006/assets/img/dev/MY_VIDEO_POSTER.jpg" data-setup="{}"><source src="http://techslides.com/demos/sample-videos/small.mp4" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';
	//viewer = '<video id="my-video" class="video-js" controls preload="auto" width="640" height="264" poster="http://localhost:9006/assets/img/dev/MY_VIDEO_POSTER.jpg" data-setup="{}"><source src="http://localhost:9006/assets/img/dev/small.mp4" type="video/mp4"><p class="vjs-no-js">To view this video please enable JavaScript, and consider upgrading to a web browser that<a href="http://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a></p></video>';

	return viewer;
}