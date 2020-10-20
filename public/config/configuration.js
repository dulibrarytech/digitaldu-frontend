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

export class Configuration {
	constructor(values) {
		this.settings = {};

		/*
		 * Client settings object
		 */

		 /*
		 * Url to the websocket connector
		 * Required for compound object and other batch file downloads
		 */
		this.settings["wsUrl"] = "ws://localhost:9007";
	}

	getSettings(setting) {
		return this.settings[setting];
	}
}