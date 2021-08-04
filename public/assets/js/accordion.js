$(document).ready(function() {
	var acc = document.getElementsByClassName("accordion"), i;
	for (i = 0; i < acc.length; i++) {
	    acc[i].addEventListener("click", function() {
	        this.classList.toggle("active");

	        // Get the caret element
	        var caret;
	        for (var i = 0; i < this.childNodes.length; i++) {
	        	if(this.childNodes[i].className) {
	        		if(this.childNodes[i].classList.contains("facet-caret")) {
	        			caret = this.childNodes[i];
	        		}
	        	}    
			}

			// Toggle the caret right or down
			if(caret.classList.contains("fa-caret-right")) {
				caret.classList.remove("fa-caret-right");
				caret.classList.add("fa-caret-down");
				caret.setAttribute("aria-label", "Click to close panel")
			}
			else {
				caret.classList.remove("fa-caret-down");
				caret.classList.add("fa-caret-right");
				caret.setAttribute("aria-label", "Click to expand")
			}

			// Toggle the facet panel visibility and alignment
	        var panel = this.nextElementSibling;
	        if (panel.style.display === "block") {
	            panel.style.display = "none";
	        } else {
	            panel.style.display = "block";
	        }
	    });
	}
});

function updateUrlExpandParams(url) {
	var accordions = document.getElementsByClassName("accordion"), paramStr;

	for(var i=0; i<accordions.length; i++) {
		name = accordions[i].name.replace("_collapsible", "");
		if(name == "") {
			continue;
		}
		paramStr = "&expand[]=" + name;

		// Add the expand param for this accordion if it is open and the param is not already present
		if(accordions[i].classList.contains("active") && url.indexOf(paramStr) < 0) {
			url += paramStr;
		}

		// Remove the expand param if the accordion is not open
		else if(accordions[i].classList.contains("active") === false) {
			url = url.replace(paramStr, "");
		}
	}
	return url;
}