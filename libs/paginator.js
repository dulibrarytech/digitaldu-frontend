/*
 * Creates the view object containing the paginator data
 */

const url = require('url');
const config = require('../config/config');

/*
 * TODO Will revise this code for less clunkiness
 * TODO Will add header comments
 * 
 */
exports.create = function(items, page, maxItems, totalItems, path) {

	var pagination = {};
	pagination['page'] = page || 1;

	var pattern = /[?&]page=[0-9]*/i;
	if(path.search("page=") > 0) {
		path = path.replace(pattern, "");
	}

	// Determine is page param should be added as existing or initial param
	var prefix = path.indexOf("?") >= 0 ? "&" : "?";

	// Get total number of pages to be displayed in the page list
	pagination['pageCount'] = Math.ceil(totalItems / maxItems);

	// First item on the current page
	pagination['beginCount'] = (maxItems * (page-1)) + 1;

	// Get the max number of hits displayed as of this page.  
	if(items.length < maxItems) {
		// This is the last page.  Page hits should == the total number of hits here
		pagination['pageHits'] = (pagination.beginCount - 1) + items.length;
	}
	else {	
		pagination['pageHits'] = items.length * page;
	}

	// The total number of search results
	pagination['totalHits'] = totalItems;
	pagination['buttons'] = getButtons(items.length, page, maxItems, totalItems);

	// Add the path to the prev/next buttons
	pagination['path'] = {};
	if(pagination.buttons.prev > 0) {
		pagination.path['prev'] = path + prefix + "page=" + parseInt(pagination.buttons.prev);
	}
	if(pagination.buttons.next > 0) {
		pagination.path['next'] = path + prefix + "page=" + parseInt(pagination.buttons.next);
	}
	pagination.path['current'] = path + prefix;

	// Get the max number of page links to show
	pagination['maxPageLinks'] = config.maxPaginatorPageLinks;

	// Show the page links if there are results
	if(pagination.totalHits > 0 && pagination.pageCount > 1) {

		// Pages present are within the range of max links.  Show current page within this range
		if(page <= (pagination.maxPageLinks / 2)) {

			// First page is always 1 here
			pagination['firstPage'] = 1;

			// Get the last page value.  If pages present are less than max links per page value, the last page is the max value.
			if(pagination.pageCount <= pagination.maxPageLinks) {
				pagination['lastPage'] = pagination.pageCount;
			}
			else {
				pagination['lastPage'] = pagination.maxPageLinks;
			}
		}

		// Pages present exceed the range of max links.  Show the current page at the center of the page list for ease of forward/backward navigation
		else {
			pagination['firstPage'] = parseInt(page) - (pagination.maxPageLinks / 2);
			pagination['lastPage'] = parseInt(page) + (pagination.maxPageLinks / 2);

			// Make sure the page list does not exceed the page count
			if(pagination.lastPage > pagination.pageCount) {
				pagination.lastPage = pagination.pageCount;
			}
		}
	}

	// If no search results, do not show any page links
	else {
		pagination['firstPage'] = 0;
		pagination['lastPage'] = 0;
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