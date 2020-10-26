"use strict";

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	serverPort = config.webSocketPort || 9007,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    webSocketServer = new WebSocket.Server({ server }),
    clientConnections = [];

server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});

webSocketServer.on('connection', (webSocketClient, req) => {
	// Add the new connection to the client connection array
	clientConnections.push(webSocketClient);

	webSocketClient.on('close', (webSocketClient) => {
		console.log("Websocket client closed");
	});
});

webSocketServer.getClient = function(clientHost) {
	return clientConnections[clientHost] || null;
}

webSocketServer.getLastClient = function() {
	return clientConnections[clientConnections.length-1];
}

module.exports = webSocketServer;