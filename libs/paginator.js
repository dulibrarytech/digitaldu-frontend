/*
 * Creates the view object containing the paginator data
 */

exports.create = function(items, page, pageCount) {
	var pagination = {
		page: page,
		beginCount: 0,
		pageHits: 0,
		totalHits: 0
	};

	// First item on the current page
	pagination.beginCount = (pageCount * (page-1)) + 1;

	// Items on the current page
	if(items.list.length < pageCount) {

		// This is the 'last page', when page count > number of items left to display.
		pagination.pageHits = (pagination.beginCount - 1) + items.list.length;
	}
	else {	
		pagination.pageHits = items.list.length * page;
	}

	// The total number of search results
	pagination.totalHits = items.count;

	return pagination;
}