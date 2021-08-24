// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getRegion,
    getCacheValue, awsDir, mercorExec
} = require('../mercor.js');
const {
    Server, Task, getInstances
} = require('../apiCaller.js');
const fs = require('fs');
const { exec, execSync } = require('child_process');

// Page element references
/** The main divider box that divides the page into sections. */
var dividerBox = document.getElementById('dividerBox');
/** The first section; contains the title. */
var titleBox = document.getElementById('titleBox');
/** The button that connects to a server, if parameters are valid, when clicked. */
var createButton = document.getElementById('createButton');
/** The button that closes the window and cancels the operation when clicked. */
var cancelButton = document.getElementById('cancelButton');
/** The div that encloses all start options. */
var startBox = document.getElementById('startBox');
/** The button that chooses the start option. */
var startButton = document.getElementById('startButton');
/** The label that describes the start option. */
var startLabel = document.getElementById('startLabel');
/** The text box that is used for the start option. */
var startTextBox = document.getElementById('startTextBox');
/** The div that encloses all stop options. */
var stopBox = document.getElementById('stopBox');
/** The button that chooses the stop option. */
var stopButton = document.getElementById('stopButton');
/** The label that describes the stop option. */
var stopLabel = document.getElementById('stopLabel');
/** The text box that is used for the stop option. */
var stopTextBox = document.getElementById('stopTextBox');
/** The box that is used to keep the server list. */
var serverSelect = document.getElementById('serverSelect');

/** @type {Server[]} The list of Servers available to the user. */
var servers = [];

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
        createButton.style.backgroundColor = Colors.backgroundSecondary();
        createButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        createButton.style.backgroundColor = Colors.textPrimary();
        createButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
    }

    var elements = document.getElementsByClassName("box");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.backgroundPrimaryAccent();
    }

    elements = document.getElementsByClassName("selectButton");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.textTertiary();
        elements[index].style.borderColor = Colors.textTertiary();
    }

    document.getElementById("serverLabel").style.color = Colors.textSecondary();
    document.getElementById("serverLabel").style.backgroundColor = Colors.backgroundPrimary();
    document.getElementById("serverSelect").style.backgroundColor = Colors.backgroundPrimaryAccent();

    elements = document.getElementsByClassName("serverOption");
    for(var index = elements.length - 1; index >= 0; index--) {
        if((elements.length - 1 - index) % 2 == 0) {
            elements[index].style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
        } else {
            elements[index].style.backgroundColor = Colors.backgroundPrimaryAccent();}
    }

    elements = document.getElementsByClassName("serverNameLabel");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.color = Colors.textTertiary();
    }

    elements = document.getElementsByClassName("serverButtonSelect");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.textTertiary();
        elements[index].style.borderColor = Colors.textTertiary();
    }

}

/**
 * Resets the elements of the window to their default values.
 */
function updateElements() {
    loadServers();    
}

/**
 * Creates a new Server option and adds it to the list of available Servers.
 * @param {string} name The name of the Server.
 * @param {string} id The ID of the Server.
 * @param {number} index The index of the Server in the list.
 */
 function addServerToList(name, id, index) {
    var newServerOption = document.createElement('button');
    newServerOption.className = "serverOption";
    newServerOption.id = id;
    newServerOption.style.setProperty('--row', index + 1);

    var newServerButtonSelect = document.createElement('div');
    newServerButtonSelect.className = "serverButtonSelect";
    newServerButtonSelect.id = id;
    newServerOption.appendChild(newServerButtonSelect);

    var newServerNameLabel = document.createElement('div');
    newServerNameLabel.className = "serverNameLabel";
    newServerNameLabel.textContent = name + " (" + id + ")";
    newServerOption.appendChild(newServerNameLabel);

    newServerOption.addEventListener('click', function() {
        // Resets colors of all other options
        var serverButtonSelects = document.getElementsByClassName("serverButtonSelect");
        for(var index = 0; index < serverButtonSelects.length; index++) {
            serverButtonSelects[index].style.backgroundColor = Colors.textTertiary();
            serverButtonSelects[index].value = "unselected";
        }
        // Highlights selected option
        newServerButtonSelect.style.backgroundColor = "#333333";
        newServerButtonSelect.value = "selected";
    });

    serverSelect.appendChild(newServerOption);
}

/**
 * Loads the list of servers that the user can select from.
 */
function loadServers() {
    const servJson = getInstances().then(function(data) {
        servers = [];
        if(data != "ERROR" && data["Reservations"] != undefined) {
            for(var index = 0; index < data["Reservations"].length; index++) {
                const srv = data["Reservations"][index];
                const newSpecs = splitSpecs(getSpecs(srv));
                if(getStatus(srv).toLowerCase() != "terminated") {
                    servers.push(new Server(
                        getName(srv),
                        getInstanceId(srv),
                        (getIPv4(srv) != undefined) ? getIPv4(srv) : "",
                        getPassword(srv),
                        getKey(srv),
                        getStatus(srv),
                        (newSpecs.length > 2) ? (newSpecs[0] + " (" + getCpuType(srv) + ")") : getCpuType(srv),
                        (newSpecs.length > 2) ? newSpecs[1] : "",
                        (newSpecs.length > 2) ? newSpecs[2] : ""
                    ));
                }
            }

            serverSelect.style.setProperty('--rows', servers.length);
        
            for(var index = 0; index < servers.length; index++) {
                addServerToList(servers[index].name, servers[index].id, index);
            }
        } else {
            console.log("Error retrieving servers.");
            newPopup("Error", "Error retrieving servers.", "Close");
        }
        
        updateColors();
    });
}

