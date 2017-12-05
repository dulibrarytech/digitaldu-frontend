'use strict';

const es = require('../config/index');
const config = require('../config/config');
const Repository = require('../libs/repository');


// Create thumbnail links
var createCollectionList= function(pidArray) {
	var updatedArray = [], pid;
	for(var pid of pidArray) {

    // Fetch the thumbnail
		var tn = Repository.getDatastream("TN", pid.replace('_', ':'))

		updatedArray.push({
			  pid: pid,
	    	tn: tn
	    });
	}
	return updatedArray;
};

var addTNData = function(resultArray) {
  // Foreach in array, add new prop 'tn'
  var tn = "";
  resultArray.forEach(function(result) {
    console.log("Result:",result);
  });
}

exports.getCollections = function(pid, callback) {
	var collections = [], collectionList = [];
	// Query ES for all objects with rels-ext/isMemberOfCollection == pid
	es.search({
        index: config.elasticsearchIndex,
        type: "object",
  		q: "rels-ext_isMemberOfCollection:" + pid
    }).then(function (body) {
    	for(var i=0; i<body.hits.total; i++) {
    		collections.push(body.hits.hits[i]._source.pid);      // TODO push title; update param name of creataCollectionList
    	}
    	collectionList = createCollectionList(collections);
	    callback({status: true, data: collectionList});

    }, function (error) {
        	console.log("Error: ", error);
        callback({status: false, message: error, data: null});
    });
};

exports.searchIndex = function(query, type, facets=null, page=null, callback) {

    // Build elasticsearch matchfields object for query: this object enables field specific searching
    var field = { match: "" };
    var matchFields = [], results = [];

    // Type specific search (if a searchfield is selected)
    if(Array.isArray(type)) {

        query = "*" + query + "*";
        type.forEach(function(type) {
          var q = {};
          q[type] = query;
          matchFields.push({
              "wildcard": q
          });
        })
    }

    // Search all fields (searchfield == All)
    else {

        var q = {};
        q[type] = "*" + query + "*";
        matchFields.push({
        	"wildcard": q
        });
    }

    // If facet data is present, add it to the search
    if(facets) {
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
      type: 'object',
      body: {
        from : 0, 
        size : config.maxDisplayResults,
        query: {
            "bool": {
              "should": matchFields
            }
        },
        aggregations: facetAggregations
      }
    }

    if(facets) {
      data.body.query.bool["minimum_should_match"] = count+1;
    }

    // Query the index
    es.search(data, function (error, response, status) {
      var responseData = {};
      if (error){
        console.log("search error: " + error);
        callback({status: false, message: error, data: null});
      }
      else {

        // Return the aggs for the facet display
        responseData['facets'] = response.aggregations;

        // Build the search results object
        var results = [], tn;
        for(var result of response.hits.hits) {
          tn = Repository.getDatastream("TN", result._source.pid.replace('_', ':'));
          results.push({
            title: result._source.title,
            namePersonal: result._source.namePersonal,
            abstract: result._source.abstract.substring(0,config.resultDescriptionMaxLength),
            tn: tn,
            pid: result._source.pid
          });
        }
        responseData['results'] = results;

        callback({status: true, data: responseData});
      }
  });
};

exports.fetchObjectByPid = function(pid, callback) {
  var objectData = {
    pid: null
  };
  
  es.get({
      index: config.elasticsearchIndex,
      type: 'object',
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
};