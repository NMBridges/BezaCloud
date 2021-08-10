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
var loader = document.getElementById("loader");

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

    // The Task name descriptor element.
    var newName = document.createElement('div');
    newName.className = "taskName";
    newName.textContent = task.name;
    newTile.appendChild(newName);

    // The Task server ID descriptor element.
    var newId = document.createElement('div');
    newId.className = "taskId";
    newId.textContent = "ID: " + task.id;
    newTile.appendChild(newId);

    // The Task description label element.
    var newTypeLabel = document.createElement('div');
    newTypeLabel.className = "typeLabel";
    newTypeLabel.textContent = "Task Description";
    newTile.appendChild(newTypeLabel);

    // The Task type descriptor element.
    var newTaskType = document.createElement('div');
    newTaskType.className = "taskType";
    newTaskType.textContent = "Action: " + task.type.substr(0,1).toUpperCase() + task.type.substr(1) + " server";
    newTile.appendChild(newTaskType);

    // The Task time descriptor element.
    var newTaskTime = document.createElement('div');
    newTaskTime.className = "taskTime";
    newTaskTime.textContent = "Time: " + unixToDate(task.time);
    newTile.appendChild(newTaskTime);

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
    updateCache("tasks-us-east-1", [new Task("BIG BOY SERVER", "serverIDDD", "start", 1628633092, "us-east-1")]);

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
 * Converts a unix time code to the date/time format.
 * @param {number} unix The given unix time code.
 * @returns The unix time code in date/time format.
 */
function unixToDate(unix){
    var datetime = new Date(unix * 1000);
    var months = [
        "Jan","Feb","Mar",
        "Apr","May","Jun",
        "Jul","Aug","Sep",
        "Oct","Nov","Dec"
    ];
    var year = datetime.getFullYear();
    var month = months[datetime.getMonth()];
    var day = datetime.getDate();
    var hour = datetime.getHours();
    var min = datetime.getMinutes();
    var sec = datetime.getSeconds();
    var formatted = month + " " + day + ", " + year + " " + twoDig(hour % 12) + ":" + twoDig(min) + ":" + twoDig(sec) + (hour > 12 ? " PM" : " AM");
    return formatted;
}

/**
 * Adds a 0 before the number if it is less than two digits.
 * @param {number} num The original number.
 */
function twoDig(num) {
    return ((("" + num).length > 1) ? "" : "0") + num;
}

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

        var items = document.getElementsByClassName("tile");
        for(var count = 0; count < items.length; count++) {
            items[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            items[count].style.borderColor = Colors.textSecondary();
        }

        items = document.getElementsByClassName("modifyButton");
        for(var count = 0; count < items.length; count++) {
            items[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            items[count].style.color = Colors.textPrimary();
            items[count].style.borderColor = Colors.textPrimary();
        }

        items = document.getElementsByClassName("taskName");
        for(var count = 0; count < items.length; count++) {
            items[count].style.color = Colors.textPrimary();
        }
        
        items = document.getElementsByClassName("taskId");
        for(var count = 0; count < items.length; count++) {
            items[count].style.color = Colors.textSecondary();
        }

        items = document.getElementsByClassName("typeLabel");
        for(var count = 0; count < items.length; count++) {
            items[count].style.color = Colors.textPrimary();
        }
        
        items = document.getElementsByClassName("taskType");
        for(var count = 0; count < items.length; count++) {
            items[count].style.color = Colors.textSecondary();
        }
        
        items = document.getElementsByClassName("taskTime");
        for(var count = 0; count < items.length; count++) {
            items[count].style.color = Colors.textSecondary();
        }

        items = document.getElementsByClassName("modifyArea");
        for(var count = 0; count < items.length; count++) {
            items[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            items[count].style.borderColor = Colors.textSecondary();
        }

        items = document.getElementsByClassName("terminateButton");
        for(var count = 0; count < items.length; count++) {
            items[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            items[count].style.color = "#cc3333";
        }
    }
}