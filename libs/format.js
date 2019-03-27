/*
 * format.js
 * Format class
 * Custom format functions
 */

Discovery = require('../discovery/service.js');

/*
 * Add custom format functions here
 */
exports.format = function(object) {
  formatDateFacets(object["Date"]);
  return object;
}

var exampleFormatter = function(object) {
  for(var key of object) {
    // Do something
  }
  return object;
}

var formatDateFacets = function(dateFacets) {
    for(var index of dateFacets) {
      // TODO 
      // Regex for common date entries
      // Normalize to one format:  detect, convert
      // Leave in place but do not format outlier formats (Can add regex for uncommon outliers in future
    }
    return dateFacets;
}

var formatCollectionFacets = function(collectionFacets/*, callback*/) {
        // console.log("TEST controller facet data test:", collectionFacets);
      var pids = [];
      for(var index of collectionFacets) {
        //console.log("TEST collection key", index.key);
        pids.push(index.key);
      }

      // Discovery.getTitleString(pids, [], function(error, data) {
      //   console.log("TEST titles", data);
      //   callback(data);
      // });

      // Get title without the recursive calls?
      return collectionFacets;
}