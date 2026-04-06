/*
 * IIIF version 3.0 manifest creation function
 *
 * (ddu2 will use typescript, define as type)
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
 * * (ddu2 will use typescript, define as type)
 * objectItems: [
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

const {
  Manifest, 
  Canvas, 
  AnnotationPage, 
  Annotation, 
  Image, 
  Service
} = require('@archival-iiif/presentation-builder');

/* 
 * digitaldu v2 configuration
 * (include all in settings under 'iiif' and update this module to use new varnames)
 *  
 * iiifServerUrl,           // info.json; cantaloupe base url - includes "/iiif/v3"
 * iiifPresentationUrl,     // manifests; app base url - includes "/presentation/v3" 
 * /

/* ------------------------------------------------------------------------------
 * end digitaldu v1 configuration and setup
 * --------------------------------------------------------------------------- */

/* -------------------------------------------------------------------------------------------------
 * digitaldu v1 configuration:
 * (use existing config)
 * 
 * // REMOVE these may be passed into child objects, as they arr eapplication (not iiif specific) and can be used to construct urls for manifest fields (if so, remove from this list)
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
const IIIF_MEDIA_TYPES = {
  IMAGE: "Image",
  VIDEO: "Video",
  AUDIO: "Sound",
  TEXT: "Text",
  DATASET: "Dataset"
};

const THUMBNAIL_IMAGE_MIME_TYPE = "image/jpeg";

const DEFAULT_RIGHTS_STATEMENT = "http://creativecommons.org/licenses/by/4.0/";

exports.createManifest = async (objectContainer = {}, objectItems = [], callback) => {

  const ID              = objectContainer.id || "example-object-id";
  const TITLE           = objectContainer.title || "Example Object Title";
  const DESCRIPTION     = objectContainer.description || "This is an example description for the object.";
  const RIGHTS          = objectContainer.rights || DEFAULT_RIGHTS_STATEMENT; 
  const METADATA        = objectContainer.metadata || [];
  const OBJECT_PAGE_URL = objectContainer.objectPage || `${config.appUrl}/object/${ID}`; 
  const MANIFEST_URL    = objectContainer.manifestUrl || `${IIIFUrl}/${ID}/manifest`;

  const label = TITLE ? {
    "en": [TITLE]
  } : {
    "none": ["-"] 
  };
  const manifest = new Manifest(MANIFEST_URL, label);

  /* context */
  manifest.setContext();

  /* summary */
  manifest.setSummary({
    "en": [DESCRIPTION || ""]
  });

  /* homepage */
  manifest.homepage = [
    {
      "id": OBJECT_PAGE_URL,
      "type": "Text",
      "label": {
        "en": ["View Object Page"]
      }
    }
  ];

  /* metadata */
  manifest.setMetadata(METADATA.map((md) => ({
    label: {
      "en": [md.label]
    },
    value: {
      "en": md.values
    }
  })));

  /* items (canvases) */
  let items = [], canvas = [];
  await Promise.all(objectItems.map(async (item) => {

    switch(getIiifType(item.mime_type)) {

      case IIIF_MEDIA_TYPES.IMAGE:
        canvas = await getImageCanvas(objectContainer, item);
        break;

      case IIIF_MEDIA_TYPES.AUDIO:
      case IIIF_MEDIA_TYPES.VIDEO:
        // canvas = getAudioVideoCanvas(objectContainer, item);
        break;

      case IIIF_MEDIA_TYPES.TEXT:
        canvas = await getTextCanvas(objectContainer, item);
        break;

      default:
        // Handle unknown media types or set a default canvas
        console.warn(`Unknown media type for item ${item.id}: ${item.mimeType}`);
    }

    // TODO: partOf collection?

    console.log("test: pushing canvas for item:", item.id, canvas);
    items.push(canvas);
  }));
  manifest.setItems(items);

  /* thumbnail */
  manifest.setThumbnail(getManifestThumbnail(manifest, objectItems[0]));

  callback(null, manifest);
};

const getManifestThumbnail = (manifest, thumbnailItem) => {
  let thumbnail = {};

  const iiifType = getIiifType(thumbnailItem.mime_type); // Returns 'Image'

  if(iiifType === IIIF_MEDIA_TYPES.IMAGE) {
    // use the thumbnail object from the first canvas for the manifest thumbnail (eliminates need to fetch image data again for the 'getImageThumbnail' function
    thumbnail = manifest.items[0].thumbnail; 
  }
  else if(iiifType === IIIF_MEDIA_TYPES.AUDIO || iiifType === IIIF_MEDIA_TYPES.VIDEO) {
    thumbnail = getAudioVideoThumbnail(thumbnailItem);
  }
  else if(iiifType === IIIF_MEDIA_TYPES.TEXT) {
    thumbnail = getTextThumbnail(thumbnailItem);
  }
  else {
    // Handle unknown media types or set a default thumbnail
    console.warn(`Unknown media type for thumbnail of item ${thumbnailItem.id}: ${thumbnailItem.mimeType}`);
    // TODO: set default thumbnail
  }

  return thumbnail;
}

