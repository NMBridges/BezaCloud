// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getRegion,
    getCacheValue, awsDir, localExec
} = require('../beza.js');
const {
    Template, Server, ApiCaller
} = require('../apiCaller.js');
const fs = require('fs');
const { exec, execSync } = require('child_process');

// .pem key decryption
const crypto = require('crypto');

// Page element references
/** The main divider box that divides the page into sections. */
var dividerBox = document.getElementById('dividerBox');
/** The first section; contains the title. */
var titleBox = document.getElementById('titleBox');
/** The button that connects to a server, if parameters are valid, when clicked. */
var connectButton = document.getElementById('connectButton');
/** The button that closes the window and cancels the operation when clicked. */
var cancelButton = document.getElementById('cancelButton');
/** The button that opens a file selection window when clicked. */
var fileSelectButton = document.getElementById('fileSelectButton');
/** The hidden button that is used for file selection window when necessary. */
var fileUploadButton = document.getElementById('fileUpload');
/** The label that describes the .pem key file path. */
var pemFileLabel = document.getElementById('pemFileLabel');
/** The div that encloses all .pem key options. */
var pemBox = document.getElementById('pemBox');
/** The button that chooses the .pem key option. */
var pemButton = document.getElementById('pemButton');
/** The label that describes the .pem key option. */
var pemLabel = document.getElementById('pemLabel');
/** The div that encloses all passkey options. */
var passBox = document.getElementById('passBox');
/** The button that chooses the passkey option. */
var passButton = document.getElementById('passButton');
/** The label that describes the passkey option. */
var passLabel = document.getElementById('passLabel');
/** The text box that is used for the passkey option. */
var manualPassTextBox = document.getElementById('manualPassTextBox');

/** @type {Template[]} The list of Templates available to the user. */
var templates = [];

/** @type {Server} Object containing information on the server to connect to. */
var server = new Server();

window.onload = function() {
    updateColors();
};

/**
 * Updates the elements of the window in accordance to the color theme.
 */
function updateColors() {
    dividerBox.style.backgroundColor = Colors.backgroundPrimary();

    // Depending on the color theme, the color schema may vary for some elements.
    if(getTheme() == "Dark") {
        titleBox.style.color = Colors.backgroundSecondary();
        connectButton.style.backgroundColor = Colors.backgroundSecondary();
        connectButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        connectButton.style.backgroundColor = Colors.textPrimary();
        connectButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    }

    pemLabel.style.color = Colors.textPrimary();
    passLabel.style.color = Colors.textPrimary();

    var elements = document.getElementsByClassName("box");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.backgroundPrimaryAccent();
    }

    var elements = document.getElementsByClassName("selectButton");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = "#989898";
        elements[index].style.borderColor = "#989898";
    }

    pemFileLabel.style.color = Colors.textSecondary();

    // then select the second one if there is a password, first otherwise
}

/**
 * Resets the elements of the window to their default values.
 */
function updateElements() {
    server = getCacheValue("newConnection");
    server.password = atob(server.password);
    manualPassTextBox.value = server.password;

    updateColors();

    if(server.password != "" && server.password != null) {
        passBox.click();
    } else {
        pemBox.click();
    }

    if(ApiCaller.pemFileExists(server.key)) {
        pemFileLabel.textContent = awsDir() + "/connections/" + server.key + ".pem";
    }
}

// -------------------------------  connectButton functions  -------------------------------- //

connectButton.addEventListener('mouseenter', function() {
    if(connectButton.value == "selected") { return; }
    if(getTheme() == "Dark") {
        connectButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        connectButton.style.backgroundColor = Colors.textSecondary();
    }
});

connectButton.addEventListener('mouseleave', function() {
    if(connectButton.value == "selected") { return; }
    if(getTheme() == "Dark") {
        connectButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        connectButton.style.backgroundColor = Colors.textPrimary();
    }
});

