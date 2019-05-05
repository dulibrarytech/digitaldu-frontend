exports.testObject = function(object) {
	return typeof object != "undefined";
}

exports.isParentObject = function(object) {
  return typeof object.children != 'undefined';
}

exports.isObjectEmpty = function(object) {
	//return (Object.entries(object).length === 0 && object.constructor === Object)
	for(var key in object) {
        if(object.hasOwnProperty(key))
            return false;
    }
    return true;
}

// Extract values from jsonObject. Values to parse out are set in the valueMap:
exports.parseJSONObjectValues = function(valueMap, jsonObject) {
	var valuesObject = {};
	for(var key in valueMap) {
		var mapObject, recordItem, insert=true, showValue;

		if(valueMap[key][0] == "{") {
			mapObject = JSON.parse(valueMap[key]) || {};

			for(var subKey in mapObject) {	// Should only be 1 at first
				recordItem = jsonObject[subKey] || [];

				if(typeof recordItem[0] == "string") {
					valuesObject[key] = recordItem;
				}

				else if(typeof recordItem[0] == "object") {
					showValue = [];
					for(var index in recordItem) {
						for(var data in mapObject[subKey][0]) {
							if(recordItem[index][data] != mapObject[subKey][0][data] && mapObject[subKey][0][data].toLowerCase() != "value") {
								insert = false;
							}

							if(mapObject[subKey][0][data].toLowerCase() == "value" &&
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
		else {
			valuesObject[key] = jsonObject[valueMap[key]];
		}
	}

	return valuesObject;
}