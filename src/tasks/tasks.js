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
 */
function convertTask(obj) {
    return new Task(obj.name, obj.id, obj.type, obj.time, obj.reg);
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
    newName.textContent = task.name;
    newTile.appendChild(newName);

    // The task AMI ID descriptor element.
    var newId = document.createElement('div');
    newId.className = "taskId";
    newId.textContent = "ID: " + task.id;
    newTile.appendChild(newId);

    // The task visibility label element.
    var newTypeLabel = document.createElement('div');
    newTypeLabel.className = "typeLabel";
    newTypeLabel.textContent = "Task Type";
    newTile.appendChild(newTypeLabel);

    // The task visibility descriptor element.
    var newTaskVisibility = document.createElement('div');
    newTaskVisibility.className = "taskType";
    newTaskVisibility.textContent = "Server " + task.type;
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
    
    // The permadelete Template button.
    var newTerminateButton = document.createElement('div');
    newTerminateButton.className = "terminateButton";
    newTerminateButton.textContent = "Delete";
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
            // Removes that template from the user's My Templates
            tasks.pop(parseInt(newTerminateButton.id));
            
            // Updates the template ID cache
            updateCache("tasks-" + getRegion(), tasks);

            // Reload
            displayOverlay(true);
            loadTasks();
        }
    });
    newModifyArea.appendChild(newTerminateButton);


    newTerminateButton.value = "active";
    newModifyButton.value = "active";

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
                tasks.push(convertTask(cacheTasks[index]));
            }
        }
    }

    console.log(tasks);

    // Clears and adds Tasks in current region to GUI.
    primaryBody.innerHTML = '';
    for(var index = 0; index < tasks.length; index++) {
        addTile(index);
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
            modifyButtons[count].style.color = Colors.textPrimary();
            modifyButtons[count].style.borderColor = Colors.textPrimary();
        }

        var templateNames = document.getElementsByClassName("taskName");
        for(var count = 0; count < templateNames.length; count++) {
            templateNames[count].style.color = Colors.textPrimary();
        }
        
        var templateIds = document.getElementsByClassName("taskId");
        for(var count = 0; count < templateIds.length; count++) {
            templateIds[count].style.color = Colors.textSecondary();
        }

        var platformLabels = document.getElementsByClassName("typeLabel");
        for(var count = 0; count < platformLabels.length; count++) {
            platformLabels[count].style.color = Colors.textPrimary();
        }
        
        var templatePlatforms = document.getElementsByClassName("taskType");
        for(var count = 0; count < templatePlatforms.length; count++) {
            templatePlatforms[count].style.color = Colors.textSecondary();
        }

        var modifyAreas = document.getElementsByClassName("modifyArea");
        for(var count = 0; count < modifyAreas.length; count++) {
            modifyAreas[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            modifyAreas[count].style.borderColor = Colors.textSecondary();
        }

        var terminateButtons = document.getElementsByClassName("terminateButton");
        for(var count = 0; count < terminateButtons.length; count++) {
            terminateButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            terminateButtons[count].style.color = "#cc3333";
        }
    }
}