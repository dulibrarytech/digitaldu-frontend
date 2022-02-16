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
 * Search Service Functions
 *
 */

'use strict';

const es = require('../config/index'),
      util = require('util'),
      config = require('../config/' + process.env.CONFIGURATION_FILE),
      Repository = require('../libs/repository'),
      Helper = require("./helper"),
      AppHelper = require("../libs/helper.js");

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
 * @typedef {Object} dateRange
 * @property {String} from - Daterange 'search from' date.  Year only [YYYY]
 * @property {String} to - Daterange 'search to' date.  Year only [YYYY]
 *
 * @typedef {Object} sort
 * @property {String} field - Index field to sort search results by
 * @property {String} order - Order of sort ["asc"|"desc"]
 *
 * @typedef {Object} queryData - Data to perform a single query
 * @property {String} terms - Search terms
 * @property {String} field - Search in this index field; "all" to search in all configured search fields {"all"|[index field]}
 * @property {String} type - Search type ["contains|is"]
 * @property {String} bool - Bool to use to combine current query with previous query ["or"|"and"|"not"]
 *
 * @typedef {Object} searchResults - This object is the search results data object
 * @property {String} title - Result object title
 * @property {String} tn - Uri to result object thumbnail datastream
 * @property {String} pid - Result object pid
 * @property {String} objectType - Result object 'object_type' ["object"|"collection"]
 * @property {Object} display_record - Result object index display record
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {Array.<searchResults>|null} Search results object, Null if error
 */
