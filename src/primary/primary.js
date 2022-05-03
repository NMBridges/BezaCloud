// Supplemental functions
const { 
    hex, Colors, getTheme, setTheme, getPage,
    setPage, getPopupValues, setPopupValues
 } = require("../beza.js");

// Document items
var dashboardButton = document.getElementById("dashboardButton");
var dashLine = document.getElementById("dashLine");
var serversButton = document.getElementById("serversButton");
var serversLine = document.getElementById("serversLine");
var tasksButton = document.getElementById("tasksButton");
var tasksLine = document.getElementById("tasksLine");
var optionsButton = document.getElementById("optionsButton");
var optionsLine = document.getElementById("optionsLine");
var templatesButton = document.getElementById("templatesButton");
var templatesLine = document.getElementById("templatesLine");
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
        //dashboardButton.style.backgroundColor = Colors.backgroundSecondarySelected();
        dashboardButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Servers") {
        //serversButton.style.backgroundColor = Colors.backgroundSecondarySelected();
        serversButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        serversButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Options") {
        //optionsButton.style.backgroundColor = Colors.backgroundSecondarySelected();
        optionsButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        optionsButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Tasks") {
        //tasksButton.style.backgroundColor = Colors.backgroundSecondarySelected();
        tasksButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        tasksButton.style.backgroundColor = Colors.backgroundSecondary();
    }
    if(pg == "Templates") {
        //templatesButton.style.backgroundColor = Colors.backgroundSecondarySelected();
        templatesButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
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
        //dashboardButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
    dashboardButton.classList.add("buttonBig");
    dashLine.classList.add("hovered");
});

dashboardButton.addEventListener('mouseleave', function() {
    if(getPage() == "Dashboard") {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondary();
        dashLine.classList.remove("hovered");
    }
    dashboardButton.classList.remove("buttonBig");
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
        //serversButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
    serversButton.classList.add("buttonBig");
    serversLine.classList.add("hovered");
});

serversButton.addEventListener('mouseleave', function() {
    if(getPage() == "Servers") {
        serversButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        serversButton.style.backgroundColor = Colors.backgroundSecondary();
        serversLine.classList.remove("hovered");
    }
    serversButton.classList.remove("buttonBig");
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
        //tasksButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
    tasksButton.classList.add("buttonBig");
    tasksLine.classList.add("hovered");
});

tasksButton.addEventListener('mouseleave', function() {
    if(getPage() == "Tasks") {
        tasksButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        tasksButton.style.backgroundColor = Colors.backgroundSecondary();
        tasksLine.classList.remove("hovered");
    }
    tasksButton.classList.remove("buttonBig");
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
        //optionsButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
    optionsButton.classList.add("buttonBig");
    optionsLine.classList.add("hovered");
});

optionsButton.addEventListener('mouseleave', function() {
    if(getPage() == "Options") {
        optionsButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        optionsButton.style.backgroundColor = Colors.backgroundSecondary();
        optionsLine.classList.remove("hovered");
    }
    optionsButton.classList.remove("buttonBig");
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
        //templatesButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    }
    templatesButton.classList.add("buttonBig");
    templatesLine.classList.add("hovered");
});

templatesButton.addEventListener('mouseleave', function() {
    if(getPage() == "Templates") {
        templatesButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    } else {
        templatesButton.style.backgroundColor = Colors.backgroundSecondary();
        templatesLine.classList.remove("hovered");
    }
    templatesButton.classList.remove("buttonBig");
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
    signOutButton.classList.add("buttonBig");
});

signOutButton.addEventListener('mouseleave', function() {
    signOutButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    signOutButton.classList.remove("buttonBig");
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
        dashLine.classList.remove("hovered");
    }
    if(page == "Servers") {
        serv.hidden = false;
        serv.contentWindow.displayOverlay(true);
        serv.contentWindow.loadServers();
    } else {
        serv.hidden = true;
        serversLine.classList.remove("hovered");
    }
    if(page == "Tasks") {
        task.hidden = false;
        task.contentWindow.displayOverlay(true);
        task.contentWindow.loadTasks();
    } else {
        task.hidden = true;
        tasksLine.classList.remove("hovered");
    }
    if(page == "Options") {
        opti.hidden = false;
    } else {
        opti.hidden = true;
        optionsLine.classList.remove("hovered");
    }
    if(page == "Templates") {
        temp.hidden = false;
        temp.contentWindow.displayOverlay(true);
        temp.contentWindow.loadTemplates();
    } else {
        temp.hidden = true;
        templatesLine.classList.remove("hovered");
    }

    updateColors();
}