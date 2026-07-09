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
 *   manifestUrl: "https://digitalarchives.du.edu/iiif/{id}/manifest",
 *   objectPage: "https://digitalarchives.du.edu/object/{id}"
 * }
 *
 * * (ddu2 will use typescript, define as type)
 * objectItems: [
 *   {
 *     id: "cf143816-b08f-4caa-a82d-814e337d0304", // is compound: add _[part] standard: no suffix or just id with no suffix, if non-compound object with single part
 *     title: "is compound: from compound.part, standard: from display_record",
 *     description: "is compound: from compound.part, standard: from display_record or abstract",
 *     mimeType: "is compound: from compound.part, standard: from parent mimeType field",
 *     resourceUrl: "https://digitalarchives.du.edu/datastream/{id}/object", // datastream (is compound, id has part)
 *     thumbnailUrl: "https://digitalarchives.du.edu/datastream/{id}/thumbnail", // datastream thumbnail
 *   },
 *   {
 *     id: "cf143816-b08f-4caa-a82d-814e337d0304_2",
 *     title: "Example Part 2",
 *     description: "This is the second part of the example object.",
 *     mimeType: "image/jpeg",
 *     resourceUrl: "https://digitalarchives.du.edu/datastream/{id}/object", // datastream
 *     thumbnailUrl: "https://digitalarchives.du.edu/datastream/{id}/thumbnail", // datastream thumbnail
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
const AV_PLACEHOLDER_IMAGE_LABEL = "Poster Image";
const AV_PLACEHOLDER_IMAGE_TYPE = "image/jpeg";
const AV_PLACEHOLDER_CANVAS_LABEL = "Poster Image Canvas";
const DEFAULT_RIGHTS_STATEMENT = "http://creativecommons.org/licenses/by/4.0/";
const DEFAULT_THUMBNAIL_IMAGE_URL = "default-thumbnail.jpg";

exports.createManifest = async (objectContainer = {}, objectItems = [], callback) => {

  const ID              = objectContainer.id || "example-object-id";
  const TITLE           = objectContainer.title || "Example Object Title";
  const DESCRIPTION     = objectContainer.description || "This is an example description for the object.";
  const RIGHTS          = objectContainer.rights || DEFAULT_RIGHTS_STATEMENT; 
  const METADATA        = objectContainer.metadata || [];
  const OBJECT_PAGE_URL = objectContainer.objectPage || MANIFEST_URL; 
  const MANIFEST_URL    = objectContainer.manifestUrl || `${IIIFUrl}/presentation/v3/${ID}`;

  const label = TITLE ? {
    "en": [TITLE]
  } : {
    "none": ["-"] 
  };
  const manifest = new Manifest(MANIFEST_URL, label);

  /* context -------------------------------------------------------------------- */
  manifest.setContext();

  /* summary -------------------------------------------------------------------- */
  manifest.setSummary({
    "en": [DESCRIPTION || ""]
  });

  /* homepage -------------------------------------------------------------------- */
  manifest.homepage = [
    {
      "id": OBJECT_PAGE_URL,
      "type": "Text",
      "label": {
        "en": ["View Object Page"] // use object title?
      },
      "format": "text/html",
      "language": ["en"]
    }
  ];

  /* metadata -------------------------------------------------------------------- */
  manifest.setMetadata(METADATA.map((md) => ({
    label: {
      "en": [md.label]
    },
    value: {
      "en": md.values
    }
  })));

  /* rights -------------------------------------------------------------------- */
  manifest.setRights(RIGHTS);

  /* items (canvases) -------------------------------------------------------------------- */
  let items = [], canvas = [];
  await Promise.all(objectItems.map(async (item, index) => {

    switch(getIiifType(item.mimeType)) {

      case IIIF_MEDIA_TYPES.IMAGE:
        canvas = await getImageCanvas(objectContainer, item, index+1);
        break;

      case IIIF_MEDIA_TYPES.AUDIO:
      case IIIF_MEDIA_TYPES.VIDEO:
        canvas = await getAudioVideoCanvas(objectContainer, item, index+1);
        break;

      case IIIF_MEDIA_TYPES.TEXT:
        canvas = await getTextCanvas(objectContainer, item, index+1);
        break;

      default:
        console.warn(`Unknown media type for item ${item.id}: ${item.mimeType}, skipping canvas creation`);
    }

    items[index] = canvas;
  }));
  manifest.setItems(items);

  /* thumbnail --------------------------------------------------------------------------------- */
  switch(getIiifType(objectContainer.mimeType)) {
    case IIIF_MEDIA_TYPES.IMAGE:
      manifest.setThumbnail(manifest.items[0].thumbnail); // getImageCanvas() set the thumbnail using image data from the IIIF server, so we can use the thumbnail from the first canvas for the manifest thumbnail
      break;

    case IIIF_MEDIA_TYPES.AUDIO:
    case IIIF_MEDIA_TYPES.VIDEO:
      manifest.setPlaceholderCanvas( getAudioVideoPlaceholderCanvas({
        ...objectContainer,
        thumbnailUrl: objectItems[0].thumbnailUrl
      }));
      manifest.setThumbnail( getThumbnailObject({
        ...objectContainer,
        thumbnailUrl: objectItems[0].thumbnailUrl
      }));
      break;

    case IIIF_MEDIA_TYPES.TEXT:
      manifest.setThumbnail( getThumbnailObject({
        ...objectContainer,
        thumbnailUrl: objectItems[0].thumbnailUrl
      }));
      break;

    default:
      console.warn(`Unknown media type for thumbnail of object ${objectContainer.id}: ${objectContainer.mimeType}`);
  }

  // TODO: partOf collection?

  callback(null, manifest);
};

const getImageThumbnail = (itemData, imageData=null) => {
  let thumbnail = {
      "id":     DEFAULT_THUMBNAIL_IMAGE_URL, 
      "type":   IIIF_MEDIA_TYPES.IMAGE,
      "format": THUMBNAIL_IMAGE_MIME_TYPE,
  };

  if(!imageData) {
    return {
      "id":     DEFAULT_THUMBNAIL_IMAGE_URL, 
      ...thumbnail
    };
  }

  if(imageData) {
    var {width, height} = imageData.sizes[1];

    thumbnail.id = `${IIIFServerUrl}${IIIF_ENDPOINT}/${itemData.id}/full/${width},${height}/0/default.jpg`;
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

    thumbnail.service = {
      "@context": "http://iiif.io/api/image/3/context.json",
      id,
      type,
      profile,
      width,
      height,
      sizes
    };
  }

  return thumbnail;
}

/* construct the placeholderCanvas data object including annotation image object with a service that points to the datastream thumbnail url for the item (if available) or a default placeholder image if no thumbnailUrl is provided for the item. the placeholder image can be a generic audio or video icon to represent the content in the manifest thumbnail. */
const getAudioVideoPlaceholderCanvas = (itemData) => {
  const label = {
    "en": [AV_PLACEHOLDER_CANVAS_LABEL]
  };

  const canvas = new Canvas(`${IIIFUrl}/${itemData.id}/canvas/poster`, label);

  const image = new Image(
    itemData.thumbnailUrl || `${config.appUrl}/images/default-placeholder.png`, // use a default placeholder image if no thumbnailUrl is provided for the item
  );
  image.type = IIIF_MEDIA_TYPES.IMAGE;
  image.format = AV_PLACEHOLDER_IMAGE_TYPE;
  image.setLabel({
    "en": [AV_PLACEHOLDER_IMAGE_LABEL]
  });

  const annotation = new Annotation(
    `${IIIFUrl}/${itemData.id}/canvas/poster/page/image`, 
    image, 
    "painting"
  );
  annotation.target = `${IIIFUrl}/${itemData.id}/canvas/poster`;

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${itemData.id}/canvas/poster/page`, 
    [annotation]
  );
  annotationPage.setItems(annotation);

  canvas.setItems(annotationPage);

  return canvas;
}

/* construct the thumbnail object using the 'thumbnailUrl' from the item data (which is a datastream thumbnail url) or use a default placeholder image if no thumbnailUrl is provided for the item. the placeholder image can be a generic audio or video icon to represent the content in the manifest thumbnail. */
const getThumbnailObject = (itemData) => {
  let thumbnail = {
    "id":     itemData.thumbnailUrl || "",
    "type":   IIIF_MEDIA_TYPES.IMAGE,
    "format": THUMBNAIL_IMAGE_MIME_TYPE,
  };

  return thumbnail;
}

const getImageCanvas = async (objectContainer, itemData, index=1) => {

  const label = itemData.title ? {
    "en": [itemData.title]
  } : {
    "none": ["-"] // placeholder if no title
  };

  const canvas = new Canvas(`${IIIFUrl}/${itemData.id}/canvas/${index}`, label);

  /* get the image data from the IIIF server info.json endpoint to get the width, height, and sizes for the image service */
  const imageDataUrl = `${IIIFServerUrl}${IIIF_ENDPOINT}/${itemData.id}/info.json`;
  try {
    var response = await fetch(imageDataUrl);
    if(!response.ok) throw new Error(`Failed to fetch image data for item ${itemData.id} at ${imageDataUrl}: ${response.status} ${response.statusText}`);
  }
  catch(error) {
    console.error(`Error fetching image data for item ${itemData.id} at ${imageDataUrl}: ${error}`);
    canvas.setThumbnail(getImageThumbnail(itemData, null));
    canvas.setItems([]);
    return canvas;
  }

  const imageData = await response.json();
  
  const width         = imageData.width || 0;
  const height        = imageData.height || 0;
  const sizes         = imageData.sizes || [];

  if(sizes.length > 0) {
    var largestSize = sizes.reduce((largest, size) => {
      if(size.width > largest.width) {
        return size;
      }
      return largest;
    }, sizes[0]);
  }

  canvas.setWidth(width);
  canvas.setHeight(height);

  canvas.setThumbnail(getImageThumbnail(itemData, imageData));

  const service = {
    "@context": "http://iiif.io/api/image/3/context.json",
    id: `${IIIFServerUrl}${IIIF_ENDPOINT}/${itemData.id}`,
    type: "ImageService3",
    profile: "level2",
    width: imageData.width,
    height: imageData.height,
  };

  const image = new Image(
    `${IIIFServerUrl}${IIIF_ENDPOINT}/${itemData.id}/full/${largestSize?.width || width},${largestSize?.height || height}/0/default.jpg`, 
    imageData.width, 
    imageData.height
  );
  image.type = IIIF_MEDIA_TYPES.IMAGE;
  image.format = "image/jpeg";

  image.setService(service);

  const annotation = new Annotation(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/page/image`, 
    image, 
    "painting"
  );
  annotation.target = `${IIIFUrl}/${itemData.id}/canvas/${index}`;

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/page`, 
    [annotation]
  );
  annotationPage.setItems(annotation);

  canvas.setItems(annotationPage);

  return canvas;
}

const getAudioVideoCanvas = async (objectContainer, itemData, index=1) => {
  const iiifType = getIiifType(itemData.mimeType);

  const label = {
    "none": ["-"] 
  };

  const duration = null; // TODO: get duration from itemData (can get width, height also if needed for video thumbnail canvas)

  const canvas = new Canvas(`${IIIFUrl}/${itemData.id}/canvas/${index}`, label, null, null, duration);

  let media = {};
  if(iiifType === IIIF_MEDIA_TYPES.AUDIO) {
    media = {
      "id": itemData.resourceUrl,
      "type": IIIF_MEDIA_TYPES.AUDIO,
      "format": "audio/wav",
      "label": {
        "en": [itemData.title || "Audio Resource"]
      }
    }
  } 
  else if(iiifType === IIIF_MEDIA_TYPES.VIDEO) {
    media = {
      "id": itemData.resourceUrl,
      "type": IIIF_MEDIA_TYPES.VIDEO,
      "format": "video/mp4",
      "label": {
        "en": [itemData.title || "Video Resource"]
      }
    }
  }

  canvas.setThumbnail( getThumbnailObject(itemData) );
  canvas.setRendering(media);

  const annotation = new Annotation(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/page/image`, 
    media, 
    "painting"
  );
  annotation.target = `${IIIFUrl}/${itemData.id}/canvas/${index}`;

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/page`, 
    [annotation]
  );
  annotationPage.setItems(annotation);

  canvas.setItems(annotationPage);

  return canvas;
}

const getTextCanvas = async (objectContainer, itemData, index=1) => {
  const label = {
    "none": ["-"] 
  };

  const canvas = new Canvas(`${IIIFUrl}/${itemData.id}/canvas/${index}`, label);
  canvas.setThumbnail( getThumbnailObject(itemData) );

  const textLabel = itemData.title ? {
    "en": [itemData.title]
  } : {
    "none": ["Untitled"] // placeholder if no title
  };

  const text = {
    "id": itemData.resourceUrl, 
    "type": IIIF_MEDIA_TYPES.TEXT,
    "format": itemData.mimeType || "application/pdf",
    "label": textLabel,
  }
  canvas.setRendering(text);

  const image = {
    "id": `${IIIFServerUrl}${IIIF_ENDPOINT}/${itemData.id}/full/max/0/default.jpg`, 
    "type": IIIF_MEDIA_TYPES.IMAGE,
    "format": "image/jpeg",
    "metadata": [
      {
        "label": {
          "en": ["Title"]
        },
        "value": {
          "none": [itemData.title || "Untitled"]
        }
      },
      {
        "label": {
          "en": ["Description"]
        },
        "value": {
          "none": [itemData.description || "No description available"]
        }
      }
    ]
  }

  const annotation = new Annotation(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/supplementing/pdf`, 
    image, 
    "supplementing"
  );
  annotation.target = `${IIIFUrl}/${itemData.id}/canvas/${index}`;

  const annotationPage = new AnnotationPage(
    `${IIIFUrl}/${itemData.id}/canvas/${index}/supplementing`
  );
  annotationPage.setItems(annotation)

  canvas.setItems(annotationPage);

  return canvas;
}

/**
 * Maps a MIME type to a IIIF Presentation 3.0 Type
 * 
 * @param {string} mimeType - The MIME type (e.g., 'image/jpeg', 'video/mp4')
 * @returns {string} The IIIF Type ('Image', 'Video', 'Sound') or 'Dataset'
 */
const getIiifType = (mimeType) => {

  if(!mimeType) {
    console.warn(`No MIME type provided, defaulting to 'Dataset'`);
    return IIIF_MEDIA_TYPES.DATASET; 
  }

  let iiifType = '';

  if (mimeType.startsWith('image/')) {
    iiifType = IIIF_MEDIA_TYPES.IMAGE;
  } 
  else if (mimeType.startsWith('video/')) {
    iiifType = IIIF_MEDIA_TYPES.VIDEO;
  } 
  else if (mimeType.startsWith('audio/')) {
    iiifType = IIIF_MEDIA_TYPES.AUDIO;
  } 
  else if (mimeType === 'application/pdf') {
    iiifType = IIIF_MEDIA_TYPES.TEXT;
  }
  else {
    iiifType = IIIF_MEDIA_TYPES.DATASET; // default to Dataset for unknown MIME types
  }

  return iiifType;
}
