$( document ).ready(function() {
	// UV Kaltura viewer: embed the Kaltura viewer, controls, and events
	$( "#uv" ).on("uvloaded", function(event, embedKalturaViewer, objectID, universalViewerMediaElement, viewerContent) {
		// Embed a Kaltura viewer in the universalviewer UI
		if(embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
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

			// Add view transcript button, define Kaltura transcript viewer hide/show functionality
		  	var uvExpandHeight = "1020px",
				uvCollapseHeight = "718px",
				mainPanelExpandHeight = "980px",
				mainPanelCollapseHeight = "718px";

			/*
		 	 * Append a 'view transcript' button (and event actions) if it is not already present.  
		 	 * This is a special instance of the transcript button that expands the universal viewer height to show the embedded Kaltura viewer's transcript section
		 	 * and works independently of the main UI button.  
		 	 */
			if($("#view-transcript").length < 1) {
				$("#object-view-controls").append("<button id='view-transcript' type='button'>View Transcript</button>");
			}

			// Remove default click event, add event with Kaltura element resizing
			$("#view-transcript").unbind("click");
		  	$("#view-transcript").click(function(event) {

		  		// Show the transcript viewer
		  		if($("#viewer-section").hasClass("transcript-visible") == false) {
					$("#view-transcript").html("Hide Transcript");
					$("#viewer-section").addClass("transcript-visible");
					$( ".uv" ).css("height", uvExpandHeight);
					$( ".mainPanel" ).css("height", mainPanelExpandHeight);
		  		}
		  		// Hide the transcript viewer
		  		else {
					$("#view-transcript").html("View Transcript");
					$("#viewer-section").removeClass("transcript-visible");
					$( ".uv" ).css("height", uvCollapseHeight);
					$( ".mainPanel" ).css("height", mainPanelCollapseHeight);
		  		}
		  	});
	  	}
	});
});
