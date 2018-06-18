/*
 * Creates the view object containing the paginator data
 * Nodejs is awesome
 */

const url = require('url');

exports.create = function(items, page, maxItems, totalItems, path) {
	var pagination = {
		page: page || 1,
		beginCount: 0,
		pageHits: 0,
		totalHits: 0,
		buttons: {},
		path: {}
	};

	// Remove the page variable if it exists in the path.  The page will be added below
	var pattern = /[?&]page=[0-9]*/i;
	if(path.search("page=") > 0) {
		path = path.replace(pattern, "");
	}

	// First item on the current page
	pagination.beginCount = (maxItems * (page-1)) + 1;

	// Items on the current page
	if(items.length < maxItems) {
		// This is the 'last page', when page count > number of items left to display.
		pagination.pageHits = (pagination.beginCount - 1) + items.length;
	}
	else {	
		pagination.pageHits = items.length * page;
	}

	// The total number of search results
	pagination.totalHits = totalItems;
	pagination.buttons = getButtons(items.length, page, maxItems, totalItems);

	pagination.path = {
		prev: "",
		next: ""
	}

	if(pagination.buttons.prev > 0) {
		pagination.path.prev = path + "&page=" + parseInt(pagination.buttons.prev);
	}
	if(pagination.buttons.next > 0) {
		pagination.path.next = path + "&page=" + parseInt(pagination.buttons.next);
	}

	return pagination;
}

var getButtons = function(pageItemCount, page, maxItems, totalItems) {
	var buttons = {
		prev: 0,
		next: 0
	}
		
	if(typeof page == "string") {
		page = parseInt(page);
	}

	if(pageItemCount < maxItems || pageItemCount == maxItems && totalItems % maxItems == 0) {
		buttons.next = 0;
		buttons.prev = page-1;
	}
	else if(pageItemCount == maxItems && page == 1) {
		buttons.next = page+1;
		buttons.prev = 0;
	}
	else {
		buttons.next = page+1;
		buttons.prev = page-1;
	}

	return buttons;
}