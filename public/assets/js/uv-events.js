$( document ).ready(function() {
	$( "#uv" ).on("uvloaded", function(event, params) {
		$("#object-view").append('<div id="sidebar-nav-buttons" style="display: none"></div>');
		$("#sidebar-nav-buttons").append('<a id="prev" href="' + params.prevLink + '#uv" title="View previous items" style="visibility: hidden"><< Previous ' + params.pageSize + '</a>')
		$("#sidebar-nav-buttons").append('<a id="next" href="' + params.nextLink + '#uv" title="View next items" style="visibility: hidden">Next ' + params.pageSize + ' >></a>')
		if(params.prevLink) {$("#sidebar-nav-buttons #prev").css("visibility", "visible")}
		if(params.nextLink) {$("#sidebar-nav-buttons #next").css("visibility", "visible")}

		// Embed a Kaltura viewer in the universalviewer UI
		if(params.embedKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		$(".mwPlayerContainer").css("display", "none");
	  		$(".transcriptInterface").css("width", "98%");
	  		$(".outer-spinner").remove();

			setTimeout(function(){  
		  		$( "#uv" ).css("visibility", "visible");
		  		$("[id^=mep_]").html("");
		  		$("[id^=mep_]").append(params.viewerContent);

		  		$(".thumb").on("click", function(event) {
					let part = parseInt($(this)[0].id.replace("thumb", "")) + 1,
						uri = $(this)[0].baseURI,
						baseUrl = uri.substring(0, uri.indexOf("/object"));

		  			let kalturaViewerUri = baseUrl + "/viewer/kaltura/" + viewerContent.objectID + "/" + part;
		  			$.get(kalturaViewerUri, function(viewerContent, status) {
					    if(status == "success") {
					    	$("[id^=mep_]").html(params.viewerContent);
					    }
					});
		  		});
		  	}, 500);

			// Add view transcript button, define Kaltura transcript viewer hide/show functionality
		  	var uvExpandHeight = "1020px",
				uvCollapseHeight = "718px",
				mainPanelExpandHeight = "980px",
				mainPanelCollapseHeight = "718px";

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
