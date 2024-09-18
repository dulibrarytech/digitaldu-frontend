  /**
    Copyright 2020 University of Denver

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
 * File transfer and download Functions
 *  
 */
'use strict'

const config = require('../config/' + process.env.CONFIGURATION_FILE),
      fs = require('fs'),
      stringifyObject = require('stringify-object'),
      waterfall = require('async-waterfall'),
      zipFolder = require('zip-a-folder'),
      Helper = require('./helper.js'),
      Metadata = require('./metadata.js'),
      File = require('./file.js');

const Logger = require('./log4js');

/*
 *
 */
exports.downloadObjectFile = function(object, callback) {
  callback(null);
}

/*
 * Fetch all object files from a compound object
 * Create a text file containing the object's metadata
 * Zip the object and metadata files
 */
exports.downloadCompoundObjectFiles = function(object, callbackC, websocket=null) {
  var path = config.batchFileDownloadTemporaryFolder + ("_" + new Date().getTime()),
      files = [],
      metadata = {},
      pid = object.pid || "",
      parts = Helper.getCompoundObjectPart(object, -1),
      extension = Helper.getFileExtensionForMimeType(object.mime_type || "");

  let uri, part;
  for(var index in parts) {
    part = parseInt(parts[index].order) || index;
    uri = `${config.rootUrl}/datastream/${pid}/${extension}/${part}/${pid}_${part}.${extension}`;
    files[part-1] = uri;
  }

  waterfall([
    function(callback){
      fetchResourceFiles(path, files, function(error) {
        if(error) {error = "Error downloading file(s):" + error}
        callback(error || null);
      }, websocket);
    },
    function(callback){
      let metadata = Metadata.getMetadataFieldValues(object) || {};
      createMetadataFiles(object.pid, path, metadata, function(error) {
        if(error) {error = "Error creating metadata file(s):" + error}
            callback(error || null);
      });
    },
    function(callback){
      let filepath = path + "/" + pid + ".zip";
      zipFolder.zipFolder(path, filepath, function(error) {
        if(error) {error = "Error creating zip file for download:" + error}
          callback(error || null, filepath);
      });
    }
  ], function (error, filepath) {
      if(error) {callbackC(error, null)}
      else {callbackC(null, filepath)}
  });
}

/**
 * Fetch a list of files, and store them in a local folder
 */
var fetchResourceFiles = async function(path, files, callback, websocket=null) {
  var url = "",
      filename,
      count = 0,
      msg,
      response;

  for(var fileUri of files) {
    count++;
    filename = fileUri.substring(fileUri.lastIndexOf('/')+1) || "noname.file";

    if(websocket) {
      if(websocket.abort) {
        msg = {
          status: "6",
          message: "Socket connection aborted by client."
        };
        websocket.send(JSON.stringify(msg));
        break;
      }
      else {
        msg = {
          status: "2",
          message: "Downloading " + count + " of " + files.length,
          currentItem: count,
          itemCount: files.length || -1
        };
        websocket.send(JSON.stringify(msg));
      }
    }
    Logger.module().info('INFO: ' + `Fetching resource file: uri ${fileUri}, saving to file: ${filename}`);
    
    response = await File.downloadToFileSync(fileUri, path, filename);
  }

  callback(null);
}
exports.fetchResourceFiles = fetchResourceFiles;

var createMetadataFiles = function(pid, path, metadata, callback) {
  var objectString = stringifyObject(metadata, {
      indent: '  ',
      singleQuotes: false
  });

  let filename = path + "/" + pid + "_metadata.txt";
  fs.writeFile(filename, objectString, error => {
    if(error) {callback(error)}
    else {callback(null)}
  });
}
exports.createMetadataFiles = createMetadataFiles;

exports.removeDownloadTempFolder = function(filepath) {
  let folderPath = filepath.substring(0, filepath.lastIndexOf("/"));
  Logger.module().info('INFO: ' + `Removing temp folder ${folderPath}...`);

  File.removeDir(folderPath, function(error) {
    if(error) {
      Logger.module().error('ERROR: ' + `Error removing temp folder: ${error}`);
    }
  });
}