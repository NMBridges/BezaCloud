// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getCacheValue,
    updateCache, getRegion
} = require('../mercor.js');
const {
    Template, getAmiData
} = require('../apiCaller.js');

// Page element references
/** The main divider box that divides the page into sections. */
var dividerBox = document.getElementById('dividerBox');
/** The first section; contains the title. */
var titleBox = document.getElementById('titleBox');
/** The label that describes the AMI ID text box. */
var amiIdLabel = document.getElementById('amiIdLabel');
/** The AMI ID text box/field. */
var amiIdTextBox = document.getElementById('amiIdTextBox');
/** The button that creates a server, if parameters are valid, when clicked. */
var addTemplateButton = document.getElementById('addTemplateButton');
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
        addTemplateButton.style.backgroundColor = Colors.backgroundSecondary();
        addTemplateButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        addTemplateButton.style.backgroundColor = Colors.textPrimary();
        addTemplateButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
    }

    amiIdLabel.style.color = Colors.textSecondary();

}

/**
 * Resets the elements of the window to their default values.
 */
function resetElements() {
    amiIdTextBox.value = "";

    updateColors();
}

/**
 * Given an AMI JSON object, it returns a Template object.
 * @param {string} ami The AMI JSON object to parse.
 * @param {string} owner The owner of the AMI.
 */
 function createTemplateObject(ami, owner) {
    var tempTemplateName = '';
    if(ami['Tags'] != undefined) {
        for(var tagIndex = 0; tagIndex < ami['Tags'].length; tagIndex++) {
            if(ami['Tags'][tagIndex]['Key'] == "Name") {
                tempTemplateName = ami['Tags'][tagIndex]['Value'];
            }
        }
    }
    const templateName = tempTemplateName;
    const templateId = ami['ImageId'];
    const templateStatus = ami['State'];
    const templatePub = ami['Public'];
    const templateAmiName = ami['Name'];
    const templatePlat = ami['PlatformDetails'];

    var newTemplate = new Template(
        templateName,
        templateId,
        templateStatus,
        templatePub,
        templateAmiName,
        templatePlat,
        owner
    );
    return newTemplate;
}

addTemplateButton.addEventListener('mouseenter', function() {
    if(getTheme() == "Dark") {
        addTemplateButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        addTemplateButton.style.backgroundColor = Colors.textSecondary();
    }
});

addTemplateButton.addEventListener('mouseleave', function() {
    if(getTheme() == "Dark") {
        addTemplateButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        addTemplateButton.style.backgroundColor = Colors.textPrimary();
    }
});

addTemplateButton.addEventListener('click', function() {
    const newAmiId = amiIdTextBox.value.trim();

    // Ensures the AMI ID is not already in the user's list
    const cachedAmiIds = getCacheValue("templates-" + getRegion());
    if(cachedAmiIds != "ERROR") {
        console.log(cachedAmiIds);

        for(var cacheIndex = 0; cacheIndex < cachedAmiIds.length; cacheIndex++) {
            if(cachedAmiIds[cacheIndex] == newAmiId) {
                // User already has it 
                newPopup("Error", "You already have this Template in your Template library.", "Close");
                //window.close();
                return;
            }
        }
    }
    // If that passes Checks if the AMI ID is valid
    getAmiData([newAmiId]).then(function(results) {
        console.log(results);
        if(results != "ERROR" && results != false) {
            if('Images' in results) {
                // Good, this is a valid AMI ID
                newPopup("Success", "Template successfully added.", "Close");
                cachedAmiIds.push(newAmiId);
                updateCache("templates-" + getRegion(), cachedAmiIds);
                window.close();
            } else {
                // Error
                newPopup("Error", "Error adding Template. Your network connection may be weak, or the AMI ID is potentially invalid. " +
                "Please ensure the Template is hosted in this region.", "Close");
            }
        } else {
            // Error
            newPopup("Error", "Error adding Template. Your network connection may be weak, or the AMI ID is potentially invalid. " + 
            "Please ensure the Template is hosted in this region.", "Close");
        }
    });
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