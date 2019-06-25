exports.testObject = function(object) {
	return (object && typeof object != "undefined");
}

exports.isParentObject = function(object) {
  return (object && object.object_type == "compound");
}

exports.isObjectEmpty = function(object) {
	//return (Object.entries(object).length === 0 && object.constructor === Object)
	for(var key in object) {
        if(object.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.getFileStream = function(path, callback) {
  var fs = require('fs');
  var rstream = fs.createReadStream(path);
  callback(null, rstream);
}

// Extract values from jsonObject. Values to parse out are set in the valueMap:
exports.parseJSONObjectValues = function(valueMap, jsonObject) {
	var valuesObject = {};

	// Locate nested fields in the index
	for(var key in valueMap) {
		var mapObject, recordItem, insert=true, showValue;

		if(valueMap[key][0] == "{") {

			try {
				mapObject = JSON.parse(valueMap[key]) || {};
			}
			catch (e) {
				console.log("Error: Could not parse configuration json object", valueMap);
			}

			for(var subKey in mapObject) {
				recordItem = jsonObject[subKey] || [];

				if(typeof recordItem[0] == "string") {
					valuesObject[key] = recordItem;
				}

				else if(typeof recordItem[0] == "object") {
					showValue = [];
					for(var index in recordItem) {
						for(var data in mapObject[subKey][0]) {
							if(recordItem[index][data] != mapObject[subKey][0][data] && mapObject[subKey][0][data] != "VALUE") {
								insert = false;
							}

							if(mapObject[subKey][0][data]== "VALUE" &&
								typeof recordItem[index][data] != "undefined") {
								showValue.push(recordItem[index][data]);
							}
						}
					}
					if(insert && showValue.length > 0) {
						valuesObject[key] = showValue;
					}
				}
			}
		}

		// Use the value from a flat field
		else {
			if(typeof jsonObject[valueMap[key]] != 'undefined') {
				valuesObject[key] = jsonObject[valueMap[key]];
			}
		}
	}

	return valuesObject;
}

// exports.getNestedObjectField = function(params, object) {
//   var value = "n",
//   	  targetObject = {},
//       pathArray = params.path.split(".");

//     console.log("TEST params in", params);
//     console.log("TEST object in", object);

//   let objects = null;
//   for(var index of pathArray) {
//   	// if(objects) {
//   	// 	console.log("TEST objects", objects);
//   	// }
//   	// else {
//   	 	object = object[index];
//   	// }

// 	// if(typeof object.length != 'undefined') {
// 	// 	objects = object;
// 	// }
// 	// else {
// 	// 	objects = null;
// 	// }
//   }
//   	console.log("TEST reduced object", object);
//   	console.log("TEST objects", objects);

//   return value;
// }