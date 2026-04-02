/*
 * IIIF version 3.0 manifest creation function
 *
 * objectContainer: {
 *   id: "cf143816-b08f-4caa-a82d-814e337d0304", // for compound, this is top level (for partOf)
 *   title: "Example Object",
 *   description: "This is an example object for IIIF manifest creation.",
 *   rights: "http://creativecommons.org/licenses/by/4.0/",
 *   metadata: [
 *     { label: "Creator", values: ["John Doe", "Jane Doe"] },
 *     { label: "Date", values: ["2024-01-01"] }
 *   ],
 *   manifestUrl: "https://specialcollections.du.edu/iiif/{id}/manifest",
 *   objectPage: "https://specialcollections.du.edu/object/{id}"
 * }
 *
 * objectParts: [
 *   {
 *     id: "cf143816-b08f-4caa-a82d-814e337d0304", // is compound: add _[part] standard: no suffix or just id with no suffix, if non-compound object with single part
 *     title: "is compound: from compound.part, standard: from display_record",
 *     description: "is compound: from compound.part, standard: from display_record or abstract",
 *     mimeType: "is compound: from compound.part, standard: from parent mime_type field",
 *     resourceUrl: "https://specialcollections.du.edu/datastream/{id}/object", // datastream (is compound, id has part)
 *     thumbnailUrl: "https://specialcollections.du.edu/datastream/{id}/thumbnail" // datastream thumbnail

 *   },
 *   {
 *     id: "cf143816-b08f-4caa-a82d-814e337d0304_2",
 *     title: "Example Part 2",
 *     description: "This is the second part of the example object.",
 *     mimeType: "image/jpeg",
 *     resourceUrl: "https://specialcollections.du.edu/datastream/{id}/object", // datastream
 *     thumbnailUrl: "https://specialcollections.du.edu/datastream/{id}/thumbnail" // datastream thumbnail
 *   }
 * ]
 *
 * }
 *
 * This function creates a IIIF Presentation API 3.0 manifest based on the provided object container and its parts.
 * The manifest includes the object's title, thumbnail, and metadata, as well as an empty items array that can be populated with canvases representing the object parts.
 */

const {Image, Service} = require('@archival-iiif/presentation-builder');

/* -------------------------------------------------------------------------------------------------
 * digitaldu v1 configuration and setup:
 * (use existing config)
 *
 * digitaldu v2: include all in settings under 'iiif' and update this module to pull required paths:
 * iiifServerUrl,           // info.json; cantaloupe base url - includes "/iiif/v3"
 * iiifPresentationUrl,     // manifests; app base url - includes "/presentation/v3"
 * 
 * // these may be passed into child objects, as they arr eapplication (not iiif specific) and can be used to construct urls for manifest fields (if so, remove from this list)
 * iiifObjectResourceUrl,   // direct link to resource (datastream)
 * iiifObjectPageUrl        // direct link to object viewer page (if iiif viewer)
 * ----------------------------------------------------------------------------------------------- */
const config = require('../config/' + process.env.CONFIGURATION_FILE);

const {
  IIIFServerUrl,  // iiifServerUrl ddu2
  IIIFUrl,        // iiifPresentationUrl ddu2
} = config;


/* local settings */
const IIIF_ENDPOINT = "/iiif/3"; // for server info.json and image access urls, e.g. /iiif/3/{id} for info.json and /iiif/3/{id}/full/1024,768/0/default.jpg for image access
/* ------------------------------------------------------------------------------
 * end digitaldu v1 configuration and setup
 * --------------------------------------------------------------------------- */

const DEFAULT_RIGHTS_STATEMENT = "http://creativecommons.org/licenses/by/4.0/";

exports.createManifest = (objectContainer = {}, objectParts = [], callback) => {
  console.log("test: createManifest");

  const ID              = objectContainer.id || "example-object-id";
  const TITLE           = objectContainer.title || "Example Object Title";
  const DESCRIPTION     = objectContainer.description || "This is an example description for the object.";
  const RIGHTS          = objectContainer.rights || DEFAULT_RIGHTS_STATEMENT; 
  const METADATA        = objectContainer.metadata || [];
  const OBJECT_PAGE_URL = objectContainer.objectPage || `${config.appUrl}/object/${ID}`; 
  const MANIFEST_URL    = objectContainer.manifestUrl || `${IIIFUrl}/${ID}/manifest`;

  /* define the manifest object and fields */
  let manifest = {
    "@context": "http://iiif.io/api/presentation/3/context.json",
    "id": "", 
    "type": "Manifest",
    "label": {},
    "summary": {},
    "thumbnail": [],
    "homepage": [],
    "metadata": [],
    "items": []
  }

  /*
   * Populate manifest fields with data from objectContainer and objectParts
   * - Use objectContainer data to populate top-level manifest fields (id, label, summary, rights, metadata, homepage)
   * - Use objectParts data to populate manifest items with canvases for each part (if compound) or one canvas for the object (if non-compound)
   */
  manifest.id = MANIFEST_URL;

  manifest.label = {
    "en": [TITLE || ""]
  };

  manifest.summary = {
    "en": [DESCRIPTION || ""]
  };

  manifest.homepage = [
    {
      "id": OBJECT_PAGE_URL,
      "type": "Text",
      "label": {
        "en": ["View Object Page"]
      }
    }
  ];

  // thumbnail data


  // metadata - use provided metadata array to construct manifest.metadata in {label: "", value: ""} format
  

  // items - use objectParts array to construct manifest.items with canvases for each part (if compound) or one canvas for the object (if non-compound)
  objectParts.forEach(part => {

    // TODO: determine part type and get specific canvas? ex: const canvas = getImageCanvas(objectContainer, part) or getVideoCanvas(objectContainer, part) etc. based on part type
    // Example Usage:
    // const iiifType = getIiifType(part.mimeType); // Returns 'Image'
    let canvas = [];

    // canvas = getImageCanvas(objectContainer, part);

    manifest.items.push(canvas);
  });

  callback(null, manifest);
};

