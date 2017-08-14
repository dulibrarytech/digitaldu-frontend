'use strict';

const es = require('../config/index');
const config = require('../config/config');
const fedora = require('../libs/fedora');

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
        type: "data",
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
      type: 'mods',
      body: {
        from : page, 
        size : config.maxDisplayResults,
        query: {
            "bool": {
              "should": matchFields
            }
        },
        // TODO: retrieve from helper
        // foreach facet of facetList
        // aggr[facet] = {"field": facet}
        aggregations: {
          "namePersonal": {
             "terms": {"field": "namePersonal"}
          },
          "typeOfResource": {
             "terms": {"field": "typeOfResource"}
          },
          "subjectTopic": {
             "terms": {"field": "subjectTopic"}
          }
        }
      }
    }

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
            console.log("---Facets---");
            console.log(response.aggregations.namePersonal.buckets);
            console.log(response.aggregations.subjectTopic.buckets);
            console.log(response.aggregations.typeOfResource.buckets);

          // TODO: build facets object
          // foreach facet in config.facetlist
          // facets[facet] = [][
          // for var index in esponse.aggregations[facet].buckets
          // facets.facet.push({index.key: index.doc_count})

          var results = [], tn;
          response.hits.hits.forEach(function(result){
            //tn = fedora.getTNUrl(pid.replace('_', ':'));
            tn = "assets/img/image-unavailable-2.png";
            results.push({
              title: result._source.title,
              namePersonal: result._source.namePersonal,
              abstract: result._source.abstract,
              tn: tn
            });
          });

          responseData['results'] = results;
          //responseData['facets'] = 

          //results = addTNData(results);
          callback({status: true, data: responseData});
        }
    });
};