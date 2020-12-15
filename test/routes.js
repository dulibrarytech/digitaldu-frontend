const config = require('../config/' + process.env.CONFIGURATION_FILE),
		Test = require('../test/controller');

module.exports = function (app) {

	if(config.nodeEnv == "development") {
		app.route('/test')
	        .get(Test.test_view)

		app.route('/test/uviewer')
	        .get(Test.test_UVViewer)

	    app.route('/test/kalturaviewer')
	        .get(Test.test_KalturaViewer)

	    app.route('/test/findRecordsNotInRange')
	        .get(Test.test_findRecordsNotInRange)

	    app.route('/test/retrieveNestedObjectValue')
	        .get(Test.test_retrieveNestedObjectValue)

	    app.route('/test/metadata_createMetadataDisplayObject')
	        .get(Test.test_metadata_createMetadataDisplayObject)

	    app.route('/test/isCompound')
	        .get(Test.test_isCompound)

	    app.route('/test/fetchObjectByPid')
	        .get(Test.test_fetchObjectByPid)

	    app.route('/test/fileDownloader')
	    	.get(Test.test_fileDownloader)

	    app.route('/test/sanitizeHtml')
	    	.get(Test.test_sanitizeHtml)

	    app.route('/test/cache_getList')
	    	.get(Test.test_cache_getList)

	    app.route('/test/cache_removeObject')
	    	.get(Test.test_cache_removeObject)
	}
};