const getImageCanvas = async (objectContainer, part) => {

  const response  = await fetch(`${IIIFServerUrl}${IIIF_ENDPOINT}/${part.id}`);
  const imageData = await response.json();
  console.log("test: imageData:", imageData);
  
  const width         = imageData.width;
  const height        = imageData.height;
  const sizes         = imageData.sizes;
  const largestSize   = sizes[sizes.length - 1];
  const smallestSize  = sizes[0];

  let canvas = {
    "id": `${IIIFUrl}/${part.id}/canvas`, 
    "type": "Canvas",
    "label": {},
    "width": 0,
    "height": 0,
    "thumbnail": [],
    "items": [],
  }

  // REFERENCE
  // construct and return a canvas object for an image part based on the object container and part data
  // let canvas = {
  //   "id": `${IIIFServerUrl}${IIIF_ENDPOINT}/${part.id}/canvas/c/1`, // https://bl.digirati.io/images/ark:/81055/81055/man_10000006.0x000002/canvas/c/1 (IIIF_ENDPOINT + /canvas/c/1)
  //   "type": "Canvas",
  //   "label": {
  //     "en": [part.title]
  //   },
  //   "width": 2400, // image dimensions from part info.json response data (top level)
  //   "height": 1800,
  //   "thumbnail": [
  //     {
  //       "id": part.resourceUrl, // https://bl.digirati.io/thumbs/ark:/81055/81055/man_10000006.0x000002/full/150,200/0/default.jpg (constructed from info.json response data: smallest size)
  //       "type": "Image",
  //       "width": 150, // thumbnail dimensions from info.json response data (smallest size)
  //       "height": 200,
  //       "format": "image/jpeg", // will be cantaloupe generated thumbnail, so always jpeg
  //       "service": [
  //         {
  //           "@context": "http://iiif.io/api/image/3/context.json",
  //           "@id": `${iiifServerDomain}/iiif/3/${part.id}`, // info.json url e.g. https://iiif.wellcomecollection.org/image/b23984958_B0009857.JP2 (info.json url constructed from iiifServerUrl + /iiif/3/ + part.id)
  //           "@type": "ImageService3",
  //           "profile": "http://iiif.io/api/image/3/level2.json",
  //           "width": 2400, // image dimensions from info.json response data (top level)
  //           "height": 1800,
  //           "sizes": [] // from info.json (part)
  //         }
  //       ]
  //     }
  //   ],
  //   "items": [
  //     {
  //       "id": `${part.id}/annotation-page`, // https://bl.digirati.io/images/ark:/81055/81055/man_10000006.0x000002/canvas/c/1/page/1 (IIIF_ENDPOINT + /canvas/c/1/page/1)
  //       "type": "AnnotationPage",
  //       "items": [
  //         {
  //           "id": `${part.id}/annotation`, // https://bl.digirati.io/images/ark:/81055/81055/man_10000006.0x000002/canvas/c/1/page/image/1 (IIIF_ENDPOINT + /canvas/c/1/page/image/1)
  //           "type": "Annotation",
  //           "motivation": "painting",
  //           "body": {
  //             "id": part.imageUrl, // iiif url for image e.g. https://iiif.wellcomecollection.org/image/b23984958_B0009857.JP2/full/1024,768/0/default.jpg (constructed from info.json response data: sizes[0] largest size)
  //             "type": "Image",
  //             "width": 768, // image dimensions from info.json response data (sizes[0] largest size)
  //             "height": 1024,
  //             "format": "image/jpeg", // object mime type from part?
  //             "service": [
  //               {
  //                 "@context": "http://iiif.io/api/image/3/context.json",
  //                 "@id": `${params.iiifServerDomain}/iiif/image/${part.id}`, // info.json url e.g. https://iiif.wellcomecollection.org/image/b23984958_B0009857.JP2 (info.json url constructed from iiifServerUrl + /iiif/3/ + part.id)
  //                 "@type": "ImageService3",
  //                 "profile": "http://iiif.io/api/image/3/level2.json",
  //                 "width": 2400, // image dimensions from info.json response data (top level)
  //                 "height": 1800,
  //               }
  //             ]
  //           },
  //           "target": part.id
  //         }
  //       ]
  //     }
  //   ]
  // };

  return canvas;
}

const getVideoCanvas = (objectContainer, part) => {
  // construct and return a canvas object for a video part based on the object container and part data
}

const getAudioCanvas = (objectContainer, part) => {
  // construct and return a canvas object for an audio part based on the object container and part data
}

const getTextCanvas = (objectContainer, part) => {
  // construct and return a canvas object for a text part based on the object container and part data
}

/**
 * Maps a MIME type to a IIIF Presentation 3.0 Type
 * 
 * @param {string} mimeType - The MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @returns {string} The IIIF Type ('Image', 'Video', 'Sound') or 'Dataset'
 */
const getIiifType = (mimeType = "") => {
  if (mimeType.startsWith('image/')) {
    return 'Image';
  } else if (mimeType.startsWith('video/')) {
    return 'Video';
  } else if (mimeType.startsWith('audio/')) {
    return 'Sound';
  } else if (mimeType === 'application/pdf') {
    return 'Text';
  }
  // Default for documents, text, or others
  return 'Dataset';
}
