/*
 * object view events
 */

$( document ).ready(function() {
	$("#copy-manifest-link").click(function(event) {
		var r = document.createRange();
		var iiifLink = document.getElementById("copy-manifest-link").previousSibling;
		r.selectNode(iiifLink);
		window.getSelection().removeAllRanges();
		window.getSelection().addRange(r);
		document.execCommand('copy');
		window.getSelection().removeAllRanges();
	});
});