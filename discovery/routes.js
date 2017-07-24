'use strict';

module.exports = function (app) {
	// app.route('/')
 //        .get();
	app.get("/repository", function(req, res) {  
	    res.json({
	        status: "Hello World"
	    });
	});
};


