 /**
 * @file 
 *
 * Search module service functions
 *
 */

'use strict';

const es = require('../config/index'),
      fs = require('fs'),
      util = require('util'),
      config = require('../config/' + process.env.CONFIGURATION_FILE),
      request  = require("request"),
      Repository = require('../libs/repository'),
      Helper = require("./helper");

/**
 * 
 *
 * @param 
 * @return 
 */
exports.searchIndex = function(queryData, facets=null, collection=null, pageNum=1, pageSize=10, daterange=null, callback) {

    var matchFields = [], 
        mustMatchFields = [], 
        results = [], 
        restrictions = [],
        filters = [],
        queryType,
        queryArray = [],
        booleanQuery = {
          "bool": {
            "should": [],
            "must": [],
            "must_not": []
          }
        },
        boolObj;
        
    /* 
     * Build the search fields object 
     * Use a match query for each word token, a match_phrase query for word group tokens, and a wildcard search for tokens that contain a '*'.
     * Each query is placed in a separate bool object
     */
    var field, fields, type, terms, bool;
    for(var index in queryData) {
      matchFields = [];
      boolObj = {
          "bool": {
            "should": []
          }
      };

      // Get the query data from the current data object, or use default data
      terms = queryData[index].terms || "";
      field = queryData[index].field || "all";
      type = queryData[index].type || "contains";
      bool = index == 0 ? "or" : queryData[index].bool || "or";

      // If field value is "all", get all the available search fields
      fields = Helper.getSearchFields(field)

      // Get the Elastic query type to use for this query
      queryType = Helper.getQueryType(queryData[index]);

      // Build elastic query.  If an array of fields is passed in, search in all of the fields that are in the array.
      if(Array.isArray(fields)) {
        /*
         * Loop the keywords, adding each to the main query array under the specified query type (match, wildcard, match_phrase)
         * For match queries, check for a boost value in the keyword object and add it to the query if the value is present
         */
        let keywordObj, tempObj, queryObj;
        for(var field of fields) {
          keywordObj = {};
          tempObj = {};
          queryObj = {};

          // Get boost value if it exists in this field object
          if(queryType == "match") {
            queryObj = {
              "query": terms,
              "operator": "and",
              "fuzziness": config.searchTermFuzziness
            };

            // Add the field boost value if it is set
            if(field.boost) {
              queryObj["boost"] = field.boost;
            }

            // Create the elastic match query object
            keywordObj[field.field] = queryObj;
            tempObj[queryType] = keywordObj;

            // If a matchfield is present, add the control field to the query
            if(typeof field.matchField != 'undefined') {
              let mustQuery = {
                "match_phrase": {}
              };
              mustQuery.match_phrase[field.matchField] = field.matchTerm;
              matchFields.push({
                "bool": {
                  "must": [tempObj,mustQuery] // Both must match for the bool to be true
                }
              });
            }
            else {

              // Push the "match" query
              matchFields.push(tempObj);
            }
          }

          else {
            keywordObj[field.field] = terms;
            tempObj[queryType] = keywordObj;
            matchFields.push(tempObj);
          }
        }
      }

      // Search a single field
      else {
          let keywordObj = {}, tempObj = {};
          keywordObj[type] = terms;
          tempObj[queryType] = keywordObj;
          matchFields.push(tempObj);
      } 
      boolObj.bool.should = matchFields;

      // Add this query to the boolean filter must object
      if(bool == "and") {
        booleanQuery.bool.must.push(boolObj);
      }

      // Add this query to the boolean filter must_not object
      else if(bool == "not") {
        booleanQuery.bool.must_not.push(boolObj);
      }

      // Add this query to the boolean filter should object
      else {
        booleanQuery.bool.should.push(boolObj);
      }
    }

    // If facets are present, apply filters to the search
    if(facets) {
      var facetKey, count=0;
      for(var facet in facets) {
        for(var value of facets[facet]) {
          let query = {};
          count++;

          // Get the facet key from the configuration, using the facet name
          facetKey = config.facets[facet];

          // Add to filters
          query[facetKey] = value;
          filters.push({
            "match_phrase": query 
          });
        }
      }
    }

    //If a date range is present, add the date range query to the must match array
    if(daterange) {
      filters.push(Helper.getDateRangeQuery(daterange));
    }

    // Do not show collection objects
    restrictions.push({
      "match": {
        "object_type": "collection"
      }
    });

    // Do not show objects that are children of compound objects
    restrictions.push({
      "exists": {
          "field": "is_child_of"
      }
    });

    // Querystring and facet search.  Add the filter query object if any filters are present
    var queryObj = {}, 
    filter = filters.length > 0 ? filters : {};
    if(queryData[0].terms != "" || facets) {
      queryObj = {
        "bool": {
          "must": booleanQuery,
          "must_not": restrictions,
          "filter": filter
        }
      }
    }

    // If empty querystring, search for all items that are not collections
    else {
      restrictions.push({
        match: {
          "object_type": "collection"
        }
      });
      queryObj = {
        "bool": {
          "must": booleanQuery,
          "must_not": restrictions
        }
      }
    }

    // DEBUG
    //console.log("TEST", util.inspect(queryObj, {showHidden: false, depth: null}));

    // Get elasticsearch aggregations object 
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Apply sortBy option
    var sortArr = [];
    //     sortData = {
    //       "order": "asc"
    //       // "ignore_unmapped" : true

    //     };
    // sortArr.push({
    //   "title": sortData
    // });
    //   console.log("TEST sortArr", sortArr);

    // Create elasticsearch data object
    var data = {  
      index: config.elasticsearchPublicIndex,
      type: config.searchIndexName,
      body: {
        from : (pageNum - 1) * pageSize, 
        size : pageSize,
        query: queryObj,
        sort: sortArr,
        aggregations: facetAggregations
      }
    }

    // Query the index
    es.search(data, function (error, response, status) {
      if (error || typeof response == 'undefined'){
        callback(error, {});
      }
      else {
        returnResponseData(facets, response, callback);
      }
    });
}

