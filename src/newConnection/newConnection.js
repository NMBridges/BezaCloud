// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getRegion,
    getCacheValue
} = require('../mercor.js');
const {
    Template, getAmiData, getDefaultVpcId, getSecurityGroups,
    getMercorSecurityGroupId, createKeyPair, createInstance,
    createMercorSecurityGroup
} = require('../apiCaller.js');

// Page element references
/** The main divider box that divides the page into sections. */
var dividerBox = document.getElementById('dividerBox');
/** The first section; contains the title. */
var titleBox = document.getElementById('titleBox');
/** The button that connects to a server, if parameters are valid, when clicked. */
var connectButton = document.getElementById('connectButton');
/** The button that closes the window and cancels the operation when clicked. */
var cancelButton = document.getElementById('cancelButton');

/** @type {Template[]} The list of Templates available to the user. */
var templates = [];

window.onload = function() {
    updateColors();
};

/**
 * Updates the elements of the window in accordance to the color theme.
 */
function updateColors() {
    dividerBox.style.backgroundColor = Colors.backgroundPrimary();

    // Depending on the color theme, the color schema may vary for some elements.
    if(getTheme() == "Dark") {
        titleBox.style.color = Colors.backgroundSecondary();
        connectButton.style.backgroundColor = Colors.backgroundSecondary();
        connectButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
        document.getElementById("fileSelectButton").style.backgroundColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        connectButton.style.backgroundColor = Colors.textPrimary();
        connectButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
        document.getElementById("fileSelectButton").style.backgroundColor = Colors.textPrimary();
    }

    var elements = document.getElementsByClassName("box");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.backgroundPrimaryAccent();
    }

    var elements = document.getElementsByClassName("selectButton");
    for(var index = 0; index < elements.length; index++) {
        elements[index].style.backgroundColor = Colors.textTertiary();
        elements[index].style.borderColor = Colors.textTertiary();
    }

    // then select the second one if there is a password, first otherwise
}

/**
 * Resets the elements of the window to their default values.
 */
function updateElements() {
    //nameTextBox.value = "";
    
    updateColors();
}

connectButton.addEventListener('mouseenter', function() {
    if(getTheme() == "Dark") {
        connectButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        connectButton.style.backgroundColor = Colors.textSecondary();
    }
});

connectButton.addEventListener('mouseleave', function() {
    if(getTheme() == "Dark") {
        connectButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        connectButton.style.backgroundColor = Colors.textPrimary();
    }
});

connectButton.addEventListener('click', function() {
    window.close();
});

cancelButton.addEventListener('mouseenter', function() {
    cancelButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

cancelButton.addEventListener('mouseleave', function() {
    cancelButton.style.backgroundColor = Colors.backgroundPrimary();
});

cancelButton.addEventListener('click', function() {
    window.close();
});

// ------------------------------------------------------------------------------ //

// ------------------------  miscellaneous functions  --------------------------- //

/**
 * Creates a new popup window.
 * @param {string} header The header text of the popup.
 * @param {string} body The body text of the popup.
 * @param {string} button The button text of the popup. Blank if hidden.
 */
 function newPopup(header, body, button) {
    setPopupValues(header, body, button);
    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('showPopup');
}

// ------------------------------------------------------------------------------ //