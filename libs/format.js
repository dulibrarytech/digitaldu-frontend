/*
 * format.js
 * Format class
 * Custom format functions
 */

const Discovery = require('../discovery/service.js'),
      config = require('../config/config.js');

/*
 * Add custom format functions here
 */
exports.formatFacetDisplay = function(object, callback) {
  formatDateFacets(object["Date"]);
  formatCollectionFacets(object["Collections"], function(error) {
    if(error) {
      callback(error, null);
    }
    else {
      callback(null, object);
    }
  });
}

exports.formatFacetBreadcrumbs = function(object, callback) {
  if(object == null) {
    callback(null, {});
  }
  else {
      formatCollectionBreadcrumbs(object["Collections"], function(error) {
         callback(null, object);
      });
  }
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

var formatCollectionFacets = function(collectionFacets, callback) {
    if(collectionFacets.length < 1) {
      callback(null);
    }
    else {
      var pids = [];
      for(var index of collectionFacets) {
        pids.push(index.key);
      }

      Discovery.getTitleString(pids, [], function(error, data) {

        for(var index in collectionFacets) {
          collectionFacets[index].name = data[index].name;
          collectionFacets[index].facet = pids[index];
          collectionFacets[index].type = "Collection";
        }
        callback(null);
      });
    }
}

var formatCollectionBreadcrumbs = function(breadcrumbFacets, callback) {

  if(!breadcrumbFacets || breadcrumbFacets.length < 1) {
    callback(null);
  }
  else {
    var pids = [];
    for(var index of breadcrumbFacets) {
      pids.push(index.name);
    }

    Discovery.getTitleString(pids, [], function(error, data) {

      for(var index in breadcrumbFacets) {
        breadcrumbFacets[index].name = data[index].name;
        breadcrumbFacets[index].facet = data[index].pid;
        breadcrumbFacets[index].type = "Collections";
      }

      callback(null);
    });
  }

  //callback(null);
}