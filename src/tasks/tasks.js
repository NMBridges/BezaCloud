// Supplemental functions
const { 
    Colors, setPopupValues, getPopupValues, awsDir,
    getRegion, updateCache, getCacheValue
} = parent.require("../mercor.js");
const {
    Task
} = parent.require("../apiCaller.js");
const { exec, execSync } = parent.require('child_process');
const homeDir = parent.require('os').homedir();

// Document elements
var topBar = document.getElementById("topBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var regionLabel = document.getElementById("regionLabel");
var newTaskButton = document.getElementById("newTaskButton");
var primaryBody = document.getElementById("primaryBody");
var overlay = document.getElementById("overlay");

/** @type {Task[]} The list of Tasks set by the user. */
var tasks = [];

/** Called when the window is first loaded. */
window.onload = function() {
    updateColors();
}

// ---------------------------  Task loading functions  ---------------------------- //

/**
 * Given a JSON object, it will return a Task object with the same values.
 * @param {any} obj The JSON object to parse.
 * @param {string} reg The region of the Task.
 */
function convertTask(obj, reg) {
    return new Task(obj.name, obj.id, obj.type, obj.time, reg);
}

/**
 * Adds a tile to the background with the appropriate Task details.
 * @param {number} index The index of the Task in 'tasks' to add.
 */
 function addTile(index) {
    const task = tasks[index];
    // The main tile block.
    var newTile = document.createElement('div');
    newTile.className = "tile";

    // The task name descriptor element.
    var newName = document.createElement('div');
    newName.className = "taskName";
    newName.textContent = task.amiName;
    newTile.appendChild(newName);

    // The server IP address descriptor element.
    if(task.name != "") {
        var newTagName = document.createElement('div');
        newTagName.className = "taskTagName";
        newTagName.textContent = "Given Name: " + task.name;
        newTile.appendChild(newTagName);
    }

    // The task AMI ID descriptor element.
    var newId = document.createElement('div');
    newId.className = "taskId";
    newId.textContent = "ID: " + task.id;
    newTile.appendChild(newId);

    // The task status icon.
    var newStatus = document.createElement('div');
    newStatus.className = "statusIcon";
    var newStatusLabel = document.createElement('div');
    newStatusLabel.className = "statusPopup";
    newStatusLabel.textContent = task.status;
    newStatus.appendChild(newStatusLabel);
    newTile.appendChild(newStatus);

    // The task visibility label element.
    var newPlatformLabel = document.createElement('div');
    newPlatformLabel.className = "platformLabel";
    newPlatformLabel.textContent = "Platform";
    newTile.appendChild(newPlatformLabel);

    // The task visibility descriptor element.
    var newTaskVisibility = document.createElement('div');
    newTaskVisibility.className = "templatePlatform";
    newTaskVisibility.textContent = template.plat;
    newTile.appendChild(newTaskVisibility);

    // The modify Task button.
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
        newModifyArea.focus();
        if(newModifyButton.value == "active") {
            newModifyArea.hidden = !newModifyArea.hidden;
        }
    });

    // The toggle visibility button.
    var newVisibilityButton = document.createElement('div');
    newVisibilityButton.className = "visibilityButton";
    newVisibilityButton.textContent = "Make Public";
    if(template.pub) {
        newVisibilityButton.textContent = "Make Private";
    }
    newVisibilityButton.id = "" + index;
    newVisibilityButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newVisibilityButton.value == "active") {
            newVisibilityButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newVisibilityButton.addEventListener('mouseleave', function() {
        newVisibilityButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newVisibilityButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newVisibilityButton.value == "active") {
            if(template.pub) {
                // Make the server private.
                displayOverlay(true);

                changeAmiVisibility(templates[parseInt(newVisibilityButton.id)].id, false).then(function(result) {
                    if(result == "ERROR") {
                        console.log("ERROR");
                    }
                    loadTemplates();
                });
            } else {
                // Make the server public.
                displayOverlay(true);
                
                changeAmiVisibility(templates[parseInt(newVisibilityButton.id)].id, true).then(function(result) {
                    if(result == "ERROR") {
                        console.log("ERROR");
                    }
                    loadTemplates();
                });
            }
        }
    });
    newModifyArea.appendChild(newVisibilityButton);

    // The toggle visibility button.
    var newCopyButton = document.createElement('div');
    newCopyButton.className = "copyButton";
    newCopyButton.textContent = "Copy to Different Region";
    newCopyButton.id = "" + index;
    newCopyButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newCopyButton.value == "active") {
            newCopyButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newCopyButton.addEventListener('mouseleave', function() {
        newCopyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newCopyButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newCopyButton.value == "active") {
            // Copy the Template to another region
            updateCache('copyTemplate', [templates[parseInt(newCopyButton.id)].id, templates[parseInt(newCopyButton.id)].amiName]);
            const remote = parent.require('electron').remote;
            let w = remote.getCurrentWindow();
            w.emit('newCopyTemplate');
            /*copyImage(templates[parseInt(newCopyButton.id)].id, templates[parseInt(newCopyButton.id)].amiName, "us-east-2").then(function() {
                loadTemplates();
            });*/
        }
    });
    newModifyArea.appendChild(newCopyButton);
    
    // The permadelete Template button.
    var newTerminateButton = document.createElement('div');
    newTerminateButton.className = "terminateButton";
    if(template.owner == "self") {
        newTerminateButton.textContent = "Permadelete";
    } else {
        newTerminateButton.textContent = "Remove from My Templates"
    }
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
            if(templates[parseInt(newTerminateButton.id)].owner == "self") {
                // Terminate Template.
                displayOverlay(true);
                deleteImage(templates[parseInt(newTerminateButton.id)].id).then(function() {
                    loadTemplates();
                });
            } else {
                // Removes that template from the user's My Templates
                templates.pop(parseInt(newTerminateButton.id));
                
                // Stores templates AMI IDs in Cache
                var templateIds = [];
                for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                    templateIds.push(templates[templateIndex].id);
                }
                
                // Updates the template ID cache
                updateCache("templates-" + getRegion(), templateIds);

                // Reload
                displayOverlay(true);
                loadTemplates();
            }
        }
    });
    newModifyArea.appendChild(newTerminateButton);


    newVisibilityButton.value = "inactive";
    newCopyButton.value = "inactive";
    newTerminateButton.value = "inactive";
    newModifyButton.value = "inactive";
    if(template.status == "available") {
        if(template.owner == "self") {
            newVisibilityButton.value = "active";
            newCopyButton.value = "active";
        }
        newTerminateButton.value = "active";
        newModifyButton.value = "active";
    }

    newTile.appendChild(newModifyArea);
    primaryBody.appendChild(newTile);
}

