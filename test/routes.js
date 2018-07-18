const Test = require('../test/controller');

module.exports = function (app) {

    app.route('/test')
        .get(Test.testViewer);
};