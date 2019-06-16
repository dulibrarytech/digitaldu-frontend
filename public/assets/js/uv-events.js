$( document ).ready(function() {
	$( "#uv" ).on("uvloaded", function(event, useKalturaViewer, objectID, universalViewerMediaElement, viewerContent) {
		
		if(useKalturaViewer) {
	  		$( "#uv" ).css("visibility", "hidden");
	  		$( "#uv" ).css("height", "1090px");
	  		$( ".uv" ).css("height", "1090px");

			setTimeout(function(){  
		  		$( "#uv" ).css("visibility", "visible");
		  		$("[id^=mep_]").html(viewerContent);

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
	});
});