'use strict';

exports.create = function (facets) {

    var facetObj = {};
    for(var key in facets) {
        facetObj[key] = createList(facets[key].buckets)
    }

    return facetObj;
};

function createList(data) {

    var i;
    var html = '';
    for (i = 0; i < data.length; i++) {
        html += '<span><a href="#">' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br>';
    }

    return html;
}