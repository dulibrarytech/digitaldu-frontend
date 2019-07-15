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

var extractValues = function(pathArray, object, matchField, matchValue, condition, bucket) {
	var nextKey,
		nextObject,
		nextArray;

	// We have drilled into the specified field.  Locate the value
	if(pathArray.length == 1) {
		if(matchField) {
			if(object[pathArray] && 
				condition == "true" && 
				object[matchField] == matchValue) {

				bucket.push(object[pathArray]);
			}
			else if(object[pathArray] && 
					condition == "false" && 
					object[matchField] != matchValue) {

				bucket.push(object[pathArray]);
			}
		}
		else if(object[pathArray]) {
			bucket.push(object[pathArray]);
		}
	}

	// Keep digging
	else {
		nextArray = pathArray.slice();
		nextKey = nextArray.shift();
		nextObject = object[nextKey];

		if(!nextObject) {
			return 0;
		}
		else if(nextObject.length) {
			for(var index in nextObject) {
				extractValues(nextArray, nextObject[index], matchField, matchValue, condition, bucket);
			}
		}
		else {
			extractValues(nextArray, nextObject, matchField, matchValue, condition, bucket);
		}
	}
}
exports.extractValues = extractValues;