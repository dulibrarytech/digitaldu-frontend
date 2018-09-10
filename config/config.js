'use strict';

module.exports = {

    host: process.env.APP_HOST,
    rootRoute: "repository",
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,

    // ENV settings
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,
    cantaloupeUrl: process.env.CANTALOUPE_URL,
    cantaloupePort: process.env.CANTALOUPE_PORT,


    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu:root",
    topLevelCollectionName: "Root Collection",
    collectionMimeType: "collection",

    // Search results limit
    maxDisplayResults: 1000,

    // Max search results on results page
    maxResultsPerPage: 10,

    // Max number of page links shown in the page list
    maxPaginatorPageLinks: 10,

    // Max characters in result description field
    resultMaxCharacters: 400,

    // Collection results per page
    maxCollectionsPerPage: 12,

    // Namespace path to the indexed search fields, if the fields are not in top-level of item index object.  Include ALL periods
    searchFieldNamespace: "",

    // Will appear in the view, if an item has no title information
    noTitlePlaceholder: "Untitled",

    // Image to display if no thumbnail image exists in the repository
    tnPlaceholderPath: "files/tn-placeholder.jpg",

    // Limit of facet results returned from a search
    facetLimit: 200,

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