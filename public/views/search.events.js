'use strict'

import { Configuration } from '../config/configuration.js';

$( document ).ready(function() {
	$("#add-query-button").click(function(event) {
		$("#add-query-button").blur();
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
});