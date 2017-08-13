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

exports.searchIndex = function(query, type, callback) {

    var field = { match: "" };
    var matchFields = [], results = [];
    if(type == 'all') {

        // TODO: Add fields dynamically based on config settings (loop config object)
        query = "*" + query + "*";
        var q = {};
         q['title'] = query;
        matchFields.push({
            "wildcard": q
        });
        var q = {};
         q['namePersonal'] = query;
        matchFields.push({
            "wildcard": q
        });
        var q = {};
         q['subjectTopic'] = query;
        matchFields.push({
            "wildcard": q
        });
          console.log("Matchfields: ", matchFields);
    }
    else {

          console.log("Type search: ", type);
        var q = {};
        q[type] = "*" + query + "*";
        matchFields.push({
        	"wildcard": q
        });
          console.log("Matchfields: ", matchFields);
    }

    var data = {  
      index: config.elasticsearchIndex,
      type: 'mods',
      body: {
        query: {
            "bool": {
              "should": matchFields
            }
          }
      }
    }

    es.search(data, function (error, response, status) {
        if (error){
          console.log("search error: " + error);
          callback({status: false, message: error, data: null});
        }
        else {
          // DEV
          console.log("--- Response ---");
          console.log(response);
          console.log("--- Hits ---");

      

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

          console.log("Result arr:", results);

          //results = addTNData(results);
          callback({status: true, data: results});
        }
    });
};