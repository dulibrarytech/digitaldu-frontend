'use strict'

//import { Configuration } from '../../config/configuration.js';

function initDaterangeSlider(fromDate, toDate) {
	$("#slider").slider({
        min: fromDate,
        max: toDate,
        step: 1,
        values: [fromDate, toDate],
        slide: function(event, ui) {
            for (var i = 0; i < ui.values.length; ++i) {
                $("input.sliderValue[data-index=" + i + "]").val(ui.values[i]);
            }
        }
    });

    $("input.sliderValue").change(function() {
        var $this = $(this);
        $("#slider").slider("values", $this.data("index"), $this.val());
    });

	$('#slider > span').mousedown(function(e){
	  $('.form-control').css("color", "black");
	  $(".form-validation-error-message").remove();
	});
}

var validateDaterangeForm = function() {
	var isValid = true;
	var from = $("#date-from").val();
	var to = $("#date-to").val();
	const year = /^[0-9][0-9][0-9][0-9]$/;

	if(from.match(year) == null){
		$("#date-from").css("color", "red");
		$("#date-from").parent().append("<span class='form-validation-error-message' style='color: red'>Please use YYYY format for date</span>");
		isValid = false;
	}

	if(to.match(year) == null) {
		$("#date-to").css("color", "red");
		$("#date-to").parent().append("<span class='form-validation-error-message' style='color: red'>Please use YYYY format for date</span>");
		isValid = false;
	}

	if(to <= from) {
		$("#date-to").css("color", "red");
		$("#date-to").parent().append("<span class='form-validation-error-message' style='color: red'>To date must be greater than From date</span>");
		isValid = false;
	}
	return isValid;
}

var submitDateRange = function() {
	if(validateDaterangeForm()) {
		var decoded = decodeURIComponent(window.location.href);
		var url, queryPrefix = decoded.indexOf("?") >= 0 ? "&" : "?";

		if(decoded.match(/[?&]from=[0-9]+&to=[0-9]+/g)) {
			url = decoded.replace(/from=[0-9]+&to=[0-9]+/g, $("#daterange-form").serialize());
		}
		else {
			url = decoded + queryPrefix + $("#daterange-form").serialize();
		}

		url = url.replace(/page=[1234567890]*/g, "");
		window.location.assign(encodeURI(url));
	}
}

var removeDateRange = function(from, to) {
	var searchUrl = decodeURIComponent(window.location.href);
	window.location.assign(encodeURI(searchUrl.replace(/[?&]{0,1}from=[0-9]+&to=[0-9]+/g, "")));
}