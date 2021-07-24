// Supplemental functions
const { Colors, getTheme, setPopupValues } = require('../mercor.js');
const {
    Template, getUserAMIs, getDefaultVpcId, getSecurityGroups,
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
/** The button that creates a server, if parameters are valid, when clicked. */
var createServerButton = document.getElementById('createServerButton');
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
        createServerButton.style.backgroundColor = Colors.backgroundSecondary();
        createServerButton.style.color = Colors.backgroundPrimary();
        cancelButton.style.backgroundColor = Colors.backgroundPrimary();
        cancelButton.style.color = Colors.backgroundSecondary();
        cancelButton.style.borderColor = Colors.backgroundSecondary();
    } else {
        titleBox.style.color = Colors.textPrimary();
        createServerButton.style.backgroundColor = Colors.textPrimary();
        createServerButton.style.color = Colors.backgroundPrimary();
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
 * Resets the elements of the window to their default values.
 */
function resetElements() {
    nameTextBox.value = "";
    
    // Clears the Templates and CPUs of any list items, then retrieves the
    // user's Templates and available CPUs
    templateSelect.innerHTML = '';
    loadTemplates();

    templateSelect.style.setProperty('--rows', templates.length);

    for(var index = 0; index < templates.length; index++) {
        addTemplateToList((templates[index].name == "") ? templates[index].amiName : templates[index].name, templates[index].id, index);
    }

    cpuSelect.innerHTML = '';
    cpuSelect.style.setProperty('--rows', 5);

    for(var index = 0; index < 5; index++) {
        addCpuToList("CPU " + index, index);
    }

    updateColors();
}

/**
 * Creates a new Template option and adds it to the list of available Templates.
 * @param {string} name The name of the Template.
 * @param {string} amiId The ID of the AMI/Template.
 * @param {number} index The index of the Template in the list.
 */
function addTemplateToList(name, amiId, index) {
    var newTemplateOption = document.createElement('button');
    newTemplateOption.className = "templateOption";
    newTemplateOption.id = amiId;
    newTemplateOption.style.setProperty('--row', index + 1);

    var newTemplateButtonSelect = document.createElement('div');
    newTemplateButtonSelect.className = "templateButtonSelect";
    newTemplateOption.appendChild(newTemplateButtonSelect);

    var newTemplateNameLabel = document.createElement('div');
    newTemplateNameLabel.className = "templateNameLabel";
    newTemplateNameLabel.textContent = name;
    newTemplateOption.appendChild(newTemplateNameLabel);

    newTemplateOption.addEventListener('click', function() {
        // Resets colors of all other options
        var templateButtonSelects = document.getElementsByClassName("templateButtonSelect");
        for(var index = 0; index < templateButtonSelects.length; index++) {
            templateButtonSelects[index].style.backgroundColor = Colors.textTertiary();
        }
        // Highlights selected option
        newTemplateButtonSelect.style.backgroundColor = "#333333";
    });

    templateSelect.appendChild(newTemplateOption);
}

/**
 * Creates a new CPU option and adds it to the list of available CPUs.
 * @param {string} name The name of the CPU.
 * @param {number} index The index of the CPU in the list.
 */
function addCpuToList(name, index) {
    var newCpuOption = document.createElement('button');
    newCpuOption.className = "cpuOption";
    newCpuOption.id = name;
    newCpuOption.style.setProperty('--row', index + 1);

    var newCpuButtonSelect = document.createElement('div');
    newCpuButtonSelect.className = "cpuButtonSelect";
    newCpuOption.appendChild(newCpuButtonSelect);

    var newCpuNameLabel = document.createElement('div');
    newCpuNameLabel.className = "cpuNameLabel";
    newCpuNameLabel.textContent = name;
    newCpuOption.appendChild(newCpuNameLabel);

    newCpuOption.addEventListener('click', function() {
        // Resets colors of all other options
        var cpuButtonSelects = document.getElementsByClassName("cpuButtonSelect");
        for(var index = 0; index < cpuButtonSelects.length; index++) {
            cpuButtonSelects[index].style.backgroundColor = Colors.textTertiary();
        }
        // Highlights selected option
        newCpuButtonSelect.style.backgroundColor = "#333333";
    });

    cpuSelect.appendChild(newCpuOption);
}

/**
 * Loads 'templates' with a list of Templates that the user has in their Template library.
 */
function loadTemplates() {
    const results = getUserAMIs();
    console.log(results);
    templates = [];
    if(results != "ERROR") {
        // create list of templates
        if('Images' in results) {
            for(var index = 0; index < results['Images'].length; index++) {
                const ami = results['Images'][index];

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
                const templatePlat = ami['Platform'];

                var newTemplate = new Template(
                    templateName,
                    templateId,
                    templateStatus,
                    templatePub,
                    templateAmiName,
                    templatePlat
                );

                templates.push(newTemplate);
            }
        } else {
            // Error
        }
    } else {
        // Error
    }
}

/**
 * @returns A list of CPUs that the user can use for that region.
 */
function getCpus() {
    
}

// --------------------------- Server Creating Functions ------------------------ //

/**
 * Creates a server based on the specified parameters.
 * @param {string} name The name of the server.
 * @param {string} ami The AMI ID to base the server on.
 * @param {string} cpu The CPU type.
 */
 async function newServer(name, ami, cpu) {
    // Gets region's default VPC
    getDefaultVpcId().then(function(vpcId) {
        if(vpcId != "ERROR") {
            getSecurityGroups().then(function(secGroups) {
                if(secGroups[0] != "ERROR") {
                    // Checks if Mercor security group exists in the region
                    var secGroupId = getMercorSecurityGroupId(secGroups);
                    if(secGroupId != "NONE") {
                        // Continue as is
                        createKeyPair().then(function(key) {
                            if(key != "ERROR") {
                                createInstance(ami,cpu,name,key,secGroupId).then(function(instanceId) {
                                    // done
                                    newPopup("", "Server successfully created.", "Close");
                                    window.close();
                                    return true;
                                });
                            } else {
                                // Error
                                newPopup("Error", "Error creating key pair.", "Close");
                                window.close();
                                return false;
                            }
                        });
                    } else {
                        // If not, creates one
                        createMercorSecurityGroup(vpcId).then(function(newId) {
                            secGroupId = newId;
                            if(secGroupId != "ERROR") {
                                // Continue
                                createKeyPair().then(function(key) {
                                    if(key != "ERROR") {
                                        createInstance(ami,cpu,name,key,secGroupId).then(function(instanceId) {
                                            // done
                                            if(instanceId != "ERROR") {
                                                newPopup("", "Successfully created server.", "Close");
                                                window.close();
                                                return true;
                                            } else {
                                                newPopup("Error", "Error creating server. Template is potentially invalid.", "Close");
                                                window.close();
                                                return true;
                                            }
                                        });
                                    } else {
                                        // Error
                                        newPopup("Error", "Error creating key pair.", "Close");
                                        window.close();
                                        return false;
                                    }
                                });
                            } else {
                                // Error
                                newPopup("Error", "Error creating security group.", "Close");
                                window.close();
                                return false;
                            }
                        });
                    }
                } 
            });
        } else {
            // Error
            newPopup("Error", "Error retrieving VPC ID.", "Close");
            window.close();
            return false;
        }
    });
}

createServerButton.addEventListener('mouseenter', function() {
    if(getTheme() == "Dark") {
        createServerButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    } else {
        createServerButton.style.backgroundColor = Colors.textSecondary();
    }
});

createServerButton.addEventListener('mouseleave', function() {
    if(getTheme() == "Dark") {
        createServerButton.style.backgroundColor = Colors.backgroundSecondary();
    } else {
        createServerButton.style.backgroundColor = Colors.textPrimary();
    }
});

createServerButton.addEventListener('click', function() {
    // Create server
    newServer(nameTextBox.value, "ami-054dc1c0a4617b048", "t2.micro");
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