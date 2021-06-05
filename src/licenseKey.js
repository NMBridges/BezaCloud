const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');
returnBtn.onclick = keySearched;

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
    // Connects to MySQL server
    var con = mysql.createConnection({
        host: "3.221.75.247",
        user: "typaCC",
        password: "sM1L6::@"
    });
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });

    // Gets unique machine ID
    var machId = machineIdSync({original: true});
    console.log("MACHINE ID:", machId);
    
    // check if license key is valid
}
