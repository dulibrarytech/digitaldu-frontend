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
			}
			else {
				caret.classList.remove("fa-caret-down");
				caret.classList.add("fa-caret-right");
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