'use strict';
 
const Service = require('./service');

exports.getDPLAFeed = function(req, res) {
	var feed = [];

	Service.getObjectArray(function(error, data) {
		if(error) {
			console.log(error);
			res.status(500);
		}
		else if(data.length <= 0) {
			console.log("No objects found");
			res.status(404);
		}
		else {
			feed = data;
		}

		let json = JSON.stringify(feed);
		res.set("Content-Length", json.length);
		res.set("Content-Type", "application/json");
		res.send(json);
	});
}