var coll = document.getElementsByClassName("collapsible");
var i;
console.log("ADD", coll);
for (i = 0; i < coll.length; i++) {
    coll[i].addEventListener("click", function() {
        this.classList.toggle("active");
        // var content = this.nextElementSibling;
        var content = document.getElementById("mods-display");
        if (content.style.display === "block") {
            content.style.display = "none";
        } else {
            content.style.display = "block";
        }
    });
}