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

      // for(var key in facets) {
      //   for(var index of facets[key]) {
      //     var q = {};
      //     q[key] = index;
      //     matchFields.push({
      //       "match": q
      //     });
      //   }
      // }

      // TODO: Add filter object ***
    }

      console.log("Page:", page);
      console.log("Matchfields obj:", matchFields);

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
        // TODO: retrieve from helper
        // foreach facet of config.facets
        // aggr[facet] = {"field": facet}
        aggregations: {
          "Creator": {
             "terms": {"field": "namePersonal"}
          },
          "Type": {
             "terms": {"field": "typeOfResource"}
          },
          "Subject": {
             "terms": {"field": "subjectTopic"}
          }
        }
      }
    }
      console.log("Data obj:", data);

    es.search(data, function (error, response, status) {
        var responseData = {};
        if (error){
          console.log("search error: " + error);
          callback({status: false, message: error, data: null});
        }
        else {
          
            // DEV
            console.log("--- Response ---");
            console.log(response);
            console.log("--- Hits ---", response.hits.hits);

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