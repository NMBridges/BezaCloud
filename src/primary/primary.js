// Supplemental functions
const { 
    hex, Colors, getTheme, setTheme, getPage,
    setPage, getPopupValues, setPopupValues
 } = require("../seros.js");

// Document items
var dashboardButton = document.getElementById("dashboardButton");
var serversButton = document.getElementById("serversButton");
var tasksButton = document.getElementById("tasksButton");
var optionsButton = document.getElementById("optionsButton");
var templatesButton = document.getElementById("templatesButton");
var signOutButton = document.getElementById("signOutButton");
var menuBar = document.getElementById("menuBar");

var dash = document.getElementById("dash");
var serv = document.getElementById("serv");
var task = document.getElementById("task");
var opti = document.getElementById("opti");
var temp = document.getElementById("temp");

window.onload = function() {
    to("Dashboard");

    if(process.platform == "darwin") {
        const remote = require('electron').remote;
        let w = remote.getCurrentWindow();
        w.emit('refreshContents');
    }

};

/**
 * Updates the CSS style colors for the page based on the color theme.
 */
function updateColors() {
    getTheme();
    const pg = getPage();
    if(pg == "Dashboard") {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Servers") {
        serversButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        serversButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Options") {
        optionsButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        optionsButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Tasks") {
        tasksButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        tasksButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Templates") {
        templatesButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        templatesButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    signOutButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    dashboardButton.style.color = Colors.menuTextPrimary();
    serversButton.style.color = Colors.menuTextPrimary();
    optionsButton.style.color = Colors.menuTextPrimary();
    tasksButton.style.color = Colors.menuTextPrimary();
    templatesButton.style.color = Colors.menuTextPrimary();
    signOutButton.style.color = Colors.menuTextPrimary();

    menuBar.style.backgroundColor = Colors.backgroundSecondary();

    // Update subwindows
    dash.contentWindow.updateColors();
    serv.contentWindow.updateColors();
    opti.contentWindow.updateColors();
}

// -------------------------- dashboardButton functions ----------------------------- //

dashboardButton.addEventListener('mouseenter', function() {
    if(getPage() == "Dashboard") {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

dashboardButton.addEventListener('mouseleave', function() {
    if(getPage() == "Dashboard") {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondary();
    }
});

/** Goes to the Dashboard page */
dashboardButton.addEventListener('click', function() {
    if(getPage() != "Dashboard") {
        to("Dashboard");
    }
});

// ---------------------------------------------------------------------------------- //

// ---------------------------- serversButton functions ----------------------------- //

serversButton.addEventListener('mouseenter', function() {
    if(getPage() == "Servers") {
        serversButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        serversButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

serversButton.addEventListener('mouseleave', function() {
    if(getPage() == "Servers") {
        serversButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        serversButton.style.backgroundColor = Colors.backgroundSecondary();
    }
});

/** Goes to the Servers page */
serversButton.addEventListener('click', function() {
    if(getPage() != "Servers") {
        to("Servers");
    }
});

// ---------------------------------------------------------------------------------- //

// ----------------------------- tasksButton functions ------------------------------ //

tasksButton.addEventListener('mouseenter', function() {
    if(getPage() == "Tasks") {
        tasksButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        tasksButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

tasksButton.addEventListener('mouseleave', function() {
    if(getPage() == "Tasks") {
        tasksButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        tasksButton.style.backgroundColor = Colors.backgroundSecondary();
    }
});

/** Goes to the Tasks page */
tasksButton.addEventListener('click', function() {
    if(getPage() != "Tasks") {
        to("Tasks");
    }
});

// ---------------------------------------------------------------------------------- //

// ---------------------------- optionsButton functions ----------------------------- //

optionsButton.addEventListener('mouseenter', function() {
    if(getPage() == "Options") {
        optionsButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        optionsButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

optionsButton.addEventListener('mouseleave', function() {
    if(getPage() == "Options") {
        optionsButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        optionsButton.style.backgroundColor = Colors.backgroundSecondary();
    }
});

/** Goes to the Options page */
optionsButton.addEventListener('click', function() {
    if(getPage() != "Options") {
        to("Options");
    }
});

// ---------------------------------------------------------------------------------- //

// --------------------------- templatesButton functions ---------------------------- //

templatesButton.addEventListener('mouseenter', function() {
    if(getPage() == "Templates") {
        templatesButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        templatesButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
});

templatesButton.addEventListener('mouseleave', function() {
    if(getPage() == "Templates") {
        templatesButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        templatesButton.style.backgroundColor = Colors.backgroundSecondary();
    }
});

/** Goes to the Options page */
templatesButton.addEventListener('click', function() {
    if(getPage() != "Templates") {
        to("Templates");
    }
});

// ---------------------------------------------------------------------------------- //

// ---------------------------- signOutButton functions ----------------------------- //

signOutButton.addEventListener('mouseenter', function() {
    signOutButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
});

signOutButton.addEventListener('mouseleave', function() {
    signOutButton.style.backgroundColor = Colors.backgroundSecondarySelected();
});

/** Goes to the Options page */
signOutButton.addEventListener('click', function() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('logOut');
});

// ---------------------------------------------------------------------------------- //

if (window.addEventListener) {
    window.addEventListener("message", onMessage, false);        
} 
else if (window.attachEvent) {
    window.attachEvent("onmessage", onMessage, false);
}

function onMessage(event) {
    var data = event.data;
    if (typeof(window[data.func]) == "function") {
        window[data.func].call(null, data.message);
    }
}

/**
 * Performs necessary operations to transition from one page to another.
 * @param {string} page The page to transition to.
 */
function to(page) {
    console.log("To ", page);
    setPage(page);

    // Hides each iframe if it is not the desired page.
    if(page == "Dashboard") {
        dash.hidden = false;
        dash.contentWindow.loadOnSwitch();
    } else {
        dash.hidden = true;
    }
    if(page == "Servers") {
        serv.hidden = false;
        serv.contentWindow.displayOverlay(true);
        serv.contentWindow.loadServers();
    } else {
        serv.hidden = true;
    }
    if(page == "Tasks") {
        task.hidden = false;
        task.contentWindow.displayOverlay(true);
        task.contentWindow.loadTasks();
    } else {
        task.hidden = true;
    }
    if(page == "Options") {
        opti.hidden = false;
    } else {
        opti.hidden = true;
    }
    if(page == "Templates") {
        temp.hidden = false;
        temp.contentWindow.displayOverlay(true);
        temp.contentWindow.loadTemplates();
    } else {
        temp.hidden = true;
    }

    updateColors();
}