 /**
 * @file 
 *
 * Facets
 * Create facet objects for the view controllers, and content to display facet data
 */

'use strict';
const config = require('../config/' + process.env.CONFIGURATION_FILE);

/**
 * Create facet display panel html for each facet type
 *
 * @param {Array.<facet>} facets - Array of facet objects
 * @param {Array.<String>} baseUrl - baseUrl to Discovery application - to create facet link (to append facet to the current search)
 * @param {Array.<String>} showAll - Array of facet types, to cancel any limitation setting for that type.  Type names included in this array will cause entire facet list to be rendered in the facet panel
 * @param {Array.<String|null>} expand - Array of facet types.  If a type is included here, its facet panel will be expanded when the containing view is rendered
 *
 * @typedef {Object} facet - Facet display data object
 * @property {String} key - Elastic facet key (from aggregation result)
 * @property {String} doc_count - Number of documents that contain the facet
 * @property {String} type - Facet type, or Elastic 'bucket' name that the facet belongs to.  Used to group facets in the facet panels
 * @property {String} facet - (Same as 'key')
 * @property {String} name - Label to show in the view for this facet.  This can be a pretty version of the facet key
 *
 * @typedef {Object} facetObj - Facet display html by facet type
 * @property {String} [facet name] - html string for facet display
 *
 * @return {facetObj} - Facet display html by facet type
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
 * Create facet breadcrumb html anchor list
 *
 * @param {selectedFacets} selectedFacets - Selected facet data by facet type
 * @param {dateRange} dateRange - baseUrl to Discovery application - to create facet link (to append facet to the current search)
 * @param {String} baseUrl - base url to Discovery application - to create facet link (to append facet to the current search)
 *
 * @typedef {Object} selectedFacets - Currently selected search facets
 * @property {Array.<facetData>} [facet type] - Array of facetData objects for selected facets, by facet type (ex 'Subject')
 *
 * @typedef {Object} facetData - Facet display data object
 * @property {String} name - Facet label 
 * @property {String} facet - Facet value (key)
 *
 * @typedef {Object} dateRange - Selected date range data
 * @property {String} from - Daterange start year (YYYY)
 * @property {String} to - Daterange end year (YYYY)
 *
 * @return {String} - html string of facet breadcrumb links
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
 * Create an object of facet display objects grouped by type
 *
 * @param {Object} esAggregetions - Elastic 'aggregations' response object
 * @param {Array.<String>} showAll - Array of facet types, to cancel any limitation setting for that type.  Type names included in this array will cause entire facet list to be rendered in the facet panel
 *
 * @typedef {Object} facetData - Facet display data objects by type
 * @property {Array.<facet>} [facet type] - Facet display data objects
 *
 * @typedef {Object} facet - Facet display data object
 * @property {String} key - Elastic facet key (from aggregation result)
 * @property {String} doc_count - Number of documents that contain the facet
 * @property {String} type - Facet type, or Elastic 'bucket' name that the facet belongs to.  Used to group facets in the facet panels
 * @property {String} facet - (Same as 'key')
 * @property {String} name - Label to show in the view for this facet.  This can be a pretty version of the facet key
 *
 * @return {facetData}
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

/**
 * Creates a facet display data list from the currently selected facets
 *
 * @param {searchFacets} searchFacets - Selected facet keys by type
 *
 * @typedef {Object} selectedFacetsByType - Facet display data objects by type
 * @property {Array.<String>} [facet type] - Selected facet keys
 *
 * @typedef {Object} facetData - Facet display data object
 * @property {String} name - Facet label 
 * @property {String} facet - Facet value (key)
 *
 * @return {facetData}
 */
 exports.getSearchFacetObject = function(searchFacets) {
    var object = {}, facets = [], name;
    for(var key in searchFacets) {
      object[key] = [];
      facets = searchFacets[key];
      for(var index in facets) {
        name = facets[index];
        for(var label in config.facetLabelNormalization[key]) {
            if(config.facetLabelNormalization[key][label].includes(facets[index])) {
                name = label;
            }
        }

        object[key].push({
          name: name || "",
          facet: facets[index] || ""
        });
      }
    }
    return object;
 }

