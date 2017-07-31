'use strict';

module.exports = {
    // Appliation settings
    baseUrl: process.env.APP_HOST + ":" + process.env.APP_PORT,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,

    // Repository settings
    fedoraPath: "http://librepo01-vlp.du.edu:8080",
    topLevelCollectionPID: "codu_root"
};