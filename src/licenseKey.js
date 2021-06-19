const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');
const closeBtn = document.getElementById('closeBtn');
returnBtn.onclick = keySearched;
closeBtn.onclick = closeClicked;

const { machineIdSync } = require("../node_modules/node-machine-id/index.js");
var mysql = require('mysql');
const { updateKeyCache, tryLicenseKey } = require("./mercor.js");

// Checks for 'return' on license key text box
keyTextBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        returnBtn.click();
    }
});

/**
 * Checks that the input license key is valid
 */
function keySearched() {
    updateKeyCache(keyTextBox.value);
    
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('licenseKeySearched');
}

/**
 * Closes the window when 'close' is clicked.
 */
function closeClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}