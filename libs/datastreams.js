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
 * Object Datastream Access Functions
 */

'use strict';

const config = require('../config/' + process.env.CONFIGURATION_FILE),
  HttpRequest = require("../libs/http-request"),
  File = require('../libs/file'),
  Repository = require('../libs/repository'),
  Helper = require('../libs/helper'),
  Kaltura = require('../libs/kaltura'),
  IIIF = require('../libs/IIIF');

const Logger = require('./log4js');

/**
 * Get a datastream for an object
 * Return a placeholder image if the requested datastream is not available (thumbnail datastreams only)
 *
 * @param {Array.<Object>} object - index document source Required fields: "object", "thumbnail" 
 * @param {Array.<String>} datastreamID - datastream ID
 *
 * @callback callback
 * @param {String|null} Error message or null
 * @param {datastream|null} Null if error
 * 
 * @param {<String>} apikey - Api key to use private (admin) index to fetch unpublished datastreams
 *
 * @return {undefined}
 */
exports.getDatastream = function(object, datastreamID, callback, apikey=null) {
  let settings = null;
  datastreamID == "thumbnail" ? "tn" : datastreamID;

  /*
   * Thumbnail datastreams
   */
  if(datastreamID == "tn") {
    if(Helper.isCollectionObject(object)) {
      settings = config.thumbnailDatastreams.collection || null;
    }
    else {
      let objectType = Helper.getObjectType(object) || "";
      settings = config.thumbnailDatastreams.object.type[objectType] || null;
    }    

    if(settings) {
      let uri = null,
          source = settings.source;

      // Get the stream uri
      if(settings.source == "auto") {

        // Automatically determine the source uri
        let sourceData = getAutoStreamSource(datastreamID, object);
        uri = sourceData.uri;
        source = sourceData.source;
      }
      else {
        // Use manual setting for source uri
        switch(source) {
          case "iiif":
            let pid = object.order ? `${object.pid}_${object.order}` : object.pid; // Append the part id to the object pid
            uri = IIIF.getThumbnailUri(pid, apikey);
            break;
          case "kaltura":
            uri = Kaltura.getThumbnailUrl(object);
            break;
          case "repository":
            uri = object.thumbnail || null;
            break;
          case "remote":
            uri = object.thumbnail || null;
            break;
          default:
            Logger.module().error('ERROR: ' + `Invalid source setting, could not determine uri. Source: ${source} Object: ${pid}`);
            break;
        }
      }

      // Fetch the stream
      if(uri == null || uri == "") {
        Logger.module().info('INFO: ' + `Uri not available for datastream request. Check object source fields. Stream option: ${(settings.source || "null")} Pid: ${object.pid}`);
        streamDefaultThumbnail(object, callback);
      }
      else {
        if(config.nodeEnv == "devlog") {
          Logger.module().info('INFO: ' + `Thumbnail image stream uri: ${uri}`);
        }

        // Stream from repository
        if(source == "repository") {
          Repository.streamData(object, "tn", function(error, stream) {
            if(error) {
              Logger.module().error('ERROR: ' + `Repository fetch error: ${error} Object: ${object.pid}`);
              streamDefaultThumbnail(object, callback);
            }
            else {
              if(stream) {
                callback(null, stream, object);
              }
              else {
                Logger.module().info('INFO: ' + `Repository thumbnail stream not available. Object: ${object.pid} Using default thumbnail`);
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }

        // Stream from remote source
        else {
          streamRemoteData(uri, function(error, status, stream) {
            if(error) {
              Logger.module().error('ERROR: ' + `Remote stream error: ${error} Object: ${object.pid}. Source: ${source}`);
              streamDefaultThumbnail(object, callback);
            }
            else if(stream == null) {
              Logger.module().error('ERROR: ' + `Remote stream error: Remote stream unavailable or not found. Object: ${object.pid}, Uri: ${uri}`);
              streamDefaultThumbnail(object, callback);
            }
            else {
              if(status == 200) {
                callback(null, stream, object);
              }
              else {
                Logger.module().error('ERROR: ' + `Remote stream error: Response status: ${status} Object: ${object.pid}. Source: ${source}`);
                streamDefaultThumbnail(object, callback);
              }
            }
          });
        }
      }
    }
    else {
      Logger.module().error('ERROR: ' + `Could not determine datastream settings for object ${object.pid}. Check configuration or object source data. Object path: ${object.object || "null"}. Mime type: ${object.mime_type || "null"}`);
      streamDefaultThumbnail(object, callback);
    }
  }

  /* 
   * Object datastreams
   */
  else {
    if(!object.object) {
      Logger.module().error('ERROR: ' + `Object path is null for object: ${object.pid}`);
    }

    let objectType = Helper.getObjectType(object) || "",
        sourceOption = "repository";

    settings = config.objectDatastreams.object.type[objectType] || null;
    if(settings) {
      let uri = null,
          extension = null;

      if(datastreamID == "object") {
        extension = object.object ? Helper.getFileExtensionFromFilePath(object.object) : Helper.getFileExtensionForMimeType(object.mime_type || "");
      }
      else {
        extension = datastreamID;
      }

      // If settings has specific source option, (settings.file_type) Get the source
      sourceOption = settings.source;
      if(settings.file_type) {
        for(var key in settings.file_type) {
          if(key == extension && settings.file_type[key].source != 'undefined') {
            sourceOption = settings.file_type[key].source || settings.source;
          }
        }
      }

      // Prevent infinite loop. The 'object' datastream route is reserved for the image server requests. If a iiif source is requested using the 'object' datastream, stream from the repository.
      if(sourceOption == "iiif" && datastreamID == "object") {
        sourceOption = "repository";
      }
    
      // Set the source uri
      switch(sourceOption) {
        case "iiif":
          let pid = object.order ? `${object.pid}_${object.order}` : object.pid; // Append the part id to the object pid
          uri = IIIF.getResourceUri(pid, apikey);
          break;
        case "kaltura":
          let viewerId = object.entry_id || object.kaltura_id || null;
          uri = viewerId ? Kaltura.getStreamingMediaUrl(viewerId, extension) : null;
          if(!viewerId) {
            Logger.module().info('INFO: ' + `Null kaltura ID field. Object: ${object.pid}`);
          }
          break;
        case "repository":
          uri = object.object;
          break;
        default:
          Logger.module().error('ERROR: ' + `Datastream error: Invalid source setting. Could not determine datastream source uri. Source option: ${sourceOption} Object: ${object.pid}`);
          break;
      }

      if(uri == null || uri == "") {
        Logger.module().info('INFO: ' + `Uri not available for datastream request. Check object source fields. Stream option: ${(settings.source || "null")} Pid: ${object.pid}`)
        callback(null, null, object);
      }
      else {
        if(config.nodeEnv == "devlog") {
          Logger.module().info('INFO: ' + `Object image stream uri: ${uri}`);
        }

        // Stream from repository
        if(sourceOption == "repository") {
          Repository.streamData(object, datastreamID, function(error, stream) {
            if(error) {
              callback(`Repository fetch error: ${error} Object: ${object.pid}`, null, object);
            }
            else {
              if(stream) {
                callback(null, stream, object);
              }
              else {
                Logger.module().error('ERROR: ' + `Repository stream error: Source not available, null stream received from repository. Object: ${object.pid}`);
                callback(null, null, object);
              }
            }
          });
        }

        // Stream from remote source
        else {
          streamRemoteData(uri, function(error, status, stream) {
            if(error) {
              callback(`Remote stream error: ${error} Object: ${object.pid}`, null, object);
            }
            else if(stream == null) {
              Logger.module().error('ERROR: ' + `Remote stream error: Null stream received. Object: ${object.pid} Uri: ${uri}`);
              callback(null, null, object);
            }
            else {
              if(status == 200) {
                callback(null, stream, object);
              }
              else {
                Logger.module().error('ERROR: ' + `Remote stream error: response status: ${status} Object: ${object.pid} Uri: ${uri}`);
                callback(null, null, object);
              }
            }
          });
        }
      }

    }
    else {
      callback(`Could not fetch datastream for object ${object.pid} Object path: ${object.object || "null"}. Mime type: ${object.mime_type || "null"} Stream settings could not be determined`);
    }
  }
}

/**
 * Sends a head request to the repository to verify that a specified datastream is available for an object
 *
 * @param {Object} object - index document object
 * @param {String} datastreamID - type of datastream to verify
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {Boolean} - true if object request status is 200, false if not 200
 *
 * @return {undefined}
 */
exports.verifyObject = function(object, datastreamID, callback) {
  if(datastreamID != "tn" && datastreamID != "object") {
    datastreamID = "object";
  }

  Repository.getStreamStatus(object, datastreamID, function(error, status) {
    if(error) {
      callback(error, null);
    }
    else {
      if(status == "200") {
        callback(null, true, object.pid);
      }
      else {
        callback(null, false);
      }
    }
  });
}

/**
 * Request data stream from uri
 *
 * @param {String} uri - Uri of data source
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {http status code|null} - Response status code, Null if error
 * @param {response|null} Response data, Null if error
 *
 * @return {undefined}
 */
var streamRemoteData = function(uri, callback) {
  if(uri) {
    HttpRequest.get_stream(uri, {}, function(error, status, data) {
      if(error) {
        callback("HTTP request error: " + error, null, null);
      }
      else if(status != 200) {
        Logger.module().error('ERROR: ' + `Request for data received status ${status}`);
        callback(null, status, null);
      }
      else {
        callback(null, status, data);
      }
    });
  }
  else {
     callback(null, 404, null);
  }
}

/**
 * Check for an object-specific default thumbnail image.  If none is found, stream the default generic thumbnail image
 *
 * @param {Object} object - index document object
 *
 * @callback callback
 * @param {String|null} - Error message or null
 * @param {file stream|null} - Node fs readStream, Null if error
 *
 * @return {undefined}
 */
var streamDefaultThumbnail = function(object, callback) {
  Logger.module().info('INFO: ' + `Streaming default thumbnail for object ${object.pid}`);

  let path = config.thumbnailDefaultImagePath + config.defaultThumbnailImage;

  // Check for an object specific default thumbnail image.  If found, use it
  for(var index in config.objectTypes) {
    if(config.objectTypes[index].includes(object.mime_type || "")) {
      if(typeof config.thumbnailPlaceholderImages[index] != 'undefined') {
        path = config.thumbnailDefaultImagePath + config.thumbnailPlaceholderImages[index];
      }
    }
  }

  File.getFileStream(path, function(error, thumbnail) {
    if(error) {callback(`Error fetching default thumbnail image: ${error}`, null, object)}
    else{callback(null, thumbnail, object, true)}
  });
}

/**
 * Determine stream source based on path format
 * 1. Path contains 'http://' 'or 'https://' - Absolute uri, will fetch remotely
 * 2. Path contains no protocol, but does contain slashes - Relative uri, assume DuraCloud uri
 * 3. Path contains no protocol or slashes - object ID assumed. Source stream from another object in the repository. Use /datastream api (pid must not be of current object)
 *
 * @param {String} dsid - Datastream id or file extension
 * @param {Object} object - index document object
 * 
 * @typedef {Object} streamData - Uri and stream source option
 * @property {String} uri - uri to resource
 * @property {String} source - stream source option
 *
 * @return {streamData}
 */
var getAutoStreamSource = function(dsid, object) {
  let data = {
    uri: null,
    source: "repository"
  },
  path = dsid == "tn" ? (object.thumbnail || "") : (object.object || "");

  // Absolute path to internal or external resource
  if(/https?:\/\//.test(path)) {
    data.uri = path;
    data.source = "remote";
  }
  // Relative path to DuraCloud
  else if(path.indexOf("/") >= 0) {
    data.uri = path;
    data.source = "repository";
  }
  // Object pid (filename not allowed) Can't be the same as current object
  else if(path != object.pid && path.length > 0) {
    data.uri = `${config.rootUrl}/datastream/${path}/${dsid}`;
    data.source = "remote";
  }

  return data;
}