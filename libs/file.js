/**
 * @file 
 *
 * File management functions
 *  
 */
'use strict'

const fs = require("fs");
const path = require("path");

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