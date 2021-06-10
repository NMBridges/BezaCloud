const homeDir = require('os').homedir();
const fs = require('fs');
const { machineIdSync } = require("../node_modules/node-machine-id/index.js");
var mysql = require('mysql-await');

// Returns the cached license key from the user's file system
function cachedLicenseKey() {
    var cachedKey = "";
    if(!fs.existsSync(homeDir + "/MercorConnect/licenseKey.txt")) {
        return "";
    }
    var keyDir = homeDir + "/MercorConnect/licenseKey.txt";
    try {
        cachedKey = fs.readFileSync(keyDir, 'utf-8');
        cachedKey = cachedKey.substr(4).trim();
    } catch(err) {
        console.log(err);
    }
    return cachedKey;
}

// Returns the cached AWS credentials
function cachedAwsCredentials() {
    // if(process.platform == 'win32') { } - perhaps separate by platform
    // in the future.
    
    // Loads the raw file, reads it line by line, and returns the proper strings
    var raw = fs.readFileSync(homeDir + "/.aws/credentials", 'utf-8');
    
    var lines = [];
    var tempStr = "";
    
    for(var q = 0; q < raw.length; q++) {
        var character = raw.substring(q, q + 1);
        if(character != " " && character != "" && character != "\r" && character != "\n") {
            tempStr += character;
        } else {
            if(tempStr != "") {
                lines.push(tempStr);
                tempStr = "";
            }
        }
    }
    
    if(tempStr != "") {
        lines.push(tempStr);
        tempStr = "";
    }

    var akId = "";
    if(lines[1].substring(0, 18) == "aws_access_key_id=") {
        akId = lines[1].substring(18);
    }

    var sak = "";
    if(lines[2].substring(0, 22) == "aws_secret_access_key=") {
        sak = lines[2].substring(22);
    }

    return { akId, sak };
}

// Updates the cached AWS credentials
function updateAwsCredentialsCache(newCreds) {
    const credPath = homeDir + "/.aws/credentials";
    if(!fs.existsSync(credPath)) {
        fs.appendFileSync(credPath, newCreds);
    } else {
        fs.writeFileSync(credPath, newCreds);
    }
}

// Returns the IP, user, pass, and database of the SQL server from an s3 bucket
// to be implemented
function getSqlServer() {

}

// Verifies the license key works. If not, returns false
async function tryLicenseKey(inputKey) {
    // Connects to MySQL server - in future pull this data from
    // s3 bucket using 'getSqlServer()'
    const con = mysql.createConnection({
        host: "3.221.75.247",
        user: "typaCC",
        password: "sM1L6::@",
        database: "licensemanager"
    });

    var keyIsValid = false;
    
    console.log("Connected to MySQL server");

    // Gets unique machine ID
    var machId = machineIdSync({original: true});

    // check if license key is valid
    const result = await con.awaitQuery("SELECT * FROM activationTable WHERE licenseKey=?", [inputKey]);
    
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
        keyIsValid = true;
    } else {
        // license key is valid and unused
        // register this license key for this device and proceed
        const result2 = await con.awaitQuery("UPDATE activationTable SET hardwareId =? WHERE licenseKey =?", [machId, inputKey]);
        await con.awaitCommit();
        console.log("License key registered successfully.");
        keyIsValid = true;
    }

    await con.awaitEnd();

    return keyIsValid;
}

// Ensures that there is a directory to store cache data
function createMercorConnectDir() {
    if(!fs.existsSync(homeDir + "/MercorConnect")) {
        fs.mkdirSync(homeDir + "/MercorConnect");
    }
    if(!fs.existsSync(homeDir + "/MercorConnect/licenseKey.txt")) {
        fs.appendFileSync(homeDir + "/MercorConnect/licenseKey.txt", "key=");
    }
    // add other sections as needed
}

// Updates the license key cache
function updateKeyCache(newKey) {
    if(!fs.existsSync(homeDir + "/MercorConnect/licenseKey.txt")) {
        fs.appendFileSync(homeDir + "/MercorConnect/licenseKey.txt", "key=" + newKey);
    } else {
        fs.writeFileSync(homeDir + "/MercorConnect/licenseKey.txt", "key=" + newKey);
    }
}

module.exports = { 
    cachedLicenseKey, tryLicenseKey, createMercorConnectDir, updateKeyCache,
    cachedAwsCredentials, updateAwsCredentialsCache
};