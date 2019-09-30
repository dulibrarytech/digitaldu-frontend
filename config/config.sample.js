 /**
 * @file 
 *
 * config.sample.js
 * Discovery app example configuration file
 */

'use strict';

module.exports = {

    /*
     * Runtime environment
     */
    nodeEnv: process.env.NODE_ENV,

    /*
     * Keys
     */
    apiKey: process.env.API_KEY,

    /*
     * Domain and paths
     */
    host: process.env.APP_HOST,
    appPath: process.env.CLIENT_PATH,
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,

    /*
     * External services
     */
    repositoryDomain: process.env.REPOSITORY_DOMAIN,
    repositoryPath: process.env.REPOSITORY_PATH,
    repositoryProtocol: process.env.REPOSITORY_PROTOCOL,
    repositoryUser: process.env.REPOSITORY_USER,
    repositoryPassword: process.env.REPOSITORY_PWD,
    elasticsearchHost: process.env.ELASTICSEARCH_HOST,
    elasticsearchPort: process.env.ELASTICSEARCH_PORT,
    elasticsearchPublicIndex: process.env.ELASTICSEARCH_PUBLIC_INDEX,
    elasticsearchPrivateIndex: process.env.ELASTICSEARCH_PRIVATE_INDEX,
    IIIFServerUrl: process.env.CANTALOUPE_URL,
    cantaloupePort: process.env.CANTALOUPE_PORT,

    /*
     * Root collection
     */
    topLevelCollectionPID: "{PID}",
    topLevelCollectionName: "Root Collection",

    /*
     * Index type name
     */
    searchIndexType: "{Elastic index type, if any}",

    /*
     * Search results limit
     */
    maxDisplayResults: 1000,

    /*
     * Max search results on results page
     */
    maxResultsPerPage: 10,

    /*
     * Max characters in result description field
     */
    resultMaxCharacters: 400,

    /*
     * Collection results per page
     */
    maxCollectionsPerPage: 12,

    /*
     * Max number of page links shown in the page list
     */
    maxPaginatorPageLinks: 10,

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
     * Set to false if collection objects should be omitted from search results
     */
    showCollectionObjectsInSearchResults: true,

    /*
     * Will appear in the view, if an item has no title information
     */
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
    compoundObjectPartID: "_",  // This must be a character that does not appear in object PID

    /*
     * Openseadragon viewer settings
     * Path relative to /public folder
     */
    openseadragonPathToLibrary: "/libs/openseadragon/openseadragon.min.js",
    openseadragonImagePath: "/libs/openseadragon/images/",

    /* 
     * JWPlayer Settings
     * Path relative to /public folder
     */
    jwplayerPathToLibrary: "/libs/jwplayer_du/jwplayer-du.js",

    /*
     * Universalviewer settings
     * Embed a Kaltura player in the Universal Viewer to play audio and video files 
     * Objects must have an 'entry_id' field containing the Kaltura ID
     */
    universalViewerKalturaPlayer: true,

    /*
     * IIIF API 
     */
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
    kalturaUI_ID: "{UIID}",
    kalturaPartnerID: "{PARTNER_ID}",
    kalturaUniqueObjectID: "{OBJECT_ID}",
    kalturaPlayerHeight: "900px",  // Height without the transcript player
    kalturaPlayerWidth: "100%",
    showKalturaTitle: false,
    kalturaThumbnailWidth: "200",
    kalturaThumbnailHeight: "250",

    /*
     * Date range field configuration
     * Specify a 'begin date' field and an 'end date' field to enable date range search queries
     * If the date fields are nested and there are multiple date objects (ex. creation and publication) specify which date field to use:
     * 'dateFieldMatchField' Identifies the correct date field to use in range query
     * 'dateFieldMatchValue' Value to identify the correct date field to use in range query
     */
    beginDateField: "display_record.dates.begin",
    endDateField: "display_record.dates.end",
    showDateRangeLimiter: true,
    nestedDateField: true,  // true if date data type is "nested"
    dateFieldMatchField: "display_record.dates.label",
    dateFieldMatchValue: "creation",

    /*
     * Define object types here, associte with object mime types
     */
    objectTypes: {
        "audio": ["audio/mpeg", "audio/x-wav", "audio/mp3"],
        "video": ["video/mp4", "video/quicktime", "video/mov"],
        "smallImage": ["image/png", "image/jpg", "image/jpeg"],
        "largeImage": ["image/tiff", "image/jp2"],
        "pdf": ["application/pdf"]
    },


    /*
     * The index field that contains the display record data
     */
    displayRecordField: "display_record",

    /*
     * Image to display if no thumbnail image exists in the repository
     * Before a thumbnail is rendered, this location is checked for a source file before requesting it from the repository
     */
    tnPath: "files/thumbnails/",
    thumbnailFileExtension: ".png",
    defaultThumbnailImage: "tn-placeholder.jpg",

    /*
     * Object specific default thumbnail images
     * { "object type" : "image filename" }
     */
    thumbnailPlaceholderImages: {
        "audio": "audio-tn.png",
        "video": "video-tn.png",
        "pdf": "pdf-tn.png",
        "smallImage": "image-tn.png",
        "largeImage": "image-tn.png"
    },

    /*
     *  Declare thumbnail image sources here for each object type/file type
     *
     *  streamOption: [index|iiif|kaltura|external]
     *  uri: if 'external' this is the path to the resource,
     *  source: [repository|remote] if 'index' stream: 'repository' will use repository api to source uri, 'remote' will fetch full uri
     */
    thumbnails: {
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
     * Fulltext search fields 
     * Define all search fields here
     *
     * @example - Index display record
     *      "subjects": [
     *           {
     *               "authority": "lcsh",
     *               "title": "Deciduous",
     *               "terms": [
     *                   {
     *                       "type": "subject",
     *                       "term": "Maine"
     *                   }
     *               ],
     *               "authority_id": ""
     *           },
     *           {
     *               "authority": "lcsh",
     *               "title": "Forestry",
     *               "terms": [
     *                   {
     *                       "type": "topic",
     *                       "term": "Forests"
     *                   }
     *               ],
     *               "authority_id": ""
     *           }
     *       ]
     *
     * @example - searchAllField object example
     *         // Use the "term" field value if the sibling field "type" has the value "topic".  Other "term" values will be ignored
     *         {"label": "Subject", "id": "subject", "field": "subjects.terms", "matchField": "subjects.terms.type", "matchTerm": "topic"} 
     *
     *          // If field data is of type "nested", set the "isNestedType" param to true to enable searching within nested data
     *          {"label": "Subject", "id": "subject", "field": "subjects.terms", "matchField": "subjects.terms.type", "matchTerm": "topic", "isNestedType": "true"} 
     */ 
    searchAllFields: [
        {"label": "Collection", "id": "collection", "field": "is_member_of_collection"},
        {"label": "Title", "id": "title", "field": "title", "boost": "1"},
        {"label": "Description", "id": "description", "field": "abstract", "boost": "3"}
    ],

    /*
     * Selectable search fields for the standard search.  These will appear in 'Search Type' dropdown list
     * (ex { "Label" : "searchAllFields.id" })
     */ 
    searchFields: [
        {"Title": "title"},
        {"Description": "description"}
    ],

    /*
     * Selectable search fields for the advanced search
     * { "Label" : "searchAllFields.id" }     
     */ 
    advancedSearchFields: [
        {"Title": "title"},
        {"Description": "description"}
    ],

    /*
     * Search result sort fields
     * Ex. Will sort on names.namePart value if names.role == 'creator'
     * { "Creator" : {
     *          "path": "names.namePart",
     *          "matchField": "names.role",
     *          "matchValue": "creator"
     *     }
     * }
     */
    searchSortFields: {
        "Title": {
            "path": "title"
        }
    },

    collectionSortFields: {
        "Title": {
            "path": "title.keyword"
        }
    },

    /*
     * Options to appear in the search sort dropdown menu
     * { "Display Label" : "searchSortField display label, [asc|desc]" }
     */
    sortByOptions: {
        "Relevance": "relevance", // default
        "Title (a - z)": "Title,asc",
        "Title (z - a)": "Title,desc"
    },

    collectionSortByOptions: {
        "Title (a - z)": "Title,asc",
        "Title (z - a)": "Title,desc"
    },

    /*
     * Advanced Search query options
     */
    searchTypes: [
        {"Contains": "contains"},
        {"Is": "is"}
    ],
    booleanSearchFields: [
        {"AND": "and"},
        {"OR": "or"},
        {"NOT": "not"}
    ],

    /*
     * Fuzz factor: number of fuzzy characters in the search terms
     */
    searchTermFuzziness: "2",

    /*
     * Facets to display on the search results view
     * { "Facet Label" : "path.to.index.field" }
     */
    facets: {
        "Type": "type",
        "Date": "{path.to.date.field}",
        "Collections": "is_member_of_collection"
    },

    /*
     * Specify ordering of the facet lists
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
    frontPageFacets: ["Type", "Collections"],

    /*
     * Thumbnail images for the frontpage facet panels
     * Path is relative to the /public folder
     */
    facetThumbnails: {
        "Type": {
            "Still Image": "assets/img/picture-in-frame-TN.png",
            "Moving Image": "assets/img/film-camera-TN.png",
            "Text": "assets/img/old-book-TN.png"
        }
    },

    /*
     * Create facet display labels to select multiple facet values
     */
    facetLabelNormalization: {
        "Type": {
            "Still Image": ["still image", "image/tiff", "image/jp2", "image/jp3"],
            "Moving Image": ["moving image", "moving_image", "video/mp4"],
            "Text": ["text", "text/plain"]
        }
    },

    /*
     * Assign datastream IDs for objects by object mimetype
     * For dynamic generation of the /datastream uri (internal use only). 
     * The datastreams listed here will be appended to the uri (/datastream/{PID}/{datastreams key}), and the repository interface will receive the datastream key
     * Currently, the Duraspace repository interface does not use this data
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
      * Object files must be named {PID}.{file extension} ex: 12345.jpg
      * Configure file extensions for object mime types below
      * Before an object is rendered, this location is checked for a source file before requesting it from the repository
      */
     objectCachePath: "files/object",

     /*
      * File extensions for the local cache.  A request for a datastream will first check the local cache to see if a source file is present.
      */
     fileExtensions: {
        "jp2": ["image/tiff"],
        "mp3": ["audio/mp3"],
        "mp4": ["video/mp4"],
        "pdf": ["application/pdf"]
     }
};