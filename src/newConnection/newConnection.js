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
/** The label that describes the name text box. */
var nameLabel = document.getElementById('nameLabel');
/** The name text box/field. */
var nameTextBox = document.getElementById('nameTextBox');
/** The label that describes the Template selection field. */
var templateLabel = document.getElementById('templateLabel');
/** The Template selection field bounding box. */
var templateSelect = document.getElementById('templateSelect');
/** The label that describes the CPU selection field. */
var cpuLabel = document.getElementById('cpuLabel');
/** The CPU selection field bounding box. */
var cpuSelect = document.getElementById('cpuSelect');
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
    } else {
        titleBox.style.color = Colors.textPrimary();
        connectButton.style.backgroundColor = Colors.textPrimary();
        connectButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
    }

    nameLabel.style.color = Colors.textSecondary();
    templateLabel.style.color = Colors.textSecondary();
    cpuLabel.style.color = Colors.textSecondary();
    
    templateSelect.style.backgroundColor = Colors.backgroundPrimaryAccent();
    cpuSelect.style.backgroundColor = Colors.backgroundPrimaryAccent();

    var templateOptions = document.getElementsByClassName("templateOption");
    for(var index = templateOptions.length - 1; index >= 0; index--) {
        if((templateOptions.length - 1 - index) % 2 == 0) {
            templateOptions[index].style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
        } else {
            templateOptions[index].style.backgroundColor = Colors.backgroundPrimaryAccent();}
    }

    var cpuOptions = document.getElementsByClassName("cpuOption");
    for(var index = cpuOptions.length - 1; index >= 0; index--) {
        if((cpuOptions.length - 1 - index) % 2 == 0) {
            cpuOptions[index].style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
        } else {
            cpuOptions[index].style.backgroundColor = Colors.backgroundPrimaryAccent();}
    }

    var templateNameLabels = document.getElementsByClassName("templateNameLabel");
    for(var index = 0; index < templateNameLabels.length; index++) {
        templateNameLabels[index].style.color = Colors.textTertiary();
    }

    var templateButtonSelects = document.getElementsByClassName("templateButtonSelect");
    for(var index = 0; index < templateButtonSelects.length; index++) {
        templateButtonSelects[index].style.backgroundColor = Colors.textTertiary();
        templateButtonSelects[index].style.borderColor = Colors.textTertiary();
    }

    var cpuNameLabels = document.getElementsByClassName("cpuNameLabel");
    for(var index = 0; index < cpuNameLabels.length; index++) {
        cpuNameLabels[index].style.color = Colors.textTertiary();
    }

    var cpuButtonSelects = document.getElementsByClassName("cpuButtonSelect");
    for(var index = 0; index < cpuButtonSelects.length; index++) {
        cpuButtonSelects[index].style.backgroundColor = Colors.textTertiary();
        cpuButtonSelects[index].style.borderColor = Colors.textTertiary();
    }

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

/**
 * Resets the elements of the window to their default values.
 */
function updateElements() {
    nameTextBox.value = "";
    
    // Clears the Templates and CPUs of any list items, then retrieves the
    // user's Templates and available CPUs
    templateSelect.innerHTML = '';
    loadTemplates();

    cpuSelect.innerHTML = '';
    getCpus();

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