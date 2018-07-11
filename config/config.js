'use strict';

var protocol = "http";

module.exports = {

    host: process.env.APP_HOST,
    rootRoute: "repository",
    baseUrl: protocol + "://" + process.env.APP_HOST,
    rootUrl: protocol + "://" + process.env.APP_HOST + "/repository",

    // ENV settings
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,
    cantaloupePort: process.env.CANTALOUPE_PORT,


    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu:root",
    collectionMimeType: "collection",

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

    // Will appear in the view, if an item has no title information
    noTitlePlaceholder: "Untitled",

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
    videoViewer: "jwplayer",

    /* 
     * Viewer to display pdf files
     * * PDF-JS currently unavailable
     * [browser | [pdf-js]]
     */
    pdfViewer: "browser",

    /* 
     * Viewer to display large image files (tiff, jp2)
     * [browser | [openseadragon]]
     */
    largeImageViewer: "openseadragon",
    openseadragonImagePath: "/libs/openseadragon/images/",

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
        "Title": ["title"],
        "Creator": {"field": "name", "data": "namePart", "id": {"role": "creator"}},


        "Corporate Creator": "nameCorporate",
        "Publisher": "publisher",
        "Type": "typeOfResource",
        "Genre": "genre",
        "Topic": "subjectTopic",
        "Identifier": "identifier",
        "Language": "language",
        "Access Condition": "accessCondition",
        "Subject": "subject"
    }
};