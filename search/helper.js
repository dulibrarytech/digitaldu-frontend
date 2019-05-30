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
exports.getDaterangeQuery = function(daterange) {
  if(/[0-9][0-9][0-9][0-9]/g.test(daterange.from) && /[0-9][0-9][0-9][0-9]/g.test(daterange.to)) {
      let dateMatchFields = [], dateQuery = {}, dateStr = "";

      // Build a string of all dates included in the specified range
      for(let i=parseInt(daterange.from); i<=parseInt(daterange.to); i++) {
        dateStr += i.toString() + " ";
      }

      // Add the date string to the date query
      dateQuery[config.objectDateField] = {
        "query": dateStr
      }

      // Add the date query to the array
      dateMatchFields.push({
        "match": dateQuery
      });

      // 'Circa' dates extend range positive
      for(let i=1; i<=config.datespanRange; i++) {
        dateQuery = {};
        dateQuery[config.objectDateField] = {
          "query": "circa " + (parseInt(daterange.to) + i).toString()
        }

        // Add the query to the array
        dateMatchFields.push({
          "match_phrase": dateQuery
        });
      }

      // 'Circa' dates extend range negative
      for(let i=1; i<=config.datespanRange; i++) {
        dateQuery = {};
        dateQuery[config.objectDateField] = {
          "query": "circa " + (parseInt(daterange.from) - i).toString()
        }

        // Add the query to the array
        dateMatchFields.push({
          "match_phrase": dateQuery
        });
      }

      // Add the date query array to the bool query object, return it
      return {
        "bool": {
          "should": dateMatchFields
        }
      }
    }
}