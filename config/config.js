'use strict';

module.exports = {
    // Appliation settings
    baseUrl: process.env.APP_HOST + ":" + process.env.APP_PORT,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,

    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu_root",

    // Search settings
    // {display field : index field}
    searchFields: [
    	{"Title": "title"},
    	{"Creator": "namePersonal"},
    	{"Subject": "subjectTopic"}
    ]
};