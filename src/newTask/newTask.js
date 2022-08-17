// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getRegion,
    getCacheValue, awsDir, localExec, updateCache
} = require('../beza.js');
const {
    Server, Task, ApiCaller
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

    startLabel.style.color = Colors.textPrimary();
    stopLabel.style.color = Colors.textPrimary();

    var elements = document.getElementsByClassName("box");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.backgroundPrimaryAccent();
    }

    elements = document.getElementsByClassName("selectButton");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = "#989898";
        elements[index].style.borderColor = "#989898";
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
        elements[index].style.backgroundColor = "#989898";
        elements[index].style.borderColor = "#989898";
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
    newServerButtonSelect.value = "unselected";
    newServerOption.appendChild(newServerButtonSelect);

    var newServerNameLabel = document.createElement('div');
    newServerNameLabel.className = "serverNameLabel";
    newServerNameLabel.textContent = name + " (" + id + ")";
    newServerOption.appendChild(newServerNameLabel);

    newServerOption.addEventListener('click', function() {
        // Resets colors of all other options
        var serverButtonSelects = document.getElementsByClassName("serverButtonSelect");
        for(var index = 0; index < serverButtonSelects.length; index++) {
            serverButtonSelects[index].style.backgroundColor = "#989898";
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
    const servJson = ApiCaller.getInstances().then(function(data) {
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
                        (newSpecs.length > 2) ? newSpecs[2] : "",
                        getLaunchTime(srv)
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
 * Returns the CPU type of the server instance, given the instance JSON.
 * @param {JSON} json The instance JSON object.
 */
function getLaunchTime(json) {
    return json["Instances"][0]["LaunchTime"];
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
    if(createButton.value == "selected") { return; }
    if(getTheme() == "Dark") {
        createButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        createButton.style.backgroundColor = Colors.textSecondary();
    }
});

createButton.addEventListener('mouseleave', function() {
    if(createButton.value == "selected") { return; }
    if(getTheme() == "Dark") {
        createButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        createButton.style.backgroundColor = Colors.textPrimary();
    }
});

createButton.addEventListener('click', function() {
    if(createButton.value == "selected") { return; }
    parseNewTask();
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
    stopButton.style.backgroundColor = "#989898";
    stopBox.value = "deselected";
});

// ------------------------------------------------------------------------------------------ //

// ---------------------------------  stopBox functions  ------------------------------------ //

stopBox.addEventListener('click', function() {
    stopBox.style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
    stopButton.style.backgroundColor = "#333333";
    stopBox.value = "selected";
    
    startBox.style.backgroundColor = Colors.backgroundPrimaryAccent();
    startButton.style.backgroundColor = "#989898";
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
    createButton.value = "selected";
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
    createButton.value = "";
}

/**
 * Given a JSON object, it will return a Task object with the same values.
 * @param {any} obj The JSON object to parse.
 */
function convertTask(obj) {
    return new Task(obj.name, obj.id, obj.type, obj.time, obj.region);
}

/**
 * Parses the new Task created by the user and adds it to the cache if it is valid.
 */
function parseNewTask() {
    if(createButton.value == "selected") { return; }

    var serverIsSelected = false;
    var serverButtonSelects = document.getElementsByClassName("serverButtonSelect");
    for(var index = 0; index < serverButtonSelects.length; index++) {
        if(serverButtonSelects[index].value == "selected") {
            serverIsSelected = true;
        }
    }
    if(serverIsSelected) {
        if(stopBox.value == "selected" || startBox.value == "selected") {
            buttonDown();
            const value = "" + (stopBox.value == "selected" ? stopTextBox.value.trim() : startTextBox.value.trim());
            console.log(value);
            if(value.length == 19 && value.split(" ").length == 2
                && value.split(" ")[0].length == 10
                && value.split(" ")[1].length == 8
                && value.split(" ")[0].split("/").length == 3
                && value.split(" ")[0].split("/")[0].length == 2
                && value.split(" ")[0].split("/")[1].length == 2
                && value.split(" ")[0].split("/")[2].length == 4
                && value.split(" ")[1].split(":").length == 3
                && value.split(" ")[1].split(":")[0].length == 2
                && value.split(" ")[1].split(":")[1].length == 2
                && value.split(" ")[1].split(":")[2].length == 2) {
    
                const dd = value.split(" ")[0].split("/")[1];
                const MM = value.split(" ")[0].split("/")[0];
                const yy = value.split(" ")[0].split("/")[2];
                const hh = value.split(" ")[1].split(":")[0];
                const mm = value.split(" ")[1].split(":")[1];
                const ss = value.split(" ")[1].split(":")[2];

                console.log("" + parseInt(dd) + parseInt(MM) + parseInt(yy) + parseInt(hh) + parseInt(mm) + parseInt(ss));
                
                const months = [
                    "Jan", "Feb", "Mar", "Apr",
                    "May", "Jun", "Jul", "Aug",
                    "Sep", "Oct", "Nov", "Dec"
                ]
                
                const inputtedDate = new Date(months[parseInt(MM) - 1] + " " + parseInt(dd) +" "+ parseInt(yy) +" "+ parseInt(hh) +":"+  parseInt(mm) +":"+ parseInt(ss) +" "+ new Date().toLocaleTimeString('en-us',{timeZoneName:'short'}).split(' ')[2]);
                
                if(inputtedDate.toString() != "Invalid Date" && inputtedDate.getTime() > Date.now()) {
                    var serverButtonSelects = document.getElementsByClassName("serverButtonSelect");
                    for(var index = 0; index < serverButtonSelects.length; index++) {
                        if(serverButtonSelects[index].value == "selected") {
                            for(var serverIndex = 0; serverIndex < servers.length; serverIndex++) {
                                if(serverButtonSelects[index].id == servers[serverIndex].id) {
                                    // Load 'tasks' from cache, add new Task, and recache it.
                                    var tasks = [];
                                    
                                    const cacheTasks = getCacheValue('tasks-' + getRegion());
                                    if(cacheTasks != "ERROR") {
                                        for(var tIndex = 0; tIndex < cacheTasks.length; tIndex += 1) {
                                            tasks.push(convertTask(cacheTasks[tIndex]));
                                        }
                                    }

                                    if(stopBox.value == "selected") {
                                        const newTaskForCache = new Task(servers[serverIndex].name, servers[serverIndex].id, "stop", inputtedDate.getTime() / 1000, getRegion());
                                        tasks.push(newTaskForCache);
                                        updateCache("tasks-" + getRegion(), tasks);
                                    } else {
                                        const newTaskForCache = new Task(servers[serverIndex].name, servers[serverIndex].id, "start", inputtedDate.getTime() / 1000, getRegion());
                                        tasks.push(newTaskForCache);
                                        updateCache("tasks-" + getRegion(), tasks);
                                    }
                                    // Success.
                                    newPopup("Success", "Successfully created Task.", "Close");
                                    buttonUp();
                                    window.close();
                                }
                            }
                        }
                    }
                } else {
                    // Invalid Datetime. Please follow the format.
                    newPopup("Invalid datetime", "Please ensure your date and time exist and have not passed.", "Close");
                    buttonUp();
                }
            } else {
                // Invalid Datetime. Please follow the format.
                newPopup("Invalid datetime", "Please follow the datetime format given: DD/MM/YYYY HH/mm/ss", "Close");
                buttonUp();
            }
        } else {
            // No Server.
            newPopup("Error", "Please select a type for the task, either Start or Stop.", "Close");
            buttonUp();
        }
    } else {
        // No Server.
        newPopup("Error", "Please select a server to create a Task for.", "Close");
        buttonUp();
    }
}