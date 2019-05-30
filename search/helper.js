 /**
 * @file 
 *
 * Search module helper functions
 *
 */

'use strict';

var config = require('../config/config'),
    appHelper = require('../libs/helper');

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
exports.removeSelectedFacets = function(facets, results) {
  for(var facetKey in facets) {
    for(var index in facets[facetKey]) {
      var facetString = facets[facetKey][index],
          bucket = results.aggregations[facetKey].buckets;
      for(let facetIndex in bucket) {
        if(bucket[facetIndex].key == facetString) {
          bucket.splice(facetIndex,1);
        }
      }
    }
  }
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.removeEmptyFacetKeys = function(facets) {
  var buckets;
  for(var facetKey in facets) {
      buckets = facets[facetKey].buckets;
      for(var index in buckets) {
        if(buckets[index].key.length < 2) {
          buckets.splice(index);
        }
      }
  }
  return facets;
}

/**
 * Defunct
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
    queryData = query == "" ? "*" : query;
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
  var records = [], dateObj = {}, displayRecord, date;
    for(var index of results) {

      displayRecord = index._source[config.displayRecordField];
      date = appHelper.parseJSONObjectValues(config.objectDateValue, displayRecord);

      if(appHelper.testObject(date["Date"]) && 
        isDateInRange(date["Date"][0], range) === false) {
          records.push(index._id);
      }
    }

    return records;
}

// Update for new index, vocabulary specific
// Using the new begin and end dates in the index (separate from the display data)
var isDateInRange = function(date, range) {
  var inRange = false, dateElements, dates = [];

  // Replace all non alphanumeric characters with spaces
  date = date.replace(/[^a-zA-Z0-9]/g, " ");
  dateElements = date.split(" ");

  // Handle "circa", create date range +/- 5 years
  if(date.toLowerCase().includes("circa")) {
    date = date.match(/[0-9][0-9][0-9][0-9]/g);
    dates.push(parseInt(date[0])-5);  // Begin date
    dates.push(parseInt(date[0])+5);  // End date
  }

  // Parse the dates out of the date field string
  else {
    dates = date.match(/[0-9][0-9][0-9][0-9]/g) || [];
  }
  
  // If one date is present, that is the single date value
  if(dates.length == 1) {
    if(dates[0] >= range[0] && dates[0] <= range[1]) {
      inRange = true;
    }
  }

  // If two dates are present, test the range.  The first date that appears is the start date, the second date that appears is the end date, subsequent dates are ignored
  else if(dates.length == 2) {
    if( ( (dates[0] >= range[0] && dates[0] <= range[1]) || (dates[1] >= range[0] && dates[1] <= range[1]) ) || (dates[0] <= range[0] && dates[1] >= range[1]) ) {
      inRange = true;
    }
  }
  else {
    inRange = true;
  }

  return inRange;
}