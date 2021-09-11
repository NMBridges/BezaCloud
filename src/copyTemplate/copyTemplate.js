// Supplemental functions
const {
    Colors, getTheme, setPopupValues, getCacheValue,
    updateCache, getRegion
} = require('../mercor.js');
const {
    Template, getAmiData, copyImage
} = require('../apiCaller.js');

// Page element references
/** The main divider box that divides the page into sections. */
var dividerBox = document.getElementById('dividerBox');
/** The first section; contains the title. */
var titleBox = document.getElementById('titleBox');
/** The box representing the N. Virginia region */
var usEast1Box = document.getElementById('usEast1Box');
/** The box representing the Ohio region */
var usEast2Box = document.getElementById('usEast2Box');
/** The box representing the N. Virginia region */
var usWest1Box = document.getElementById('usWest1Box');
/** The box representing the N. Virginia region */
var usWest2Box = document.getElementById('usWest2Box');
/** The button representing the N. Virginia region */
var usEast1Button = document.getElementById('usEast1Button');
/** The button representing the Ohio region */
var usEast2Button = document.getElementById('usEast2Button');
/** The button representing the N. Virginia region */
var usWest1Button = document.getElementById('usWest1Button');
/** The button representing the N. Virginia region */
var usWest2Button = document.getElementById('usWest2Button');
/** The button that copies a Template, if parameters are valid, when clicked. */
var copyButton = document.getElementById('copyButton');
/** The button that closes the window and cancels the operation when clicked. */
var cancelButton = document.getElementById('cancelButton');

/** The ID of the AMI to copy */
var amiIdToCopy = '';
/** The name of the AMI to copy */
var amiNameToCopy = '';

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
        copyButton.style.backgroundColor = Colors.backgroundSecondary();
        copyButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        copyButton.style.backgroundColor = Colors.textPrimary();
        copyButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.textPrimary();
        cancelButton.style.borderColor = Colors.textPrimary();
    }

    var regionButtons = document.getElementsByClassName('regionButton');
    var regionLabels = document.getElementsByClassName('regionLabel');
    var regionDivs = document.getElementsByClassName('regionDiv');
    for(var index = 0; index < regionButtons.length; index++) {
        const reg = getRegion();
        
        // Region Button
        regionButtons[index].style.backgroundColor = Colors.textSecondary();
        regionButtons[index].style.borderColor = Colors.textTertiary();
        if((index == 0 && reg == "us-east-1") || (index == 1 && reg == "us-east-2") ||
            (index == 2 && reg == "us-west-1") || (index == 3 && reg == "us-west-2") ) {
            regionButtons[index].style.borderColor = "#555555";
            regionButtons[index].style.backgroundColor = "#555555";
        }

        // Region Labels
        regionLabels[index].style.color = Colors.textPrimary();
        if((index == 0 && reg == "us-east-1") || (index == 1 && reg == "us-east-2") ||
            (index == 2 && reg == "us-west-1") || (index == 3 && reg == "us-west-2") ) {
            regionLabels[index].style.color = Colors.textTertiary();
        }

        // Region Div
        if(index % 2 == 0) {
            regionDivs[index].style.backgroundColor = Colors.backgroundPrimaryDoubleAccent();
        } else {
            regionDivs[index].style.backgroundColor = Colors.backgroundPrimaryAccent();
        }
    }

    

}

/**
 * Resets the elements of the window to their default values.
 */
