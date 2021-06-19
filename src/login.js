const accessKeyIdField = document.getElementById('accessKeyIdField');
const secretAccessKeyField = document.getElementById('secretAccessKeyField');
const loginBtn = document.getElementById('loginBtn');
const exitBtn = document.getElementById('exitBtn');
loginBtn.onclick = loginClicked;
exitBtn.onclick = exitClicked;
document.onfocus = autofillTextboxes;
accessKeyIdField.onfocus = autofillTextboxes;
accessKeyIdField.focus();

// Supplemental functions
const { cachedAwsCredentials, updateAwsCredentialsCache } = require("./mercor.js");
const { connectionTest } = require("./apiCaller.js");

/**
 * Checks if the AWS credentials are valid. Logs in if so.
 */
function loginClicked() {
    const out = "[default]\naws_access_key_id=" + accessKeyIdField.value + "\naws_secret_access_key=" + secretAccessKeyField.value;
    updateAwsCredentialsCache(out);
    connectionTest().then( function(valid) {
        if(valid) {
            console.log("Logged in");
            // log in
            
            const remote = require('electron').remote;
            let w = remote.getCurrentWindow();
            w.emit('loginSuccessful');
        } else {
            console.log("Login failed");
            // display incorrect credentials message
            const textBox1 = document.getElementById('accessKeyIdField');
            const textBox2 = document.getElementById('secretAccessKeyField');
            textBox1.classList.add("shake");
            textBox2.classList.add("shake");

            setTimeout(() => {
                textBox1.classList.remove("shake");
                textBox2.classList.remove("shake");
            }, 500);
        }
    });
}

/**
 * Fills the textboxes with past login info.
 */
function autofillTextboxes() {
    if(accessKeyIdField.value == "") {
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

