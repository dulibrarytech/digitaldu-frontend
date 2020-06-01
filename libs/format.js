  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

/*
 * Format 
 * Custom format functions
 * Customize the facet labels shown in the view or the facet data strings used in a search request
 */

const Discovery = require('../discovery/service.js'),
      config = require('../config/' + process.env.CONFIGURATION_FILE);

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
  formatFacets(object || []); // format all facets
  formatTypeFacets(object["Type"] || []);
  formatDateFacets(object["Date"] || []);
  formatObjectTypeFacets(object["Object Type"] || []);
  formatCollectionFacets(object["Collection"] || [], function(error) {
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
      formatCollectionBreadcrumbs(object["Collection"] || [], function(error) {
         callback(null, object);
      });
  }
}

var formatFacets = function(facets) {
  for(var key in facets) {
    for(var facet of facets[key]) {
      // Replace the quotation characters in the facet data string, which break the dynamically generated link to search the facet
      facet.facet = facet.facet.replace(/'/g, "\'");
      facet.facet = facet.facet.replace(/"/g, '\"');
    }
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
        breadcrumbFacets[index].type = "Collection";
      }

      callback(null);
    });
  }
}

// Capitalize the first char, change 'object' name to 'item'
var formatObjectTypeFacets = function(facets) {
  for(var key in facets) {
    if(facets[key].name == "object") {
      facets[key].name = "Item";
    }
    facets[key].name = facets[key].name[0].charAt(0).toUpperCase() + facets[key].name.slice(1);
  }
}