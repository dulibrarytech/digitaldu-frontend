 /**
 * @file 
 *
 * Search Service Functions
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
 * Search the index
 * Perform a search with query data and search specifications
 *
 * @param {Array.<queryData>} queryData - Array of data for multiple combined queries
 * @param {Object} facets - DDU Facet object (ex {"{facet name or ID}": ["{facet value}", "{facet value}", ...]}) Currently selected facets
 * @param {String} collection - Collection PID to scope search resuts to.  No longer in use, use collection facet
 * @param {Array.<queryData>} pageNum - Page number of results to return.  Will use this page number in the Elastic search  Must be numeric
 * @param {Array.<queryData>} pageSize - Specify number of results per page directly with this value.  Must be numeric
 * @param {dateRange} daterange
 * @param {sort} sort
 *
 * @typedef (Object) dateRange
 * @property {String} from - Daterange 'search from' date.  Year only [YYYY]
 * @property {String} to - Daterange 'search to' date.  Year only [YYYY]
 *
 * @typedef (Object) sort
 * @property {String} field - Index field to sort search results by
 * @property {String} order - Order of sort ["asc"|"desc"]
 *
 * @typedef (Object) queryData - Data to perform a single query
 * @property {String} terms - Search terms
 * @property {String} field - Search in this index field; "all" to search in all configured search fields {"all"|[index field]}
 * @property {String} type - Search type ["contains|is"]
 * @property {String} bool - Bool to use to combine current query with previous query ["or"|"and"|"not"]
 *
 * @typedef (Object) searchResults - This object is the search results data object
 * @property {String} title - Result object title
 * @property {String} tn - Uri to result objcet thumbnail datastream
 * @property {String} pid - Result object pid
 * @property {String} objectType - Result object 'object_type' ["object"|"collection"]
 * @property {Object} display_record - Result object index display record
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array.<searchResults>|null} Search results object, Null if error
 */
exports.searchIndex = function(queryData, facets=null, collection=null, pageNum=1, pageSize=10, daterange=null, sort=null, callback) {
    var queryFields = [],
        results = [], 
        restrictions = [],
        filters = [],
        queryType,
        booleanQuery = {
          "bool": {
            "should": [],
            "must": [],
            "must_not": []
          }
        },
        currentQuery;
      
        
    /* 
     * Build the search fields object 
     * Use a match query for each word token, a match_phrase query for word group tokens, and a wildcard search for tokens that contain a '*'.
     * Each query is placed in a separate bool object
     */
    // Search data for each query
    var field, fields, type, terms, bool;

    // Objects for building the nested boolean queries
    var curObj = booleanQuery,
        prevBool, queryArray, boolType, nestedBool;

    // queryData is an array of the combined queries in the search.  A simple search will contain one query, an advanced search may contain multiple queries
    for(var index in queryData) {
      queryFields = [];
      currentQuery = {};

      // Get the query data from the current data object, or use default data
      terms = queryData[index].terms || "";
      field = queryData[index].field || "all";
      type = queryData[index].type || "contains";

      // Determine the boolean term to join the current query with the next query in the array
      bool = queryData[parseInt(index)+1] ? queryData[parseInt(index)+1].bool : queryData[index].bool || "or";
      prevBool = queryData[index].bool;

      // If the next bool is "not" use current query's boolean term
      if(bool == "not") {
        bool = index == 0 ? "or" : queryData[index].bool || "or";
      }

      // If field value is "all", get all the available search fields
      fields = Helper.getSearchFields(field);
      
      // Get the Elastic query type to use for this query
      queryType = Helper.getQueryType(queryData[index]);

      /*
       * Build the elastic query
       * (REQ: fields terms querytype)
       */
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
              "operator": "or",
              "fuzziness": config.searchTermFuzziness
            };

            // Add the field boost value if it is set
            if(field.boost) {
              queryObj["boost"] = field.boost;
            }

            // Create the elastic match query object
            keywordObj[field.field] = queryObj;
            tempObj[queryType] = keywordObj;

            // matchField specifies a field in the index to use, when an index path points to differing index values.  Add a must query to select the specified match field
            if(typeof field.matchField != 'undefined') {
              let mustQuery = {
                "match_phrase": {}
              };
              mustQuery.match_phrase[field.matchField] = field.matchTerm;
              queryFields.push({
                "bool": {
                  "must": [tempObj,mustQuery] // Both must match for the bool to be true
                }
              });
            }
            else {
              // Push the "match" query
              queryFields.push(tempObj);
            }
          }

          else {
            keywordObj[field.field] = terms;
            tempObj[queryType] = keywordObj;
            queryFields.push(tempObj);
          }
        }
      }
      else {
        console.log("Error: invalid search field configuration", {});
      } 
      currentQuery = queryFields[0];

      /*
       * Add the query to the boolean object:
       * Multiple queries with different boolean types will be nested in existing boolean objects
       */

      // Add this query to the boolean filter must object
      if(bool == "and") {
        queryArray = curObj.bool.must;
        boolType = "must";
      }

      // Add this query to the boolean filter must_not object
      else if(prevBool == "not") {
        booleanQuery.bool.must_not.push(currentQuery);
        boolType = "must_not";
      }

      // Add this query to the boolean filter should object
      else {
        queryArray = curObj.bool.should;
        boolType = "should";
      }

      // First iteration, just push the query to the current boolean array
      if(prevBool == null) {
        queryArray.push(currentQuery);
      }

      // No change in boolean condition, just push the query to the current boolean array
      else if(prevBool == bool) {
        queryArray.push(currentQuery);
      }

      // Change in boolean terms, create a new boolean object to nest in the current boolean array.  Push the query to the new object, use the new object's boolean array as the current array
      else {

        // NOT queries have already been pushed to the top-level must_not array, ignore them here
        if (boolType != "must_not"){
          nestedBool = {
            "bool": {
              "should": [],
              "must": []
            }
          };
          nestedBool.bool[boolType] = [];

          // Nest the new boolean object, set the current query array to the new boolean object's query array
          queryArray.push(nestedBool);
          queryArray.push(currentQuery);
          queryArray = nestedBool.bool[boolType];

          // 'Step down' the current object to the newest nested level
          curObj = nestedBool;
        }
      }
    }

    /*
     * Add facets and filters:
     */

    // If facets are present, apply filters to the search
    if(facets) {
      let facetKey, count=0;
      for(let facet in facets) {
        for(let value of facets[facet]) {
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
    if(config.showCollectionObjectsInSearchResults == false) {
      restrictions.push({
        "match": {
          "object_type": "collection"
        }
      });
    }

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

    // DEBUG - Output the full structure of the query object
    //console.log("TEST queryObj:", util.inspect(queryObj, {showHidden: false, depth: null}));

    // Get elasticsearch aggregations object 
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Apply sort option
    let sortArr = [];
    if(sort) {
      let data = {},
          field = config.searchSortFields[sort.field] + ".keyword" || null;

      if(field) {
        data[field] = {
          "order": sort.order
          // "ignore_unmapped" : true
        }
      }
      sortArr.push(data);
    }

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
              objectType: result._source.object_type
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
    });
}