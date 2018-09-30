 /**
 * @file 
 *
 * Search module service functions
 *
 */

'use strict';

const es = require('../config/index');
const fs = require('fs');
const config = require('../config/config');
const request  = require("request");
const Repository = require('../libs/repository');
const Helper = require("./helper");

/**
 * 
 *
 * @param 
 * @return 
 */
exports.searchIndex = function(query, type, facets=null, collection=null, pageNum=1, callback) {

    // Build elasticsearch matchfields object for query: this object enables field specific searching
    var field = { match: "" };
    var matchFields = [], results = [];
    var queryType;

    // This is a string literal search if the query is contained by parentheses.  Use 'match_phrase'
    if(query[0] == '"' && query[ query.length-1 ] == '"') {
      query = query.replace(/"/g, '');
      queryType = "match_phrase";
    }

    // This is a wildcard search.  Use 'wildcard'
    else if(query.indexOf('*') >= 0) {
      queryType = "wildcard";
    }

    // This is a regular term search.  Use 'match'  Query will be tokenized searched with an AND operator
    else  {
      var qtemp = query;
      query = {
        "query": qtemp,
        "operator": "and"
      }
      queryType = "match";
    }

    // Search specified field (type) (if a searchfield is selected)
    if(Array.isArray(type)) {
        //query = "*" + query + "*";
        type.forEach(function(type) {
          var q = {}, tempObj = {};

          type = config.searchFieldNamespace + type;
          q[type] = query;

          tempObj[queryType] = q;
          matchFields.push(tempObj);
        })
    }

    // Search all available fields (searchfield == All)
    else {

        var q = {}, tempObj = {};
        q[type] = query;

        tempObj[queryType] = q;
        matchFields.push(tempObj);
    }

    // If facet data is present, add it to the search
    var matchFacetFields = [];
    if(facets) {
      var indexKey, count=0;
      for(var key in facets) {
        for(var index of facets[key]) {
          var q = {};
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

    // Build query data object.  If query is empty, search for all items that are not collections. 
    var queryObj = {};
    if(query != "" || facets) {
      queryObj = {
        "bool": {
          "should": matchFields,
          "must": matchFacetFields,
          "must_not": {
            "match": {
              "object_type": "collection"
            }
          },
          "filter": {
            "bool": {
              "should": matchFields
            }
          }
        }
      }
    }
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

    // Build elasticsearch aggregations object from config facet list.
    var facetAggregations = Helper.getFacetAggregationObject(config.facets);

    // Build elasticsearch query object.
    var data = {  
      index: config.elasticsearchIndex,
      type: config.searchIndexName,
      body: {
        from : (pageNum - 1) * config.maxResultsPerPage, 
        size : config.maxResultsPerPage,
        query: queryObj,
        aggregations: facetAggregations
      }
    }

    // Query the index.
    es.search(data, function (error, response, status) {

      var responseData = {};
      if (error){
        callback({status: false, message: error, data: null});
      }
      else {

        // Return the aggs for the facet display
        responseData['facets'] = response.aggregations;
        responseData['count'] = response.hits.total;

        try {

          // Build the search results objects
          var results = [], tn, resultData;
          for(var result of response.hits.hits) {

            // Get the thumbnail
            //tn = Repository.getDatastreamUrl("tn", result._source.pid.replace('_', ':'));
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

          // Add results array
          responseData['results'] = results;

          callback({status: true, data: responseData});
        }
        catch (e) {
          callback({status: false, message: e, data: responseData});
        }
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
        callback(body);
    }, function (error) {
        callback(error);
    });
};