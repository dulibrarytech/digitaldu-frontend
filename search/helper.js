  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

 /**
 * @file 
 *
 * Search Helper Functions
 *
 */

'use strict';

var config = require('../config/' + process.env.CONFIGURATION_FILE);
var pluralize = require('pluralize');

/**
 * Removes any facets appearing in 'facets' object from the Elastic response object agregations buckets 
 * Updates results object as reference
 *
 * @param {Object} facets - DDU Facet object (ex {"{facet name or ID}": ["{facet value}", "{facet value}", ...]}) Currently selected facets
 * @param {Object} results - Elastic search response object
 *
 * @return {undefined}
 */
exports.removeSelectedFacets = function(facets, results) {
  for(var facetKey in facets) {
    for(var index in facets[facetKey]) {
      var facetString = facets[facetKey][index],
          bucket = results.aggregations[facetKey] ? results.aggregations[facetKey].buckets : [];
      for(let facetIndex in bucket) {
        if(bucket[facetIndex].key == facetString) {
          bucket.splice(facetIndex,1);
        }
      }
    }
  }
}

/**
 * Removes any aggregation keys with empty values from the Elastic search response aggregations object
 *
 * @param {Object} facets - Elastic search response aggregations object
 *
 * @return {Object} - Updated Elastic search response aggregations object
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
 * Get data for the search results keywords label
 * If there are multiple queries in the array, this is an advanced search.  Use the first query for the results querystring label
 *
 * @param {Array.<String>} query - Array of search terms, one for each query
 * @param {Object} facets - DDU Facet object (ex {"{facet name or ID}": ["{facet value}", "{facet value}", ...]}) Currently selected facets
 *
 * @return {String} The results label
 */
exports.getResultsLabel = function(query, facets, bool, field) {
  let queryLabel = " ", // One space character is required here (" ")
      appendLabel = "";
  if(query && query.length > 0) {
    for(let index in query) {
      // Handle special case of a collection field advanced search
      if(field[index] && field[index].toLowerCase() == "collection") {
        continue;
      }
      if(query[index].length == 0) {
        query[index] = "*";
      }
      if(bool[index] && bool[index].toLowerCase() == "not") {
        queryLabel += "NOT ";
      }
      queryLabel += (query[index] + ((index == query.length-1) ? " " : "; "));
    }
  }
  return queryLabel + appendLabel; 
}

/**
 * Create an Elastic date range query from search date range values
 *
 * @param {daterange} daterange - From and to values defining the daterange
 *
 * @typedef {Object} daterange
 * @property {String} from - Daterange 'search from' date.  Year only [YYYY]
 * @property {String} to - Daterange 'search to' date.  Year only [YYYY]
 *
 * @return {Object} Elastic daterange query object
 */
exports.getDateRangeQuery = function(daterange) {
  var dateQuery = {
    "bool": {
      "must": []
    }
  },
  dateQueries = [],
  beginRange = {}, 
  endRange = {};

  // Add the match field query if a match field has been set
  if(config.dateFieldMatchField && config.dateFieldMatchField.length > 0) {
    let matchField = {};
    matchField[config.dateFieldMatchField] = config.dateFieldMatchValue;
    dateQuery.bool.must.push({
      "match_phrase": matchField
    });
  }

  // Query 1: begin field is in bounds
  let rangeQuery = {};
  rangeQuery[config.beginDateField] = {
    "gte": daterange.from,
    "lte": daterange.to
  };
  dateQueries.push({
    "range": rangeQuery
  });

  // Query 2: end field is in bounds
  rangeQuery = {};
  rangeQuery[config.endDateField] = {
    "gte": daterange.from,
    "lte": daterange.to
  };
  dateQueries.push({
    "range": rangeQuery
  });

  // Query 3: begin and end field are out of bounds, but begin is < range start, and end is > range end
  let query = {
    "bool": {
      "must": []
    }
  };
  rangeQuery = {};
  rangeQuery[config.beginDateField] = {
    "lte": daterange.from
  };
  query.bool.must.push({
    "range": rangeQuery
  });
  rangeQuery = {};
  rangeQuery[config.endDateField] = {
    "gte": daterange.to
  };
  query.bool.must.push({
    "range": rangeQuery
  });
  dateQueries.push(query);

  // Add datequeries: one hit means object is in range
  dateQuery.bool.must.push({
    "bool": {
      "should": dateQueries
    }
  });

  return config.nestedDateField ? {
    nested: {
      path: config.beginDateField.substring(0,config.beginDateField.lastIndexOf(".")),
      query: dateQuery
    }
  } : dateQuery;
}

/**
 * Retrieve search field(s) from the configuration
 *
 * @param {String} fieldValue - A search field label from the configuration
 * If a search field label is passed in, the corresponding search field data will be retrieved from the configuration 
 * If fieldValue is "all", all search fields will be retrieved from the configuration 
 *
 * @return {Array.<Object>} Array of search fields defined in the configuration
 */
exports.getSearchFields = function(fieldValue) {
  var fields = [];

  // Non-scoped search: Search in all of the fields in the fulltext search
  if(fieldValue.toLowerCase() == 'all') {
    fields = config.searchAllFields;
  }

  // Scoped search: Use the selected type in the search type dropdown
  else {
    for(var field of config.searchAllFields) {
      if(field.id.toLowerCase() == fieldValue.toLowerCase()) {
          fields.push(field);
      }
    }
  }

  return fields;
}

