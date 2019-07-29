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
     *  locationUrl: if 'external' this is the path to the resource,
     *  source: [repository|remote] if 'index' stream: 'repository' will use repository api to source uri, 'remote' will fetch full uri
     */
    thumbnails: {
        // object_types
        "collection": {
            "streamOption": "index",
            "locationUrl": "", 
            "source": "repository"
        },
        "object": {
            "fileTypes": {
                "image": {
                    "streamOption": "iiif",
                    "locationUrl": "", 
                    "source": ""
                },
                "audio": {
                    "streamOption": "kaltura",
                    "locationUrl": "", 
                    "source": ""
                },
                "video": {
                    "streamOption": "kaltura",
                    "locationUrl": "", 
                    "source": ""
                },
                "pdf": {
                    "streamOption": "iiif",
                    "locationUrl": "", 
                    "source": ""
                }
            }
        },
        "compound": {
            "streamOption": "index",
            "locationUrl": "", 
            "source": "repository"
        }
    },

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

    /*
     * Kaltura viewer settings
     */
    kalturaUI_ID: "44058172",
    kalturaPartnerID: "2357732",
    kalturaUniqueObjectID: "kaltura_player_1559751114",
    kalturaPlayerHeight: "923px",  // Height without the transcript player
    kalturaPlayerWidth: "100%",
    showKalturaTitle: "false",
    kalturaThumbnailWidth: "200",
    kalturaThumbnailHeight: "250",


    // The index field that holdas the display record data
    displayRecordField: "display_record",

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

    searchSortFields: {
        "Title": {"path": "", "field": "title"},
        "Creator": {"path": "", "field": "creator"},
        "Date": {"path": "display_record.dates", "field": "expression", "matchField": "label", "matchValue": "creation"}
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

    // {"Label": "id"}
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
        {"label": "Description", "id": "description", "field": "display_record.dates.notes.content", "boost": "3"},
        {"label": "Creation Date", "id": "create_Date", "field": "display_record.dates.expression", "matchField": "display_record.dates.label", "matchTerm": "creation"},
        {"label": "Authority ID", "id": "authority_id", "field": "display_record.identifiers.identifier", "matchField": "display_record.identifiers.type", "matchTerm": "local"},
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
     * Facets to display
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
     * The date which is used in search results sorting, the date which the object is identified by
     * Key must be "Date", value is location in index display object
     * If multiple dates exist in the index, the first that appears will be used
     */
    objectDateValue: {
        "Date": '{"dates":[{"expression": "VALUE", "label": "creation"}]}'
        //"Date": '{"originInfo":[{"d_created": "VALUE"}]}'
    },
    beginDateField: "display_record.dates.begin",
    endDateField: "display_record.dates.end",

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    summaryDisplay: {
        "Default": {
            "Title": {
                "path": "title"
            },
            "Description": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            }
        }
    },

    /*
     * Fields to display in the summary data section (above Details link)
     * "Display field name": "index field key to match"
     */
    resultsDisplay: {
        "Default": {
            "Creation Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "creation"
            },
            "Creator": {
                "path": "names.title"
            },
            "Description": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            }
        }
    },

    /*
     * MODS fields to display in the Details section
     */
    metadataDisplay: {
        "Default": {
            "Title": {
                "path": "title"
            },
            "Creator": {
                "path": "names.title"
            },
            "Creation Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "creation"
            },
            "Digitization Date": {
                "path": "dates.expression",
                "matchField": "label",
                "matchValue": "digitization"
            },
            "Language": {
                "path": "t_language.text"
            },
            "Abstract": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract"
            },
            "Subjects": {
                "path": "subjects.title"
            },
            "Topics": {
                "path": "subjects.terms.term",
                "matchField": "type",
                "matchValue": "topical"
            },
            "Geographic": {
                "path": "subjects.terms.term",
                "matchField": "type",
                "matchValue": "geographic"
            },
            "Extents": {
                "path": "extents"
            },
            "Resource URI": {
                "path": "uri"
            },
            "Authority ID": {
                "path": "identifiers.identifier",
                "matchField": "type",
                "matchValue": "local"
            },
            "Notes": {
                "path": "notes.content",
                "matchField": "type",
                "matchValue": "abstract",
                "condition": "false"
            }
        }
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

     fileExtensions: {
        "jp2": ["image/tiff"],
        "mp3": ["audio/mp3"],
        "mp4": ["video/mp4"],
        "pdf": ["application/pdf"]
     },
     objectFilePath: "files/object/",

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
    }
};