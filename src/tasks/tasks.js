// Supplemental functions
const { 
    Colors, setPopupValues, getPopupValues, awsDir,
    getRegion, updateCache, getCacheValue, getTheme,
    productName
} = parent.require("../beza.js");
const {
    Task, Server, ApiCaller
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
/** @type {Server[]} The list of Servers set by the user. */
var servers = [];

/** Called when the window is first loaded. */
window.onload = function() {
    updateColors();

    loadTasks();

    setInterval(checkAndRunTasks, 5000);
}

// ---------------------------  Task loading functions  ---------------------------- //

/**
 * Given a JSON object, it will return a Task object with the same values.
 * @param {any} obj The JSON object to parse.
 */
function convertTask(obj) {
    return new Task(obj.name, obj.id, obj.type, obj.time, obj.region);
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

    // The popup area that contains the modification buttons.
    var newModifyArea = document.createElement('div');
    newModifyArea.className = "modifyArea";
    newModifyArea.hidden = false;

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
    newModifyButton.addEventListener('click', function() {
        newModifyArea.focus();
        if(newModifyButton.value == "active") {
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
    loadTasksFromCache(getRegion());
    
    // Clears old tiles, resets region label
    const regionDict = {
        "us-east-1": "N. Virginia",
        "us-east-2": "Ohio",
        "us-west-1": "N. California",
        "us-west-2": "Oregon"
    };
    regionLabel.textContent = regionDict[getRegion()];

    // Clears and adds Tasks in current region to GUI.
    primaryBody.innerHTML = '';
    for(var index = 0; index < tasks.length; index++) {
        addTile(index);
    }

    displayOverlay(false);
    updateColors();
            
    var tiles = document.getElementsByClassName("tile");
    for(var count = 0; count < tiles.length; count++) {
        tiles[count].classList.add("show");
    }
                
    if (tiles.length == 0) {
        var noPullLabel = document.createElement('div');
        noPullLabel.textContent = "You have no tasks in this region.";
        noPullLabel.style.color = Colors.textSecondary();
        noPullLabel.style.width = "calc(100vw - 50px)";
        noPullLabel.style.marginLeft = "auto";
        noPullLabel.style.marginRight = "auto";
        noPullLabel.style.marginTop = "calc(50vh - 50px)";
        noPullLabel.style.textAlign = "center";
        primaryBody.appendChild(noPullLabel);
    }
}

/**
 * Loads the 'tasks' variable for the region from cache.
 * @param {string} reg The region to pull Tasks from cache for.
 */
function loadTasksFromCache(reg) {
    tasks = [];

    const regions = [
        'us-east-1', 'us-east-2',
        'us-west-1', 'us-west-2'
    ];

    const cacheTasks = getCacheValue('tasks-' + reg);
    if(cacheTasks != "ERROR") {
        for(var index = 0; index < cacheTasks.length; index++) {
            tasks.push(convertTask(cacheTasks[index]));
        }
    }

    console.log(tasks);
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
 * Checks if any Tasks need to be executed and executes them if so.
 */
function checkAndRunTasks() {
    const regions = [
        'us-east-1', 'us-east-2',
        'us-west-1', 'us-west-2'
    ];

    for(var regionIndex = 0; regionIndex < regions.length; regionIndex++) {
        const reg = regions[regionIndex];
        // Refreshes the tasks variable.
        loadTasksFromCache(reg);

        // Activated when a Task is executed and deleted.
        var needsRefresh = false;

        /** 
         *  The new array of Tasks that will, by the end of the
         *  loop, contain only unused Tasks.
         */
        var newTasks = [];

        // Loops through 'tasks' and checks if any need to be executed.
        for(var index = 0; index < tasks.length; index++) {
            var tempTask = tasks[index];
            var taskRan = false;
            // Verifies that it is the correct region.
            if(reg == tempTask.region) {
                // Verifies that the Task is due to run.
                if(Date.now() / 1000 > parseInt(tempTask.time)) {
                    console.log("Task should run ", tempTask)
                    taskRan = true;
                    if(tempTask.type == "start") {
                        ApiCaller.startInstance(tempTask.id, reg).then(function(success) {
                            if(success) {
                                // Send notification that server started.
                                new Notification("Server Started", { body: tempTask.name
                                    + " (" + tempTask.id + ") successfully started." }).onclick
                                        = () => console.log("");
                                needsRefresh = true;
                            } else {
                                // Try again next cycle...
                            }
                        });
                        // Do something about it so in case it takes > 5 seconds
                    } else if(tempTask.type == "stop") {
                        ApiCaller.stopInstance(tempTask.id, reg).then(function(success) {
                            if(success) {
                                // Send notification that server stopped.
                                new Notification("Server Stopped", { body: tempTask.name
                                    + " (" + tempTask.id + ") successfully stopped." }).onclick
                                        = () => console.log("");
                                needsRefresh = true;
                            } else {
                                // Try again next cycle...
                            }
                        });
                        // Do something about it so in case it takes > 5 seconds
                    }
                }
            }
            
            if(!taskRan) {
                newTasks.push(tasks[index]);
            } else {
                needsRefresh = true;
            }
        }

        updateCache("tasks-" + reg, newTasks);

        if(reg == getRegion() && needsRefresh) {
            loadTasks();
        }
    }
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

        tiles = document.getElementsByClassName("tile show");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
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
        
        if(getTheme() == productName) {
            newTaskButton.children[0].src = "../assets/Plus-White.png";
        } else {
            newTaskButton.children[0].src = "../assets/Plus-White.png";
        }
    }
}