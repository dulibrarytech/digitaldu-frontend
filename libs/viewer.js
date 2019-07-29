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
	 Kaltura = require('./kaltura');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getObjectViewer = function(object, mimeType="") {
 	var viewer = "";

 	if(object == null) {
 		console.log("Viewer says: null object");
 		return viewer;
 	}

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
 			viewer += getAudioPlayer(object, mimeType);
 			break;

 		case "video":
 			viewer += getVideoViewer(object);
 			break;

 		case "smallImage":
 			viewer += getLargeImageViewer(object);
 			break;

 		case "largeImage":
 			viewer += getLargeImageViewer(object);
 			break;

 		case "pdf":
 			viewer += getPDFViewer(object);
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
exports.getCompoundObjectViewer = function(object) {
 	var viewer = "";

 	// IF video this is the kaltura player

 	// Get viewer for object mime type:
 	switch(config.compoundObjectViewer) {
 		case "universalviewer":
 			viewer += getIIIFObjectViewer(object, "1", config.universalViewerKalturaPlayer);
 			break;

 		default:
 			console.log("Viewer error: No compound viewer found.  Please check configuration");
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
function getAudioPlayer(object, type) {
	var player = '<div id="audio-player" class="viewer-section">', tn, stream;
	var extension = "mp3";

	tn = config.rootUrl + "/datastream/" + object.pid + "/tn";
	stream = config.rootUrl + "/datastream/" + object.pid + "/mp3";

	switch(config.audioPlayer) {
		case "browser":
			player += getHTMLAudioPlayer(tn, stream, object.mime_type);
			break;
		case "jwplayer":
			player += getJWPlayer(tn, stream, extension, config.jwplayerPathToLibrary);
			break;
		case "universalviewer":
			player += getIIIFObjectViewer(object, null, config.universalViewerKalturaPlayer);
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
function getVideoViewer(object) {
	var viewer = '<div id="video-viewer" class="viewer-section">', tn, stream, url;
	var extension = "", datastreamID = "";

	tn = config.rootUrl + "/datastream/" + object.pid + "/tn";
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
	stream = config.rootUrl + "/datastream/" + object.pid + "/" + datastreamID;

	switch(config.videoViewer) {
		case "videojs":
			viewer += getVideojsViewer(tn, stream, object.mime_type);
			break;
		case "jwplayer":
			viewer += getJWPlayer(tn, stream, extension, config.jwplayerPathToLibrary);
			break;
		case "universalviewer":
			viewer += getIIIFObjectViewer(object, null, config.universalViewerKalturaPlayer);
			break;
		case "kaltura":
			viewer += getKalturaViewer(object, {
				partner_id: config.kalturaPartnerID,
				uiconf_id: config.kalturaUI_ID,
				entry_id: object.entry_id,
				unique_object_id: config.kalturaUniqueObjectID,
				title: object.title
			});
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
function getSmallImageViewer(object) {
	var viewer = '<div id="small-image-viewer" class="viewer-section">';

	var image = Repository.getDatastreamUrl("jpg", object.pid);

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
function getLargeImageViewer(object) {
	var viewer = "";

	switch(config.largeImageViewer) {
		case "browser":
			viewer += getSmallImageViewer(object);
			break;

		case "openseadragon":
			viewer += getOpenSeadragonViewer(object, imagePath, imageServerUrl);
			break;

		case "universalviewer":
			viewer += getIIIFObjectViewer(object);
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
function getPDFViewer(object) {
	var viewer = '<div id="pdf-viewer" class="viewer-section">';
	var doc = "/datastream/" + object.pid + "/OBJ";

	switch(config.pdfViewer) {
		case "browser":
			viewer += '<iframe class="viewer-content" src="' + doc + '" height="500px" type="application/pdf" ></iframe>';
			break;
		case "universalviewer": 
			viewer += getIIIFObjectViewer(object);
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
function getIIIFObjectViewer(object, part=null, embedKalturaViewer=false) {

	// Embed the Kaltura player in the Universalviewer	
	let kalturaViewer = "", 
		entryID = "",
		eventTriggers = "";

	// Option to embed the Kaltura player into this Universalviewer	instance
	if(embedKalturaViewer) {
		// If a part value is present, assume the object is compound, and view this part
		if(part && isNaN(part) == false) {

			// Locate the entry_id for the requested compound object part
			for(var index in object.display_record.parts) {
				if(object.display_record.parts[index].order == part) {
					entryID = object.display_record.parts[index].entry_id;
				}
			}
		}

		// This is not a compound object.  Just grab the entry_id from the object
		else {
			entryID = object.entry_id || "";
		}

		// Get the player content
		kalturaViewer = getKalturaViewer(object, {
			partner_id: config.kalturaPartnerID,
			uiconf_id: config.kalturaUI_ID,
			entry_id: entryID,
			unique_object_id: config.kalturaUniqueObjectID
		});

		// Add the event trigger to embed the Kaltura player 
		eventTriggers += '$( "#uv").trigger( "uvloaded", [ ' + embedKalturaViewer + ', "' + object.pid + '", "' + config.universalViewerMediaElement + '", "' + kalturaViewer + '" ] );';
	}

	let viewer = '<div id="uv" class="uv"></div>';
		viewer += '<script>';
		viewer += 'window.addEventListener("uvLoaded", function (e) {';
		viewer += 'createUV("#uv", {';
		viewer += 'iiifResourceUri: "' + config.IIIFUrl + '/' + object.pid + '/manifest",';
		viewer += 'configUri: "' + config.rootUrl + '/libs/universalviewer/uv-config.json",';
		viewer += 'root: "../..' + config.appPath + '/libs/universalviewer/uv",';
		viewer += '}, new UV.URLDataProvider());';
		viewer += eventTriggers;
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
 function getOpenSeadragonViewer(object, osdPath, imagePath, serverUrl) {
	var viewer = "";

 	viewer += "<span id='display-message' >Loading image, please wait...</span>";
	viewer += '<div id="large-image-viewer" class="viewer-section">'
	viewer += '<div id="viewer-content-wrapper"><div id="openseadragon1" class="viewer-content" style="width: 96%; margin: 0 auto"><span id="large-image-viewer-loading"></span></div>';
	viewer += '</div>';
	viewer += '<script src="' + osdPath + '"></script>';
	viewer += '<script>var viewer = OpenSeadragon({'
	viewer +=     'id: "openseadragon1",'
	viewer +=     'prefixUrl: "' + imagePath + '",'
	viewer +=     'immediateRender: true,'
	viewer +=     'showNavigator: true,'
	viewer +=     'tileSources: "' + serverUrl + '/iiif/2/' + object.pid + '"'
	viewer += '});'
	viewer += 'viewer.addHandler("tile-loaded", function(event) {document.getElementById("display-message").style.display = "none"})'
	viewer += '</script>';
	viewer += '</div>';

	return viewer;
 }