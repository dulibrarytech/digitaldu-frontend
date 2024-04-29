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

export const Configuration = (function () {
	let config = {};
	let settings = {
		/*
		 * Url to the websocket connector
		 * Required for compound object and other batch file downloads
		 */
		wsUrl : "ws://localhost:8010",

		 /*
		 * Delay in ms after the batch download is initiated from the client, and the connect request is sent to the server websocket
		 * This allows server to start the websocket and for it to be available, after receiving the download request
		 */
		wsConnectDelay : 3000
	}

	config.getSetting = function(value) {
		return settings[value];
	}

	return config;

}());