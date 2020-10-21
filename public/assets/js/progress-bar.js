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

export class ProgressBar {
	constructor(parentId="", maxValue=100) {
		this.parentId = parentId;
		this.maxValue = maxValue;
		this.add();
	}

	add() {
		let parent = document.getElementById(this.parentId);
		let progBar = document.createElement("PROGRESS");
		let label = document.createElement("DIV");
		let button = document.createElement("BUTTON");
		label.setAttribute("id", this.parentId + "_progress-bar-message");
		parent.appendChild(label);
		progBar.setAttribute("value", "0");
		progBar.setAttribute("max", this.maxValue);
		parent.appendChild(progBar);
		button.innerHTML = "Cancel";
  		button.setAttribute("id", "batch-file-download-cancel");
  		parent.appendChild(button);
		this.progBar = progBar;
		this.label = label;
	}

	remove() {
		let parent = document.getElementById(this.parentId);
		parent.removeChild(this.progBar);
		parent.removeChild(this.label);
	}

	setMaxValue(value) {
		this.maxValue = value;
		this.progBar.setAttribute("max", value);
	}

	increment(value=1) {
		let currentValue = parseInt(this.progBar.getAttribute("value"));
		currentValue += value;
		this.progBar.setAttribute("value", currentValue);
	}

	displayMessage(text) {
		this.label.innerHTML = text;
	}

	resetMessage() {
		this.label.innerHTML = "";
	}
}