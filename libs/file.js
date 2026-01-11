/**
 * @file 
 *
 * File management functions
 *  
 */
'use strict'

const fs = require("fs");
const download = require('file-download');
const path = require("path");
const XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

const Logger = require('./log4js');

exports.fetchFile = function(type, url, async=true, body=null, callback=null) {
  var xhttp = new XMLHttpRequest();

  if(async) {
    xhttp.onreadystatechange = function() {
      if (this.readyState == 4 && 
          this.status == 200) {         
         callback(null, 200, xhttp.responseText);
      }
      else {
        let message = "Server responded with status " + this.status + ", ready state " + this.readyState;
        callback(message, this.status, null)
      }
    };
  }

  if(type.toLowerCase() == "post") {
    let param = url.substring(url.indexOf("?")+1).split("="),
      data = {};

    // If (body)
    data = body;

    // Else (no body) TODO convert to loop to allow multiple params
    data[param[0]] = param[1];

    url = url.substring(0, url.indexOf("?"));
    xhttp.open("POST", url, async);
    xhttp.setRequestHeader("Content-type", "application/json");
    xhttp.send(JSON.stringify(data));
  }
  else {
    xhttp.open("GET", url, async);
    xhttp.send();
  }

  if(async == false) {
    return xhttp.responseText;
  }
}

exports.removeDir = function(path, callback) {
  if (fs.existsSync(path)) {
    const files = fs.readdirSync(path)

    if (files.length > 0) {
      files.forEach(function(filename) {
        if (fs.statSync(path + "/" + filename).isDirectory()) {
          removeDir(path + "/" + filename)
        } else {
          fs.unlinkSync(path + "/" + filename)
        }
      })
      fs.rmdirSync(path)
    } else {
      fs.rmdirSync(path)
    }
  } else {
    callback("Directory path not found.")
  }
}

exports.downloadToFileSync = async function(uri, filepath, filename) {
  let options = {
    directory: filepath,
    filename: filename
  }

  let promise = new Promise((resolve, reject) => {
    try {
      download(uri, options, function(error, filename) {
        if(error) {
          Logger.module().error('ERROR: ' + `Error downloading file: ${uri} Error: ${error}`);
          resolve(error);
        }
        else {
          resolve(filename);
        }
      });
    } catch (e) {
      Logger.module().error('ERROR: ' + `Error downloading file: ${uri} Error: ${e}`);
    }
  });

  let result = await promise;
  return result;
}

exports.getFileStream = function(path, callback) {
    let stream = fs.createReadStream(path);

    stream.on('error', function(error) {
      if(error.code == "ENOENT") {
        Logger.module().error(`File not found: ${error.path}`)
        callback(null, null)
      }
      else {
        callback(error, null)
      }
    });

    stream.on('open', function() {
      callback(null, stream);
    });
}