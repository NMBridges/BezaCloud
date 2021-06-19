const homeDir = require('os').homedir();
const fs = require('fs');
const { machineIdSync } = require("../node_modules/node-machine-id/index.js");
var mysql = require('mysql-await');

/**
 * @returns The directory where the credentials and config files are stored. It differs by OS.
 */
function awsDir() {
    if(process.platform == "win32") {
        return homeDir + "/.aws";
    } else {
        return "~/.aws";
    }
}

/**
 * @returns The cached license key from the user's file system
 */
function cachedLicenseKey() {
    var cachedKey = "";
    if(!fs.existsSync(awsDir() + "/licenseKey2.txt")) {
        return "";
    }
    var keyDir = awsDir() + "/licenseKey2.txt";
    try {
        cachedKey = fs.readFileSync(keyDir, 'utf-8');
        cachedKey = cachedKey.substr(4).trim();
    } catch(err) {
        console.log(err);
    }
    return cachedKey;
}

/**
 * @returns The cached AWS credentials, as a tuple.
 */
function cachedAwsCredentials() {    
    // Loads the raw file, reads it line by line, and returns the proper strings
    var raw = fs.readFileSync(awsDir() + "/credentials", 'utf-8');
    
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

/**
 * Updates the cached AWS credentials
 * @param {string} newCreds The new AWS credentials, as a string to be placed in
 * the credentials file.
 */
function updateAwsCredentialsCache(newCreds) {
    const credPath = awsDir() + "/credentials";
    if(!fs.existsSync(credPath)) {
        fs.appendFileSync(credPath, newCreds);
    } else {
        fs.writeFileSync(credPath, newCreds);
    }
}

/** 
 * @returns The IP, user, pass, and database of the SQL server from an s3 bucket
 */
function getSqlServer() {

}

/**
 * Verifies the license key works. If not, returns false.
 * @param {string} inputKey The license key to validate.
 * @returns A boolean hether the license key works.
 */
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

/**
 * Ensures that there is a directory to store cache data
 */ 
function createAwsDir() {
    if(!fs.existsSync(awsDir())) {
        fs.mkdirSync(awsDir());
    }
    if(!fs.existsSync(awsDir() + "/licenseKey2.txt")) {
        fs.appendFileSync(awsDir() + "/licenseKey2.txt", "key=");
    }
    // add other sections as needed
}

/** 
 * Updates the license key cache.
 */ 
function updateKeyCache(newKey) {
    if(!fs.existsSync(awsDir() + "/licenseKey2.txt")) {
        fs.appendFileSync(awsDir() + "/licenseKey2.txt", "key=" + newKey);
    } else {
        fs.writeFileSync(awsDir() + "/licenseKey2.txt", "key=" + newKey);
    }
}

module.exports = { 
    cachedLicenseKey, tryLicenseKey, createAwsDir, updateKeyCache,
    cachedAwsCredentials, updateAwsCredentialsCache
};