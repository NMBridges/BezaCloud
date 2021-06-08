const accessKeyIdField = document.getElementById('accessKeyIdField');
const secretAccessKeyField = document.getElementById('secretAccessKeyField');
const loginBtn = document.getElementById('loginBtn');
const exitBtn = document.getElementById('exitBtn');
loginBtn.onclick = loginClicked;
exitBtn.onclick = exitClicked;
accessKeyIdField.onfocus = autofillTextboxes;
accessKeyIdField.focus();

const { cachedAwsConfig, updateAwsConfigCache } = require("./mercor.js");

function loginClicked() {
    const jsonObj = JSON.parse(cachedAwsConfig());
    jsonObj['accessKeyId'] = accessKeyIdField.value;
    jsonObj['secretAccessKey'] = secretAccessKeyField.value;
    updateAwsConfigCache(JSON.stringify(jsonObj));
}

function autofillTextboxes() {
    const jsonObj = JSON.parse(cachedAwsConfig());
    accessKeyIdField.value = jsonObj['accessKeyId'];
    secretAccessKeyField.value = jsonObj['secretAccessKey'];
}

function exitClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}

