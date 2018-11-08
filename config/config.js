'use strict';

module.exports = {

    // Domain and paths
    host: process.env.APP_HOST,
    rootRoute: process.env.CLIENT_PATH,
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,

    // External services
    repositoryUrl: process.env.REPOSITORY,
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

    // IIIF
    IIIFUrl: process.env.IIIF_URL,

    // Search index name (type)
    searchIndexName: "data",

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

    // Search in the specified metadata keyword fields.  These fields will not appear in the Search Type selections.  Search All is not scoped to the selections that appear in the Search Type list.  
    fulltextMetadataSearch: true,

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
     * Fields for fulltext search (search all)
     * 
     */ 
    metadataKeywordFields: [
        "display_record.abstract",
        "display_record.accessCondition",
        "display_record.classification",
        "display_record.genre",
        "display_record.identifier",
        "display_record.language",
        "display_record.location.url",
        "display_record.name.namePart",
        "display_record.name.role",
        "display_record.note",
        "display_record.originInfo.copyrightDate",
        "display_record.originInfo.d_captured",
        "display_record.originInfo.d_created",
        // "display_record.originInfo.d_issued",    // Check index schema, no date format specified.  Throws error
        "display_record.originInfo.frequency",
        "display_record.originInfo.place",
        "display_record.originInfo.publisher",
        "display_record.physicalDescription.digitalOrigin",
        "display_record.physicalDescription.extent",
        "display_record.physicalDescription.form",
        "display_record.physicalDescription.internetMediaType",
        "display_record.physicalDescription.note",
        "display_record.subject.city",
        "display_record.subject.citySection",
        "display_record.subject.continent",
        "display_record.subject.country",
        "display_record.subject.county",
        "display_record.subject.genre",
        "display_record.subject.geographic",
        "display_record.subject.namePart",
        "display_record.subject.occupation",
        "display_record.subject.region",
        "display_record.subject.role",
        "display_record.subject.temporal",
        "display_record.subject.topic",
        "display_record.tableOfContents",
        "display_record.targetAudience",
        "display_record.title",
        "display_record.typeOfResource"
    ],

    /*
     * Fields for scoped search.  These will appear in 'Search Type' dropdown list
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