'use strict';

var protocol = "http";

module.exports = {

    // ENV settings
    baseUrl: protocol + "://" + process.env.APP_HOST + ":" + process.env.APP_PORT,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,

    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu_root",

    // Search results list size
    maxDisplayResults: 10,
    resultMaxCharacters: 400,

    /* 
     * Viewer to play audio files
     * [browser | [ext audio lib]]
     */
    audioPlayer: "jwplayer",

    /* 
     * Viewer to display video files
     * [videojs | jwplayer]
     */
    videoViewer: "jwplayer",

    /* 
     * Viewer to display video files
     * [browser | [ext viewer lib]]
     */
    pdfViewer: "browser",

    /* 
     * Viewer to display large image files (tiff, jp2)
     * [browser | [openseadragon]]
     */
    largeImageViewer: "openseadragon",

    /*
     * List of fields to search.  These will appear in 'Search Type' dropdown list
     * "Search type name": Index field to search"
     */
    searchFields: [
    	{"Title": "title"},
    	{"Creator": "namePersonal"},
    	{"Subject": "subjectTopic"}
    ],

    /*
     * Facets to display
     * "Facet name": "index field"
     */
    facets: {
        "Creator": "namePersonal",
        "Subject": "subjectTopic",
        "Type": "typeOfResource"
    },

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field"
     */
    summaryDisplay: {
        "Title": "title",
        "Description": "abstract"
    },

    /*
     * MODS fields to display in the Details section
     * "Display field name": "index field"
     */
    metadataDisplay: {
        "Title": "title",
        "Subtitle": "subTitle",
        "Creator": "namePersonal",
        "Corporate Creator": "nameCorporate",
        "Publisher": "publisher",
        "Type": "typeOfResource",
        "Topic": "subjectTopic",
        "Identifier": "identifier",
        "Description": "abstract"
    }
};