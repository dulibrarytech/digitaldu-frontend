$(window).bind("pageshow", function(event) {
	// Back button
	if (event.persisted || (typeof window.performance != "undefined" && (window.performance.navigation.type === 2 || window.performance.navigation.type === 0))) {
		restoreFormData();
	}
});

var changeAdvSearchTypeSel = function(element, autocompleteData) {
	let id = element.id,
		index = id.substring(29),
		selValue = $("#" + id + " option:selected").text();

	if(selValue == "Call Number") {
		// Remove 'Contains' option
		// let typeOpts = $("#advanced-search-type-select-" + index).children().children();
		// $(typeOpts[0]).remove();
	}

	else if(selValue == "Collection") {
		// Remove 'Contains' option
		let typeOpts = $("#advanced-search-type-select-" + index).children().children();
		$(typeOpts[0]).remove();

		// Get list of collection names for autocmplete
		var collectionNames = [];
		for(var i in autocompleteData.collectionData) {
			collectionNames.push(autocompleteData.collectionData[i].name);
		}

		// Init the jquery autocomplete library, with update to only show suggestions that match the current input characters
	    $( "#advanced-search-box-" + index ).autocomplete({
	    	source: function(req, responseFn) {
	        var re = $.ui.autocomplete.escapeRegex(req.term);
	        var matcher = new RegExp( "^" + re, "i" );
	        var a = $.grep(collectionNames, function(item,index){
	            return matcher.test(item);
	        });
	        responseFn(a);
	      }
	    });
	}
}

var addFormRow = function() {
	let formRow = "<div class='form-inline'>";
	formRow += $("#advanced-search .form-inline:first-child").html();
	formRow += "</div>";
	$("#advanced-search").append(formRow);

	// Set the form element id values with a row index suffix
	$("#advanced-search .form-inline:last-child .advanced-search-bool-select").attr("id", "advanced-search-bool-select-" + parseInt($("#advanced-search .form-inline").length));
	$("#advanced-search .form-inline:last-child .advanced-search-field-select").attr("id", "advanced-search-field-select-" + parseInt($("#advanced-search .form-inline").length));
	$("#advanced-search .form-inline:last-child .advanced-search-type-select").attr("id", "advanced-search-type-select-" + parseInt($("#advanced-search .form-inline").length));
	$("#advanced-search .form-inline:last-child .advanced-search-box").attr("id", "advanced-search-box-" + parseInt($("#advanced-search .form-inline").length));
}

var storeFormData = function() {
	var formState = [],
		formRowValues = {},
	 	searchFieldRows = $('.advanced-search-field-select');

	var rowIndex;
	for(row in searchFieldRows) {
		if(isNaN(row) == false) {
			formRowValues = {};
			rowIndex = parseInt(row)+1;
			formRowValues["bool_select"] = $("#advanced-search-bool-select-" + rowIndex).val();
			formRowValues["field_select"] = $("#advanced-search-field-select-" + rowIndex).val();
			formRowValues["type_select"] = $("#advanced-search-type-select-" + rowIndex).val();
			formRowValues["search_box"] = $("#advanced-search-box-" + rowIndex).val();
			formState[row] = formRowValues;
		}
	}
	localStorage.setItem("ADVANCED_SEARCH_FORM_STATE", JSON.stringify(formState));
}

var restoreFormData = function() {
	// Restore, then clear local storage
	var formState = JSON.parse(localStorage.getItem("ADVANCED_SEARCH_FORM_STATE")) || {}

	// Update rows
	var row;
	for(var index in formState) {
		// Do not add the first row, it is rendered with each page load
		if(index > 0) {
			addFormRow();
		}
		row = parseInt(index) + 1;

		// Update the form element values
		$("#advanced-search-bool-select-" + row).val(formState[index].bool_select)
		$("#advanced-search-field-select-" + row).val(formState[index].field_select);
		$("#advanced-search-type-select-" + row).val(formState[index].type_select);
		$("#advanced-search-box-" + row).val(formState[index].search_box);
	}
	localStorage.setItem("ADVANCED_SEARCH_FORM_STATE", null);
}

var updateFormFieldValues = function(autocompleteData) {
	var searchFieldInputs = $('.advanced-search-field-select');
	for(var key in searchFieldInputs) {
		if(isNaN(key) == false) {
			let rowIndex = parseInt(key) + 1;
			// Update form data
			if($("#" + searchFieldInputs[key].id).val() == "collection") {
				// Get the pid that corresponds with the selected collection title, replace the input value with the pid
				for(var i in autocompleteData.collectionData) {
					if(autocompleteData.collectionData[i].name == $("#advanced-search-box-"+rowIndex).val()) {
						$("#advanced-search-box-"+rowIndex).val(autocompleteData.collectionData[i].pid);
					}
				}
			}
		}
	}
}