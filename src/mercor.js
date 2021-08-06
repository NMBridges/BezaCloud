const homeDir = require('os').homedir();
const fs = require('fs');
const { machineIdSync } = require("node-machine-id/index.js");
var mysql = require('mysql-await');
const { Address } = require('@aws-sdk/client-ec2');
const { exec, execSync } = require('child_process');
const promiseExec = require('util').promisify(exec);
var atob = require("atob");
var btoa = require("btoa");

/** Global variable that holds information for the popup window header. */
var popupHeader = "";
/** Global variable that holds information for the popup window body. */
var popupBody = "";
/** Global variable that holds information for the popup window button. */
var popupButton = "";

/** @type {string} The color theme of Mercor Connect. */
var theme = getTheme();
/** @type {string} The AWS region of Mercor Connect. */
var region = getRegion();
/** @type {string} The current page that Mercor Connect is on. */
var page = "Dashboard";

/**
 * @returns The directory where the credentials and config files are stored.
 */
function awsDir() {
    return homeDir + "/.aws";
}

/**
 * Returns whether or not the user has the AWS CLI installed.
 */
const hasAwsCliInstalled = async () => {
    if(process.platform == "win32") {
        try {
            execSync("aws --version");
            console.log("AWS CLI installed");
            return true;
        } catch {
            console.log("AWS CLI not installed");
            return false;
        }
    } else {
        try {
            const { stdout, stderr } = await promiseExec("aws --version");
            console.log("AWS CLI installed");
            return true;
        } catch(err) {
            console.log("AWS CLI not installed", err);
            return false;
        }
    }
}

/**
 * Downloads and installs the AWS CLI if on Windows. Downloads if on Mac.
 */
const installAwsCli = async () => {
    if(process.platform == "win32") {
        exec("msiexec.exe /i https://awscli.amazonaws.com/AWSCLIV2.msi", function(err) {
            if(err != null) {
                console.log("Success installing AWS CLI");
                return;
            } else {
                console.log("Error installing AWS CLI");
                return;
            }
        });
    } else {
        exec("curl \"https://awscli.amazonaws.com/AWSCLIV2.pkg\" -o \"" + awsDir() + "/AWSCLIV2.pkg\"", function(err) {
            if(err == null) {
                console.log("AWS CLI downloaded successfully")
                return;
            } else {
                console.log("Error downloading AWS CLI");
                return;
            }
        });
    }
}

/**
 * Runs an inputted command. Used asynchronously by windows that are about to close.
 * @param {string} inpCmd The inputted command to be executed.
 */
function mercorExec(inpCmd) {
    exec(inpCmd);
}

/**
 * @returns The current page.
 */
function getPage() {
    return page;
}

/**
 *  @param {string} newPage The new page.
 */
function setPage(newPage) {
    page = newPage;
}

/**
 * @returns The cached license key from the user's file system
 */
function cachedLicenseKey() {
    var cachedKey = getCacheValue("licenseKey");
    return cachedKey;
}

/** 
 * Updates the license key cache.
 */ 
 function updateKeyCache(newKey) {
    updateCache("licenseKey", newKey);
    return;
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
    try {
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
    } catch {
        console.log("Invalid license key.");
        return false;
    }
}

/**
 * Ensures that there is a directory to store cache data
 */ 
function createAwsDir() {
    if(!fs.existsSync(awsDir())) {
        fs.mkdirSync(awsDir());
        fs.mkdirSync(awsDir() + "/connections");
    }
    if(!fs.existsSync(awsDir() + "/cache.json")) {
        fs.appendFileSync(awsDir() + "/cache.json", btoa('{}'));
    }
    // add other sections as needed
}

/**
 * Updates the cache with the given key / value pair.
 * @param {string} key The key that needs to be updated.
 * @param {string} value The value that needs to be updated.
 */
function updateCache(key, value) {
    if(!fs.existsSync(awsDir() + "/cache.json")) {
        fs.appendFileSync(awsDir() + "/cache.json", btoa('{}'));
    }

    const raw = fs.readFileSync(awsDir() + "/cache.json");
    const jsonObj = JSON.parse(atob(atob(raw)));
    jsonObj[key] = value;
    fs.writeFileSync(awsDir() + "/cache.json", btoa(JSON.stringify(jsonObj)), err => {
        if (err) {
            console.log("Error writing file:", err);
        }
    });
}

