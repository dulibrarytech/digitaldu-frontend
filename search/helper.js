 /**
 * @file 
 *
 * Search module helper functions
 *
 */

'use strict';

var config = require('../config/config');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getFacetAggregationObject = function(facets) {
  var facetAggregations = {}, field;
    for(var key in facets) {
      field = {};
      field['field'] = facets[key] + ".keyword";
      field['size'] = config.facetLimit;
      facetAggregations[key] = {
        "terms": field
      };
    }
    return facetAggregations;
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getSearchResultDisplayFields = function(searchResult) {
  var fields = {
    title: "",
    description: "",
    creator: ""
  };

  var displayRecord = {};

  try {
    // Get Display Record data
      if(searchResult._source.display_record && typeof searchResult._source.display_record == 'string') {
        displayRecord = JSON.parse(searchResult._source.display_record);
      }
      else if(searchResult._source.display_record && typeof searchResult._source.display_record == 'object') {
        displayRecord = searchResult._source.display_record;
      }

      // Find the title
      if(searchResult._source.title && searchResult._source.title != "") {
        fields.title = searchResult._source.title;
      }
      else if(displayRecord.title &&  displayRecord.title != "") {
        fields.title = displayRecord.title;
      }

      // Find the description
      if(searchResult._source.modsDescription && searchResult._source.modsDescription != "") {
        fields.description = searchResult._source.modsDescription;
      }
      else if(displayRecord.abstract && displayRecord.abstract != "") {
        fields.description = displayRecord.abstract;
      }

      // Find the creator
      if(searchResult._source.creator && searchResult._source.creator != "") {
        fields.creator = searchResult._source.creator;
      }
      else if(displayRecord.creator && displayRecord.creator != "") {
        fields.creator = displayRecord.creator;
      }
  }
  catch(error) {
    console.log("Error: " + error);
  }

    return fields;
}

/**
 * Create the 'results for:' label for search results
 *
 * @param 
 * @return 
 */
exports.getResultsLabel = function(query, facets) {
  let queryData = " ";
  if(query == "" && facets) {
    for(let key in facets) {
      for(let index in facets[key]) {
        queryData += (" " + facets[key][index]);
      }
      queryData += ";";
    }
  }
  else {
    queryData = query;
  }
  return queryData; 
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.findRecordsNotInRange = function(results, range) {
  var records = [], date;
    for(var index of results) {

      // If index does not have the dates fieid, skip the record.  Date can not be determined, search result will be displayed
      if(typeof index._source.display_record.dates == 'undefined') {
        continue;
      }
      date = index._source.display_record.dates[0].date || [];   // PROD
      if(isDateInRange(date, range) === false) {
        records.push(index._id);
      }
    }

  return records;
}

var isDateInRange = function(date, range) {
  var inRange = false;

  var dateElements = date.split(" "),
      dates = [];

  for(var i=0; i<dateElements.length; i++) {
    if(!isNaN(dateElements[i]) && dates.length < 2) {
      dates.push(parseInt(dateElements[i]))
    }
    else if(isNaN(dateElements[i])) {
      continue;
    }
    else {
      break;
    }
  }

  if(dates.length == 1) {
    if(dates[0] >= range[0] && dates[0] <= range[1]) {
      inRange = true;
    }
  }
  else if(dates.length == 2) {
    if( ( (dates[0] >= range[0] && dates[0] <= range[1]) || (dates[1] >= range[0] && dates[1] <= range[1]) ) || (dates[0] <= range[0] && dates[1] >= range[1]) ) {
      inRange = true;
    }
  }
  else {
    inRange = true;
  }
    console.log("TETS in range is T");
  return inRange;
}