/**
 * 
 *
 * @param 
 * @return 
 */
exports.searchFacets = function (query, facets, page, callback) {
    client.search({
            index: config.elasticsearchPublicIndex,
            type: config.searchIndexName,
            body: {
                "query": {
                    "bool": {
                        "must": {
                            "multi_match": {
                                "operator": "and",
                                "fields": facets,
                                "query": query
                            }
                        }
                    }
                }
            }
        }
    ).then(function (body) {
        callback(null, body);
    }, function (error) {
        callback(error, {});
    });
};

/**
 * Create a data object with result and facet data
 *
 * @param 
 * @return 
 */
var returnResponseData = function(facets, response, callback) {

  // Remove selected facet from the facet panel list.  The list should not show a facet option if the facet has already been selected
  Helper.removeSelectedFacets(facets, response);
  
  // Return the aggregation results for the facet display
  var responseData = {};
  responseData['facets'] = Helper.removeEmptyFacetKeys(response.aggregations);
  responseData['count'] = response.hits.total;

  try {

    // Create a normalized data object for the search results
    var results = [], tn, resultData, resultObj;
    for(var result of response.hits.hits) {

      // Get the thumbnail for this search result
      tn = config.rootUrl + "/datastream/" + result._source.pid.replace('_', ':') + "/tn";

      // Push a new result object to the results data array
      resultObj = {
        title: result._source.title || "No Title",
        tn: tn,
        pid: result._source.pid,
      }

      // Add the display record
      resultObj[config.displayRecordField] = result._source[config.displayRecordField] || {};

      // Ad current result to the results array
      results.push(resultObj);
    }

    // Add the results array, send the response
    responseData['results'] = results;
    callback(null, responseData);
  }
  catch(error) {
    callback(error, {});
  }
}