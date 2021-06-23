// Supplemental functions
const { Colors } = parent.require("../mercor.js");

// Document items
var topBar = document.getElementById("topBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var regionLabel = document.getElementById("regionLabel");
var refreshButton = document.getElementById("refreshButton");
var newServerButton = document.getElementById("newServerButton");
var primaryBody = document.getElementById("primaryBody");

window.addEventListener('load', function() {
    updateColors();


});

/**
 * Updates the page elements' colors in accordance to the color theme.
 */
function updateColors() {
    // The top of the page
    topBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
    mainPageLabel.style.color = Colors.textPrimary();
    regionLabel.style.color = Colors.textSecondary();
    refreshButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    newServerButton.style.backgroundColor = Colors.backgroundPrimaryAccent();

    // The main body / server tiles.
    {
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();

        var tiles = document.getElementsByClassName("tile");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
        }

        var connectButtons = document.getElementsByClassName("connectButton");
        for(var count = 0; count < connectButtons.length; count++) {
            connectButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // In future, make this depend on whether the server is active.
            connectButtons[count].style.color = Colors.textSecondary();
            connectButtons[count].style.borderColor = Colors.textSecondary();
        }

        var modifyButtons = document.getElementsByClassName("modifyButton");
        for(var count = 0; count < modifyButtons.length; count++) {
            modifyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // In future, make this depend on whether the server is active.
            modifyButtons[count].style.color = Colors.textSecondary();
            modifyButtons[count].style.borderColor = Colors.textSecondary();
        }

        var serverNames = document.getElementsByClassName("serverName");
        for(var count = 0; count < serverNames.length; count++) {
            serverNames[count].style.color = Colors.textPrimary();
        }

        var statusIcons = document.getElementsByClassName("statusIcon");
        for(var count = 0; count < statusIcons.length; count++) {
            // Make this depend on server status
            //statusIcons[count].style.backgroundColor = Colors.textPrimary();
        }
        
        var serverIds = document.getElementsByClassName("serverId");
        for(var count = 0; count < serverIds.length; count++) {
            serverIds[count].style.color = Colors.textSecondary();
        }
        
        var serverIPv4s = document.getElementsByClassName("serverIPv4");
        for(var count = 0; count < serverIPv4s.length; count++) {
            serverIPv4s[count].style.color = Colors.textSecondary();
        }

        var specsLabels = document.getElementsByClassName("specsLabel");
        for(var count = 0; count < specsLabels.length; count++) {
            specsLabels[count].style.color = Colors.textPrimary();
        }
        
        var serverCPUs = document.getElementsByClassName("serverCPU");
        for(var count = 0; count < serverCPUs.length; count++) {
            serverCPUs[count].style.color = Colors.textSecondary();
        }
        
        var serverRAMs = document.getElementsByClassName("serverRAM");
        for(var count = 0; count < serverRAMs.length; count++) {
            serverRAMs[count].style.color = Colors.textSecondary();
        }
        
        var serverStorages = document.getElementsByClassName("serverStorage");
        for(var count = 0; count < serverStorages.length; count++) {
            serverStorages[count].style.color = Colors.textSecondary();
        }
    }
}