'use strict';

module.exports = {
    // Application settings
    fedoraPath: "http://librepo01-vlp.du.edu:8080",
    topLevelCollectionPID: "codu:root",

    // .env configuration
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX
};