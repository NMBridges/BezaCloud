const { Colors } = parent.parent.require("../mercor.js");

var boundingBox = document.getElementById('boundingBox');
var headerLabel = document.getElementById('headerLabel');
var bodyLabel = document.getElementById('bodyLabel');
var continueButton = document.getElementById('continueButton');

window.onload = function() {

};

/**
 * Updates the colors of the document elements in accordance to the color theme.
 */
function updateColors() {
    boundingBox.style.backgroundColor = Colors.backgroundPrimary();
    
    headerLabel.style.color = Colors.textPrimary();
    bodyLabel.style.color = Colors.textSecondary();

    continueButton.style.backgroundColor = Colors.backgroundSecondary();
    continueButton.style.color = Colors.textPrimary();
}