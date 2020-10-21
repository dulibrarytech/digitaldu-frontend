"use strict";

const config = require('../config/' + process.env.CONFIGURATION_FILE),
	serverPort = config.webSocketPort || 9007,
    http = require("http"),
    express = require("express"),
    app = express(),
    server = http.createServer(app),
    WebSocket = require("ws"),
    websocketServer = new WebSocket.Server({ server });

//start the web server
server.listen(serverPort, () => {
    console.log(`Websocket server started on port ` + serverPort);
});

module.exports = websocketServer;
