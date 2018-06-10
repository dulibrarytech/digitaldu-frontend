/*
 * Creates the view object containing the paginator data
 */

exports.create = function(items, page, maxItems) {
	var pagination = {
		page: page,
		beginCount: 0,
		pageHits: 0,
		totalHits: 0
	};

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
	pagination.totalHits = items.length;
	pagination['buttons'] = getButtons(items.length, page, maxItems);
		console.log("TEST buttons are", pagination.buttons);
	return pagination;
}

var getButtons = function(pageItemCount, page, maxItems) {
	var buttons = {
		prev: 0,
		next: 0
	}
	if(pageItemCount <= maxItems && maxItems % pageItemCount == 0) {
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