const getImageThumbnail = (objectData, imageData) => {
  let thumbnail = {
      "id":     `${IIIFServerUrl}${IIIF_ENDPOINT}/${objectData.id}/full/!200,200/0/default.jpg`, 
      "type":   IIIF_MEDIA_TYPES.IMAGE,
      "format": THUMBNAIL_IMAGE_MIME_TYPE,
  };

  if(imageData) {
    var {width, height} = imageData.sizes[1];

    thumbnail.id = `${IIIFServerUrl}${IIIF_ENDPOINT}/${objectData.id}/full/${width},${height}/0/default.jpg`;
    thumbnail.width = width;
    thumbnail.height = height;

    var {
      id,
      type,
      profile,
      width,
      height, 
      sizes
    } = imageData;

    thumbnail.service = [{
      "@id": id,
      "@type": type,
      "profile": profile,
      "width": width,
      "height": height,
      "sizes": sizes
    }];
  }

  return thumbnail;
}

/* construct the placeholderCanvas data object including annotation image object with a service that points to the datastream thumbnail url for the item (if available) or a default placeholder image if no thumbnailUrl is provided for the item. the placeholder image can be a generic audio or video icon to represent the content in the manifest thumbnail. */
const getAudioVideoThumbnail = (objectData, itemData) => {
  
}

/* construct the thumbnail object using the 'thumbnailUrl' from the item data (which is a datastream thumbnail url) or use a default placeholder image if no thumbnailUrl is provided for the item. the placeholder image can be a generic audio or video icon to represent the content in the manifest thumbnail. */
const getTextThumbnail = (itemData) => {
  console.log("getTextThumbnail: itemData:", itemData);
  let thumbnail = {
    "id":     itemData.thumbnailUrl || `${config.appUrl}/images/default-placeholder.png`, // use a default placeholder image if no thumbnailUrl is provided for the item
    "type":   IIIF_MEDIA_TYPES.IMAGE,
    "format": THUMBNAIL_IMAGE_MIME_TYPE,
  };

  return thumbnail;
}

const getImageCanvas = async (objectContainer, item) => {
  const imageDataUrl = `${IIIFServerUrl}${IIIF_ENDPOINT}/${item.id}/info.json`;

  const response  = await fetch(imageDataUrl);
  const imageData = await response.json();
  
  const width         = imageData.width;
  const height        = imageData.height;
  const sizes         = imageData.sizes;
  const largestSize   = sizes[sizes.length - 1];
  const smallestSize  = sizes[0];

  const label = item.title ? {
    "en": [item.title]
  } : {
    "none": ["-"] // placeholder if no title
  };

  const canvas = new Canvas(`${IIIFUrl}/${item.id}/canvas`, label, imageData.width, imageData.height);

  canvas.setThumbnail(getImageThumbnail(objectContainer, imageData));

  const service = new Service(
    `${IIIFServerUrl}${IIIF_ENDPOINT}/${item.id}`, 
    "ImageService3", 
    "level2"
  );
  service.width = imageData.width;
  service.height = imageData.height;
  service.sizes = imageData.sizes;

  const image = new Image(
    `${IIIFServerUrl}${IIIF_ENDPOINT}/${item.id}/full/${largestSize.width},${largestSize.height}/0/default.jpg`, 
    imageData.width, 
    imageData.height
  );
  image.type = IIIF_MEDIA_TYPES.IMAGE;
  image.format = item.type;
  image.setService(service);

  const annotation = new Annotation(
    `${IIIFUrl}/${item.id}/annotation`, 
    image, 
    "painting"
  );
  annotation.target = `${IIIFUrl}/${item.id}/canvas`;

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${item.id}/annotation_page`, 
    [annotation]
  );
  annotationPage.setItems(annotation);

  canvas.setItems(annotationPage);

  return canvas;
}

const getAudioVideoCanvas = async (objectContainer, itemData) => {
  // construct and return a canvas object for an audio item based on the object container and item data
}

const getTextCanvas = async (objectContainer, item) => {
  const label = item.title ? {
    "en": [item.title]
  } : {
    "none": ["-"] // placeholder if no title
  };

  const canvas = new Canvas(`${IIIFUrl}/${item.id}/canvas`, label);
  canvas.setThumbnail(getTextThumbnail(item));

  const textLabel = item.title ? {
    "en": [item.title]
  } : {
    "none": ["Untitled"] // placeholder if no title
  };

  const text = {
    "id": item.resourceUrl, 
    "type": IIIF_MEDIA_TYPES.TEXT,
    "format": item.mimeType || "application/pdf",
    "label": textLabel,
    "metadata": [
      {
        "label": {
          "en": ["Description"]
        },
        "value": {
          "none": [item.description || "No description available."]
        }
      }
    ]
  }

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${item.id}/supplementing`
  );
  annotationPage.setItems({
    body: text,
  });

  canvas.setAnnotations(annotationPage);

  console.log("test: getTextCanvas:", canvas);
  return canvas;
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