/**
 * @param {string} key 
 * @returns The cache value for the specified key.
 */
function getCacheValue(key) {
    createAwsDir();
    if(!fs.existsSync(awsDir() + "/cache.json")) {
        fs.appendFileSync(awsDir() + "/cache.json", btoa('{}'));
        return "ERROR";
    }
    const raw = fs.readFileSync(awsDir() + "/cache.json");
    const jsonObj = JSON.parse(atob(atob(raw)));
    if(key in jsonObj) {
        return jsonObj[key];
    } else {
        return "ERROR";
    }
}

/**
 *  @param {string} newRegion The new AWS region.
 */
function setRegion(newRegion) {
    region = newRegion;
    updateCache("region", newRegion);
}

/**
 * @returns The AWS region.
 */
function getRegion() {
    region = getCacheValue("region");
    if(region == "ERROR" || region == undefined) {
        setRegion("us-east-1");
    }
    return region;
}

/**
 * @returns The color theme.
 */
function getTheme() {
    theme = getCacheValue("theme");
    if(theme == "ERROR" || theme == undefined) {
        setTheme("Dark");
    }
    return theme;
}

/**
 *  @param {string} newTheme The new color theme.
 */
function setTheme(newTheme) {
    theme = newTheme;
    updateCache("theme", newTheme);
}

/** 
 * Creates an .rdp file.
 */ 
function createRdpFile(address) {
    const newFile = "full address:s:" + address + "\nusername:s:Administrator";
    if(!fs.existsSync(awsDir() + "/connections/server.rdp")) {
        fs.appendFileSync(awsDir() + "/connections/server.rdp", newFile);
    } else {
        fs.writeFileSync(awsDir() + "/connections/server.rdp", newFile);
    }
}

/** 
 * Opens the .rdp file.
 */ 
function openRdpFile() {
    if(!fs.existsSync(awsDir() + "/connections/server.rdp")) {
        console.log("Error RDP file does not exist.")
        return false;
    } else {
        exec("open " + awsDir() + "/connections/server.rdp");
        return true;
    }
}

/**
 * Sets the values for the popup window.
 * @param {string} header The header text.
 * @param {string} body The body text.
 * @param {string} button The button text. Blank if button should be hidden.
 */
 function setPopupValues(header, body, button) {
    popupHeader = header;
    popupBody = body;
    popupButton = button;
    updateCache("popupHeader", popupHeader);
    updateCache("popupBody", popupBody);
    updateCache("popupButton", popupButton);
}

/**
 * @returns The text values for the popup window.
 */
function getPopupValues() {
    popupHeader = getCacheValue("popupHeader");
    popupBody = getCacheValue("popupBody");
    popupButton = getCacheValue("popupButton");
    return [popupHeader, popupBody, popupButton];
}

/**
 * @param {number} r The red value.
 * @param {number} g The green value.
 * @param {number} b The blue value.
 * @returns A hexadecimal value for that RGB set.
 */
function hex(r, g, b) {
    return "#" + ((r > 15) ? r.toString(16) : ("0" + r.toString(16))) + ((g > 15) ? g.toString(16) : ("0" + g.toString(16))) + ((b > 15) ? b.toString(16) : ("0" + b.toString(16)));
}

