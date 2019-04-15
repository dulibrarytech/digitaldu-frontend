exports.testObject = function(object) {
	return typeof object != "undefined";
}

exports.isParentObject = function(object) {
  return typeof object.children != 'undefined';
}

exports.isObjectEmpty = function(object) {
	return (Object.entries(object).length === 0 && object.constructor === Object)
}