/*
 * Creates the view object containing the paginator data
 * Nodejs is awesome
 */

const url = require('url');

/*
 *
 *
 * 
 */
exports.create = function(items, page, maxItems, totalItems, path) {
	var pagination = {
		page: page || 1,
		beginCount: 0,
		pageHits: 0,
		totalHits: 0,
		buttons: {},
		path: {},
		pageCount: 0
	};

	// View button data
	pagination.path = {
		prev: "",
		next: "",
		root: ""
	}

	// Check the path for the '?' character.  If it exists, add 'page' as an additional variable.  If not, 'page' is the first querystring variable, so use '?'
	var prefix = path.indexOf("?") >= 0 ? "&" : "?";

	// Remove the page variable if it exists in the path.  The page will be added below
	var pattern = /[?&]page=[0-9]*/i;
	if(path.search("page=") > 0) {
		path = path.replace(pattern, "");
	}

	// Get total number of pages to be displayed in the page list
	pagination.pageCount = totalItems / maxItems;

	// First item on the current page
	pagination.beginCount = (maxItems * (page-1)) + 1;

	// Get the max number of "hits"  displayed as of this page.  
	if(items.length < maxItems) {
		// This is the 'last page'.  Page hits should == the total number of hits here
		pagination.pageHits = (pagination.beginCount - 1) + items.length;
	}
	else {	
		pagination.pageHits = items.length * page;
	}

	// The total number of search results
	pagination.totalHits = totalItems;
	pagination.buttons = getButtons(items.length, page, maxItems, totalItems);

	// Add the path to the prev/next buttons
	if(pagination.buttons.prev > 0) {
		pagination.path.prev = path + prefix + "page=" + parseInt(pagination.buttons.prev);
	}
	if(pagination.buttons.next > 0) {
		pagination.path.next = path + prefix + "page=" + parseInt(pagination.buttons.next);
	}
	pagination.path.root = path + prefix;

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

	// This is the first page
	if(pageItemCount < maxItems || pageItemCount == maxItems && totalItems % maxItems == 0) {
		buttons.next = 0;
		buttons.prev = page-1;
	}

	// This is the last page
	else if(pageItemCount == maxItems && page == 1) {
		buttons.next = page+1;
		buttons.prev = 0;
	}

	// Any other page between first/last
	else {
		buttons.next = page+1;
		buttons.prev = page-1;
	}

	return buttons;
}

var getPageList = function() {

}