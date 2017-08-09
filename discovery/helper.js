'use strict';

var config = require('../config/config');

exports.getResultsPerPage = function(resultCount, pageNumber) {
	var resultsPerPage = "";

	if(pageNumber == 1) {
		if(resultCount < config.maxDisplayResults) {
			resultsPerPage = "(1 - " + resultCount + " of " + resultCount + ")";
		}
		else {
			resultsPerPage = "(1 - " + config.maxDisplayResults + " of " + resultCount + ")";
		}
	}

	return resultsPerPage;
}

