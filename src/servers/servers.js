// Supplemental functions
const { 
    Colors, createRdpFile, openRdpFile, setPopupValues,
    getPopupValues, awsDir, getRegion, updateCache, getTheme,
    productName
} = parent.require("../beza.js");
const { 
    Server, ApiCaller
} = parent.require("../apiCaller.js");
const { exec, execSync } = parent.require('child_process');
const homeDir = parent.require('os').homedir();

// Document items
var topBar = document.getElementById("topBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var regionLabel = document.getElementById("regionLabel");
var refreshButton = document.getElementById("refreshButton");
var newServerButton = document.getElementById("newServerButton");
var primaryBody = document.getElementById("primaryBody");
var overlay = document.getElementById("overlay");
var loader = document.getElementById("loader");

/** Boolean that stores whether or not the page is currently loading servers. */
var loadingServers = false;

/**
 * @type {Server[]} The servers belonging to the currently loaded region.
 */
var servers = [];

window.onload = function() {
    loadServers();

    setInterval(checkServerTimes, 5000);
};

// ---------------------------- Server Connecting Functions ------------------------- //

/**
 * Connects to a server, given the index of the server within the 'servers' array.
 * @param {number} index The index of 'servers' that holds the server to connect to.
 */
function connect(index) {
    updateCache("newConnection", servers[index]);

    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('newConnection');
}

// ---------------------------------------------------------------------------------- //

// ----------------------------- Server Creating Functions -------------------------- //

/**
 * Creates a server based on the specified parameters.
 * @param {string} name The name of the server.
 * @param {string} ami The AMI ID to base the server on.
 * @param {string} cpu The CPU type.
 */
function newServer(name, ami, cpu) {
    // Gets region's default VPC
    ApiCaller.getDefaultVpcId().then(function(vpcId) {
        if(vpcId != "ERROR") {
            ApiCaller.getSecurityGroups().then(function(secGroups) {
                if(secGroups[0] != "ERROR") {
                    // Checks if security group exists in the region
                    var secGroupId = ApiCaller.getProductSecurityGroupId(secGroups);
                    if(secGroupId != "NONE") {
                        // Continue as is
                        ApiCaller.createKeyPair().then(function(key) {
                            if(key != "ERROR") {
                                ApiCaller.createInstance(ami,cpu,name,key,secGroupId).then(function(instanceId) {
                                    // done
                                    newPopup("", "Server successfully created.", "Close");
                                    displayOverlay(false);
                                });
                            } else {
                                // Error
                                newPopup("Error", "Error creating key pair.", "Close");
                                displayOverlay(false);
                            }
                        });
                    } else {
                        // If not, creates one
                        ApiCaller.createProductSecurityGroup(vpcId).then(function(newId) {
                            secGroupId = newId;
                            if(secGroupId != "ERROR") {
                                // Continue
                                ApiCaller.createKeyPair().then(function(key) {
                                    if(key != "ERROR") {
                                        ApiCaller.createInstance(ami,cpu,name,key,secGroupId).then(function(instanceId) {
                                            // done
                                            newPopup("", "Successfully created server.", "Close");
                                            displayOverlay(false);
                                        });
                                    } else {
                                        // Error
                                        newPopup("Error", "Error creating key pair.", "Close");
                                        displayOverlay(false);
                                    }
                                });
                            } else {
                                // Error
                                newPopup("Error", "Error creating security group.", "Close");
                                displayOverlay(false);
                            }
                        });
                    }
                } 
            });
        } else {
            // Error
            newPopup("Error", "Error retrieving VPC ID.", "Close");
            displayOverlay(false);
        }
    });
}

// ---------------------------------------------------------------------------------- //

// ------------------------------ Server Loading Functions -------------------------- //

/**
 * Pulls all AWS servers from the user's account in the given region.
 */
function loadServers() {
    if(!loadingServers) {
        loadingServers = true;
        updateColors();
        const servJson = ApiCaller.getInstances().then(function(data) {
            servers = [];
            if(data["Reservations"] != undefined) {
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
            }
    
            console.log(data['Reservations']);
            console.log(servers);
    
            // Sorts the servers on the dashboard according to their status.
            // Running servers appear first.
            const values = {
                "running": 5,
                "pending": 4,
                "stopping": 3,
                "shutting-down": 2,
                "stopped": 1,
                "terminated": 0
            };

            servers.sort(function(a, b) {
                return values[b.status] - values[a.status];
            })
    
            // Clears old tiles, resets region label
            const regionDict = {
                "us-east-1": "N. Virginia",
                "us-east-2": "Ohio",
                "us-west-1": "N. California",
                "us-west-2": "Oregon"
            };
            regionLabel.textContent = regionDict[getRegion()];
            
            // Clears old tiles and adds new tiles
            primaryBody.innerHTML = '';
            for(var counter = 0; counter < servers.length; counter++) {
                addTile(counter);
            }
    
            // Updates the colors of the new tiles
            displayOverlay(false);
            updateColors();
            
            var tiles = document.getElementsByClassName("tile");
            for(var count = 0; count < tiles.length; count++) {
                tiles[count].classList.add("show");
            }

            if (servers.length == 0) {
                var noPullLabel = document.createElement('div');
                noPullLabel.textContent = "You have no servers in this region.";
                noPullLabel.style.color = Colors.textSecondary();
                noPullLabel.style.width = "calc(100vw - 50px)";
                noPullLabel.style.marginLeft = "auto";
                noPullLabel.style.marginRight = "auto";
                noPullLabel.style.marginTop = "calc(50vh - 50px)";
                noPullLabel.style.textAlign = "center";
                primaryBody.appendChild(noPullLabel);
            }

            loadingServers = false;
        });
    }
}

/**
 * Adds a tile to the background with the appropriate server details.
 * @param {number} index The index of the server in 'servers' to add.
 */
function addTile(index) {
    const server = servers[index];
    // The main tile block.
    var newTile = document.createElement('div');
    newTile.className = "tile";

    // The server name descriptor element.
    var newName = document.createElement('div');
    newName.className = "serverName";
    newName.textContent = server.name;
    newTile.appendChild(newName);

    // The server ID descriptor element.
    var newId = document.createElement('div');
    newId.className = "serverId";
    newId.textContent = "ID: " + server.id;
    newTile.appendChild(newId);

    // The server status icon.
    var newStatus = document.createElement('div');
    newStatus.className = "statusIcon";

    var newStatusLabel = document.createElement('div');
    newStatusLabel.className = "statusPopup";
    newStatusLabel.textContent = server.status;
    newStatus.appendChild(newStatusLabel);
    newTile.appendChild(newStatus);

    // The server IP address descriptor element.
    if(server.ipv4 != "") {
        var newIp = document.createElement('div');
        newIp.className = "serverIPv4";
        newIp.textContent = "IPv4: " + server.ipv4;
        newTile.appendChild(newIp);
    }

    // The server specifications label element.
    var newSpecsLabel = document.createElement('div');
    newSpecsLabel.className = "specsLabel";
    newSpecsLabel.textContent = "Specifications";
    newTile.appendChild(newSpecsLabel);

    // The server CPU descriptor element.
    var newCpu = document.createElement('div');
    newCpu.className = "serverCPU";
    newCpu.textContent = "CPU: " + server.cpu;
    newTile.appendChild(newCpu);

    // The server RAM descriptor element.
    if(server.memory != "") {
        var newMemory = document.createElement('div');
        newMemory.className = "serverRAM";
        newMemory.textContent = "Memory: " + server.memory;
        newTile.appendChild(newMemory);
    }

    // The server storage descriptor element.
    if(server.storage != "") {
        var newStorage = document.createElement('div');
        newStorage.className = "serverStorage";
        newStorage.textContent = "Storage: " + server.storage;
        newTile.appendChild(newStorage);
    }

    // The server connection button.
    var newConnButton = document.createElement('button');
    newConnButton.className = "connectButton";
    newConnButton.textContent = "Connect";
    newConnButton.id = "" + index;
    newConnButton.addEventListener('mouseenter', function() {
        // If button is active, proceed.
        if(newConnButton.value == "active") {
            newConnButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newConnButton.addEventListener('mouseleave', function() {
        newConnButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newConnButton.addEventListener('click', function() {
        // Connect to server.
        // If button is active, proceed.
        if(newConnButton.value == "active") {
            displayOverlay(true);
            connect(parseInt(newConnButton.id));
        }
    });
    newTile.appendChild(newConnButton);

    // The popup area that contains the modification buttons.
    var newModifyArea = document.createElement('div');
    newModifyArea.className = "modifyArea";
    //newModifyArea.hidden = true;
    newModifyArea.hidden = false;

    // The modify server button.
    var newModifyButton = document.createElement('button');
    newModifyButton.className = "modifyButton";
    newModifyButton.textContent = "Modify";
    newModifyButton.addEventListener('mouseenter', function() {
        // If button is active, proceed.
        if(newModifyButton.value == "active") {
            newModifyButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newModifyButton.addEventListener('mouseleave', function() {
        newModifyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newModifyButton.addEventListener('click', function() {
        newModifyArea.focus();
        if(newModifyButton.value == "active") {
            //newModifyArea.hidden = !newModifyArea.hidden;
            var modAreas = document.getElementsByClassName("modifyArea show");
            for (var index = 0; index < modAreas.length; index += 1) {
                if (modAreas[index] != newModifyArea) {
                    modAreas[index].classList.remove("show");
                }
            }
            newModifyArea.classList.toggle("show");
        }
    });
    newTile.appendChild(newModifyButton);

    // The Create Template button.
    var newTemplateButton = document.createElement('div');
    newTemplateButton.className = "createTemplateButton";
    newTemplateButton.textContent = "Create Template";
    newTemplateButton.id = "" + index;
    newTemplateButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newTemplateButton.value == "active") {
            newTemplateButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newTemplateButton.addEventListener('mouseleave', function() {
        newTemplateButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newTemplateButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newTemplateButton.value == "active") {
            if(server.status == "stopped") {
                // Create new template from instance.
                displayOverlay(true);
                const servId = servers[parseInt(newRebootButton.id)].id;
                const templateName = servers[parseInt(newRebootButton.id)].name.trim() + ApiCaller.genRandom(5);
                ApiCaller.createImage(servId, templateName).then(function(data) {
                    if(data != "ERROR") {
                        // Good to go
                        newPopup("Template successfully created", "Template created with name " + templateName + ". Note: Templates based on Servers not made in " + productName + " may, when used to create Servers, have connection issues.", "Close");
                        loadServers();
                    } else {
                        // Error rebooting server
                    }
                });
            } else if(server.status == "running") {
                // Display window saying server must be stopped
                newPopup("Error", "Servers should be shut down with Sysprep before they can be used to create Templates. Instructions: Connect to your server --> Go to Start Menu --> " +
                "EC2LaunchSettings --> Set 'Administrator Password' to 'Random.' Then click 'Shutdown with Sysprep.' Wait for the server to automatically shut down, and then retry creating a Template.", "Close");
            }
        }
    });
    newModifyArea.appendChild(newTemplateButton);

    // The toggle power button.
    var newPowerButton = document.createElement('div');
    newPowerButton.className = "powerButton";
    newPowerButton.textContent = "Start";
    if(server.status == "running") {
        newPowerButton.textContent = "Stop";
    }
    newPowerButton.id = "" + index;
    newPowerButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newPowerButton.value == "active") {
            newPowerButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newPowerButton.addEventListener('mouseleave', function() {
        newPowerButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newPowerButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newPowerButton.value == "active") {
            if(server.status == "stopped") {
                // Turn server on.
                displayOverlay(true);
                ApiCaller.startInstance(servers[parseInt(newPowerButton.id)].id, getRegion()).then(function(started) {
                    if(started) { 
                        // Good to go
                        setTimeout(loadServers, 500);
                    } else {
                        // Error starting server
                    }
                });
            } else if(server.status == "running") {
                // Turn server off.
                displayOverlay(true);
                ApiCaller.stopInstance(servers[parseInt(newPowerButton.id)].id, getRegion()).then(function(stopped) {
                    if(stopped) { 
                        // Good to go
                        setTimeout(loadServers, 500);
                    } else {
                        // Error stopping server
                    }
                });
            }
        }
    });
    newModifyArea.appendChild(newPowerButton);

    // The reboot server button.
    var newRebootButton = document.createElement('div');
    newRebootButton.className = "rebootButton";
    newRebootButton.textContent = "Reboot";
    newRebootButton.id = "" + index;
    newRebootButton.value
    newRebootButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newRebootButton.value == "active") {
            newRebootButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newRebootButton.addEventListener('mouseleave', function() {
        newRebootButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newRebootButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newRebootButton.value == "active") {
            // Reboot server.
            if(server.status == "running") {
                displayOverlay(true);
                ApiCaller.rebootInstance(servers[parseInt(newRebootButton.id)].id).then( function(rebooted) {
                    if(rebooted) {
                        // Good to go
                        setTimeout(loadServers, 500);
                    } else {
                        // Error rebooting server
                    }
                });
            }
        }
    });
    newModifyArea.appendChild(newRebootButton);

    // The permadelete server button.
    var newTerminateButton = document.createElement('div');
    newTerminateButton.className = "terminateButton";
    newTerminateButton.textContent = "Permadelete";
    newTerminateButton.id = "" + index;
    newTerminateButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newTerminateButton.value == "active") {
            newTerminateButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newTerminateButton.addEventListener('mouseleave', function() {
        newTerminateButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newTerminateButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newTerminateButton.value == "active") {
            // Terminate server.
            displayOverlay(true);
            ApiCaller.terminateInstance(servers[parseInt(newRebootButton.id)].id).then(function(terminated) {
                if(terminated) {
                    // Good to go
                    setTimeout(loadServers, 500);
                } else {
                    // Error rebooting server
                }
            });
        }
    });
    newModifyArea.appendChild(newTerminateButton);

    newTemplateButton.value = "inactive";
    newPowerButton.value = "inactive";
    newRebootButton.value = "inactive";
    newTerminateButton.value = "inactive";
    newConnButton.value = "inactive";
    newModifyButton.value = "inactive";
    if(server.status == "running" || server.status == "stopped") {
        newTemplateButton.value = "active";
        newPowerButton.value = "active";
        newRebootButton.value = "active";
        newTerminateButton.value = "active";
        newModifyButton.value = "active";
        if(server.status == "running" && server.os != "Linux") {
            newConnButton.value = "active";
        }
    }

    newTile.appendChild(newModifyArea);
    primaryBody.appendChild(newTile);
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

// ---------------------------------------------------------------------------------- //

// ---------------------------- refreshButton functions ----------------------------- //

refreshButton.addEventListener('click', function() {
    displayOverlay(true);
    loadServers();
});

refreshButton.addEventListener('mouseenter', function() {
    refreshButton.style.backgroundColor = Colors.backgroundPrimary();
});

refreshButton.addEventListener('mouseleave', function() {
    refreshButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

// ---------------------------------------------------------------------------------- //

// ---------------------------- newServerButton functions --------------------------- //

newServerButton.addEventListener('click', function() {
    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('newServer');
    //newServer("HEEHE", "ami-00ca0e19d67106fc9", "t2.micro");
    //ApiCaller.createImage("i-0aff62c6e9addd8d7", "NEWEST-AMI3");
});

newServerButton.addEventListener('mouseenter', function() {
    newServerButton.style.backgroundColor = Colors.backgroundPrimary();
});

newServerButton.addEventListener('mouseleave', function() {
    newServerButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

// ---------------------------------------------------------------------------------- //

// ----------------------------- miscellaneous functions ---------------------------- //

/**
 * Turns the overlay on or off.
 * @param {boolean} to Boolean representing turning the overlay on (true) or off (false)
 */
 function displayOverlay(to) {
    if(to) {
        overlay.style.display = "block";
        loader.style.display = "block";
    } else {
        overlay.style.display = "none";
        loader.style.display = "none";
    }
    const contenta = overlay.innerHTML;
    overlay.innerHTML = contenta;
    overlay.focus();
}

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

/**
 * Checks servers to see if notifications should be sent out for their run time.
 */
function checkServerTimes() {
    for(var index = 0; index < servers.length; index++) {
        const msSinceLaunch = Date.now() - new Date(servers[index].launchTime).getTime();
        if(servers[index].status == "running") {
            if(Math.abs( msSinceLaunch - 10800000 ) <= 2500) {
                // Send notification that the server has been running for 3 hours.
                new Notification("Server Notice", { body: server[index].name
                    + " (" + server[index].id + ") has been running for 3 hours." }).onclick
                         = () => console.log("");
            } else if(Math.abs( msSinceLaunch - 21600000 ) <= 2500) {
                // Send notification that the server has been running for 6 hours.
                new Notification("Server Notice", { body: server[index].name
                    + " (" + server[index].id + ") has been running for 6 hours." }).onclick
                         = () => console.log("");
            } else if(Math.abs( msSinceLaunch - 86400000 ) <= 2500) {
                // Send notification that the server has been running for 24 hours.
                new Notification("Server Notice", { body: server[index].name
                    + " (" + server[index].id + ") has been running for 24 hours." }).onclick
                         = () => console.log("");
            }           
        }
    }
}

// ---------------------------------------------------------------------------------- //

/**
 * Updates the page elements' colors in accordance to the color theme.
 */
function updateColors() {
    // The top of the page
    topBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
    mainPageLabel.style.color = Colors.textPrimary();
    regionLabel.style.color = Colors.textSecondary();
    refreshButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    newServerButton.style.backgroundColor = Colors.backgroundPrimaryAccent();

    // The main body / server tiles.
    {
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();

        var tiles = document.getElementsByClassName("tile");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
        }

        tiles = document.getElementsByClassName("tile show");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
        }

        var connectButtons = document.getElementsByClassName("connectButton");
        for(var count = 0; count < connectButtons.length; count++) {
            connectButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running.
            const state = servers[count].status.toLowerCase();
            if(state == "running") {
                connectButtons[count].style.color = Colors.textPrimary();
                connectButtons[count].style.borderColor = Colors.textPrimary();
            } else {
                connectButtons[count].style.color = Colors.textTertiary();
                connectButtons[count].style.borderColor = Colors.textTertiary();
            }
        }

        var modifyButtons = document.getElementsByClassName("modifyButton");
        for(var count = 0; count < modifyButtons.length; count++) {
            modifyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                modifyButtons[count].style.color = Colors.textPrimary();
                modifyButtons[count].style.borderColor = Colors.textPrimary();
            } else {
                modifyButtons[count].style.color = Colors.textTertiary();
                modifyButtons[count].style.borderColor = Colors.textTertiary();
            }
        }

        var serverNames = document.getElementsByClassName("serverName");
        for(var count = 0; count < serverNames.length; count++) {
            serverNames[count].style.color = Colors.textPrimary();
        }

        var statusIcons = document.getElementsByClassName("statusIcon");
        for(var count = 0; count < statusIcons.length; count++) {
            // Adjusts the color depending on the server's status.
            const state = servers[count].status.toLowerCase();
            if(state == "running") {
                statusIcons[count].style.backgroundColor = "#33cc33";
            } else if(state == "shutting-down" || state == "pending" || state == "stopping") {
                statusIcons[count].style.backgroundColor = "#cccc33";
            } else {
                statusIcons[count].style.backgroundColor = "#cc3333";
            }
            statusIcons[count].children[0].style.color = Colors.textSecondary();
        }
        
        var serverIds = document.getElementsByClassName("serverId");
        for(var count = 0; count < serverIds.length; count++) {
            serverIds[count].style.color = Colors.textSecondary();
        }
        
        var serverIPv4s = document.getElementsByClassName("serverIPv4");
        for(var count = 0; count < serverIPv4s.length; count++) {
            serverIPv4s[count].style.color = Colors.textSecondary();
        }

        var specsLabels = document.getElementsByClassName("specsLabel");
        for(var count = 0; count < specsLabels.length; count++) {
            specsLabels[count].style.color = Colors.textPrimary();
        }
        
        var serverCPUs = document.getElementsByClassName("serverCPU");
        for(var count = 0; count < serverCPUs.length; count++) {
            serverCPUs[count].style.color = Colors.textSecondary();
        }
        
        var serverRAMs = document.getElementsByClassName("serverRAM");
        for(var count = 0; count < serverRAMs.length; count++) {
            serverRAMs[count].style.color = Colors.textSecondary();
        }
        
        var serverStorages = document.getElementsByClassName("serverStorage");
        for(var count = 0; count < serverStorages.length; count++) {
            serverStorages[count].style.color = Colors.textSecondary();
        }

        var modifyAreas = document.getElementsByClassName("modifyArea");
        for(var count = 0; count < modifyAreas.length; count++) {
            modifyAreas[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            modifyAreas[count].style.borderColor = Colors.textSecondary();
        }

        var templateButtons = document.getElementsByClassName("createTemplateButton");
        for(var count = 0; count < templateButtons.length; count++) {
            templateButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if state is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                templateButtons[count].style.color = Colors.textPrimary();
            } else {
                templateButtons[count].style.color = Colors.textTertiary();
            }
        }

        var powerButtons = document.getElementsByClassName("powerButton");
        for(var count = 0; count < powerButtons.length; count++) {
            powerButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if state is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                powerButtons[count].style.color = Colors.textPrimary();
            } else {
                powerButtons[count].style.color = Colors.textTertiary();
            }
        }

        var rebootButtons = document.getElementsByClassName("rebootButton");
        for(var count = 0; count < rebootButtons.length; count++) {
            rebootButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                rebootButtons[count].style.color = Colors.textPrimary();
            } else {
                rebootButtons[count].style.color = Colors.textTertiary();
            }
        }

        var terminateButtons = document.getElementsByClassName("terminateButton");
        for(var count = 0; count < terminateButtons.length; count++) {
            terminateButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                terminateButtons[count].style.color = "#cc3333";
            } else {
                terminateButtons[count].style.color = "#882222";
            }
        }

        if(getTheme() == productName) {
            newServerButton.children[0].src = "../assets/Plus-White.png";
            refreshButton.children[0].src = "../assets/Refresh-White.png";
        } else {
            newServerButton.children[0].src = "../assets/Plus-White.png";
            refreshButton.children[0].src = "../assets/Refresh-White.png";
        }
    }
}