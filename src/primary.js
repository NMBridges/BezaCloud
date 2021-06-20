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

window.addEventListener('load', () => {
    /**
     * Updates the CSS style colors for the page based on the color theme.
     */
    function updateColors() {
        dashboardButton.style.backgroundColor = Colors.backgroundSecondary();
		serversButton.style.backgroundColor = Colors.backgroundSecondary();
		optionsButton.style.backgroundColor = Colors.backgroundSecondary();
		tasksButton.style.backgroundColor = Colors.backgroundSecondary();
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

    }

    updateColors();

    dashboardButton.addEventListener('click', function() {
        if(getPage() != "Dashboard") {
            setPage("Dashboard");
            // change page to dashboard
        }
    });

    serversButton.addEventListener('click', function() {
        if(getPage() != "Servers") {
            setPage("Servers");
            // change page to Servers
        }
    });

    tasksButton.addEventListener('click', function() {
        if(getPage() != "Tasks") {
            setPage("Tasks");
            // change page to Tasks
        }
    });

    optionsButton.addEventListener('click', function() {
        if(getPage() != "Options") {
            setPage("Options");
            // change page to Options
        }
    });
});