File = require('./file');

const LOCAL_STORAGE_PATH = "storage";

exports.streamFile = function(fileName, callback) { 

  const file = `${LOCAL_STORAGE_PATH}/${fileName}`;

  File.getFileStream(file, function(error, stream) {
    if(error) {
      callback(`Error fetching file in local storage: ${error}`, null)
    }
    else {
      callback(null, stream)
    }
  });
}