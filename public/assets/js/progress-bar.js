export class ProgressBar {
	constructor(parentId="", maxValue=100) {
		this.parentId = parentId;
		this.maxValue = maxValue;
		this.add();
	}

	add() {
		let parent = document.getElementById(this.parentId);
		let progBar = document.createElement("PROGRESS");
		let message = document.createElement("DIV");
		progBar.setAttribute("value", "0");
		progBar.setAttribute("max", this.maxValue);
		parent.appendChild(progBar);
		message.setAttribute("id", this.parentId + "_progress-bar-message");
		message.setAttribute("style", "font-size: 0.8em; margin-top: 10px");
		parent.appendChild(message);
		this.progBar = progBar;
		this.message = message;
	}

	remove() {
		let parent = document.getElementById(this.parentId);
		parent.removeChild(this.progBar);
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
		this.message.innerHTML = text;
	}

	resetMessage() {
		this.message.innerHTML = "";
	}
}