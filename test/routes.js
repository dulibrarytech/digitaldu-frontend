const config = require('../config/' + process.env.CONFIGURATION_FILE),
		Test = require('../test/controller');

module.exports = function (app) {

	if(config.nodeEnv == "development") {
		app.route('/test')
	        .get(Test.test_view)

	    app.route('/test/cache_getList')
	    	.get(Test.test_cache_getList)

	    app.route('/test/cache_removeObject')
	    	.get(Test.test_cache_removeObject)
	}
};
