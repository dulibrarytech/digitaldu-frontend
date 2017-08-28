'use strict';

exports.testFacetSelect = function() {
    console.log("here..");
}

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
    var tree = "TEST";
    for (i = 0; i < data.length; i++) {
        //html += '<span><a href="#" onclick="selectFacet(\'' + facet + '\', \'' + data[i].key + '\');" >' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br>';

       // html += '<span><a  href="/repository/search?type=All&q=Men%27y#">' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br>';

        html += '<span><a  href="javascript:document.location.href=selectFacet(\'' + facet + '\', \'' + data[i].key + '\');">' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br>';
    }

    return html;
}