function resetElements() {
    const cacheVal = getCacheValue('copyTemplate');
    amiIdToCopy = cacheVal[0];
    amiNameToCopy = cacheVal[1];
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

copyButton.addEventListener('mouseenter', function() {
    if(getTheme() == "Dark") {
        copyButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        copyButton.style.backgroundColor = Colors.textSecondary();
    }
});

copyButton.addEventListener('mouseleave', function() {
    if(getTheme() == "Dark") {
        copyButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        copyButton.style.backgroundColor = Colors.textPrimary();
    }
});

copyButton.addEventListener('click', function() {
    if(copyButton.value == "selected") { return; }
    copyButton.style.backgroundColor = "#555555";
    copyButton.value = "selected";
    var toRegions = [];
    
    if(usEast1Button.value == "selected") {
        toRegions.push("us-east-1");
    }
    if(usEast2Button.value == "selected") {
        toRegions.push("us-east-2");
    }
    if(usWest1Button.value == "selected") {
        toRegions.push("us-west-1");
    }
    if(usWest2Button.value == "selected") {
        toRegions.push("us-west-2");
    }
    
    if(toRegions.length > 0) {
        var counter = 0;
        for(var index = 0; index < toRegions.length; index++) {
            const reg = toRegions[index];
            copyImage(amiIdToCopy, amiNameToCopy, reg).then(function(result) {
                const regionDict = {
                    "us-east-1": "N. Virginia",
                    "us-east-2": "Ohio",
                    "us-west-1": "N. California",
                    "us-west-2": "Oregon"
                };
                if(result != "ERROR") {
                    newPopup("", "Successfully copied image to " + regionDict[reg] + " region.", "Close");
                } else {
                    newPopup("Error", "Error copying image to " + regionDict[reg] + " region.", "Close");
                }
                counter++;
                if(counter == toRegions.length) {
                    copyButton.value = "";
                    window.close();
                }
            });
        }
    } else {        
        copyButton.value = "";
    }
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

// -------------------------  regionButton functions ---------------------------- //

usEast1Box.addEventListener('mouseenter', function() {
    if(usEast1Button.value != "selected" && getRegion() != "us-east-1") {
        usEast1Button.style.backgroundColor = "#888888";
    }
});

usEast1Box.addEventListener('mouseleave', function() {
    if(usEast1Button.value != "selected" && getRegion() != "us-east-1") {
        usEast1Button.style.backgroundColor = Colors.textSecondary();
    }
});

usEast1Box.addEventListener('click', function() {
    if(usEast1Button.value != "selected" && getRegion() != "us-east-1") {
        usEast1Button.style.backgroundColor = "#555555";
        usEast1Button.value = "selected";
    } else if(getRegion() != "us-east-1") {
        usEast1Button.style.backgroundColor = "#888888";
        usEast1Button.value = "";
    }
});

usEast2Box.addEventListener('mouseenter', function() {
    if(usEast2Button.value != "selected" && getRegion() != "us-east-2") {
        usEast2Button.style.backgroundColor = "#888888";
    }
});

usEast2Box.addEventListener('mouseleave', function() {
    if(usEast2Button.value != "selected" && getRegion() != "us-east-2") {
        usEast2Button.style.backgroundColor = Colors.textSecondary();
    }
});

usEast2Box.addEventListener('click', function() {
    if(usEast2Button.value != "selected" && getRegion() != "us-east-2") {
        usEast2Button.style.backgroundColor = "#555555";
        usEast2Button.value = "selected";
    } else if(getRegion() != "us-east-2") {
        usEast2Button.style.backgroundColor = "#888888";
        usEast2Button.value = "";
    }
});

usWest1Box.addEventListener('mouseenter', function() {
    if(usWest1Button.value != "selected" && getRegion() != "us-west-1") {
        usWest1Button.style.backgroundColor = "#888888";
    }
});

usWest1Box.addEventListener('mouseleave', function() {
    if(usWest1Button.value != "selected" && getRegion() != "us-west-1") {
        usWest1Button.style.backgroundColor = Colors.textSecondary();
    }
});

usWest1Box.addEventListener('click', function() {
    if(usWest1Button.value != "selected" && getRegion() != "us-west-1") {
        usWest1Button.style.backgroundColor = "#555555";
        usWest1Button.value = "selected";
    } else if(getRegion() != "us-west-1") {
        usWest1Button.style.backgroundColor = "#888888";
        usWest1Button.value = "";
    }
});

usWest2Box.addEventListener('mouseenter', function() {
    if(usWest2Button.value != "selected" && getRegion() != "us-west-2") {
        usWest2Button.style.backgroundColor = "#888888";
    }
});

usWest2Box.addEventListener('mouseleave', function() {
    if(usWest2Button.value != "selected" && getRegion() != "us-west-2") {
        usWest2Button.style.backgroundColor = Colors.textSecondary();
    }
});

usWest2Box.addEventListener('click', function() {
    if(usWest2Button.value != "selected" && getRegion() != "us-west-2") {
        usWest2Button.style.backgroundColor = "#555555";
        usWest2Button.value = "selected";
    } else if(getRegion() != "us-west-2") {
        usWest2Button.style.backgroundColor = "#888888";
        usWest2Button.value = "";
    }
});

// ------------------------------------------------------------------------------ //