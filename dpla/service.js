'use strict';

const es = require('../config/index');
const config = require('../config/config');
const dplaConfig = require('../config/config-dpla');

const Discovery = require('../discovery/service');
const JsonParser = require('../libs/json-parser.js');

var createDataObject = function(collectionObjects, callback) {
	var objects = [], object, fields = {};

	for(var collection of collectionObjects) {
		for(var item of collection) {
			object = item._source || {};
			fields = {};

			// Add static fields
			fields["dataProvider"] = "University of Denver";
			fields["isShownAt"] = config.objectAccessDomain + config.objectAccessPath + "/" + (object.pid || "null") + config.objectAccessParams;
			fields["preview"] = config.thumbnailAccessDomain + config.thumbnailAccessPath + "/" + (object.pid || "null") + config.thumbnailAccessParams;
			fields["collectionTitle"] = object.collection_title;
			fields["collectionUrl"] = config.objectAccessDomain + config.objectAccessPath + "/" + (object.is_member_of_collection || "null") + config.objectAccessParams;
			fields["iiifManifest"] = config.iiifAccessDomain + config.iiifAccessPath + "/" + (object.pid || "null") + config.iiifAccessParams;

			// Aaa assigned fields
			var data = {};
			let displayFields = dplaConfig.itemMetadataFields["default"];
			JsonParser.getItemMetadataValues(displayFields, object, data);

			for(var key in displayFields) {
				// If the assigned field is not present in the data, use the default value if it is present. Else, omit the field from the response
				// TODO if multiple fields, iterate array at data[key]
				if(typeof data[key] == 'undefined') {
					if(typeof displayFields[key].default != 'undefined') {
						fields[key] = displayFields[key].default;
					}
				}
				else {
					// Convert the value to text
					if(dplaConfig.itemMetadataFields["default"][key].display == "text" && typeof data[key] == "object") {
						fields[key] = data[key].toString();
					}
					// Display the value as-is
					else {
						fields[key] = data[key];
					}
				}
			}

			objects.push(fields);
		}
	}

	console.log("Returning " + objects.length + " objects");
	callback(null, objects);
}

exports.getObjectArray = async function(callback) {
	var collectionCount,
			collectionTitles = {},
			collections = [];

	Discovery.getCollectionList(async function(error, list) {
		if(error) {
			console.log(error);
		}
		else {
			console.log("DPLA collections:", list);

			if(dplaConfig.maxCollections > 0) {
				list.length = dplaConfig.maxCollections;
			}

			collectionCount = list.length;
			for(var collection of list) {
				collectionTitles[collection.pid] = collection.name;
			}

			collections = await Promise.all(list.map(async (collection) => {
				console.log("Fetching data for collection", collection.name);

				let response = await es.search({
					index: config.elasticsearchPublicIndex,
					body: {
						size: 10000,
					  query: {
						"bool": {
						  "must": [
							  {"match": {"is_member_of_collection": collection.pid}},
								{"match": {"object_type": "object"}}
						  ]
						}
					  }
					}
				});
				if(response.hits.total.value > 0) {
					let objects = response.hits.hits;
					let collectionObjects = [];

					for(var object of objects) {
							object._source["collection_title"] = collectionTitles[object._source.is_member_of_collection] || "No collection title";
							collectionObjects.push(object);
					}

					console.log(collectionObjects.length + " objects found");
					return collectionObjects; 
				}
				else {
						console.log("No items found in collection")
						return [];
				}
			}));

			createDataObject(collections, callback);
		}
	});
}