connectButton.addEventListener('click', function() {
    if(connectButton.value == "selected") { return; }
    connect();
});

// ------------------------------------------------------------------------------------------ //

// --------------------------------  cancelButton functions  -------------------------------- //

cancelButton.addEventListener('mouseenter', function() {
    cancelButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

cancelButton.addEventListener('mouseleave', function() {
    cancelButton.style.backgroundColor = Colors.backgroundPrimary();
});

cancelButton.addEventListener('click', function() {
    window.close();
});

// ------------------------------------------------------------------------------------------ //

// ------------------------------  fileSelectButton functions  ------------------------------ //

fileSelectButton.addEventListener('mouseenter', function() {
    if (getTheme() == "Dark") {
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

fileSelectButton.addEventListener('mouseleave', function() {
    if (getTheme() == "Dark") {
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        fileSelectButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    }
});

fileSelectButton.addEventListener('click', function() {
    pemBox.click();
});

// ------------------------------------------------------------------------------------------ //

// ----------------------------------  pemBox functions  ------------------------------------ //

pemBox.addEventListener('click', function() {
    pemBox.style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
    pemButton.style.backgroundColor = "#333333";
    pemBox.value = "selected";
    
    passBox.style.backgroundColor = Colors.backgroundPrimaryAccent();
    passButton.style.backgroundColor = "#989898";
    passBox.value = "deselected";
});

// ------------------------------------------------------------------------------------------ //

// ---------------------------------  passBox functions  ------------------------------------ //

passBox.addEventListener('click', function() {
    passBox.style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
    passButton.style.backgroundColor = "#333333";
    passBox.value = "selected";
    
    pemBox.style.backgroundColor = Colors.backgroundPrimaryAccent();
    pemButton.style.backgroundColor = "#989898";
    pemBox.value = "deselected";
});

// ------------------------------------------------------------------------------------------ //

// ------------------------  miscellaneous functions  --------------------------- //

/**
 * Creates a new popup window.
 * @param {string} header The header text of the popup.
 * @param {string} body The body text of the popup.
 * @param {string} button The button text of the popup. Blank if hidden.
 */
 function newPopup(header, body, button) {
    setPopupValues(header, body, button);
    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('showPopup');
}

fileUploadButton.addEventListener('change', (event) => {
    pemFileLabel.textContent = event.target.files[0].path;
    console.log(event.target.files[0]);
});

// ------------------------------------------------------------------------------ //

/**
 * Changes the color of the "Connect" button to simulate it being pressed.
 */
 function buttonDown() {
    connectButton.style.backgroundColor = "#333333";
    connectButton.value = "selected";
    connectButton.focus();
}

/**
 * Changes the color of the "Connect" button to simulate it being released.
 */
function buttonUp() {
    if(getTheme() == "Dark") {
        connectButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        connectButton.style.backgroundColor = Colors.textPrimary();
    }
    connectButton.value = "";
    connectButton.focus();
}

/**
 * Connects to a server.
 */
 function connect() {
    if(connectButton.value == "selected") { return; }
    const ipv4 = server.ipv4;

    if(passBox.value == "selected") {
        buttonDown();
        const newPassword = manualPassTextBox.value.trim();
        if(newPassword != "") {
            // Add new encoded password tag.
            ApiCaller.addTags(server.id, "Cert", btoa(newPassword)).then(function(success) {
                if(success) {
                    // Successfully added tags.
                } else {
                    // Oh well, try again next time.
                }

                // Run Microsoft Remote Desktop
                if(parent.process.platform == 'win32') {
                    const cmd1 = "cmd.exe /k cmdkey /generic:" + ipv4 + " /user:Administrator /pass:\"" + newPassword + "\"";
                    const e = execSync(cmd1);
                    const cmd2 = "cmd.exe /k mstsc /v:" + ipv4;
                    localExec(cmd2);
                    // Should be running Remote Desktop
                    buttonUp();
                    setTimeout(window.close, 200);
                } else {
                    // Mac
                    newPopup("The password to your server is", newPassword, "Copy and Continue");
                    const cmd1 = "touch " + awsDir() + "/connections/server.rdp";
                    const e1 = execSync(cmd1);
                    const cmd2 = "echo \"full address:s:" + ipv4 + "\nusername:s:Administrator\" > " + awsDir() + "/connections/server.rdp";
                    const e2 = execSync(cmd2);
                    buttonUp();
                    window.close();
                }
            });
        } else {
            console.log("Manual password field cannot be empty.");
            newPopup("Error", "The manual password field cannot be empty while connecting to a server using a manual password.", "Close");
            buttonUp();
        }
    } else if(pemBox.value == "selected") {
        buttonDown();
        if(pemFileLabel.textContent != "") {
            // Checks if it is a valid file.
            if(fs.existsSync(pemFileLabel.textContent)) {
                ApiCaller.getInstancePasswordData(server.id).then(function(result) {
                    if(result == "ERROR" || result.PasswordData == "") {
                        // Server is not available yet
                        console.log("Server is not available yet.");
                        newPopup("Error", "Server is not available yet. Servers may take up to 10 minutes to become available.", "Close");
                        buttonUp();
                    } else {
                        // Decode password data
                        try {
                            var pemFile = fs.readFileSync(pemFileLabel.textContent, "utf-8");
                            var buffer = Buffer.from(result.PasswordData, "base64");
                            var newPassword = crypto.privateDecrypt({key: pemFile, padding: crypto.constants.RSA_PKCS1_PADDING}, buffer).toString('utf-8');

                            if(newPassword != "") {
                                // Add new encoded password tag
                                ApiCaller.addTags(server.id, "Cert", btoa(newPassword)).then(function(success) {
                                    if(success) {
                                        // Successfully added tags.
                                    } else {
                                        // Oh well, try again next time.
                                    }
                                    
                                    // Run Microsoft Remote Desktop
                                    if(parent.process.platform == 'win32') {
                                        const cmd1 = "cmd.exe /k cmdkey /generic:" + ipv4 + " /user:Administrator /pass:\"" + newPassword + "\"";
                                        const e = execSync(cmd1);
                                        const cmd2 = "cmd.exe /k mstsc /v:" + ipv4;
                                        localExec(cmd2);
                                        // Should be running Remote Desktop
                                        buttonUp();
                                        setTimeout(window.close, 200);
                                    } else {
                                        // Mac
                                        newPopup("The password to your server is", newPassword, "Copy and Continue");
                                        const cmd1 = "touch " + awsDir() + "/connections/server.rdp";
                                        const e1 = execSync(cmd1);
                                        const cmd2 = "echo \"full address:s:" + ipv4 + "\nusername:s:Administrator\" > " 
                                            + awsDir() + "/connections/server.rdp";
                                        const e2 = execSync(cmd2);
                                        buttonUp();
                                        window.close();
                                    }
                                });
                            } else {
                                console.log("There was an error retrieving the password. No password found.");
                                newPopup("Error", "There was an error retrieving the server password." + 
                                    " Servers may take 10 or more minutes after creation to become available.", "Close");
                                buttonUp();
                            }
                        } catch(err) {
                            console.log("There was an error retrieving the password.", err);
                            newPopup("Error", "There was an error retrieving the server password.", "Close");
                            buttonUp();
                        }
                    }
                });
            } else {
                // Please attach a valid .pem or .cem file.
                console.log("Please attach a valid .pem or .cem file.");
                newPopup("Error", "Please attach a valid .pem or .cem file.", "Close");
                buttonUp();
            }
        } else {
            // Please attach a valid .pem or .cem file.
            console.log("Please attach a valid .pem or .cem file.");
            newPopup("Error", "Please attach a valid .pem or .cem file.", "Close");
            buttonUp();
        }
    } else {
        // Please select an option.
    }
}