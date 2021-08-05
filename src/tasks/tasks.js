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

/** Called when the window is first loaded. */
window.onload = function() {
    updateColors();
}

/** Reloads the Task tiles on the page. */
function loadTasks() {

    displayOverlay(false);
    updateColors();
}

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