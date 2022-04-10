/*
 * global view events
 */

'use strict'

import { Configuration } from '../config/configuration.js';

$( document ).ready(function() {

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

	$("#home-search #search-options select").change(function(event) {
		let selected = $(this).children().children("option:selected").attr("data-label");
		if(typeof selected == 'undefined') {
			selected = $(this).children("option:selected").val();
		}
		$("#home-search #search-options button div").html(selected);
	});
});