/**
 * Returns the name of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
 function getName(json) {
    if("Tags" in json["Instances"][0]) {
        if(json["Instances"][0]["Tags"] != undefined) {
            for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
                if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Name") {
                    return json["Instances"][0]["Tags"][tagIndex]["Value"];
                }
            }
        }
    }
    return "[Not Named]";
}

/**
 * Returns the status of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getStatus(json) {
    return json["Instances"][0]["State"]["Name"];
}

/**
 * Returns the ID of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getInstanceId(json) {
    return json["Instances"][0]["InstanceId"];
}

/**
 * Returns the public IPv4 of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getIPv4(json) {
    if("PublicIpAddress" in json["Instances"][0]) {
        return json["Instances"][0]["PublicIpAddress"];
    }
    return "";
}

/**
 * Returns the encoded password of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getPassword(json) {
    if("Tags" in json["Instances"][0]) {
        if(json["Instances"][0]["Tags"] != undefined) {
            for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
                if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Cert") {
                    return json["Instances"][0]["Tags"][tagIndex]["Value"];
                }
            }
        }
    }
    return "";
}

/**
 * Returns the key of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getKey(json) {
    if("Tags" in json["Instances"][0]) {
        if(json["Instances"][0]["Tags"] != undefined) {
            for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
                if("KeyName" in json["Instances"][0]) {
                    return json["Instances"][0]["KeyName"];
                }
            }
        }
    }
    return "";
}

/**
 * Returns the CPU type of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getCpuType(json) {
    return json["Instances"][0]["InstanceType"];
}

/**
 * Returns the specs of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getSpecs(json) {
    if("Tags" in json["Instances"][0]) {
        if(json["Instances"][0]["Tags"] != undefined) {
            for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
                if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Specifications") {
                    return json["Instances"][0]["Tags"][tagIndex]["Value"];
                }
            }
        }
    }
    return "";
}

/**
 * Splits the specifications into 3 separate strings.
 * @param {string} str The inputted string specs to be split.
 */
function splitSpecs(str) {
    return str.split(" / ");
}

// -------------------------------  createButton functions  -------------------------------- //

createButton.addEventListener('mouseenter', function() {
    if(getTheme() == "Dark") {
        createButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        createButton.style.backgroundColor = Colors.textSecondary();
    }
});

createButton.addEventListener('mouseleave', function() {
    if(getTheme() == "Dark") {
        createButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        createButton.style.backgroundColor = Colors.textPrimary();
    }
});

createButton.addEventListener('click', function() {
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

// ----------------------------------  startBox functions  ------------------------------------ //

startBox.addEventListener('click', function() {
    startBox.style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
    startButton.style.backgroundColor = "#333333";
    startBox.value = "selected";
    
    stopBox.style.backgroundColor = Colors.backgroundPrimaryAccent();
    stopButton.style.backgroundColor = Colors.textTertiary();
    stopBox.value = "deselected";
});

// ------------------------------------------------------------------------------------------ //

// ---------------------------------  stopBox functions  ------------------------------------ //

stopBox.addEventListener('click', function() {
    stopBox.style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
    stopButton.style.backgroundColor = "#333333";
    stopBox.value = "selected";
    
    startBox.style.backgroundColor = Colors.backgroundPrimaryAccent();
    startButton.style.backgroundColor = Colors.textTertiary();
    startBox.value = "deselected";
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

// ------------------------------------------------------------------------------ //

/**
 * Changes the color of the "Connect" button to simulate it being pressed.
 */
 function buttonDown() {
    createButton.style.backgroundColor = "#333333";
    createButton.focus();
}

/**
 * Changes the color of the "Connect" button to simulate it being released.
 */
function buttonUp() {
    if(getTheme() == "Dark") {
        createButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        createButton.style.backgroundColor = Colors.textPrimary();
    }
    createButton.focus();
}

/**
 * Connects to a server.
 */
 function connect() {
    const ipv4 = server.ipv4;

    if(stopBox.value == "selected") {
        buttonDown();
        const newPassword = stopTextBox.value.trim();
        if(newPassword != "") {
            // Add new encoded password tag.
            addTags(server.id, "Cert", btoa(newPassword)).then(function(success) {
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
                    mercorExec(cmd2);
                    // Should be running Remote Desktop
                    //window.close();
                } else {
                    // Mac
                    newPopup("The password to your server is", newPassword, "Copy and Continue");
                    const cmd1 = "touch " + awsDir() + "/connections/server.rdp";
                    const e1 = execSync(cmd1);
                    const cmd2 = "echo \"full address:s:" + ipv4 + "\nusername:s:Administrator\" > " + awsDir() + "/connections/server.rdp";
                    const e2 = execSync(cmd2);
                    window.close();
                }
            });
        } else {
            console.log("Manual password field cannot be empty.");
            newPopup("Error", "The manual password field cannot be empty while connecting to a server using a manual password.", "Close");
            buttonUp();
        }
    } else if(startBox.value == "selected") {
        buttonDown();
        if(pemFileLabel.textContent != "") {
            // Checks if it is a valid file.
            if(fs.existsSync(pemFileLabel.textContent)) {
                getInstancePasswordData(server.id).then(function(result) {
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
                                addTags(server.id, "Cert", btoa(newPassword)).then(function(success) {
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
                                        mercorExec(cmd2);
                                        // Should be running Remote Desktop
                                        //window.close();
                                    } else {
                                        // Mac
                                        newPopup("The password to your server is", newPassword, "Copy and Continue");
                                        const cmd1 = "touch " + awsDir() + "/connections/server.rdp";
                                        const e1 = execSync(cmd1);
                                        const cmd2 = "echo \"full address:s:" + ipv4 + "\nusername:s:Administrator\" > " 
                                            + awsDir() + "/connections/server.rdp";
                                        const e2 = execSync(cmd2);
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