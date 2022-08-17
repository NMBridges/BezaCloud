// Supplemental functions
const {
    cachedAwsCredentials, updateAwsCredentialsCache, Colors,
    getTheme
} = require("../beza.js");
const {
    ApiCaller
} = require("../apiCaller.js");

var bod = document.body;
var wrapper = document.getElementById('wrapper');
var accessKeyIdField = document.getElementById('accessKeyIdField');
var secretAccessKeyField = document.getElementById('secretAccessKeyField');
var loginBtn = document.getElementById('loginBtn');
var exitBtn = document.getElementById('exitBtn');
var fieldLabels = document.getElementsByClassName('fieldLabel');
var productImg = document.getElementById("productImg");


loginBtn.onclick = loginClicked;
exitBtn.onclick = exitClicked;

window.onload = function() {
    updateColors();
};

/**
 * Checks if the AWS credentials are valid. Logs in if so.
 */
function loginClicked() {
    loginBtn.style.backgroundColor = "#aaaaaa";
    if(loginBtn.value == "selected") { return; }
    loginBtn.value == "selected";
    
    const out = "[default]\naws_access_key_id=" + accessKeyIdField.value + "\naws_secret_access_key=" + secretAccessKeyField.value;
    updateAwsCredentialsCache(out);
    console.log(out);
    ApiCaller.connectionTest().then( function(valid) {
        if(valid) {
            console.log("Logged in");
            // log in

            loginBtn.value == "";
            loginBtn.style.backgroundColor = Colors.textPrimary();

            updateColors();
            
            const remote = require('electron').remote;
            let w = remote.getCurrentWindow();
            w.emit('loginSuccessful');

            return true;
        } else {
            console.log("Login failed");
            // display incorrect credentials message
            const textBox1 = document.getElementById('accessKeyIdField');
            const textBox2 = document.getElementById('secretAccessKeyField');
            textBox1.classList.add("shake");
            textBox2.classList.add("shake");

            loginBtn.value == "";
            loginBtn.style.backgroundColor = Colors.textPrimary();

            setTimeout(() => {
                textBox1.classList.remove("shake");
                textBox2.classList.remove("shake");
            }, 500);

            return false;
        }
    });
}

/**
 * Fills the textboxes with past login info.
 */
function autofillTextboxes() {
    if(accessKeyIdField.value == "" && secretAccessKeyField.value == "") {
        const credObj = cachedAwsCredentials();
        accessKeyIdField.value = credObj['akId'];
        secretAccessKeyField.value = credObj['sak'];
    }
}

/**
 * Closes the window when 'exit' is clicked.
 */
function exitClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}

/**
 * Updates the colors of the elements in accordance with the color theme.
 */
function updateColors() {
    accessKeyIdField.style.outlineColor = Colors.backgroundSecondary();
    secretAccessKeyField.style.outlineColor = Colors.backgroundSecondary();

    if(getTheme() == "Dark") {
        productImg.src = "../assets/NiMBLeBannerx100-Orange.png";
        bod.style.backgroundColor = Colors.backgroundPrimary();
        wrapper.style.backgroundColor = Colors.textPrimary();
        wrapper.style.color = Colors.backgroundPrimary();
        for(var index = 0; index < fieldLabels.length; index++) {
            fieldLabels[index].style.color = Colors.backgroundSecondary();
        }
        loginBtn.style.backgroundColor = Colors.textPrimary();
        loginBtn.style.color = Colors.backgroundSecondary();
        exitBtn.style.color = Colors.backgroundSecondary();
    } else {
        productImg.src = "../assets/NiMBLeBannerx100-White.png";
        bod.style.backgroundColor = Colors.backgroundSecondary();
        wrapper.style.backgroundColor = Colors.backgroundPrimary();
        wrapper.style.color = Colors.textPrimary();
        for(var index = 0; index < fieldLabels.length; index++) {
            fieldLabels[index].style.color = Colors.textPrimary();
        }
        loginBtn.style.backgroundColor = Colors.backgroundPrimary();
        loginBtn.style.color = Colors.textPrimary();
        exitBtn.style.backgroundColor = Colors.textPrimary();
        exitBtn.style.color = Colors.backgroundSecondary();
    }
}