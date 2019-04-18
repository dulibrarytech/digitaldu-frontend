/*
 * format.js
 * Format class
 * Custom format functions
 */

const Discovery = require('../discovery/service.js'),
      config = require('../config/config.js');

var exampleFormatter = function(object) {
  for(var key of object) {
    // Do something
  }
  return object;
}

/*
 * Add custom format functions here
 */
exports.formatFacetDisplay = function(object, callback) {
  formatTypeFacets(object["Type"] || []);
  formatDateFacets(object["Date"] || []);
  formatCollectionFacets(object["Collections"] || [], function(error) {
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
      formatDateFacets(object["Date"] || []);
      formatCollectionBreadcrumbs(object["Collections"] || [], function(error) {
         callback(null, object);
      });
  }
}

var formatTypeFacets = function(typeFacets) {
    var types = [];
    for(var index of typeFacets) {
      for(var key in config.facetLabelNormalization.Type) {
        if(config.facetLabelNormalization.Type[key].includes(index.facet)) {
          index.name = key;
        }
      }
    }

    return typeFacets;
}

var formatDateFacets = function(dateFacets) {
    var dates = [];
    // for(var index of dateFacets) {
      
    //   // Isolate the year from mm/dd/yyyy entries
    //   if(index.facet.indexOf("/") >= 0) {
    //     index.name = index.facet.replace(/[0-9]+\//g, "");
    //   }

    //   // Remove non numeric characters and spaces
    //   else {
    //     index.name = index.facet.replace(/[a-zA-Z]+\ +/g, "");
    //   }
    // }

    return dateFacets;
}

var formatCollectionFacets = function(collectionFacets, callback) {
    if(collectionFacets.length < 1) {
      callback(null);
    }
    else {
      var pids = [];
      for(var index of collectionFacets) {
          if(index.facet != config.topLevelCollectionPID) {
            pids.push(index.key);
          }
      }

      if(pids.length >= 1) {
        Discovery.getTitleString(pids, [], function(error, data) {
          if(data.length > 0) {
            for(var index in collectionFacets) {
              collectionFacets[index].name = data[index].name;
              collectionFacets[index].facet = pids[index];
              collectionFacets[index].type = "Collection";
            }
          }
      
          callback(null);
        });
      }
      else {
        callback(null);
      }
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