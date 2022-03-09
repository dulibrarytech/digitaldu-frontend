/*
 * Universal Viewer view interface with Digital-du
 * Embeds Kaltura viewer
 * Adds the Transcript viewer button and section
 */

$( document ).ready(function() {
	$( "#uv" ).on("uvElementLoaded", function(event, params) {
		if(params.isCompound) {
			$("#uv").addClass("compound-object");
		}

		// Embed a Kaltura viewer in the universalviewer UI
		if(params.embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		$(".mwPlayerContainer").css("display", "none");
	  		$(".transcriptInterface").css("width", "98%");

			setTimeout(function(){  
				// Replace UV viewer content with the Kaltura viewer content
		  		$( "#uv" ).css("visibility", "visible");
		  		$( "#uv" ).css("background-color", "#000000");
	  			$("#uv .imageBtn.share").css("visibility", "hidden");
		  		$("[id^=mep_]").html("");
		  		$("[id^=mep_]").append(params.viewerContent);

		  		// Handle UV left panel thumbnail click event
		  		$(".thumb").on("click", function(event) {
					let part = parseInt($(this)[0].id.replace("thumb", "")) + 1;

					// Get the Kaltura viewer content, add to viewer
		  			let kalturaViewerUri = params.baseUrl + "/viewer/kaltura/" + params.objectID + "/" + part + params.apikey;
		  			$.get(kalturaViewerUri, function(viewerContent, status) {
					    if(status == "success") {$("[id^=mep_]").html(viewerContent)}
					    else {console.log("Error: Can not retrieve Kaltura content. Status is ", status)}
					});
		  		});
		  	}, 1000);

			// Set the extents of the transcript view section
			var uvExpandHeight = $(".uv").height() + 220, // 1020px
				uvCollapseHeight = $(".uv").height() - 81, 	// 719px
				mainPanelExpandHeight = $(".uv").height() + 180,  // 980px
				mainPanelCollapseHeight = $(".uv").height() - 81;  // 719px

			// Add the 'show transcript' button if there is transcript data present
			if($("#view-transcript").length < 1) {
				$("#object-view-controls").append("<button id='view-transcript' alt='view transcript' type='button'>View Transcript</button>");
			}

			// Add event with Kaltura element resizing to show and hide the transcript view section
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