exports.searchIndex = function(queryData, facets=null, collection=null, pageNum=1, pageSize=10, daterange=null, sort=null, isAdvanced=false, callback) {
    var queryFields = [],
        fuzzQueryFields = [],
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

    // Prevents Elastic crash if negative values are present
    pageNum = Math.abs(pageNum);
    pageSize = Math.abs(pageSize);

    // Elastic boolean objects
    var shouldArray = [], 
        mustBoolean = {
          bool: {
            must: []
          }
        },
        mustNotArray = [];

    /*
     * Iterate through the individual queries in the search request.  Advanced searches may have multiple queries.
     * Append the queries in reverse order to provide the correct logic for joining multiple advanced search queries
     */
    for(var index in queryData.reverse()) {
      queryFields = [];
      currentQuery = {};
      fuzzQueryFields = [];

      // Handle special query cases for searching specific search fields
      queryData[index].terms = Helper.updateQueryTermsForField(queryData[index].terms, queryData[index].field, queryData[index].type, queryData[index].bool);

      // Get the query data for Elastic request
      queryType = Helper.getQueryType(queryData[index]);
      field = queryData[index].field || "all";
      type = queryData[index].type || "contains";
      bool = queryData[index].bool || "or";
      terms = Helper.getSearchTerms(queryData[index].terms);
      fields = Helper.getSearchFields(field);

      if(Array.isArray(fields)) {

        let fieldObj, keywordObj, queryObj, nestedQuery, nestedQueryObj;
        for(var field of fields) {
          fieldObj = {};
          keywordObj = {};
          queryObj = {};
          nestedQuery = {};
          nestedQueryObj = {};

          if(queryType == "match") {
            keywordObj = {
              "query": terms,
              "operator": config.searchTermBoolean
            };

            if(field.boost) {
              keywordObj["boost"] = field.boost;
            }
            fieldObj[field.field] = keywordObj;
          }

          else if(queryType == "wildcard") {
            keywordObj = {
              "value": terms
            };

            if(field.boost) {
              keywordObj["boost"] = field.boost;
            }
            fieldObj[field.field] = keywordObj;
          }

          else {
            fieldObj[field.field] = terms;
          }

          queryObj[queryType] = fieldObj;

          // If field specifies a 'match field' create a must array to match the field exactly on a specified term, as well as on the main query fields/terms
          if(field.matchField && field.matchTerm) {
            let mustQuery = {
              "match_phrase": {}
            },
            mustArray = [queryObj];
            mustQuery.match_phrase[field.matchField] = field.matchTerm;
            mustArray.push(mustQuery);
            queryObj = {
              "bool": {
                "must": mustArray
              }
            };
          }

          // Build a nested query for nested data types
          if(field.isNestedType == "true") {
            nestedQueryObj = {
              "nested": {
                "path": field.field.substring(0,field.field.lastIndexOf(".")),
                "score_mode": "avg",
                "query": queryObj
              }
            }
            queryFields.push(nestedQueryObj);
          }
          else {
            queryFields.push(queryObj);
          }

          if(isAdvanced == false 
            && queryType == "match"
            && config.fuzzyFields.includes(field.field)) {

            let fuzzQueryObj = {
              "fuzzy": {}
            };
            fuzzQueryObj.fuzzy[field.field] = {
              "value": terms,
              "fuzziness": config.searchTermFuzziness
            };
            fuzzQueryFields.push(fuzzQueryObj);
          }
        }
      }

      if(fuzzQueryFields.length > 0) {
        queryFields.push({
          "bool": {
            "should": fuzzQueryFields
          }
        })
      }
        
      currentQuery = queryFields;

      /*
       * Add the query to the boolean object
       */
      if(bool == "or") {
        shouldArray = shouldArray.concat(currentQuery);
      }

      // Must queries must be nested in a second boolean object, which is inserted into the 'should' array
      else if(bool == "and") {
        if(currentQuery.length > 1) {
          mustBoolean.bool.must.push({
            bool: {
              should: currentQuery
            }
          });
        }
        else {
          mustBoolean.bool.must.push(currentQuery[0]);
        }
        shouldArray.push(mustBoolean);
      }

      // Add to the 'must_not' array
      else if(bool == "not") {
        mustNotArray = mustNotArray.concat(currentQuery);
      }
    }

    // Add the subquery boolean objects to the main boolean object
    booleanQuery.bool.should = shouldArray;
    booleanQuery.bool.must_not = mustNotArray;

    /*
     * Add facets and filters:
     */
    if(facets) {
      let facetData, count=0;
      for(let facet in facets) {
        for(let value of facets[facet]) {
          let query = {};
          count++;

          // Get the facet configuration
          facetData = config.facets[facet];

          // Add facet to filters
          if(facetData && facetData.path) {
            query[facetData.path] = value;
            let filter = {
              "bool": {
                "must": []
              }
            }
            filter.bool.must.push({
              "match_phrase": query 
            });

            if(facetData.matchField && facetData.matchField.length > 0) {
              query = {};
              query[facetData.matchField] = facetData.matchTerm; 
              filter.bool.must.push({
                "match_phrase": query 
              });
            }
            filters.push(filter);
          }
        }
      }
    }

    if(daterange && daterange.from && daterange.to) {
      let fullDate = Helper.formatDateFieldForElasticQuery(daterange);
      filters.push(Helper.getDateRangeQuery(fullDate));
    }

    // Restrict results to members of collection
    if(collection) {
      booleanQuery.bool.must.push({
        "match": {
          "is_member_of_collection": collection
        }
      });
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

    // Build main query object
    var queryObj = {};
    if(queryData[0].terms != "" || facets) {
      queryObj = {
        "bool": {
          "must": booleanQuery,
          "must_not": restrictions,
          "filter": filters
        }
      }
    }

    else {
      if(!collection) {
        restrictions.push({
          match: {
            "object_type": "collection"
          }
        });
      }
      queryObj = {
        "bool": {
          "must": booleanQuery,
          "must_not": restrictions,
          "filter": filters
        }
      }
    }

    var facetAggregations = AppHelper.getFacetAggregationObject(config.facets);

    // Build sort query
    let sortArr = [];
    if(sort) {
      let data = {},
          field = config.searchSortFields[sort.field] || null;

      if(field) {
        if(field.matchField && field.matchField.length > 0) {
          let filterObj = {
            "term": {}
          };

          if(field.matchTerm && field.matchTerm.length > 0) {
            filterObj.term[field.matchField + ".keyword"] = field.matchTerm;
            data[field.path + ".keyword"] = {
              "order": sort.order || "asc",
              "nested_path": field.path.substring(0,field.path.lastIndexOf(".")),
              "nested_filter": filterObj
            }
          }
        }
        else {
          data[field.path + ".keyword"] = {
            "order": sort.order || "asc"
          }
        }
      }
      sortArr.push(data);
    }

    // Create elastic search request data object
    var data = {  
      index: config.elasticsearchPublicIndex,
      // type: config.searchIndexType,
      body: {
        from : (pageNum - 1) * pageSize, 
        size : pageSize,
        query: queryObj,
        sort: sortArr,
        aggregations: facetAggregations
      }
    }

    if(config.nodeEnv == "devlogsearch") {console.log("Search query object:", util.inspect(data, {showHidden: false, depth: null}));}

    // Query the index
    es.search(data, function (error, response, status) {
      if (error || typeof response == 'undefined') {
        callback(error, {});
      }
      else {
        // Remove selected facet from the facet panel list.  The list should not show a facet option if the facet has already been selected
        Helper.removeSelectedFacets(facets, response);

        // Aggs data
        var responseData = {};
        responseData['facets'] = Helper.removeEmptyFacetKeys(response.aggregations);
        responseData['count'] = response.hits.total.value <= config.maxElasticSearchResultCount ? response.hits.total.value : config.maxElasticSearchResultCount;
        responseData['minDate'] = Helper.getResultSetMinDate(response.aggregations) || null;

        try {
          // Build the response data object
          var results = [], tn, resultData, resultObj;
          for(var result of response.hits.hits) {
            tn = config.rootUrl + "/datastream/" + result._source.pid.replace('_', ':') + "/tn";
            resultObj = {
              title: result._source.title || "No Title",
              tn: tn,
              collection: result._source.is_member_of_collection || "",
              pid: result._source.pid,
              objectType: result._source.object_type || null,
              itemType: result._source.type || null,
              mimeType: result._source.mime_type || null
            }

            // Add the display record
            resultObj[config.displayRecordField] = result._source[config.displayRecordField] || {};

            // Add current result to the results array
            results.push(resultObj);
          }

          // Add the results array, send the response
          responseData['results'] = results;
          responseData['elasticResponse'] = response;
          callback(null, responseData);
        }
        catch(error) {
          callback(error, {});
        }
      }
    });
}