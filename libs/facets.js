 /**
 * @file 
 *
 * Facets class
 * Create facet objects for the view controllers, and content to display facet data
 *
 */

'use strict';
const config = require('../config/config');

/**
 * 
 *
 * @param 
 * @return 
 */
exports.create = function(facets, baseUrl, showAll=[]) {
    var facetObj = {};
    for(var key in facets) {
        facetObj[key] = createList(key, facets[key], baseUrl, showAll);
    }
    return facetObj;
};

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getFacetBreadcrumbObject = function(selectedFacets) {
    var breadcrumbs = [], buckets;

    // Create the object to populate the view elements
    for(var key in selectedFacets) {
        buckets = selectedFacets[key];

        for(var index of buckets) {
            breadcrumbs.push({
                type: key,
                name: index.name,
                facet: index.facet
            });
        }
    }
    return createBreadcrumbTrail(breadcrumbs);
};

/**
 * Create the facet list for the display from the Elastic respone object
 *
 * @param 
 * @return 
 */
 exports.getFacetList = function(esAggregetions, showAll=[]) {
    var list = {};
    for(var key in esAggregetions) {
      list[key] = [];
      for(var item of esAggregetions[key].buckets) {

        if(item.key == config.topLevelCollectionPID) {
            continue;
        }

        // View data
        item.type = key;
        item.facet = item.key;
        item.name = item.key;
        list[key].push(item);

        if(showAll.includes(key) == false && list[key].length >= config.facetLimitsByType[key]) {
          break;
        }
      }
    }
    return list;
 }

 /*
 * Create the facet object for the display from the search query facets
 *
 * @param 
 * @return 
 */
 exports.getSearchFacetObject = function(searchFacets) {
    var object = {}, facets = [];
    for(var key in searchFacets) {
      object[key] = [];
      facets = searchFacets[key];
      for(var index in facets) {
        object[key].push({
          name: facets[index] || "",
          facet: facets[index] || ""
        });
      }
    }
    return object;
 }

/**
 * 
 *
 * @param 
 * @return 
 */
function createList(facet, data, baseUrl, showAll) {
    var i;
    var html = '';
    
    if(data.length > 0) {
        html += '<div class="panel facet-panel panel-collapsed"><ul>';
        for (i = 0; i < data.length; i++) {
            if(data[i].key != "") {
                html += '<li><span class="facet-name"><a href="javascript:document.location.href=selectFacet(\'' + facet + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\');">' + data[i].name + '</a></span><span class="facet-count">(' + data[i].doc_count + ')</span></li>';
            }
            else {
                html += "";
            }
        }

        if(facet in config.facetLimitsByType && showAll.includes(facet)) {
            html += '<li id="show-facets"><a href="javascript:document.location.href=showLessFacets(\'' + facet + '\')">Show Less</a></li>';
        }
        else if(facet in config.facetLimitsByType && showAll.includes(facet) === false) {
            html += '<li id="show-facets"><a href="javascript:document.location.href=showAllFacets(\'' + facet + '\')">Show All</a></li>';
        }

        html += '</ul></div>';
    }

    return html;
};

/**
 * 
 *
 * @param 
 * @return 
 */
function createBreadcrumbTrail(data) {
    var i;
    var html = '';
    for (i = 0; i < data.length; i++) {
        html += '<span><a href="javascript:document.location.href=removeFacet(\'' + data[i].type + '\', \'' + data[i].facet + '\');"><strong style="color: red">X</strong></a>&nbsp&nbsp' + data[i].type + '&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + data[i].name + '</span>';   // good
    }

    return data.length > 0 ? html : null;
};

