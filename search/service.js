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
        matchFields = [], matchFacetFields = [], results = [], restrictions = [],
        queryObj = {},
        queryType;

    // This is a string literal search if the query is contained by parentheses.  Use 'match_phrase'.  Must match the entire query
    if(query[0] == '"' && query[ query.length-1 ] == '"') {
      query = query.replace(/"/g, '');  
      queryType = "match_phrase";
    }

    // This is a wildcard search.  Use 'wildcard'.  Perform an Elasticsearch wildcard query
    else if(query.indexOf('*') >= 0) {
      queryType = "wildcard";
    }

    // This is a regular term search.  Use 'match'.  Will match any word in the query with weighted results.  Closest matches or multiple word matches have higher weight
    else  {
      let qtemp = query;
      query = {
        "query": qtemp,
        "operator": "and",
        "fuzziness": "AUTO"
      }
      queryType = "match";
    }

    // If an array of fields is passed in, search in all of the fields that are present
    if(Array.isArray(type)) {
        type.forEach(function(type) {
          let q = {}, tempObj = {};
          type = config.searchFieldNamespace + type;
          q[type] = query;
          tempObj[queryType] = q;
          matchFields.push(tempObj);
        });
          //console.log("TEST", matchFields); // <-- use multi match
    }

    // Search a single field
    else {
        let q = {}, tempObj = {};
        q[type] = query;
        tempObj[queryType] = q;
        matchFields.push(tempObj);
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
          matchFacetFields.push({
            "match_phrase": q 
          });
        }
      }
    }

    // If a collection id is present, scope search to that collection
    if(collection) {
      matchFacetFields.push({
          "match_phrase": {
            "is_member_of_collection": collection
          }
      });
    }

    // Do not show collection objects
    restrictions.push({
      "match": {
        "object_type": "collection"
      }
    });

    // Do not show objects that are children of compuond objects
    restrictions.push({
      "exists": {
          "field": "is_child_of"
      }
    });

    // Querystring and facet search
    if(query != "" || facets) {
      queryObj = {
        "bool": {
          "should": matchFields,
          "must": matchFacetFields,
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
      queryObj = {
        "bool": {
          "must": matchFacetFields,
          "must_not": {
            "match": {
              "object_type": "collection"
            }
          }
        }
      }
    }

    // Get elasticsearch aggregations object 
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Create elasticsearch query object
    var data = {  
      index: config.elasticsearchIndex,
      type: config.searchIndexName,
      body: {
        from : (pageNum - 1) * pageSize, 
        size : pageSize,
        query: queryObj,
        aggregations: facetAggregations
      }
    }

    // Query the index
    es.search(data, function (error, response, status) {
      if (error || typeof response == 'undefined'){
        callback({status: false, message: error, data: null});
      }
      if(daterange) {

        // Get list of outofrange pids using results
        let pids = Helper.findRecordsNotInRange(response.hits.hits, [daterange.from, daterange.to]);

        // Build resrict object (update data{} arg below)
        for(var index in pids) {
          restrictions.push({
            "match": {
              "pid": pids[index] // restricted pid array
            }
          });
        }

        // Search again
        es.search(data, function (error, response, status) {
          returnResponseData(facets, response, callback);
        });
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
                                "query": query // q
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
  // Remove selected facet from the list
  // TODO move this somewhere else
  for(var facetKey in facets) {
    for(var index in facets[facetKey]) {
      var facetString = facets[facetKey][index],
          bucket = response.aggregations[facetKey].buckets;
      for(let facetIndex in bucket) {
        if(bucket[facetIndex].key == facetString) {
          bucket.splice(facetIndex,1);
        }
      }
    }
  }
  
  // Return the aggregation results for the facet display
  var responseData = {};
  responseData['facets'] = response.aggregations;
  responseData['count'] = response.hits.total;

  try {

    // Create the search results objects
    var results = [], tn, resultData;
    for(var result of response.hits.hits) {

      // Get the thumbnail
      tn = config.rootUrl + "/datastream/" + result._source.pid.replace('_', ':') + "/tn";

      // Get the title and description data for the result listing
      resultData = Helper.getSearchResultDisplayFields(result);

      // Push a new result object to the results array
      results.push({
        title: resultData.title || "Untitled",
        creator: resultData.creator || "Unknown",
        abstract: resultData.description || "No Description",
        tn: tn,
        pid: result._source.pid
      });
    }

    // Add the results array, send the response
    responseData['results'] = results;
    callback(null, responseData);
  }
  catch(error) {
    callback(error, {});
  }
}