  /**
    Copyright 2019 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

 /**
 * @file 
 *
 * config.js
 * Discovery app configuration file
 */

'use strict';

module.exports = {
    appTitle: "Digital Collections @ DU",

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
    port: process.env.APP_PORT,
    host: process.env.APP_HOST,
    appPath: process.env.CLIENT_PATH,
    baseUrl: process.env.CLIENT_HOST,
    rootUrl: process.env.CLIENT_HOST + process.env.CLIENT_PATH,
    webSocketDomain: process.env.WEB_SOCKET_DOMAIN,
    webSocketPort: process.env.WEB_SOCKET_PORT,

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

    /*
     * Root collection
     */
    topLevelCollectionPID: "codu:root",
    topLevelCollectionName: "Collection",

    /*
     * Index type name
     */
    searchIndexType: "data",

    /*
     * Search results limit
     */
    maxDisplayResults: 1000,
    maxElasticSearchResultCount: 10000,

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
    defaultHomePageCollectionsCount: 12,
    defaultCollectionsPerPage: 10,

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
     * [openseadragon | universalviewer]
     */
    largeImageViewer: "universalviewer",

    /* 
     * Message to display in the object viewer if the object can not be rendered. Can be html
     */
    viewerErrorMessage: "This object could not be rendered. <br><br>Please contact <a href='mailto:archives@du.edu'>archives@du.edu</a> if you have any questions about accessing this object.",

    /* 
     * Viewer to display compound objects
     * At this point, multiple compound viewers can not be configured.  
     * [ universalviewer ]
     */
    compoundObjectViewer: "universalviewer",
    compoundObjectPartID: "_",

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
     */
    universalViewerKalturaPlayer: true,

    /*
     * Download options
     */
    enableFileDownload: true,
    enableCompoundObjectBatchDownload: true,
    batchFileDownloadTemporaryFolder: "./cache/download/temporary-download",

    /*
     * IIIF API 
     */
    IIIFServerUrl: process.env.IIIF_IMAGE_SERVER_URL + process.env.IIIF_IMAGE_SERVER_PATH,
    IIIFServerDomain: process.env.IIIF_IMAGE_SERVER_URL,
    IIIFDomain: process.env.IIIF_DOMAIN,
    IIIFUrl: process.env.IIIF_DOMAIN + process.env.IIIF_PATH,
    IIIFAPiKeyPrefix: "__",
    IIIFManifestPageSize: null,
    IIIFUseGenericImageData: true,
    IIIFDefaultCanvasHeight: 1000,
    IIIFDefaultCanvasWidth: 750,

    /*
     * IIIF Object Types
     * Type labels to appear in the IIIF manifest, for each object type
     * Keys are not changeable by user
     */
    IIIFObjectTypes: {
        "audio": "dctypes:Sound",
        "video": "dctypes:MovingImage",
        "still image": "dctypes:Image",
        "pdf": "foaf:Document"
    },

    IIIFThumbnailWidth: 200,
    IIIFThumbnailHeight: null,


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

    /*
     * Date range field configuration
     * Specify a 'begin date' field and an 'end date' field to enable date range search queries
     * If the date fields are nested and there are multiple date objects (ex. creation and publication) specify which date field to use:
     * 'dateFieldMatchField' Field to determine date field to use in range query
     * 'dateFieldMatchValue' Value to determine date field to use in range query
     */
    beginDateField: "display_record.dates.begin",
    endDateField: "display_record.dates.end",
    nestedDateField: true,  // true if date data type is "nested"
    dateFieldMatchField: "display_record.dates.label",
    dateFieldMatchValue: "creation",

    showSearchResultsDateRangeLimiter: true,
    showCollectionViewDateRangeLimiter: true,
    defaultDaterangeFromDate: "1800",

    /*
     * Define object types here, associte with object mime types
     */
    objectTypes: {
        "audio": ["audio/mpeg", "audio/x-wav", "audio/mp3"],
        "video": ["video/mp4", "video/quicktime", "video/mov"],
        "still image": ["image/png", "image/jpg", "image/jpeg", "image/tiff", "image/jp2"],
        "pdf": ["application/pdf"]
    },

    /*
     * Image to display if no thumbnail image exists in the repository
     * Before a thumbnail is rendered, this location is checked for a source file before requesting it from the repository
     */
    thumbnailDefaultImagePath: "files/default/thumbnail/",
    thumbnailFileExtension: "jpg",
    defaultThumbnailImage: "tn-placeholder.jpg",
    thumbnailImageCacheEnabled: false,
    thumbnailImageCacheLocation: "cache/thumbnail",
    objectDerivativeCacheEnabled: false,
    objectDerivativeCacheLocation: "/var/cache/digcoll",

    /*
     * Object types to cache
     * Add to array
     * ["audio" | "video" | "still image" | "pdf"]
     */
    cacheTypes: ["pdf"],

    /*
     * Object specific default thumbnail images
     * { "object type" : "image filename" }
     */
    thumbnailPlaceholderImages: {
        "audio": "audio-tn.png",
        "video": "video-tn.png",
        "pdf": "pdf-tn.png",
        "still image": "image-tn.png"
    },

    /*
     *  Declare thumbnail image sources here for each object type/file type
     *
     *  streamOption: [index|iiif|kaltura|external]
     *  uri: if 'external' this is the path to the resource,
     *  source: [repository|remote] if 'index' stream: 'repository' will use repository api to source uri, 'remote' will request data from uri
     */
    thumbnails: {
        "collection": {
            "streamOption": "index",
            "uri": "", 
            "source": "remote",
            "cache": false
        },
        "object": {
            "type": {
                "still image": {
                    "streamOption": "iiif",
                    "uri": "", 
                    "source": "repository",
                    "cache": false
                },
                "audio": {
                    "streamOption": "kaltura",
                    "uri": "", 
                    "source": "remote",
                    "cache": false
                },
                "video": {
                    "streamOption": "kaltura",
                    "uri": "", 
                    "source": "remote",
                    "cache": false
                },
                "pdf": {
                    "streamOption": "iiif",
                    "uri": "", 
                    "source": "remote",
                    "cache": false
                },
                "compound": {
                    "streamOption": "index",
                    "uri": "",
                    "source": "repository",
                    "cache": false
                }
            }
        }
    },

    /*
     * The index field that contains the display record data
     */
    displayRecordField: "display_record",
    removemetadataDisplayHtml: true,

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
     *                       "type": "topic",``
     *                       "term": "Forests"
     *                   }
     *               ],
     *               "authority_id": ""
     *           }
     *       ]
     *
     * @example - searchAllField object example
     *          // Use the "term" field value if the sibling field "type" has the value "topic".  Other "term" values will be ignored
     *          {"label": "Subject", "id": "subject", "field": "subjects.terms", "matchField": "subjects.terms.type", "matchTerm": "topic"} 
     *
     *          // If field data is of type "nested", set the "isNestedType" param to true to enable searching within nested data
     *          {"label": "Subject", "id": "subject", "field": "subjects.terms", "matchField": "subjects.terms.type", "matchTerm": "topic", "isNestedType": "true"} 
     */ 
    searchAllFields: [
        {"label": "Title", "id": "title", "field": "title", "boost": "5"},
        {"label": "Collection", "id": "collection", "field": "is_member_of_collection", "boost": "6"},
        {"label": "Creator", "id": "creator", "field": "creator", "boost": "3"},
        {"label": "Subject", "id": "subject", "field": "f_subjects", "boost": "2"},
        {"label": "Topic", "id": "topic", "field": "display_record.subjects.terms.term", "matchField": "display_record.subjects.terms.type", "matchTerm": "topical"},
        {"label": "Format", "id": "type", "field": "type", "boost": "3"},
        {"label": "Description", "id": "description", "field": "abstract", "boost": "4"},
        {"label": "Language", "id": "language", "field": "display_record.t_language.text", "boost": "1"},
        {"label": "Creation Date", "id": "create_date", "field": "display_record.dates.expression", "isNestedType": "true", "matchField": "display_record.dates.label", "matchTerm": "creation"},
        {"label": "Archival Identifier", "id": "call_number", "field": "display_record.identifiers.identifier", "isNestedType": "true", "matchField": "display_record.identifiers.type", "matchTerm": "local"},
        {"label": "Transcript", "id": "transcript", "field": "transcript"}
    ],

    /*
     * Selectable search fields for the standard search.  These will appear in 'Search Type' dropdown list
     * (ex { "Label" : "searchAllFields.id" })
     */ 
    searchFields: [
        {"Title": "title"},
        {"Creator": "creator"},
        {"Subject": "subject"},
        {"Format": "type"},
        {"Description": "description"}
    ],

    /*
     * Selectable search fields for the advanced search
     * { "Label" : "searchAllFields.id" }     
     */ 
    advancedSearchFields: [
        {"Title": "title"},
        {"Creator": "creator"},
        {"Subject": "subject"},
        {"Format": "type"},
        {"Description": "description"},
        {"Creation Date": "create_date"},
        {"Language": "language"},
        {"Archival Identifier": "call_number"},
        {"Topic": "topic"},
        {"Collection": "collection"},
        {"Transcript Text": "transcript"}
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
            "path": "title",
            "matchField": "",
            "matchTerm": ""
        },
        "Creator": {
            "path": "creator"
        },
        "Creation Date": {
            "path": "display_record.dates.begin",
            "matchField": "display_record.dates.label",
            "matchTerm": "creation"
        },
        "Archival Identifier": {
            "path": "display_record.identifiers.identifier",
            "matchField": "display_record.identifiers.type",
            "matchTerm": "local"
        }
    },
    defaultSearchSortField: "relevance",

    collectionSortFields: {
        "Title": {
            "path": "title"
        },
        "Archival Identifier": {
            "path": "display_record.identifiers.identifier",
            "matchField": "display_record.identifiers.type",
            "matchTerm": "local"
        },
        "Creation Date": {
            "path": "display_record.dates.begin",
            "matchField": "display_record.dates.label",
            "matchTerm": "creation"
        }
    },
    defaultCollectionSortField: "Creation Date,asc",

    /*
     * Options to appear in the search sort dropdown menu
     * { "Display Label" : "searchSortField display label, [asc|desc]" }
     */
    sortByOptions: {
        "Relevance": "relevance", // default
        "Title (a - z)": "Title,asc",
        "Title (z - a)": "Title,desc",
        "Creator (a - z)": "Creator,asc",
        "Creator (z - a)": "Creator,desc",
        "Creation Date (oldest to newest)": "Creation Date,asc",
        "Creation Date (newest to oldest)": "Creation Date,desc",
        "Archival Identifier (a to z)": "Archival Identifier,asc",
        "Archival Identifier (z to a)": "Archival Identifier,desc"
    },

    collectionSortByOptions: {
        "Creation Date (oldest to newest)": "Creation Date,asc", // default
        "Creation Date (newest to oldest)": "Creation Date,desc",
        "Title (a - z)": "Title,asc",
        "Title (z - a)": "Title,desc",
        "Archival Identifier (a to z)": "Archival Identifier,asc", 
        "Archival Identifier (z to a)": "Archival Identifier,desc"
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
    searchTermFuzziness: "1",

    /*
     * Label to use for the object "type" facet panels
     */
    typeLabel: "Format",

    /*
     * Facets to display on the search results view
     *
     * @example
     * { "Creator" : {
     *          "path": "names.namePart",
     *          "matchField": "names.role",
     *          "matchValue": "creator"
     *     }
     * }
     */
    facets: {
        "Creator": {
            "path": "display_record.names.title"
        },
        "Subject": {
            "path": "f_subjects"
        },
        "Format": {
            "path": "type",
        },
        "Date": {
            "path": "display_record.dates.expression",
            "matchField": "display_record.dates.label",
            "matchTerm": "creation"
        },
        "Collection": {
            "path": "is_member_of_collection"
        },
        "Object Type": {
            "path": "object_type"
        }
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
        "Collection": 15 
    },

     /*
     * Facets to display on the front page
     */
    frontPageFacets: ["Creator", "Subject"],

    /*
     * Thumbnail images for the frontpage facet panels
     * Path is relative to the /public folder
     */
    facetThumbnails: {
        "Format": {
            "Still Image": "assets/img/picture-in-frame-TN.png",
            "Moving Image": "assets/img/film-camera-TN.png",
            "Text": "assets/img/old-book-TN.png",
            "Sound Recording": "assets/img/Sound-Wave-icon-TN.png",
            "Music Recording": "assets/img/45_rpm_record-TN.png",
            "Nonmusic Recording": "assets/img/mic-TN.png",
            "Map": "assets/img/map-TN.png",
            "Mixed Material": "assets/img/pdf2-icon-TN.png",
            "3D Object": "assets/img/objects-icon-TN.png",
            "Collection": "assets/img/filebox-icon-TN.png"
        }
    },

    /*
     * Create facet display labels to select multiple facet values
     */
    facetLabelNormalization: {
        "Format": {
            "Still Image": ["still image", "image/tiff", "image/jp2", "image/jp3"],
            "Moving Image": ["moving image", "moving_image", "video/mp4"],
            "Text": ["text", "text/plain"],
            "Sound Recording": ["sound recording", "sound recording,[object Object]", "audio/mp3"],
            "Music Recording": ["sound recording-musical"],
            "Nonmusic Recording": ["sound recording-nonmusical", "sound recording nonmusical"],
            "Map": ["cartographic"],
            "Mixed Material": ["mixed material", "application/pdf", "mixed materials"],
            "3D Object": ["three dimensional object", "three dimensional object,[object Object]"],
            "Unknown": ["[object Object]"],
            "Collection": ["collection"]
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
        "jp2": ["image/tiff"],
        "mp3": ["audio/mp3", "audio/mpeg", "audio/x-wav"],
        "mp4": ["video/mp4"],
        "mov": ["video/mov"],
        "quicktime": ["video/quicktime"],
        "pdf": ["application/pdf"]
     },

     /*
      * Cache file extension for mimetype
      */
     fileExtensions: {
        "jp2": ["image/tiff"],
        "jpg": ["image/jpg", "image/jpeg"],
        "mp3": ["audio/mp3", "audio/x-wav"],
        "mp4": ["video/mp4"],
        "pdf": ["application/pdf"]
     },

      /*
      * Content type of each file extension, for datatream response 
      */
     contentTypes: {
        "tif": "image/tiff",
        "tiff": "image/tiff",
        "jp2": "image/jp2",
        "jpg": "image/jpg",
        "mp3": "audio/mp3",
        "mp4": "video/mp4",
        "pdf": "application/pdf"
     }
};