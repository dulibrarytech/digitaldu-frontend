$( document ).ready(function() {
	$( "#uv" ).on("uvloaded", function(event, params) {
			
		// Add compound object viewer page nave links
		if(params.pageSize > 0) {
			$("#object-view").append('<div id="sidebar-nav-buttons" style="display: none"></div>');
			$("#sidebar-nav-buttons").append('<a id="prev" href="' + params.prevLink + '" title="View previous items" style="visibility: hidden"><< Previous ' + params.pageSize + '</a>');
			$("#sidebar-nav-buttons").append('<a id="next" href="' + params.nextLink + '" title="View next items" style="visibility: hidden">Next ' + params.pageSize + ' >></a>');
		}
		if(params.prevLink) {$("#sidebar-nav-buttons #prev").css("visibility", "visible")}
		if(params.nextLink) {$("#sidebar-nav-buttons #next").css("visibility", "visible")}

		// Embed a Kaltura viewer in the universalviewer UI
		if(params.embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		$(".mwPlayerContainer").css("display", "none");
	  		$(".transcriptInterface").css("width", "98%");
	  		$(".outer-spinner").remove();

			setTimeout(function(){  
				// Replace UV viewer content with the Kaltura viewer content
		  		$( "#uv" ).css("visibility", "visible");
		  		$( "#uv" ).css("background-color", "#000000");
		  		$("[id^=mep_]").html("");
		  		$("[id^=mep_]").append(params.viewerContent);

		  		// Add thumbnail click event to load requested Kaltura viewer
		  		$(".thumb").on("click", function(event) {
					let part = parseInt($(this)[0].id.replace("thumb", "")) + 1,
						uri = $(this)[0].baseURI,
						baseUrl = uri.substring(0, uri.indexOf("/object"));

					// Get the Kaltura viewer content
		  			let kalturaViewerUri = baseUrl + "/viewer/kaltura/" + params.objectID + "/" + part;
		  			$.get(kalturaViewerUri, function(viewerContent, status) {
					    if(status == "success") {$("[id^=mep_]").html(viewerContent)}
					    else {console.log("Error: Can not retrieve Kaltura content. Status is ", status)}
					});
		  		});
		  	}, 1000);

			// Add view transcript button, define Kaltura transcript viewer hide/show functionality
			var uvExpandHeight = $(".uv").height() + 220, // 1020px
				uvCollapseHeight = $(".uv").height() - 81, 	// 719px
				mainPanelExpandHeight = $(".uv").height() + 180,  // 980px
				mainPanelCollapseHeight = $(".uv").height() - 81;  // 719px

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
