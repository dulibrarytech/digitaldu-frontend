  /**
    Copyright 2020 University of Denver

    Licensed under the Apache License, Version 2.0 (the "License");
    you may not use this file except in compliance with the License.

    You may obtain a copy of the License at
    http://www.apache.org/licenses/LICENSE-2.0
    
    Unless required by applicable law or agreed to in writing, software
    distributed under the License is distributed on an "AS IS" BASIS,
    WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
    See the License for the specific language governing permissions and
    limitations under the License.
 */

"use strict";

const WebSocketServer = require('ws');

const Logger = require('./log4js');

module.exports = (function () {
	let object = {};

	var http = require("http"),
    	express = require("express"),
    	app = express(),
    	clientConnections = [];

    object.startServer = function(port) {
		const server = http.createServer(app);
		const wss = new WebSocketServer.Server({ server });

		server.listen(port, () => {
			Logger.module().info('INFO: ' + `Websocket server started on port ${port}`);
		});

		wss.on('connection', function connection(ws) {
			clientConnections.push(ws);

			//ws.on('error', console.error);
			ws.on('error', function (error) {
				Logger.module().info('INFO: ' + `Websocket error: ${error}`);
			});

			ws.on('message', function message(data) {
				Logger.module().info('INFO: ' + `Websocket received data: ${data}`);
			});

			ws.on('close', (webSocketClient) => {
				Logger.module().info('INFO: ' + "Websocket client closed");
			});
		});
    }

    object.getClient = function(index) {
    	return clientConnections[index];
    }

    object.getLastClient = function() {
    	return clientConnections[clientConnections.length-1];
    }

	return object
}());