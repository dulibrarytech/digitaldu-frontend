'use strict'

import { Configuration } from '../config/configuration.js';

$( document ).ready(function() {
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
	$( "#goto-page-form" ).bind( "keydown", function(event) {
		if(event.keyCode == 13) {
			event.preventDefault();
		  	submitGotoPage(); 
		}
	});
	$('#set-page-number-button').click(function(event) {
		submitGotoPage(); 
	});
});