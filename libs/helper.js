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
 * Write file to backend cache
 */
exports.createLocalFile = function(path, data, callback) {
		console.log("TEST using buffer")
	var buffer = new Buffer(data, 'base64');
  	fs.writeFile(path, buffer, function(err) {
  			console.log("TEST writefile error is ", err)
	    callback(err);
	}); 
}