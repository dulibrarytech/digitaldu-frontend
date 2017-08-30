'use strict';

const es = require('../config/index');
const config = require('../config/config');
const fedora = require('../libs/fedora');
const display = require('../libs/display');

// Compose links to Fedora repository
var createCollectionList= function(pidArray) {
	var updatedArray = [], pid;
	for(var pid of pidArray) {

		// DEV Use Fedora TN datastream
		var tn = fedora.getTNUrl(pid.replace('_', ':'))

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
    		collections.push(body.hits.hits[i]._source.pid);
    	}
    	collectionList = createCollectionList(collections);
	    callback({status: true, data: collectionList});

    }, function (error) {
        	console.log("Error: ", error);
        callback({status: false, message: error, data: null});
    });
};

exports.searchIndex = function(query, type, facets=null, page=null, callback) {

      console.log("Search: facets in:", facets);

    // Build elasticsearch matchfields object for query
    var field = { match: "" };
    var matchFields = [], results = [];
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

      console.log("Matchfields obj:", matchFields);

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
        from : page, 
        size : config.maxDisplayResults,
        query: {
            "bool": {
              "should": matchFields
            }
        },
        aggregations: facetAggregations
      }
    }
      console.log("Data obj:", data);

    if(facets) {
      data.body.query.bool["minimum_should_match"] = count+1;
        console.log("Facet count", count);
    }

    // Query the index
    es.search(data, function (error, response, status) {
        var responseData = {};
        if (error){
          console.log("search error: " + error);
          callback({status: false, message: error, data: null});
        }
        else {
          
            // DEV
            // console.log("--- Response ---");
            // console.log(response);
            // console.log("--- Hits ---", response.hits.hits);

          responseData['facets'] = response.aggregations;

          // Build the search results object
          var results = [], tn;
          for(var result of response.hits.hits) {
            tn = fedora.getTNUrl(result._source.pid.replace('_', ':'));
            results.push({
              title: result._source.title,
              namePersonal: result._source.namePersonal,
              abstract: result._source.abstract.substring(0,400),
              tn: tn,
              pid: result._source.pid
            });
          }
          responseData['results'] = results;

          callback({status: true, data: responseData});
        }
    });

    exports.fetchObjectByPid = function(pid, callback) {
      var objectData = {};
        console.log("Get object data for:", pid);
      
      // client.get({
      //     index: config.elasticsearchIndex,
      //     type: 'object',
      //     id: pid
      // }, function (error, response) {
      //     // ...
      // });
      callback({status: true, data: objectData})
    };
};