File = require('./file');

const config = require('../config/' + process.env.CONFIGURATION_FILE);

exports.streamFile = function(fileName, callback) { 

  const file = `${config.localStorageFolder}/${fileName}`;

  File.getFileStream(file, function(error, stream) {
    if(error) {
      callback(`Error fetching file in local storage: ${error}`, null)
    }
    else {
      callback(null, stream)
    }
  });
}