/** Colors class that controls which colors are used based on the theme. */
class Colors {
    static textPrimary() {
        if (theme == "Dark") {
            return hex(255,255,255);
        } else if (theme == "Mercor") {
            return hex(255,255,255);
        }
        return "D90166";
    }
    static menuTextPrimary() {
        if (theme == "Dark") {
            return hex(255,255,255);
        } else if (theme == "Mercor") {
            return hex(255,255,255);
        }
        return "D90166";
    }
    static textSecondary() {
        if (theme == "Dark") {
            return hex(192,192,192);
        } else if (theme == "Mercor") {
            return hex(225,225,225);
        }
        return "D90166";
    }
    static textTertiary() {
        if (theme == "Dark") {
            return hex(152,152,152);
        } else if (theme == "Mercor") {
            return hex(170,170,170);
        }
        return "D90166";
    }
    static backgroundPrimary() {
        if (theme == "Dark") {
            return hex(35,47,63);
        } else if (theme == "Mercor") {
            return hex(97,81,245);
        }
        return "D90166";
    }
    static mainBorderColor() {
        if (theme == "Dark") {
            return hex(32,43,58);
        } else if (theme == "Mercor") {
            return hex(101,85,250);
        }
        return "D90166";
    }
    static backgroundSecondary() {
        if (theme == "Dark") {
            return hex(247, 150, 37);
        } else if (theme == "Mercor") {
            return hex(128, 132, 246);
        }
        return "D90166";
    }
    static topBarColor() {
        if (theme == "Dark") {
            return hex(255,255,255);
        } else if (theme == "Mercor") {
            return hex(255,255,255);
        }
        return "D90166";
    }
    static chartColor() {
        if (theme == "Dark") {
            return hex(247,150,37);
        } else if (theme == "Mercor") {
            return hex(255,255,255);
        }
        return "D90166";
    }
    static helpLinkColor() {
        if (theme == "Dark") {
            return hex(247,150,37);
        } else if (theme == "Mercor") {
            return hex(225,225,225);
        }
        return "D90166";
    }
    static backgroundPrimaryAccent() {
        if (theme == "Dark") {
            return hex(45,57,74);
        } else if (theme == "Mercor") {
            return hex(102,86,255);
        }
        return "D90166";
    }
    static backgroundPrimaryDoubleAccent() {
        if (theme == "Dark") {
            return hex(55,67,84);
        } else if (theme == "Mercor") {
            return hex(112,96,255);
        }
        return "D90166";
    }
    static backgroundSecondaryMouseHover() {
        if (theme == "Dark") {
            return hex(222,121,35);
        } else if (theme == "Mercor") {
            return hex(138,142,255);
        }
        return "D90166";
    }
    static backgroundSecondarySelected() {
        if (theme == "Dark") {
            return hex(202,111,33);
        } else if (theme == "Mercor") {
            return hex(148,152,255);
        }
        return "D90166";
    }
    static backgroundSecondaryToggleMenuBackground() {
        if (theme == "Dark") {
            return hex(255,165,40);
        } else if (theme == "Mercor") {
            return hex(45,45,45);
        }
        return "D90166";
    }
    static awsLink() {
        if (theme == "Dark") {
            return hex(158,163,247);
        } else if (theme == "Mercor") {
            return hex(247,150,37);
        }
        return "D90166";
    }
    static loginColor() {
        if (theme == "Dark") {
            return hex(247,150,37);
        } else if (theme == "Mercor") {
            return hex(97,81,245);
        }
        return "D90166";
    }
    static loginSecondary() {
        if (theme == "Dark") {
            return hex(35,47,63);
        } else if (theme == "Mercor") {
            return hex(158,163,247);
        }
        return "D90166";
    }
    static loginLabelPrimary() {
        if (theme == "Dark") {
            return hex(255,255,255);
        } else if (theme == "Mercor") {
            return hex(255,255,255);
        }
        return "D90166";
    }
    static loginLabelSecondary() {
        if (theme == "Dark") {
            return hex(255,255,255);
        } else if (theme == "Mercor") {
            return hex(35,225,35);
        }
        return "D90166";
    }
    static cellTile1() {
        if (theme == "Dark") {
            return hex(35,47,63);
        } else if (theme == "Mercor") {
            return hex(97,81,245);
        }
        return "D90166";
    }
    static cellTile2() {
        if (theme == "Dark") {
            return hex(37,49,65);
        } else if (theme == "Mercor") {
            return hex(101,85,249);
        }
        return "D90166";
    }
    static cellTile3() {
        if (theme == "Dark") {
            return hex(36,48,64);
        } else if (theme == "Mercor") {
            return hex(99,83,247);
        }
        return "D90166";
    }
    static cellTile4() {
        if (theme == "Dark") {
            return hex(38,50,66);
        } else if (theme == "Mercor") {
            return hex(103,87,251);
        }
        return "D90166";
    }
    static cellTileHighlight() {
        if (theme == "Dark") {
            return hex(50,60,70);
        } else if (theme == "Mercor") {
            return hex(109,93,255);
        }
        return "D90166";
    }
}

module.exports = { 
    cachedLicenseKey, tryLicenseKey, createAwsDir, updateKeyCache,
    cachedAwsCredentials, updateAwsCredentialsCache, hex, Colors,
    getTheme, getPage, setTheme, setPage, createRdpFile, openRdpFile,
    installAwsCli, setPopupValues, getPopupValues, awsDir, hasAwsCliInstalled,
    setRegion, getRegion, updateCache, getCacheValue, mercorExec
};