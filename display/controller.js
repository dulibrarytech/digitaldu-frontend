'use strict'

exports.renderObjectView = function(req, res) {

	console.log("here");

	var data = {};
	data['pid'] = Helper.extractPidFromUrl(req.originalUrl);

	// Get content model

	// Get viewer content

	// Get mods data


	return res.render('object', data);
};