const accessKeyIdField = document.getElementById('accessKeyIdField');
const secretAccessKeyField = document.getElementById('secretAccessKeyField');
const loginBtn = document.getElementById('loginBtn');
const exitBtn = document.getElementById('exitBtn');
loginBtn.onclick = loginClicked;
exitBtn.onclick = exitClicked;
accessKeyIdField.onfocus = autofillTextboxes;
accessKeyIdField.focus();

// Supplemental functions
const { cachedAwsCredentials, updateAwsCredentialsCache } = require("./mercor.js");
const { connectionTest } = require("./apiCaller.js");

// Checks if the AWS credentials are valid. Logs in if so
function loginClicked() {
    var credObj = cachedAwsCredentials();
    credObj['akId'] = accessKeyIdField.value;
    credObj['sak'] = secretAccessKeyField.value;
    const out = "[default]\naws_access_key_id=" + credObj['akId'] + "\naws_secret_access_key=" + credObj['sak'];
    updateAwsCredentialsCache(out);
    connectionTest().then( function(valid) {
        if(valid) {
            console.log("Logged in");
            // log in
        } else {
            console.log("Login failed");
            // display incorrect credentials message
        }
    });
}

// Fills the textboxes with past login info
function autofillTextboxes() {
    const credObj = cachedAwsCredentials();
    accessKeyIdField.value = credObj['akId'];
    secretAccessKeyField.value = credObj['sak'];
}

// Closes the window
function exitClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}

