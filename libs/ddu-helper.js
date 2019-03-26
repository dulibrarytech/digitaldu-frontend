/*
 * ddu-helper.js
 * Global helper class
 * This class can access any module within the application
 */

Discovery = require('../discovery/service.js'),

exports.testObject = function(object) {
	return typeof object != "undefined";
}

/**
 * 
 *
 * @param 
 * @return 
 */
var getTitleString = function(pids, titles, callback) {
  var pidArray = [], pid;
  if(typeof pids == 'string') {
    pidArray.push(pids);
  }
  else {
    pidArray = pids;
  }
  pid = pidArray[ titles.length ];
  // Get the title data for the current pid
  Discovery.fetchObjectByPid(pid, function (error, response) {
    if(error) {
      callback(error, titles);
    }
    else {

      titles.push({
        name: response ? response.title[0] : "Untitled",
        pid: pid
      });

      if(titles.length == pidArray.length) {
        // Have found a title for each pid in the input array
        callback(null, titles);
      }
      else {
        // Get the title for the next pid in the pid array
        getTitleString(pidArray, titles, callback);
      }
    }
  });
}
exports.getTitleString = getTitleString;