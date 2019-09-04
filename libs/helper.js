var config = require('../config/' + process.env.CONFIGURATION_FILE),
	rs = require('request-stream'),
    fs = require('fs');

/*
 * 
 */
exports.testObject = function(object) {
	return (object && typeof object != "undefined");
}

/*
 * 
 */
exports.isParentObject = function(object) {
  return (object && (object.is_compound == true || object.object_type == "compound" || object.type == "compound"));
}

/*
 * 
 */
exports.isObjectEmpty = function(object) {
	for(var key in object) {
        if(object.hasOwnProperty(key))
            return false;
    }
    return true;
}

exports.getCompoundObjectPart = function(object, partIndex) {
	var parts = [],
		objectPart = null;
		
	/* Part data must appear in Elastic _source object or in _source.display_record */
	if(object.parts) {
		parts = object.parts;
	}
	else if(object[config.displayRecordField] && object[config.displayRecordField].parts) {
		parts = object[config.displayRecordField].parts;
	}

	if(partIndex == -1) {
		objectPart = parts;
	}
	else if(parts.length > 0 && parts[partIndex-1]) {
		objectPart = parts[partIndex-1];
	}

	return objectPart;
}

/*
 * 
 */
exports.createLocalFile = function(path, data, callback) {
  	fs.writeFile(path, data, function(err) {
	    callback(err);
	}); 
}

/*
 * 
 */
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

				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					bucket.push(object[pathArray]);
				}
			}
			else if(object[pathArray] && 
					condition == "false" && 
					object[matchField] != matchValue) {

				if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
					bucket.push(object[pathArray]);
				}
			}
		}
		else if(object[pathArray]) {

			if(bucket.includes(object[pathArray]) === false && object[pathArray].length > 0) {
				bucket.push(object[pathArray]);
			}
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