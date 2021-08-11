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

	var downloadBatch = function(downloadUrl, socketUrl) {
		var progressBar = new ProgressBar("file-download-progress", "100");
		progressBar.displayMessage("Connecting to server...");

  		const button = document.createElement("BUTTON");
  		button.setAttribute("id", "batch-file-download-cancel");
  		button.innerHTML = "Cancel";
  		button.disabled = true;
  		document.getElementById("file-download-progress").appendChild(button);
  		disableDownloadControls(true);
  		
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
				  			disableDownloadControls(false);
				  			break;
				  		// Error
				  		case "5":
				  			progressBar.remove();
				  			console.log("Socket error");
				  			socket.close();
				  			disableDownloadControls(false);
				  			break;
				  		// Server received abort command
				  		case "6":
				  			progressBar.remove();
				  			console.log("Closing socket");
				  			socket.close();
				  			disableDownloadControls(false);
				  			break;
				  		default:
				  			console.log("Socket error");
				  			socket.close();
				  			disableDownloadControls(false);
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

			submitLinkRequest(downloadUrl, "");
		};
	}

	var cancelDownload = function(socket) {
		console.log("Cancelling download");
		socket.send(JSON.stringify({abort: true}));
	}

	var submitLinkRequest = function(url, filename) {
		var anchor = document.createElement('a');
		anchor.style.display = 'none';
		anchor.href = url;
		anchor.download = '';
		document.body.appendChild(anchor);
		anchor.click();
		anchor.remove();
	}

	var disableDownloadControls = function(disable=true) {
		for(var downloadButton of document.getElementsByClassName("batch-download-button")) {
  			downloadButton.disabled = disable;
  		}
  		document.getElementById("download-links-select").disabled = disable;
	}

	return {
		downloadBatch: function(downloadUrl, socketUrl) {
			return downloadBatch(downloadUrl, socketUrl);
		},
		submitLinkRequest: function(url, filename) {
			submitLinkRequest(url, filename);
		}
	}
}());	