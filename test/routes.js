const Test = require('../test/controller');

module.exports = function (app) {
    app.route('/test/uviewer')
        .get(Test.test_UVViewer);
};

module.exports = function (app) {
    app.route('/test/kalturaviewer')
        .get(Test.test_KalturaViewer);
};

module.exports = function (app) {
    app.route('/test/findRecordsNotInRange')
        .get(Test.test_findRecordsNotInRange);
};