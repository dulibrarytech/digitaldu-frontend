 /**
 * @file 
 *
 * Search module service functions
 *
 */

'use strict';

const es = require('../config/index'),
      fs = require('fs'),
      config = require('../config/config'),
      request  = require("request"),
      Repository = require('../libs/repository'),
      Helper = require("./helper");

/**
 * 
 *
 * @param 
 * @return 
 */
exports.searchIndex = function(query, type, facets=null, collection=null, pageNum=1, pageSize=10, daterange=null, callback) {

    var field = { match: "" },
        matchFields = [], 
        mustMatchFields = [], 
        results = [], 
        restrictions = [],
        queryType,
        queryArray = [];

    if(query == "") {
      query = '*';
    }

    // Standard search, use single query string
    queryArray.push(query);

    // TODO: Advanced Search
    // Separate the terms grouped by parentheses for match_phrase query.  Add the rest of the search terms to the array for a match query.
    // queryArray = query.match(/"[A-Za-z0-9 ]+"/g) || []; 
    // if(query.replace(/"[A-Za-z0-9 ]+"/g, "").length > 0) {
    //   queryArray.push(query.replace(/"[A-Za-z0-9 ]+"/g, "").trim());
    // } 

    /* 
     * Build the search fields object 
     * Use a match query for each word token, a match_phrase query for word group tokens, and a wildcard search for tokens that contain a '*'.
     * All tokens default to AND search.
     * TODO: Advanced search options
     */
    for(var index of queryArray) {
       // This is a string literal search if the query is contained by parentheses.  Use 'match_phrase'.  Must match the entire query
      if(index[0] == '"' && index[ index.length-1 ] == '"') {
        index = index.replace(/"/g, '');  
        queryType = "match_phrase";
      }

      // This is a wildcard search.  Use 'wildcard'.  Perform an Elasticsearch wildcard query
      else if(index.indexOf('*') >= 0) {
        queryType = "wildcard";
      }

      // This is a regular term search.  Use 'match'.  Will match any word in the query with weighted results.  Closest matches or multiple word matches have higher weight
      else  {
        queryType = "match";
      }

      // Build elastic query.  If an array of fields is passed in, search in all of the fields that are in the array.
      if(Array.isArray(type)) {

        /*
         * type is an array of keyword objects: {field: "elastic keyword field"}
         * Loop the keywords, adding each to the main query array under the specified query type (match, wildcard, match_phrase)
         * For match queries, check for a boost value in the keyword object and add it to the query if the value is present
         */
        let keywordObj, tempObj, queryObj;
        for(var field of type) {
          keywordObj = {};
          tempObj = {};
          queryObj = {};

          // Get boost value if it exists in this field object
          if(queryType == "match") {
            queryObj = {
              "query": index,
              "operator": "and",
              "fuzziness": config.searchTermFuzziness
            };

            if(field.boost) {
              queryObj["boost"] = field.boost;
            }

            keywordObj[field.field] = queryObj;
            tempObj[queryType] = keywordObj;
            matchFields.push(tempObj);
          }
          else {
            keywordObj[field.field] = index;
            tempObj[queryType] = keywordObj;
            matchFields.push(tempObj);
          }
        }
      }

      // Search a single field
      else {
          let keywordObj = {}, tempObj = {};
          keywordObj[type] = index;
          tempObj[queryType] = keywordObj;
          matchFields.push(tempObj);
      } 
    }

    // If facets are present, add them to the search
    if(facets) {
      var indexKey, count=0;
      for(var key in facets) {
        for(var index of facets[key]) {
          let q = {};
          count++;

          // Get the index key from the config facet list, using the stored facet name
          indexKey = config.facets[key];

          // Add to the main ES query object
          q[indexKey] = index;
          mustMatchFields.push({
            "match_phrase": q 
          });
        }
      }
    }

    // If a collection id is present, scope search to that collection
    if(collection) {
      mustMatchFields.push({
          "match_phrase": {
            "is_member_of_collection": collection
          }
      });
    }

    if(daterange) {

      //mustMatchFields.push(Helper.getDaterangeQuery(daterange));

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
            "match": dateQuery
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
            "match": dateQuery
          });
        }

        // Add the date query array to the bool query object
        mustMatchFields.push({
          "bool": {
            "should": dateMatchFields
          }
        });
      } 
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

    // Querystring and facet search
    var queryObj = {};
    if(query != "" || facets) {
      queryObj = {
        "bool": {
          "should": matchFields,
          "must": mustMatchFields,
          "must_not": restrictions,
          "filter": {
            "bool": {
              "should": matchFields
            }
          }
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
          "must": mustMatchFields,
          "must_not": restrictions
        }
      }
    }

    // Get elasticsearch aggregations object 
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Apply sortBy option
    // var sortArr = [],
    //     sortData = {
    //       "order": "asc",
    //       "ignore_unmapped" : true
    //     };
    // sortArr.push({
    //   "title": sortData
    // });
    //   console.log("TEST sortArr", sortArr);

    // Create elasticsearch data object
    var data = {  
      index: config.elasticsearchIndex,
      type: config.searchIndexName,
      body: {
        from : (pageNum - 1) * pageSize, 
        size : pageSize,
        query: queryObj,
        // sort: sortArr,
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
            index: config.elasticsearchIndex,
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

var returnResponseData = function(facets, response, callback) {
  // Remove selected facet from the facet panelslist
  Helper.removeSelectedFacets(facets, response);
  
  // Return the aggregation results for the facet display
  var responseData = {};
  responseData['facets'] = Helper.removeEmptyFacetKeys(response.aggregations);
  responseData['count'] = response.hits.total;

  try {

    // Create the search results objects
    var results = [], tn, resultData, resultObj;
    for(var result of response.hits.hits) {

      // Get the thumbnail
      tn = config.rootUrl + "/datastream/" + result._source.pid.replace('_', ':') + "/tn";

      // Push a new result object to the results array
      resultObj = {
        title: result._source.title || "No Title",
        tn: tn,
        pid: result._source.pid
      }
      resultObj[config.displayRecordField] = result._source[config.displayRecordField] || {};
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