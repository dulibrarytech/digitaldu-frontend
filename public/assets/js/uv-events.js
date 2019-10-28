$( document ).ready(function() {

	var uvExpandHeight = "1020px",
		uvCollapseHeight = "718px",
		mainPanelExpandHeight = "980px",
		mainPanelCollapseHeight = "718px";
	
	// UV Kaltura viewer: embed the Kaltura viewer, controls, and events
	$( "#uv" ).on("uvloaded", function(event, embedKalturaViewer, objectID, universalViewerMediaElement, viewerContent) {
		if(embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		//$( ".uv" ).css("height", uvCollapseHeight);
	  		//$( ".mainPanel" ).css("height", mainPanelCollapseHeight);
	  		$(".mwPlayerContainer").css("display", "none");
	  		$(".transcriptInterface").css("width", "98%");

			setTimeout(function(){  
		  		$( "#uv" ).css("visibility", "visible");
		  		$("[id^=mep_]").html("");
		  		$("[id^=mep_]").append(viewerContent);

		  		$(".thumb").on("click", function(event) {
					let part = parseInt($(this)[0].id.replace("thumb", "")) + 1,
						uri = $(this)[0].baseURI,
						baseUrl = uri.substring(0, uri.indexOf("/object"));

		  			let kalturaViewerUri = baseUrl + "/viewer/kaltura/" + objectID + "/" + part;
		  			$.get(kalturaViewerUri, function(viewerContent, status){
					    if(status == "success") {
					    	$("[id^=mep_]").html(viewerContent);
					    }
					});
		  		});
		  	}, 500);
	  	}

	  	// Append the 'show transcript' button, attach the toggle visibility event
	  	//$("#object-view-controls").append("<button id='show-uv-kaltura-transcript-player' type='button'>View Transcript</button>");
	  	//$("#show-uv-kaltura-transcript-player").click(function(event) {
	  	// $("#view-transcript").click(function(event) {

	  	// 	// Show the transcript viewer
	  	// 	if($("#viewer-section").hasClass("transcript-visible") == false) {
	  	// 		$( ".uv" ).css("height", uvExpandHeight);
				// $( ".mainPanel" ).css("height", mainPanelExpandHeight);
				// $("#view-transcript").html("Hide Transcript");
				// $("#viewer-section").addClass("transcript-visible");
	  	// 	}

	  	// 	// Hide the transcript viewer
	  	// 	else {
	  	// 		$( ".uv" ).css("height", uvCollapseHeight);
				// $( ".mainPanel" ).css("height", mainPanelCollapseHeight);
				// $("#view-transcript").html("View Transcript");
				// $("#viewer-section").removeClass("transcript-visible");
	  	// 	}
	  	// });
	});
});

