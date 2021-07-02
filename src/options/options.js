// Suplemental functions
const { Colors } = parent.require("../mercor.js");

// Page elements
var headerBar = document.getElementById('optionsHeaderBar');
var headerBarLabel = document.getElementById('optionsHeaderBarLabel');
var primaryBody = document.getElementById('optionsPrimaryBody');

/**
 * Updates the elements of the page in accordance to the color theme.
 */
function updateColors() {
    if(headerBar != undefined) {
        headerBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
        headerBarLabel.style.color = Colors.textPrimary();
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();
    }
}