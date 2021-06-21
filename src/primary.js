// Supplemental functions
const { hex, Colors, getTheme, setTheme, getPage, setPage } = require("./mercor.js");

// Document items
var dashboardButton = document.getElementById("dashboardButton");
var serversButton = document.getElementById("serversButton");
var tasksButton = document.getElementById("tasksButton");
var optionsButton = document.getElementById("optionsButton");
var signOutButton = document.getElementById("signOutButton");
var menuBar = document.getElementById("menuBar");
var headerBar = document.getElementById("headerBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var primaryBody = document.getElementById("primaryBody");

var dash = document.getElementById("dash");

window.addEventListener('load', () => {
    

    updateColors();

    

});

/**
 * Updates the CSS style colors for the page based on the color theme.
 */
function updateColors() {
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
    signOutButton.style.backgroundColor = Colors.backgroundSecondarySelected();
    dashboardButton.style.color = Colors.menuTextPrimary();
    serversButton.style.color = Colors.menuTextPrimary();
    optionsButton.style.color = Colors.menuTextPrimary();
    tasksButton.style.color = Colors.menuTextPrimary();
    signOutButton.style.color = Colors.menuTextPrimary();

    menuBar.style.backgroundColor = Colors.backgroundSecondary();

    mainPageLabel.style.color = Colors.textPrimary();
    headerBar.style.backgroundColor = Colors.backgroundPrimaryAccent();

    // Update subwindows
    dash.contentWindow.updateColors();
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
        setPage("Dashboard");
        // change page to dashboard


        updateColors();
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
        setPage("Servers");
        // change page to Servers

        
        updateColors();
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
        setPage("Tasks");
        // change page to Tasks

        
        updateColors();
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
        setPage("Options");
        // change page to Options

        
        updateColors();
    }
});

// ---------------------------------------------------------------------------------- //