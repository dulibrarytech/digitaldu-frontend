  /**
    Copyright 2020 University of Denver

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

 /*
  *	Page element event handlers
  */

'use strict'

import { Configuration } from '../../config/configuration.js';
import { Downloader } from './downloader.js';

$( document ).ready(function() {
	$('#results-per-page').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/[&?]resultsPerPage=[0-9]+/g, "");
		searchUrl = searchUrl.replace(/&*page=[0-9]+/g, "");
		var prefix = searchUrl.indexOf("?") > 0 ? "&" : "?";
		searchUrl += prefix;
		searchUrl += "resultsPerPage=" + $('#results-per-page').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$('#results-view-select').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/[&?]view=[a-zA-Z0-9]+/g, "");
		searchUrl += "&view=" + $('#results-view-select').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$('#sort-by-select').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/[&?]sort=[a-zA-Z0-9, ]+/g, "").replace(/[&?]page=[a-zA-Z0-9, ]+/g, "");
		var prefix = searchUrl.indexOf("?") > 0 ? "&" : "?";
		searchUrl += prefix;
		searchUrl += "sort=" + $('#sort-by-select').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$( "#goto-page-form" ).bind( "keydown", function(event) {
		if(event.keyCode == 13) {
			event.preventDefault();
		  	submitGotoPage(); 
		}
	});

	$('#set-page-number-button').click(function(event) {
		submitGotoPage(); 
	});

	$("#add-query-button").click(function(event) {
		$("#add-query-button").blur();
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

  	$(".download-button").click(function(event) {
  		Downloader.downloadBatch($(".download-button").prop("value"), Configuration.getSetting('wsUrl'));
	});

	$("#home-search button").click(function(event) {
		event.preventDefault();
		$("#searchbox").val(DOMPurify.sanitize($("#searchbox").val()));
		$("#home-search").submit();
	});

	$(".banner-search button").click(function(event) {
		event.preventDefault()
		$(".banner-search form input[type='text']").val(DOMPurify.sanitize($(".banner-search form input[type='text']").val()));
		$(".banner-search form").submit();
	});

	$(".sidebar-search button").click(function(event) {
		event.preventDefault();
		$(".sidebar-search input[type='text']").val(DOMPurify.sanitize($(".sidebar-search input[type='text']").val()));
		$(".sidebar-search form").submit();
	});

	function submitGotoPage() {
		if($('#set-page-number').val().match(/^[0-9]+$/)) {
			var searchUrl = decodeURIComponent(window.location.href).replace(/[&?]page=[a-zA-Z0-9, ]+/g, ""),
				val = $('#set-page-number').val() <= parseInt($('#page-count').html()) ? $('#set-page-number').val() : parseInt($('#page-count').html());

			if(searchUrl.indexOf("?") >= 0) { searchUrl += ("&page=" + val) }
			else { searchUrl += ("?page=" + val) }
			window.location.replace(encodeURI(searchUrl));
		}
		else {
			console.log("Invalid input, must be integer")
		}
	}

	var accordions = document.getElementsByClassName("collapsible");
	for (var i = 0; i < accordions.length; i++) {
	    accordions[i].addEventListener("click", function() {
	        this.classList.toggle("active");
	        var content = document.getElementsByClassName("mods-display")[0];
	        if (content.style.display === "block") {
	            content.style.display = "none";
	        } else {
	            content.style.display = "block";
	        }
	    });
	}
});


