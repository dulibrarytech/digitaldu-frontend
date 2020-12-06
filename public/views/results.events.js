'use strict'

import { Configuration } from '../config/configuration.js';

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

	$('.facet-name > a').keypress(function(e){
	  if(e.which == 13) {
        console.log('You pressed enter!', e);
        e.target.onclick();
    }
	});

	$('.remove-facet').keypress(function(e){
	  if(e.which == 13) {
        console.log('You pressed enter!', e);
        e.target.onclick();
    }
	});
});