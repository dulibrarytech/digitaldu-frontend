/*
 * object view events
 */

'use strict'

import { Configuration } from '../config/configuration.js';
import { Downloader } from '../assets/js/downloader.js';

$( document ).ready(function() {
	$(".download-button").click(function(event) {
		let id = "#"+event.currentTarget.id,
			url = $(id).prop("value");
		if($(id).hasClass("batch-download-button")) {
			Downloader.downloadBatch(url, Configuration.getSetting('wsUrl'));
		}
		else {
			Downloader.submitLinkRequest(url, "");
		}
	});

	$(".show-download-options").click(function(event) {
		let downloadLinkList = $(".download-links");
			console.log("Download links", downloadLinkList);

		if(downloadLinkList.hasClass("panel-collapsed")) {
			downloadLinkList.removeClass("panel-collapsed");
			$(".show-download-options").html("Hide Download Options");
		}
		else {
			downloadLinkList.addClass("panel-collapsed");
			$(".show-download-options").html("Show Download Options");
		}
	});

	$(".download-links select").change(function(event) {
		let index = event.target.selectedIndex,
			buttonId = "download-button__" + index;
		$(".download-button").css("display", "none");
		$("#"+buttonId).css("display", "inline-block");
	})

	$(".copy-text-link").click(function(event) {
		// copy text to the clipboard
		var text = event.currentTarget.getAttribute('data-text');
		navigator.clipboard.writeText(text)
		.catch(err => {
			console.error('Error in copying text: ', err);
		});

		// show green checkmark feedback when copy icon is clicked
		let icon = event.target;
		let iconUrl = icon.src;
		icon.src = '/assets/img/text-copied.png';
		setTimeout(() => {
			icon.src = iconUrl;
		}, 2000);
	})

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