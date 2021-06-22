// Supplemental functions
const { hex, Colors, getTheme, setTheme, getPage, setPage } = require("../mercor.js");

// Document items
var dashboardButton = document.getElementById("dashboardButton");
var serversButton = document.getElementById("serversButton");
var tasksButton = document.getElementById("tasksButton");
var optionsButton = document.getElementById("optionsButton");
var signOutButton = document.getElementById("signOutButton");
var menuBar = document.getElementById("menuBar");

var dash = document.getElementById("dash");
var serv = document.getElementById("serv");
var task = document.getElementById("task");
var opti = document.getElementById("opti");

window.addEventListener('load', () => {
    to("Dashboard");

    

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

/**
 * Performs necessary operations to transition from one page to another.
 * @param {string} page The page to transition to.
 */
function to(page) {
    setPage(page);

    // Hides each iframe if it is not the desired page.
    if(page == "Dashboard") {
        dash.hidden = false;
    } else {
        dash.hidden = true;
    }
    if(page == "Servers") {
        serv.hidden = false;
    } else {
        serv.hidden = true;
    }
    if(page == "Tasks") {
        task.hidden = false;
    } else {
        task.hidden = true;
    }
    if(page == "Options") {
        opti.hidden = false;
    } else {
        opti.hidden = true;
    }

    updateColors();
}