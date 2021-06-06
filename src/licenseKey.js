const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');
const closeBtn = document.getElementById('closeBtn');
returnBtn.onclick = keySearched;
closeBtn.onclick = closeClicked;

var validLicenseKey = false;

import { machineIdSync } from "../node_modules/node-machine-id/index.js";
var mysql = require('mysql');

// Checks for 'return' on license key text box
keyTextBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        returnBtn.click();
    }
});

// Checks that the input license key is valid
function keySearched() {
    // Connects to MySQL server - in future pull this data from s3 bucket
    var con = mysql.createConnection({
        host: "3.221.75.247",
        user: "typaCC",
        password: "sM1L6::@",
        database: "licensemanager"
    });
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");

        // Gets unique machine ID
        var machId = machineIdSync({original: true});
        console.log("MACHINE ID:", machId);

        // check if license key is valid
        con.query("SELECT * FROM activationTable WHERE licenseKey=?", [keyTextBox.value], function(err, result) {
            if(err) throw err;
            if(result.length == 0) {
                // license key does not exist
                // cannot proceed
                console.log("Invalid license key.");
            } else if(result[0]['hardwareId'] != null && result[0]['hardwareId'] != machId) {
                // license key is registered on another device
                // cannot proceed
                console.log("License key is registered on another device.");
            } else if(result[0]['hardwareId'] == machId) {
                // license key is registered by the current device
                // proceed
                console.log("License key is valid.");
            } else {
                // license key is valid and unused
                // register this license key for this device and proceed
                con.query("UPDATE activationTable SET hardwareId =? WHERE licenseKey =?", [machId, keyTextBox.value], function(err2, result2) {
                    if(err2) throw err2;
                    console.log("License key registered successfully.");
                });
            }
        });
    });
}

function closeClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}