/**
 * Build the search query data array (for multiple advanced search queries, or a single search) from the search url parameters
 * Combines the data in the four input arrays into one query data object per array index
 *
 * @param {Array.<String>} queryArray - Query strings, one per query
 * @param {Array.<String>} fieldArray - Search fields, one per query
 * @param {Array.<String>} typeArray - Search types, one per query
 * @param {Array.<String>} boolArray - Query boolean terms, one per query
 *
 * @typedef {Object} queryData
 * @property {String} terms - Query string
 * @property {String} field - Search field
 * @property {String} type - Search type
 * @property {String} bool - Query boolean term 
 *
 * @return {Array.<queryData>} queryDataArray
 */
exports.getSearchQueryDataObject = function(queryArray, fieldArray, typeArray, boolArray) {
  var queryDataArray = [];

  for(var index in queryArray) {

    // Default empty queries to wildcard "all results" query
    if(queryArray[index] == "") {
      queryArray[index] = '*';
    }

    queryDataArray.push({
      terms: queryArray[index],
      field: fieldArray[index],
      type: typeArray[index],
      bool: boolArray[index]
    });
  }

  return queryDataArray;
}

/**
 * Convert the sort params array into a data array for the search function
 * Sorting by "relevance" will return null, no sorting is required
 *
 * @param {String} sort - The sort string: two terms delimited by "," (ex "sort field,sort type" or "Title,asc")
 *
 * @typedef {Object} sortData
 * @property {String} field - First value of comma delimited "sort" string
 * @property {String} order - Second value of comma delimited "sort" string
 *
 * @return {sortData|null} - The sort data object.  Null will be returned if the sort value is "relevance"
 */
exports.getSortDataArray = function(sort) {
  let sortData = null;
  if(sort && sort != "") {
    sort = sort.split(",");

    // If the sort field value is "relevance", do not assign the sort data, this is the default search
    if(sort[0].toLowerCase() != "relevance") {
      sortData = {
        field: sort[0],
        order: sort[1].replace(/\W/g, '')
      }
    }
  }
  return sortData;
}

/**
 * Determine the Elastic search type for a query
 *
 * @param {queryData} - Query data object
 *
 * @typedef {Object} queryData
 * @property {String} terms - Query string
 * @property {String} field - Search field
 * @property {String} type - Search type
 * @property {String} bool - Query boolean term
 *
 * @return {String} - The Elastic query type DSL field
 */
exports.getQueryType = function(queryData) {
  var queryType = "match";
  queryData.terms = queryData.terms.trim();
  if(queryData.type == "isnot") {
    queryType = "must_not";
  }
  else if(queryData.type == "is") {
    queryType = "match_phrase";
  }
  else if(queryData.terms[0] == '"' && queryData.terms[ queryData.terms.length-1 ] == '"') {
    queryType = "match_phrase";
  }
  else if(queryData.terms.indexOf('*') >= 0 || queryData.terms.indexOf('?') >= 0) {
    queryType = "wildcard";
  }
  else  {
    queryType = "match";
  }
  return queryType;
}

/**
 * Append or remove characters from a querystring based on search data
 *
 * @property {String} terms - Query string
 * @property {String} field - Search field
 * @property {String} type - {"all"|"contains"|"is"} 
 * @property {String} bool - Query boolean term
 *
 * @return {String} - Updated query term
 */
exports.updateQueryTermsForField = function(terms="", field, type, bool) {
  // Allow tokenized or partial searches of call number field (which contains multiple periods) without the use of a wildcard character in the search terms
  if(field == "call_number") {
    // Do not update if the terms already contain a *
    if(terms.indexOf("*" < 0)) {
      terms = "*".concat(terms) + "*";
    }
  }
  return terms;
}

/**
 * Update the format of the date query to YYYY-MM-DD format for Elastic
 *
 * @typedef {Object} daterangeQuery 
 * @property {String} from - from date. Must be of format (Will update )
 * @property {String} to - to date
 *
 * @return {Object} - Updated date fields
 */
exports.formatDateFieldForElasticQuery = function(daterangeQuery) {
  let formatted = {
    from: daterangeQuery.from,
    to: daterangeQuery.to
  };
  
  // Update YYYY input format
  if(/[0-9][0-9][0-9][0-9]/.test(daterangeQuery.from)) {
    formatted.from = daterangeQuery.from + "-01-01";
  }
  if(/[0-9][0-9][0-9][0-9]/.test(daterangeQuery.to)) {
    formatted.to = daterangeQuery.to + "-12-31";
  }

  return formatted;
}

/**
 * Extracts the minimum date of the search result set, using the 'datefieldStats' value. 
 * If this value does not appear in the aggregations object (facets), null is returned
 *
 * @param {Object} facets - Elastic search response aggregations object
 *
 * @return {Object} - Updated Elastic search response aggregations object
 */
exports.getResultSetMinDate = function(facets) {
  let minDate = null;
  if(facets.datefieldStats && facets.datefieldStats.stats) {
    let minString = facets.datefieldStats.stats.min_as_string || "";
    if(/[0-9][0-9][0-9][0-9]-[0-9][0-9]-[0-9][0-9]T[0-9][0-9]:[0-9][0-9]:[0-9][0-9].[0-9][0-9][0-9]Z/g.test(minString)) {
      minDate = minString.substr(0, 4);
    }
  }
  return minDate;
}

/**
 * Singularizes all of the words in a string
 *
 * @param {string} string - A string
 *
 * @return {string} - String with all words in singular form
 */
exports.singularizeSearchStringTerms = function(string) {
  let termsArray = string.split(" ");
  string = "";
  for(var term of termsArray) {
    string += (pluralize.singular(term) + " ");
  }

  return string.trim();
}