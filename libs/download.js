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
      download = require('file-download'),
      fs = require('fs'),
      stringifyObject = require('stringify-object'),
      waterfall = require('async-waterfall'),
      zipFolder = require('zip-a-folder'),
      Helper = require('./helper.js'),
      Metadata = require('./metadata.js');

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
exports.downloadCompoundObjectFiles = function(object, callback, websocket=null) {
  var path = config.batchFileDownloadTemporaryFolder + ("_" + new Date().getTime()),
      files = [],
      metadata = {},
      pid = object.pid || "",
      parts = Helper.getCompoundObjectPart(object, -1);

  let uri, part;
  for(var index in parts) {
    part = parseInt(parts[index].order) || index;
    uri = config.rootUrl + "/datastream/" + pid + "/tn/" + part + "/" + pid + "_" + part + "." + Helper.getFileExtensionForMimeType(object.mime_type || "");
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
      if(error) {callback(error, null)}
      else {callback(null, filepath)}
  });
}

/**
 * Fetch a list of files, and store them in a local folder
 */
var fetchResourceFiles = function(path, files, callback, websocket=null) {
  var url = "",
      options = {
      directory: path,
      filename: ""
    },
    count = 0;

  for(var fileUri of files) {
    options.filename = fileUri.substring(fileUri.lastIndexOf('/')+1) || "noname.file";
    console.log("Fetching resource file: uri", fileUri, "Saving to file", options.filename);
    download(fileUri, options, function(error, filename){
      count++;
      if(error) {
        console.log("Error downloading file: " + fileUri + " Error: " + error);
      }
      else {
        console.log("Successfully downloaded file: " + filename, count, files.length);
        if(websocket) {
          let msg = {
            status: "2",
            currentItem: count,
            itemCount: files.length || -1
          };
          websocket.send(JSON.stringify(msg));
        }
      }
      if(count == files.length) {
        callback(null);
      }
    });
  }
}
exports.fetchResourceFiles = fetchResourceFiles;

var createMetadataFiles = function(pid, path, metadata, callback) {
  var objectString = stringifyObject(metadata, {
      indent: '  ',
      singleQuotes: false
  });

  try {
    let filename = path + "/" + pid + "_metadata.txt";
    fs.writeFile(filename, objectString, error => {
      callback(error);
    })
  }
  catch(e) {
    callback(e);
  }
}
exports.createMetadataFiles = createMetadataFiles;