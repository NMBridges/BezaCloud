// Supplemental functions
const { Colors, createRdpFile, openRdpFile } = parent.require("../mercor.js");
const { 
    getInstances, startInstance, stopInstance, 
    terminateInstance, rebootInstance, Server
} = parent.require("../apiCaller.js");

// Document items
var topBar = document.getElementById("topBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var regionLabel = document.getElementById("regionLabel");
var refreshButton = document.getElementById("refreshButton");
var newServerButton = document.getElementById("newServerButton");
var primaryBody = document.getElementById("primaryBody");

/**
 * @type {Server[]} The servers belonging to the currently loaded region.
 */
var servers = [];

window.addEventListener('load', function() {
    loadServers();


});

// ---------------------------- Server Connecting Functions ------------------------- //

/**
 * Connects to a server, given the index of the server within the 'servers' array.
 * @param {number} index The index of 'servers' that holds the server to connect to.
 */
function connect(index) {
    const server = servers[index];
    const encodedPassword = server.password;
    const decodedPassword = atob(encodedPassword);
    const ipv4 = server.ipv4;

    // Add password popup.
    if(decodedPassword == "") {

    }

    createRdpFile(ipv4);
    openRdpFile();

    console.log(decodedPassword);
}

// ---------------------------------------------------------------------------------- //

// ------------------------------ Server Loading Functions -------------------------- //

/**
 * Pulls all AWS servers from the user's account in the given region.
 */
function loadServers() {
    const servJson = getInstances().then(function(data) {
        servers = [];
        for(var index = 0; index < data["Reservations"].length; index++) {
            const srv = data["Reservations"][index];
            const newSpecs = splitSpecs(getSpecs(srv));
            if(getStatus(srv).toLowerCase() != "terminated") {
                servers.push(new Server(
                    getName(srv),
                    getInstanceId(srv),
                    (getIPv4(srv) != undefined) ? getIPv4(srv) : "",
                    getPassword(srv),
                    getStatus(srv),
                    (newSpecs.length > 2) ? (newSpecs[0] + " (" + getCpuType(srv) + ")") : getCpuType(srv),
                    (newSpecs.length > 2) ? newSpecs[1] : "",
                    (newSpecs.length > 2) ? newSpecs[2] : ""
                ));
            }
        }

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

        // Clears old tiles
        primaryBody.textContent = '';
        
        // Adds new tiles
        for(var counter = 0; counter < servers.length; counter++) {
            addTile(counter);
        }

        // Updates the colors of the new tiles
        updateColors();
    });
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
            connect(parseInt(newConnButton.id));
        }
    });
    newTile.appendChild(newConnButton);

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
    newTile.appendChild(newModifyButton);

    // The popup area that contains the modification buttons.
    var newModifyArea = document.createElement('div');
    newModifyArea.className = "modifyArea";
    newModifyArea.hidden = true;
    newModifyButton.addEventListener('click', function() {
        if(newModifyButton.value == "active") {
            newModifyArea.hidden = !newModifyArea.hidden;
        }
    });

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
                if(startInstance(servers[parseInt(newPowerButton.id)].id)) {
                    // Good to go
                    setTimeout(loadServers, 1500);
                } else {
                    // Error starting server
                }
            } else if(server.status == "running") {
                // Turn server off.
                if(stopInstance(servers[parseInt(newPowerButton.id)].id)) {
                    // Good to go
                    setTimeout(loadServers, 1500);
                } else {
                    // Error stopping server
                }
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
                if(rebootInstance(servers[parseInt(newRebootButton.id)].id)) {
                    // Good to go
                    setTimeout(loadServers, 1500);
                } else {
                    // Error rebooting server
                }
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
            if(terminateInstance(servers[parseInt(newRebootButton.id)].id)) {
                // Good to go
                setTimeout(loadServers, 1500);
            } else {
                // Error rebooting server
            }
        }
    });
    newModifyArea.appendChild(newTerminateButton);

    newPowerButton.value = "inactive";
    newRebootButton.value = "inactive";
    newTerminateButton.value = "inactive";
    newConnButton.value = "inactive";
    newModifyButton.value = "inactive";
    if(server.status == "running" || server.status == "stopped") {
        newPowerButton.value = "active";
        newRebootButton.value = "active";
        newTerminateButton.value = "active";
        newModifyButton.value = "active";
        if(server.status == "running") {
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
    for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
        if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Name") {
            return json["Instances"][0]["Tags"][tagIndex]["Value"];
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
    for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
        if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Cert") {
            return json["Instances"][0]["Tags"][tagIndex]["Value"];
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
    for(var tagIndex = 0; tagIndex < json["Instances"][0]["Tags"].length; tagIndex++) {
        if(json["Instances"][0]["Tags"][tagIndex]["Key"] == "Specifications") {
            return json["Instances"][0]["Tags"][tagIndex]["Value"];
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
    // New server window popup.
});

newServerButton.addEventListener('mouseenter', function() {
    newServerButton.style.backgroundColor = Colors.backgroundPrimary();
});

newServerButton.addEventListener('mouseleave', function() {
    newServerButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

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

        var connectButtons = document.getElementsByClassName("connectButton");
        for(var count = 0; count < connectButtons.length; count++) {
            connectButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running.
            const state = servers[count].status.toLowerCase();
            if(state == "running") {
                connectButtons[count].style.color = Colors.textSecondary();
                connectButtons[count].style.borderColor = Colors.textSecondary();
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
                modifyButtons[count].style.color = Colors.textSecondary();
                modifyButtons[count].style.borderColor = Colors.textSecondary();
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

        var powerButtons = document.getElementsByClassName("powerButton");
        for(var count = 0; count < powerButtons.length; count++) {
            powerButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if state is fully running or stopped.
            const state = servers[count].status.toLowerCase();
            if(state == "running" || state == "stopped") {
                powerButtons[count].style.color = Colors.textSecondary();
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
                rebootButtons[count].style.color = Colors.textSecondary();
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
    }
}