/** Reloads the Task tiles on the page. */
function loadTasks() {
    updateCache("tasks-us-east-1", [new Task("BIG BOY SERVER", "serverIDDD", "start", 13939243922, "us-east-1")]);

    tasks = [];

    const regions = [
        'us-east-1', 'us-east-2',
        'us-west-1', 'us-west-2'
    ]

    for(var regIndex = 0; regIndex < regions.length; regIndex++) {
        const cacheTasks = getCacheValue('tasks-' + regions[regIndex]);
        if(cacheTasks != "ERROR") {
            for(var index = 0; index < cacheTasks.length; index++) {
                tasks.push(convertTask(cacheTasks[index], regions[regIndex]));
            }
        }
    }

    console.log(tasks);

    // Add Tasks in current region to GUI
    for(var index = 0; index < tasks.length; index++) {

    }

    displayOverlay(false);
    updateColors();
}

// --------------------------------------------------------------------------------- //

// ---------------------------- newTaskButton functions ---------------------------- //

newTaskButton.addEventListener('click', function() {
    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('newTask');
});

newTaskButton.addEventListener('mouseenter', function() {
    newTaskButton.style.backgroundColor = Colors.backgroundPrimary();
});

newTaskButton.addEventListener('mouseleave', function() {
    newTaskButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

// ---------------------------------------------------------------------------------- //

// ---------------------------------------------------------------------------------- //

/**
 * Turns the overlay on or off.
 * @param {boolean} to Boolean representing turning the overlay on (true) or off (false)
 */
 function displayOverlay(to) {
    if(to) {
        overlay.style.display = "block";
    } else {
        overlay.style.display = "none";
    }
    const contenta = overlay.innerHTML;
    overlay.innerHTML = contenta;
    overlay.focus();
}

/**
 * Updates the page elements' colors in accordance to the color theme.
 */
 function updateColors() {
    // The top of the page
    topBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
    mainPageLabel.style.color = Colors.textPrimary();
    regionLabel.style.color = Colors.textSecondary();
    newTaskButton.style.backgroundColor = Colors.backgroundPrimaryAccent();

    // The main body / server tiles.
    {
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();

        var tiles = document.getElementsByClassName("tile");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
        }

        var modifyButtons = document.getElementsByClassName("modifyButton");
        for(var count = 0; count < modifyButtons.length; count++) {
            modifyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running or stopped.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                modifyButtons[count].style.color = Colors.textPrimary();
                modifyButtons[count].style.borderColor = Colors.textPrimary();
            } else {
                modifyButtons[count].style.color = Colors.textTertiary();
                modifyButtons[count].style.borderColor = Colors.textTertiary();
            }
        }

        var templateNames = document.getElementsByClassName("templateName");
        for(var count = 0; count < templateNames.length; count++) {
            templateNames[count].style.color = Colors.textPrimary();
        }

        var statusIcons = document.getElementsByClassName("statusIcon");
        for(var count = 0; count < statusIcons.length; count++) {
            // Adjusts the color depending on the server's status.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                statusIcons[count].style.backgroundColor = "#33cc33";
            } else if(state == "shutting-down" || state == "pending" || state == "stopping") {
                statusIcons[count].style.backgroundColor = "#cccc33";
            } else {
                statusIcons[count].style.backgroundColor = "#cc3333";
            }
        }
        
        var templateIds = document.getElementsByClassName("templateId");
        for(var count = 0; count < templateIds.length; count++) {
            templateIds[count].style.color = Colors.textSecondary();
        }
        
        var templateTagNames = document.getElementsByClassName("templateTagName");
        for(var count = 0; count < templateTagNames.length; count++) {
            templateTagNames[count].style.color = Colors.textSecondary();
        }

        var platformLabels = document.getElementsByClassName("platformLabel");
        for(var count = 0; count < platformLabels.length; count++) {
            platformLabels[count].style.color = Colors.textPrimary();
        }
        
        var templatePlatforms = document.getElementsByClassName("templatePlatform");
        for(var count = 0; count < templatePlatforms.length; count++) {
            templatePlatforms[count].style.color = Colors.textSecondary();
        }

        var modifyAreas = document.getElementsByClassName("modifyArea");
        for(var count = 0; count < modifyAreas.length; count++) {
            modifyAreas[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            modifyAreas[count].style.borderColor = Colors.textSecondary();
        }

        var visibilityButtons = document.getElementsByClassName("visibilityButton");
        for(var count = 0; count < visibilityButtons.length; count++) {
            visibilityButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available" && templates[count].owner == "self") {
                visibilityButtons[count].style.color = Colors.textPrimary();
            } else {
                visibilityButtons[count].style.color = Colors.textTertiary();
            }
        }

        var copyButtons = document.getElementsByClassName("copyButton");
        for(var count = 0; count < copyButtons.length; count++) {
            copyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available" && templates[count].owner == "self") {
                copyButtons[count].style.color = Colors.textPrimary();
            } else {
                copyButtons[count].style.color = Colors.textTertiary();
            }
        }

        var terminateButtons = document.getElementsByClassName("terminateButton");
        for(var count = 0; count < terminateButtons.length; count++) {
            terminateButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                terminateButtons[count].style.color = "#cc3333";
            } else {
                terminateButtons[count].style.color = "#882222";
            }
        }
    }
}