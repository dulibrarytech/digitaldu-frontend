$( document ).ready(function() {
    
	// Select an option in the results per page dropdown.  Reset page selection to 1 (no parameter), remove existing page count parameter
	$('#results-per-page').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/&resultsPerPage=[0-9]+/g, "");
		searchUrl = searchUrl.replace(/&*page=[0-9]+/g, "");
		searchUrl += "&resultsPerPage=" + $('#results-per-page').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$('#results-view-select').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/&view=[a-zA-Z0-9]+/g, "");
		searchUrl += "&view=" + $('#results-view-select').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$('#sort-by-select').change(function(event) {
		var searchUrl = decodeURIComponent(window.location.href).replace(/&sort=[a-zA-Z0-9,]+/g, "");
		searchUrl += "&sort=" + $('#sort-by-select').val();
		window.location.replace(encodeURI(searchUrl));
	});

	$("#add-query-button").click(function(event) {
		$("#add-query-button").blur();
	});

	$("#view-transcript").click(function(event) {
		var uvExpandHeight = "1020px",
			uvCollapseHeight = "718px",
			mainPanelExpandHeight = "980px",
			mainPanelCollapseHeight = "718px";

  		// Show the transcript viewer
  		if($("#viewer-section").hasClass("transcript-visible") == false) {
  			$( ".uv" ).css("height", uvExpandHeight);
			$( ".mainPanel" ).css("height", mainPanelExpandHeight);
			$("#view-transcript").html("Hide Transcript");
			$("#viewer-section").addClass("transcript-visible");
  		}

  		// Hide the transcript viewer
  		else {
  			$( ".uv" ).css("height", uvCollapseHeight);
			$( ".mainPanel" ).css("height", mainPanelCollapseHeight);
			$("#view-transcript").html("View Transcript");
			$("#viewer-section").removeClass("transcript-visible");
  		}
  	});
});


