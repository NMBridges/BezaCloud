const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');
const closeBtn = document.getElementById('closeBtn');
returnBtn.onclick = keySearched;
closeBtn.onclick = closeClicked;

var validLicenseKey = false;

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

// Checks that the input license key is valid
function keySearched() {
    updateKeyCache(keyTextBox.value);
    tryLicenseKey(keyTextBox.value);
}

function closeClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}