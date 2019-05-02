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
exports.create = function(facets, baseUrl, showAll=[], expand=[]) {
    var facetObj = {};
    for(var key in facets) {
        if(facets[key].length > 0) {
            facetObj[key] = createList(key, facets[key], baseUrl, showAll, expand);
        }
    }
    return facetObj;
};

/**
 * 
 *
 * @param 
 * @return 
 */
exports.getFacetBreadcrumbObject = function(selectedFacets, dateRange=null, baseUrl) {
    var facets = [], dates = [], buckets;

    // Create the object to populate the view elements
    for(var key in selectedFacets) {
        buckets = selectedFacets[key];

        for(var index of buckets) {
            facets.push({
                type: key,
                name: index.name,
                facet: index.facet
            });
        }
    }   

    if(dateRange && typeof dateRange.from != 'undefined' && typeof dateRange.to != 'undefined') {
        dates.push(dateRange);
    } 

    return createBreadcrumbTrail(facets, dates, baseUrl);
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
function createList(facet, data, baseUrl, showAll, expand) {
    var i;
    var html = '';

    if(data.length > 0) {
        if(expand.includes(facet)) {
            html += '<div id="' + facet + '-window" class="panel facet-panel panel-collapsed" style="display: block"><ul>';
        }
        else {
            html += '<div id="' + facet + '-window" class="panel facet-panel panel-collapsed"><ul>';
        }
        
        for (i = 0; i < data.length; i++) {
            if(data[i].key != "") {
                html += '<li><span class="facet-name"><a href="javascript:document.location.href=selectFacet(\'' + facet + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\');">' + data[i].name + '</a></span><span class="facet-count">(' + data[i].doc_count + ')</span></li>';                
                //html += '<li><span class="facet-name"><a href="#" onclick="selectFacet(\'' + facet + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\');">' + data[i].name + '</a></span><span class="facet-count">(' + data[i].doc_count + ')</span></li>'; //DEV
            }
            else {
                html += "";
            }
        }

        // If there is a length limit on this facet, and the facet list returned has more facets than the length limit, add the show all link
        if(facet in config.facetLimitsByType && data.length >= config.facetLimitsByType[facet]) {
            if(showAll.includes(facet)) {
                html += '<li id="show-facets"><a href="javascript:document.location.href=showLessFacets(\'' + facet + '\')">Show Less</a></li>';
            }
            else if(showAll.includes(facet) === false) {
                html += '<li id="show-facets"><a href="javascript:document.location.href=showAllFacets(\'' + facet + '\')">Show All</a></li>';
            }
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
function createBreadcrumbTrail(data, dates, baseUrl) {
    var html = '';

    html += '<a id="new-search-link" href="' + baseUrl + '">Start Over</a>';

    for (var i = 0; i < data.length; i++) {
        html += '<span><a href="javascript:document.location.href=removeFacet(\'' + data[i].type + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\');"><strong style="color: red">X</strong></a>&nbsp&nbsp' + data[i].type + '&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + data[i].name + '</span>';   // good
        //html += '<span><a href="#" onclick="removeFacet(\'' + data[i].type + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\');"><strong style="color: red">X</strong></a>&nbsp&nbsp' + data[i].type + '&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + data[i].name + '</span>'; // DEV
    }

    for (i = 0; i < dates.length; i++) {
        html += '<span><a href="javascript:document.location.href=removeDateRange(\'' + dates[i].from + '\', \'' + dates[i].to + '\');"><strong style="color: red">X</strong></a>&nbsp&nbspDate Range&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + dates[i].from + ' - ' + dates[i].to + '</span>';   // good
        //html += '<span><a href="#" onclick="removeDateRange(\'' + dates[i].from + '\', \'' + dates[i].to + '\');"><strong style="color: red">X</strong></a>&nbsp&nbspDate Range&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + dates[i].from + ' - ' + dates[i].to + '</span>'; // DEV
    }
       
    //return (data.length > 0 || dates.length > 0) ? html : null;
    return html;
};

