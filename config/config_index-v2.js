'use strict';

module.exports = {

    // Runtime environment
    nodeEnv: process.env.NODE_ENV,

    // Keys
    apiKey: process.env.API_KEY,

    // Domain and paths
    host: process.env.APP_HOST,
    appPath: process.env.CLIENT_PATH,
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,

    // External services
    repositoryUrl: process.env.REPOSITORY,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchPublicIndex: process.env.ELASTICSEARCH_PUBLIC_INDEX,
    elasticsearchPrivateIndex: process.env.ELASTICSEARCH_PRIVATE_INDEX,
    IIIFServerUrl: process.env.CANTALOUPE_URL,
    cantaloupePort: process.env.CANTALOUPE_PORT,

    // Repository settings
    institutionPrefix: "codu",
    topLevelCollectionPID: "codu:root",
    topLevelCollectionName: "Root Collection",
    collectionMimeType: "collection",
    compoundObjectPartID: "-",

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
    //fulltextMetadataSearch: true,

    // Will appear in the view, if an item has no title information
    noTitlePlaceholder: "Untitled",

    /* 
     * Viewer to play audio files
     * [browser | jwplayer | universalviewer | kaltura]
     */
    audioPlayer: "universalviewer",

    /* 
     * Viewer to display video files
     * [videojs | jwplayer | universalviewer | kaltura]
     */
    videoViewer: "universalviewer",

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
     * Universalviewer settings
     */
    universalViewerKalturaPlayer: true,

    // IIIF
    IIIFUrl: process.env.IIIF_URL,

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
    IIIFThumbnailWidth: "200",
    IIIFThumbnailHeight: "250",


    /*
     * Kaltura viewer settings
     */
    kalturaUI_ID: "44058172",
    kalturaPartnerID: "2357732",
    kalturaUniqueObjectID: "kaltura_player_1559751114",
    kalturaPlayerHeight: "923px",  // Height without the transcript player
    kalturaPlayerWidth: "100%",
    showKalturaTitle: false,
    kalturaThumbnailWidth: "200",
    kalturaThumbnailHeight: "250",


    // The index field that contains the display record data
    displayRecordField: "display_record",

    // Image to display if no thumbnail image exists in the repository
    tnPath: "files/thumbnails/",
    thumbnailFileExtension: ".png",
    defaultThumbnailImage: "tn-placeholder.jpg",

    thumbnailPlaceholderImages: {
        "audio-tn.png": ["audio/mp3"],
        "video-tn.png": ["video/mp4"],
        "pdf-tn.png": ["application/pdf"],
        "image-tn.png": ["image/tiff", "image/jp2", "image/jp3"]
    },
    /*
     *  streamOption: [index|iiif|kaltura|external]
     *  uri: if 'external' this is the path to the resource,
     *  source: [repository|remote] if 'index' stream: 'repository' will use repository api to source uri, 'remote' will fetch full uri
     */
    thumbnails: {
        // object_types
        "collection": {
            "streamOption": "index",
            "uri": "", 
            "source": "repository"
        },
        "object": {
            "fileTypes": {
                "smallImage": {
                    "streamOption": "iiif",
                    "uri": "", 
                    "source": ""
                },
                "largeImage": {
                    "streamOption": "iiif",
                    "uri": "", 
                    "source": ""
                },
                "audio": {
                    "streamOption": "kaltura",
                    "uri": "", 
                    "source": ""
                },
                "video": {
                    "streamOption": "kaltura",
                    "uri": "", 
                    "source": ""
                },
                "pdf": {
                    "streamOption": "iiif",
                    "uri": "", 
                    "source": ""
                },
                "compound": {
                    "streamOption": "index",
                    "uri": "",
                    "source": "repository"
                }
            }
        }
    },

    /*
     * Fields for scoped search.  These will appear in 'Search Type' dropdown list
     * "Search type name": Index field to search"
     *
     * View option
     */ 
    searchFields: [
        {"Title": "title"},
        {"Creator": "creator"},
        {"Subject": "subject"},
        {"Type": "type"},
        {"Description": "abstract"}
    ],

    searchSortFields: {
        "Title": "title",
        "Creator": "creator",
        "Date": "display_record.dates.expression",
        "ArchivesspaceID": "display_record.identifiers.identifier"
    },

    // View option
    sortByOptions: {
        "Relevance": "relevance",
        "Title (a - z)": "Title,asc",
        "Title (z - a)": "Title,desc",
        "Date": "Date,asc",
        "Archivesspace ID": "ArchivesspaceID,asc"
    },

    /*
     * Advanced Search query options
     */
    searchTypes: [
        {"Contains": "contains"},
        {"Is": "is"}
        // {"Is Not": "isnot"}
    ],
    booleanSearchFields: [
        {"AND": "and"},
        {"OR": "or"},
        {"NOT": "not"}
    ],

    /*
     * Targeted fields for the advanced search     
     */ 
    advancedSearchFields: [
        {"Title": "title"},
        {"Creator": "creator"},
        {"Subject": "subject"},
        {"Type": "type"},
        {"Description": "description"},
        {"Creation Date": "create_date"},
        {"Authority ID": "authority_id"}
    ],

    /*
     * Fields for fulltext search (search all)
     */ 
    fulltextKeywordSearchFields: [
        {"label": "Title", "id": "title", "field": "title", "boost": "4"},
        {"label": "Creator", "id": "creator", "field": "display_record.names.title", "boost": "2"},
        //{"label": "Creator", "field": "creator", "boost": "3"},
        {"label": "Subject", "id": "subject", "field": "f_subjects", "boost": "2"},
        {"label": "Type", "id": "type", "field": "type", "boost": "2"},
        {"label": "Description", "id": "description", "field": "display_record.notes.content", "boost": "3"},
        {"label": "Creation Date", "id": "create_Date", "field": "display_record.dates.expression", "matchField": "display_record.dates.label", "matchTerm": "creation"},
        {"label": "Authority ID", "id": "authority_id", "field": "display_record.identifiers.identifier", "matchField": "display_record.identifiers.type", "matchTerm": "local"},
    ],

    /*
     * Options for number of search results to be displayed on each page
     */
    resultCountOptions: ["10", "20", "50", "100"],

    /*
     * Search result view list options
     * 'List' and 'Grid' are available without further implementation
     */
    resultsViewOptions: ["List", "Grid"],
    defaultSearchResultsView: "List",

    /*
     * Fuzz factor: number of fuzzy characters in the search terms
     */
    searchTermFuzziness: "1",

    /*
     * Set to false if collection objects should be omitted from search results
     */
    showCollectionObjectsInSearchResults: true,

    /*
     * Facets to display on the search results view
     * Key is the facet label to be displayed, value is the path in the index
     * "Facet name": "index field"
     */
    facets: {
        "Creator": "display_record.names.title",
        "Subject": "f_subjects",
        // "Type": "type",
        "Type": "mime_type",
        "Date": "display_record.dates.expression",
        "Collections": "is_member_of_collection",
        "Authority ID": "display_record.subjects.authority_id"
    },

    /*
     * Specify ordering of the facet list
     */
    facetOrdering: {
        "Date": "desc"
    },

    /*
     * Max number of facets displayed in the facet panel
     */
    facetLimit: 200,

    /*
     * Max number of facets displayed by facet type
     * If the value is less than the above 'facetLimit' value, a 'show all' link will be displayed to display the full set of facets
     */
    facetLimitsByType: {
        "Collections": 15 
    },

     /*
     * Facets to display on the front page
     */
    frontPageFacets: ["Creator", "Subject", "Type"],

    /*
     * Thumbnail images for the frontpage facet panels
     */
    facetThumbnails: {
        "Type": {
            "Still Image": "assets/img/picture-in-frame-TN.png",
            "Moving Image": "assets/img/film-camera-TN.png",
            "Text": "assets/img/old-book-TN.png",
            "Sound Recording": "assets/img/Sound-Wave-icon-TN.png",
            "Music Recording": "assets/img/45_rpm_record-TN.png",
            "Nonmusic Recording": "assets/img/mic-TN.png",
            "Map": "assets/img/map-TN.png",
            "Mixed Material": "assets/img/document-icon-free-0-TN.jpg",
            "3D Object": "assets/img/objects-icon-TN.png"
        }
    },

    /*
     * Create facet display labels to encompass multiple facet values
     */
    facetLabelNormalization: {
        "Type": {
            "Still Image": ["still image", "image/tiff", "image/jp2", "image/jp3"],
            "Moving Image": ["moving image", "moving_image", "video/mp4"],
            "Text": ["text", "text/plain"],
            "Sound Recording": ["sound recording", "sound recording,[object Object]", "audio/mp3"],
            "Music Recording": ["sound recording-musical"],
            "Nonmusic Recording": ["sound recording-nonmusical"],
            "Map": ["cartographic"],
            "Mixed Material": ["mixed material", "application/pdf"],
            "3D Object": ["three dimensional object", "three dimensional object,[object Object]"],
            "Unknown": ["[object Object]"]
        }
    },

    /*
     * Date index fields
     */
    beginDateField: "display_record.dates.begin",
    endDateField: "display_record.dates.end",
    showDateRangeLimiter: true,

    /*
     * Mime Types for each object type
     * Object type determines which viewer is used for each mime type
     * *** Object types are not changeable by user ***
     */
    mimeTypes: {
        "audio": ["audio/mpeg", "audio/x-wav", "audio/mp3"],
        "video": ["video/mp4", "video/quicktime", "video/mov"],
        "smallImage": ["image/png", "image/jpg", "image/jpeg"],
        "largeImage": ["image/tiff", "image/jp2"],
        "pdf": ["application/pdf"]
    },

    /*
     * Available datastreams by object mimetype
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
      * Location of the object file cache
      */
     objectCachePath: "files/object",

     /*
      * File extensions for the local cache.  A request for a datastream will first check the local cache to see if a source file is present.
      * File extension is determined by the object's mimetype
      */
     fileExtensions: {
        "jp2": ["image/tiff"],
        "mp3": ["audio/mp3"],
        "mp4": ["video/mp4"],
        "pdf": ["application/pdf"]
     }
};