/**
 * Create an html string of facet panel content, for a single facet type (ex 'Subject')
 *
 * @param {String} facet - Facet type 
 * @param {facet} data - The facet data
 * @param {Array.<String>} baseUrl - baseUrl to Discovery application - to create facet link (to append facet to the current search)
 * @param {Array.<String>} showAll - Array of facet types, to cancel any limitation setting for that type.  Type names included in this array will cause entire facet list to be rendered in the facet panel
 * @param {Array.<String|null>} expand - Array of facet types.  If a type is included here, its facet panel will be expanded when the containing view is rendered
 *
 * @typedef {Object} facet - Facet display data object
 * @property {String} key - Elastic facet key (from aggregation result)
 * @property {String} doc_count - Number of documents that contain the facet
 * @property {String} type - Facet type, or Elastic 'bucket' name that the facet belongs to.  Used to group facets in the facet panels
 * @property {String} facet - (Same as 'key')
 * @property {String} name - Label to show in the view for this facet.  This can be a pretty version of the facet key
 *
 * @return {String} - Html string for facet panel content
 */
function createList(facet, data, baseUrl, showAll, expand) {
    var html = '';

    if(data.length > 0) {
        html += expand.includes(facet) ? '<div id="' + facet + '-window" class="panel facet-panel panel-collapsed" style="display: block"><ul>' : '<div id="' + facet + '-window" class="panel facet-panel panel-collapsed"><ul>';

        // Add the facet list item(s) if facets are present, and not empty
        for (var i = 0; i < data.length; i++) {
            if(data[i].key != "") {
                html += '<li><span class="facet-name"><a onclick="selectFacet(\'' + facet + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\')">' + data[i].name + '</a></span><span class="facet-count">(' + data[i].doc_count + ')</span></li>';                
            }
        }

        // If there is a length limit on this facet, and the facet list returned has more facets than the length limit, add the show all link
        if(facet in config.facetLimitsByType && data.length >= config.facetLimitsByType[facet]) {
            if(showAll.includes(facet)) {
                html += '<li id="show-facets"><a onclick="showLessFacets(\'' + facet + '\')">Show Less</a></li>';
            }
            else if(showAll.includes(facet) === false) {
                html += '<li id="show-facets"><a onclick="showAllFacets(\'' + facet + '\')">Show All</a></li>';
            }
        }
        html += '</ul></div>';
    }
    return html;
};

/**
 * Create an html string of breadcrumb trail content for facets
 *
 * @param {Array.<facet>} data - Array of facet data objects, one for each breadcrumb to display
 * @param {Array.<dateRange>} dates - Selected date range data
 * @param {Array.<String>} baseUrl - baseUrl to Discovery application - to create facet link (to append facet to the current search)
 *
 * @typedef {Object} facet - Facet display data object
 * @property {String} type - Facet type (ex 'Subject')
 * @property {String} facet - Facet key
 * @property {String} name - Label to show in the view for this facet.  This can be a pretty version of the facet key
 *
 * @typedef {Object} dateRange - Selected date range data
 * @property {String} from - Daterange start year (YYYY)
 * @property {String} to - Daterange end year (YYYY)
 *
 * @return {String} - View breadcrumb list html string
 */
function createBreadcrumbTrail(data, dates, baseUrl) {
    // var html = '<a id="new-search-link" href="' + baseUrl + '">Start Over</a>';
    var html = '';

    for (var i = 0; i < data.length; i++) {
        html += '<span><a alt="remove facet" title="remove facet" onclick="removeFacet(\'' + data[i].type + '\', \'' + data[i].facet + '\', \'' + baseUrl + '\')"><strong style="color: red">X</strong></a>&nbsp&nbsp' + data[i].type + '&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + data[i].name + '</span>';   // good
    }

    for (i = 0; i < dates.length; i++) {
        html += '<span><a alt="remove date range" title="remove date range" onclick="removeDateRange(\'' + dates[i].from + '\', \'' + dates[i].to + '\')"><strong style="color: red">X</strong></a>&nbsp&nbspDate Range&nbsp&nbsp<strong style="color: green"> > </strong>&nbsp&nbsp' + dates[i].from + ' - ' + dates[i].to + '</span>';   // good
    }
    return html;
};

