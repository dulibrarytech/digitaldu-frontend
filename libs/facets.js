'use strict';

exports.create = function (facets) {

    var facetObj = {};
    var creators = createList(facets.agent_sort_name.buckets);
    var creatorNationality = createList(facets.agent_nationality.buckets);
    var workClassifications = createList(facets.work_classification.buckets);

    facetObj.creators = creators;
    facetObj.creatorNationaliies = creatorNationality;
    facetObj.workClassifications = workClassifications;

    return facetObj;
};

function createList(data) {

    var i;
    var html = '';
    for (i = 0; i < data.length; i++) {
        html += '<span style="font-size: 12px;"><a href="#">' + data[i].key + '</a>&nbsp;&nbsp;(' + data[i].doc_count + ')</span><br><br>';
    }

    return html;
}