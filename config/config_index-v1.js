'use strict';

module.exports = {

    // Domain and paths
    host: process.env.APP_HOST,
    appPath: process.env.CLIENT_PATH,
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,

    // External services
    repositoryUrl: process.env.REPOSITORY,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchIndex: process.env.ELASTICSEARCH_INDEX,
    IIIFServerUrl: process.env.CANTALOUPE_URL,
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

    /* 
     * Viewer to play audio files
     * [browser | jwplayer | universalviewer | kaltura]
     */
    audioPlayer: "universalviewer",

    /* 
     * Viewer to display video files
     * [videojs | jwplayer | universalviewer | kaltura]
     */
    videoViewer: "kaltura",

    /* 
     * Viewer to display pdf files
     * * PDF-JS currently unavailable
     * [browser | universalviewer]
     */
    pdfViewer: "universalviewer",

    /* 
     * Viewer to display large image files (tiff, jp2)
     * [browser | openseadragon | universalviewer]
     */
    largeImageViewer: "universalviewer",

    /* 
     * Viewer to display compound objects
     * At this point, multiple compound viewers can not be configured.  
     * [ universalviewer ]
     */
    compoundObjectViewer: "universalviewer",

    /*
     * Openseadragon viewer settings
     */
    openseadragonPathToLibrary: "/libs/openseadragon/openseadragon.min.js",
    openseadragonImagePath: "/libs/openseadragon/images/",

    /* 
     * JWPlayer Settings
     */
    jwplayerPathToLibrary: "/libs/jwplayer_du/jwplayer-du.js",

    /*
     * Kaltura viewer settings
     */
    kalturaUI_ID: "44058172",
    kalturaPartnerID: "2357732",
    //kalturaUniqueObjectID: "kaltura_du_12345",
    kalturaUniqueObjectID: "kaltura_player_1549920112",

    // The index field that holdas the display record data
    displayRecordField: "display_record",

    /*
     * Fields for fulltext search (search all)
     * 
     */ 
    searchKeywordFields: [
        {"field": "title", "boost": "3"},
        {"field": "abstract", "boost": "2"},
        {"field": "creator", "boost": "2"},
        {"field": "subject", "boost": "1"},
        {"field": "display_record.accessCondition"},
        {"field": "display_record.classification"},
        {"field": "display_record.identifier"},
        {"field": "display_record.language"},
        {"field": "display_record.location.url"},
        {"field": "display_record.name.namePart", "boost": "2"},
        {"field": "display_record.note"},
        {"field": "display_record.originInfo.d_captured"},
        {"field": "display_record.originInfo.d_created"},
        {"field": "display_record.originInfo.place", "boost": "1"},
        {"field": "display_record.originInfo.publisher"},
        {"field": "display_record.physicalDescription.digitalOrigin"},
        {"field": "display_record.physicalDescription.extent"},
        {"field": "display_record.physicalDescription.form"},
        {"field": "display_record.physicalDescription.note"},
        {"field": "display_record.subject.city"},
        {"field": "display_record.subject.citySection"},
        {"field": "display_record.subject.continent"},
        {"field": "display_record.subject.country"},
        {"field": "display_record.subject.county"},
        {"field": "display_record.subject.genre"},
        {"field": "display_record.subject.geographic"},
        {"field": "display_record.subject.namePart"},
        {"field": "display_record.subject.occupation"},
        {"field": "display_record.subject.region"},
        {"field": "display_record.subject.role"},
        {"field": "display_record.subject.temporal"},
        {"field": "display_record.subject.topic"},
        {"field": "display_record.typeOfResource"},
        {"field": "display_record.targetAudience"},
        {"field": "display_record.physicalDescription.internetMediaType"}
    ],

    /*
     * Options for results per page
     */
    resultCountOptions: ["10", "20", "50", "100"],

    resultsViewOptions: ["List", "Grid"],
    defaultSearchResultsView: "List",
    showDateRangeLimiter: true,

    searchTermFuzziness: "1",

    /*
     * Fields for scoped search.  These will appear in 'Search Type' dropdown list
     * "Search type name": Index field to search"
     */ 
    searchFields: [
        {"Title": "title"},
        {"Creator": "creator"},
        {"Subject": "subject"},
        {"Type": "type"},
        {"Description": "abstract"}
    ],

    /*
     * Facets to display
     * "Facet name": "index field"
     */
    facets: {
        "Creator": "creator",
        "Subject": "subject",
        "Type": "type",
        "Date": "display_record.originInfo.d_created",
        "Collections": "is_member_of_collection",
        "Authority ID": "display_record.subject.authority_id"
    },

    /*
     * Facets to display on the front page
     */
    frontPageFacets: ["Creator", "Subject", "Type"],

    facetOrdering: {
        "Date": "desc"
    },

    // Limit of facet results returned from a search
    facetLimit: 200,
    facetLimitsByType: {
        "Collections": 15 
    },

    facetDisplayLabel: {
        "Type": {
            "Still Image": "still image",
            "Moving Image": "moving image",
            "Text": "text",
            "Sound Recording": "sound recording",
            "Music Recording": "sound recording-musical",
            "Nonmusic Recording": "sound recording-nonmusical",
            "Map": "cartographic",
            "Mixed Material": "mixed material",
            "3D Object": "three dimensional object",
            "Unknown": "[object Object]"
        }
    },

    /*
     * The date which is used in search results sorting, the date which the object is identified by
     * Key must be "Date", value is location in index display object
     * If multiple dates exist in the index, the first that appears will be used
     */
    objectDateField: "display_record.originInfo.d_created",
    objectDateValue: {
        //"Date": '{"dates":[{"date": "VALUE", "type": "creation"}]}'
        "Date": '{"originInfo":[{"d_created": "VALUE"}]}'
    },
    datespanRange: "5", // "circa"

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    summaryDisplay: {
        "Title": '{"title": ["VALUE"]}',
        "Description": "abstract"
    },

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    resultsDisplay: {
        "Date": '{"originInfo":[{"d_created": "VALUE"}]}',
        "Creator": '{"name": [ { "namePart": "VALUE", "role": "creator" } ]}',
        "Description": "abstract"
    },

    /*
     * MODS fields to display in the Details section
     * Must be valid json, can be application managed in the future (admin)
     * "Display record key": "Display record value"
     */
    metadataDisplayValues: {
        "Title": '{"title": ["VALUE"]}',
        "Creator": '{"name": [ { "namePart": "VALUE", "role": "creator" } ]}',
        "Corporate Creator": '{"name": [ { "namePart": "VALUE", "role": "corporate" } ]}',
        "Abstract": "abstract",
        "Type": '{"typeOfResource":"VALUE"}',
        "Publisher": '{"originInfo":[{"publisher": "VALUE"}]}',
        "Place": '{"originInfo":[{"place": "VALUE"}]}',
        "Date Created": '{"originInfo":[{"d_created": "VALUE"}]}',
        "Date Issued": '{"originInfo":[{"d_issued": "VALUE"}]}',
        "Subject": '{"subject":[ { "namePart": "VALUE" }]}',
        "Topic": '{"subject": [ { "topic": "VALUE" } ]}',
        "Genre": '{"subject": [ { "genre": "VALUE" } ]}',
        "Geographic": '{"subject": [ { "geographic": "VALUE" } ]}',
        "Origin": '{"physicalDescription":[ { "digitalOrigin": "VALUE" }]}',
        "Extent": '{"physicalDescription":[ { "extent": "VALUE" }]}',
        "Form": '{"physicalDescription":[ { "form": "VALUE" }]}',
        "Local Identifier": '{"identifier":"VALUE"}',
        "Access Condition": '{"accessCondition":"VALUE"}',
        "Handle": '{"location":[ { "url": "VALUE" } ]}'
    },

    /*
     * Register datastreams here.  These may not all be available
     * Available datastreams are defined in the Repository interface
     */
     datastreams: {
        "tn": "thumbnail",
        "jpg": ["image/jpeg", "image/jpg"],
        "tiff": ["image/tiff"],
        "mp3": ["audio/mp3", "audio/mpeg", "audio/x-wav"],
        "mp4": ["video/mp4"],
        "mov": ["video/mov"],
        "quicktime": ["video/quicktime"],
        "pdf": ["application/pdf"]
     },

    /*
     * Mime Types for each object type
     * Object type determines which viewer is used for each mime type
     * Keys are not changeable by user
     */
    mimeTypes: {
        "audio": ["audio/mpeg", "audio/x-wav", "audio/mp3"],
        "video": ["video/mp4", "video/quicktime", "video/mov"],
        "smallImage": ["image/png", "image/jpg", "image/jpeg"],
        "largeImage": ["image/tiff", "image/jp2"],
        "pdf": ["application/pdf"]
    },

    /*
     * IIIF Object Types
     * Type labels to appear in the IIIF manifest, for each object type
     * Keys are not changeable by user
     */
    IIIFObjectTypes: {
        "audio": "dctypes:Sound",
        "video": "dctypes:MovingImage",
        "smallImage": "dctypes:Image",
        "largeImage": "dctypes:Image",
        "pdf": "foaf:Document"
    },

    IIIFThumbnailWidth: "600",
    IIIFThumbnailHeight: "600"
};