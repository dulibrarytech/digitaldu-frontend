/*
 * Universal Viewer view interface 
 * Interfaces with viewer.js library 
 */

$( document ).ready(function() {
	$( "#uv" ).on("uvElementLoaded", function(event, params) {
		if(params.isCompound) {
			$("#uv").addClass("compound-object");
		}

		if(params.embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		$(".mwPlayerContainer").css("display", "none");
	  		$(".transcriptInterface").css("width", "98%");
	  		$(".outer-spinner").remove();

			setTimeout(function(){  
				// Append Kaltura viewer
		  		$( "#uv" ).css("visibility", "visible");
		  		$( "#uv" ).css("background-color", "#000000");
	  			$("#uv .imageBtn.share").css("visibility", "hidden");
		  		$("[id^=mep_]").html("");
		  		$("[id^=mep_]").append(params.viewerContent);

		  		// Handle UV left panel thumbnail click event
		  		$(".thumb").on("click", function(event) {
					let part = parseInt($(this)[0].id.replace("thumb", "")) + 1;

					// Get the Kaltura viewer content, add to viewer
		  			let kalturaViewerUri = params.baseUrl + "/viewer/kaltura/" + params.objectID + "/" + part;
		  			$.get(kalturaViewerUri, function(viewerContent, status) {
					    if(status == "success") {$("[id^=mep_]").html(viewerContent)}
					    else {console.log("Error: Can not retrieve Kaltura content. Status is ", status)}
					});
		  		});
		  	}, 1000);

			var uvExpandHeight = $(".uv").height() + 220, // 1020px
				uvCollapseHeight = $(".uv").height() - 81, 	// 719px
				mainPanelExpandHeight = $(".uv").height() + 180,  // 980px
				mainPanelCollapseHeight = $(".uv").height() - 81;  // 719px

			if($("#view-transcript").length < 1) {
				$("#object-view-controls").append("<button id='view-transcript' alt='view transcript' type='button'>View Transcript</button>");
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

/*
 *
 */
function initViewer(params) {

}

/*
 *
 */
function embedKalturaViewer(params) {

}

/*
 *
 */
function createTranscriptViewer(params) {

}