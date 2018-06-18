'use strict';

var protocol = "http";

module.exports = {

    rootRoute: "repository",
    baseUrl: protocol + "://" + process.env.APP_HOST + ":" + process.env.APP_PORT,
    rootUrl: protocol + "://" + process.env.APP_HOST + ":" + process.env.APP_PORT + "/repository",

    // ENV settings
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,
    cantaloupePort: process.env.CANTALOUPE_PORT,


    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu:root",
    collectionMimeType: "",

    /*
     * Begin application settings
     */

    // Search results limit
    maxDisplayResults: 1000,

    // Max search results on results page
    maxResultsPerPage: 10,

    // Max characters in result description field
    resultMaxCharacters: 400,

    // Collection results per page
    maxCollectionsPerPage: 12,

    // Namespace path to the indexed search fields, if the fields are not in top-level of item index object.  Include ALL periods
    searchFieldNamespace: "",

    /*
     * End application settings
     */

    /* 
     * Viewer to play audio files
     * [browser | jwplayer | [ext audio lib]]
     */
    audioPlayer: "browser",

    /* 
     * Viewer to display video files
     * [videojs | jwplayer]
     */
    videoViewer: "videojs",

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
    openseadragonImagePath: "libs/openseadragon/images/",

    /*
     * List of fields to search.  These will appear in 'Search Type' dropdown list
     * "Search type name": Index field to search"
     */ 
    searchFields: [
    	{"Title": "title"},
    	{"Creator": "creator"},
    	{"Subject": "subject"},
        {"Type": "type"},
        {"Description": "modsDescription"}
    ],

    /*
     * Facets to display
     * "Facet name": "index field"
     */
    facets: {
        "Creator": "creator",
        "Subject": "subject",
        "Type": "type"
    },

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
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