exports.testObject = function(object) {
	return typeof object != "undefined";
}

exports.isParentObject = function(object) {
  return typeof object.children != 'undefined';
}