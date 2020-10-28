/*
 * object view events
 */

'use strict'

import { Configuration } from '../config/configuration.js';
import { Downloader } from '../assets/js/downloader.js';

$( document ).ready(function() {
	$(".download-button").click(function(event) {
  		Downloader.downloadBatch($(".download-button").prop("value"), Configuration.getSetting('wsUrl'));
	});

	$("#copy-manifest-link").click(function(event) {
		var r = document.createRange();
		var iiifLink = document.getElementById("copy-manifest-link").previousSibling;
		r.selectNode(iiifLink);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
	});

	$("#transcript-view-wrapper").css("display", "none");
	$("#view-transcript").click(function(event) {
  		if($("#viewer-section").hasClass("transcript-visible") == false) {
			$("#view-transcript").html("Hide Transcript");
			$("#viewer-section").addClass("transcript-visible");
			$("#transcript-view-wrapper").css("display", "block")
  		}
  		else {
			$("#view-transcript").html("View Transcript");
			$("#viewer-section").removeClass("transcript-visible");
			$("#transcript-view-wrapper").css("display", "none");
  		}
  	});
  	$("#view-citations").click(function(event) {
  		if($(".object-citations").hasClass("panel-collapsed")) {
  			$(".object-citations").removeClass("panel-collapsed");
  			$("#view-citations").html("Hide Citations");
  			$("#view-citations").attr("alt", "Hide Citations");
  		}
  		else {
  			$(".object-citations").addClass("panel-collapsed");
  			$("#view-citations").html("Cite This Item");
  			$("#view-citations").attr("alt", "View Citations");
  		}
	});
});