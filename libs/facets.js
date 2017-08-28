'use strict';

exports.create = function (facets) {

    var facetObj = {};
    for(var key in facets) {
        facetObj[key] = createList(key, facets[key].buckets);
    }

    return facetObj;
};

function createList(facet, data) {

    var i;
    var html = '';
    for (i = 0; i < data.length; i++) {

        html += '<span><a  href="javascript:document.location.href=selectFacet(\'' + facet + '\', \'' + data[i].key + '\');">' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br>';   // good
    }

    return html;
};

exports.createBreadcrumbTrail = function(data) {
    var i;
    var html = '';
    for (i = 0; i < data.length; i++) {

        html += '<span><a  href="javascript:document.location.href=removeFacet(\'' + data[i].type + '\', \'' + data[i].name + '\');"><strong id="facet-breadcrumb-remove-link">X</strong></a>' + data[i].type + '&nbsp&nbsp<strong id="facet-breadcrumb-sidearrow"> > </strong>&nbsp&nbsp' + data[i].name + '</span>';   // good
    }

    return html;
};

