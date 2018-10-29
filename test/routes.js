const Test = require('../test/controller');

module.exports = function (app) {
    app.route('/test/uviewer')
        .get(Test.testUVViewer);
};