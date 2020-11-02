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

import { ProgressBar } from './progress-bar.js';

export const Downloader = (function () {

	let downloadBatch = function(downloadUrl, socketUrl) {
			console.log("TESt downloadBatch url in", downloadUrl)
		var progressBar = new ProgressBar("file-download-progress", "100");
		progressBar.displayMessage("Connecting to server...");

  		const button = document.createElement("BUTTON");
  		button.setAttribute("id", "batch-file-download-cancel");
  		button.innerHTML = "Cancel";
  		button.disabled = true;
  		document.getElementById("file-download-progress").appendChild(button);

		var socket = new WebSocket(socketUrl);
		socket.onopen = function(event) {
		  	console.log("Connection to socket established.");
		  	socket.onmessage = function (event) {
			  	var msg = JSON.parse(event.data);
			  	try {
				  	switch(msg.status) {
				  		// Begin file transfer
				  		case "1":
				  			progressBar.displayMessage("Retrieving files, please wait...");
				  			progressBar.setMaxValue(msg.itemCount);
				  			break;
				  		// Single file was transferred
				  		case "2":
				  			button.disabled = false;
				  			progressBar.increment(1);
				  			break;
				  		// File transfer complete
				  		case "3": 
				  			progressBar.displayMessage("Downloading...");
				  			break;
				  		// Download complete
				  		case "4":
				  			progressBar.remove();
				  			console.log("Closing socket");
				  			socket.close();
				  			break;
				  		// Error
				  		case "5":
				  			progressBar.remove();
				  			console.log("Error");
				  			socket.close();
				  			break;
				  		// Server received abort message
				  		case "6":
				  			progressBar.remove();
				  			console.log("Closing socket");
				  			socket.close();
				  			break;
				  		default:
				  			socket.close();
				  			console.log("Invalid socket status");
				  			break;
				  	}

			  		if(msg.message) {
			  			console.log(msg.message);
			  		}
				} catch (e) {
	  				console.log(e);
				}
			}

			socket.onerror = function(event) {
			  	socket.close();
	  			console.log(event);
			};

			button.addEventListener("click", function(event) {
				cancelDownload(socket);
			});

			// Create virtual anchor to send the browser download request
			const anchor = document.createElement('a');
			anchor.style.display = 'none';
			anchor.href = downloadUrl;
			anchor.download = '';
			anchor.click();
		};
	}

	let cancelDownload = function(socket) {
		console.log("Cancelling download");
		socket.send(JSON.stringify({abort: true}));
	}

	return {
		downloadBatch: function(downloadUrl, socketUrl) {
			return downloadBatch(downloadUrl, socketUrl);
		}
	}
}());	