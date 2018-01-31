'use strict';

const es = require('../config/index');
const config = require('../config/config');
const request  = require("request");
const Repository = require('../libs/repository');
const FedoraRepository = require('../libs/repository.fedora');


// Create thumbnail links
var createCollectionList= function(collections) {
  var collectionList = [], tn;
  for(var collection of collections) {

    // Fetch the thumbnail
    tn = Repository.getCommunityTN(collection.id);
    collectionList.push({
        pid: collection.id,
        tn: tn,
        title: collection.title,
        description: collection.description
      });
  }
  return collectionList;
}

var addTNData = function(resultArray) {
  // Foreach in array, add new prop 'tn'
  var tn = "";
  resultArray.forEach(function(result) {
    console.log("Result:",result);
  });
}

exports.getTopLevelCollections = function(callback) {
  Repository.getCommunities().catch(error => {
    console.log("Could not retrieve communities. \nError: ", error);
    callback({status: false, message: error, data: null});
  })
  .then( response => {
      if(response) {
        var list = createCollectionList(JSON.parse(response));
        callback({status: true, data: list});
      }
  });
}

exports.getCollectionsInCommunity = function(communityID, callback) {
  
}

exports.getObjectsInCollection = function(objectID, callback) {

}

exports.searchIndex = function(query, type, facets=null, page=null, callback) {

    // Build elasticsearch matchfields object for query: this object enables field specific searching
    var field = { match: "" };
    var matchFields = [], results = [];

    // Type specific search (if a searchfield is selected)

    if(Array.isArray(type)) {

        //query = "*" + query + "*";
        type.forEach(function(type) {
          var q = {};
          q[type] = query;
          matchFields.push({
              "match": q
          });
        })
    }

    // Search all fields (searchfield == All)
    else {

        var q = {};
        q[type] = query;
        matchFields.push({
          "match": q
        });
    }

    // If facet data is present, add it to the search
    if(facets) {
        console.log("TEST have FACETS");
      var matchFacetFields = [], indexKey, count=0;
      for(var key in facets) {
        for(var index of facets[key]) {
          var q = {};
          count++;

          // Get the index key from the config facet list, using the facet name 
          indexKey = config.facets[key];

          // Add to the main ES query object
          q[indexKey] = index;
          matchFields.push({
            "match": q
          });
        }
      }
    }

    // Build elasticsearch aggregations object from config facet list
    var facetAggregations = {}, field;
    for(var key in config.facets) {
      field = {};
      field['field'] = config.facets[key];
      facetAggregations[key] = {
        terms: field
      };
    }

    // Elasticsearch query object
    var data = {  
      index: config.elasticsearchIndex,
      type: 'data',
      body: {
        from : 0, 
        size : config.maxDisplayResults,
        query: {
            "bool": {
              "should": matchFields
            }
        },
        aggs: {}
      }
    }

    if(facets) {
      data.body.query.bool["minimum_should_match"] = count+1;
    }

    // Query the index
    es.search(data, function (error, response, status) {
      var responseData = {};
      if (error){
        callback({status: false, message: error, data: null});
      }
      else {
        console.log("Have response", response);
        console.log("Have result:", response.hits.hits[0]);
        // Return the aggs for the facet display
        responseData['facets'] = response.aggregations;

        try {
          // Build the search results object
          var results = [], tn;
          for(var result of response.hits.hits) {
            // Convert metadata json to object

            tn = Repository.getDatastreamUrl("tn", result._source.pid.replace('_', ':'));
            results.push({
              title: result._source.title,
              namePersonal: result._source.namePersonal,
              abstract: result._source.modsDescription.substring(0,config.resultDescriptionMaxLength),
              tn: tn,
              pid: result._source.pid
            });
          }
          responseData['results'] = results;

          callback({status: true, data: responseData});
        }
        catch (e) {
          callback({status: false, message: e, data: responseData});
        }
      }
  });
}

exports.fetchObjectByPid = function(pid, callback) {
  var objectData = {
    pid: null
  };
  
  // Remove prefix for index id
  pid = pid.replace(config.institutionPrefix + "_", "");
  pid = pid.replace(config.institutionPrefix + ":", "");
  es.get({
      index: config.elasticsearchIndex,
      type: "data",
      id: pid
  }, function (error, response) {

      if(error) {
        callback({status: false, message: error, data: null});
      }
      else if(response.found) {
        objectData = response._source;
        callback({status: true, data: objectData});
      }
      else {
        callback({status: true, data: objectData});
      }
  });
}