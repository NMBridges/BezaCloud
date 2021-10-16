// Supplemental functions
const { 
    Colors, createRdpFile, openRdpFile, setPopupValues,
    getPopupValues, awsDir, getRegion, updateCache,
    getCacheValue, getTheme
} = parent.require("../seros.js");
const {
    Template, ApiCaller
} = parent.require("../apiCaller.js");
const { exec, execSync } = parent.require('child_process');
const homeDir = parent.require('os').homedir();

// Document elements
var topBar = document.getElementById("topBar");
var mainPageLabel = document.getElementById("mainPageLabel");
var regionLabel = document.getElementById("regionLabel");
var refreshButton = document.getElementById("refreshButton");
var newTemplateButton = document.getElementById("newTemplateButton");
var primaryBody = document.getElementById("primaryBody");
var overlay = document.getElementById("overlay");
var loader = document.getElementById("loader");

/**
 * @type {Template[]} The servers belonging to the currently loaded region.
 */
var templates = [];

/** Boolean that describes whether or not the page is loading Templates. */
var loadingTemplates = false;

window.onload = function() {
    updateColors();
    loadTemplates();


};

// ---------------------------- Template Loading Functions -------------------------- //

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
    const templateAmiName = (ami['Name'] == null || ami['Name'] == "") ? "[Not Named]" : ami['Name'];
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
 * Pulls all AWS AMIs from the user's account in the given region.
 */
function loadTemplates() {
    if(!loadingTemplates) {
        loadingTemplates = true;
        ApiCaller.getUserAMIs().then(function(results) {
            console.log(results);
            templates = [];
            // Gets the list of the user's AMIs
            if(results != "ERROR" && results != false) {
                // create list of templates
                if('Images' in results) {
                    for(var index = 0; index < results['Images'].length; index++) {
                        templates.push(createTemplateObject(results['Images'][index], "self"));
                    }
                } else {
                    // Error
                }
            } else {
                // Error
            }
        
            console.log(templates);
            
            // Gets data for the other cached AMIs
            const cachedAmiIds = getCacheValue("templates-" + getRegion());
            if(cachedAmiIds != "ERROR") {
                console.log(cachedAmiIds);

                var newTemplatesToPull = [];

                // Compares AMI IDs of cached Templates with those of the account
                // to ensure that no Templates are duplicates.
                for(var cacheIndex = 0; cacheIndex < cachedAmiIds.length; cacheIndex++) {
                    if(templates.length == 0) {
                        newTemplatesToPull.push(cachedAmiIds[cacheIndex]);
                    } else {
                        for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                            if(templates[templateIndex].id == cachedAmiIds[cacheIndex]) {
                                break;
                            } else if(templateIndex == templates.length - 1) {
                                newTemplatesToPull.push(cachedAmiIds[cacheIndex]);
                            }
                        }
                    }
                }

                const serosStarterAmis = {
                    "us-east-1":"ami-054dc1c0a4617b048",
                    "us-east-2":"ami-099169caa4ac62e3f",
                    "us-west-1":"ami-0d17b334f19846f71",
                    "us-west-2":"ami-01c0f1391ef4b74f9"
                };

                const serosStarterAmi = serosStarterAmis[getRegion()];

                // Adds the default seros-starter Template if it doesn't already exist.
                for(var templateIndex = -1; templateIndex < templates.length; templateIndex++) {

                    if(templateIndex == templates.length - 1) {
                        if(templateIndex != -1 && templates[templateIndex].id == serosStarterAmi) {
                            break;
                        } else if(!newTemplatesToPull.includes(serosStarterAmi)) {
                            newTemplatesToPull.push(serosStarterAmi);
                        }
                    }
                }

                if(newTemplatesToPull.length > 0) {
                    // Get AMI data about the AMI IDs
                    ApiCaller.getAmiData(newTemplatesToPull).then(function(results) {
                        console.log(results);
                        if(results != "ERROR" && results != false) {
                            // create list of templates
                            if('Images' in results) {
                                for(var index = 0; index < results['Images'].length; index++) {
                                    templates.push(createTemplateObject(results['Images'][index], "other"));
                                }
                            } else {
                                // Error
                            }
                        } else {
                            // Error
                        }

                        // Stores templates AMI IDs in Cache
                        var templateIds = [];
                        for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                            templateIds.push(templates[templateIndex].id);
                        }
                        updateCache("templates-" + getRegion(), templateIds);
                    
                        // Clears old Template tiles, resets region label
                        const regionDict = {
                            "us-east-1": "N. Virginia",
                            "us-east-2": "Ohio",
                            "us-west-1": "N. California",
                            "us-west-2": "Oregon"
                        };
                        regionLabel.textContent = regionDict[getRegion()];
                    
                        // Adds new tiles
                        primaryBody.innerHTML = '';
                        for(var counter = 0; counter < templates.length; counter++) {
                            addTile(counter);
                        }
                    
                        updateColors();
                        displayOverlay(false);
                        loadingTemplates = false;
                    });
                } else {
                    // Stores templates AMI IDs in Cache
                    var templateIds = [];
                    for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                        templateIds.push(templates[templateIndex].id);
                    }
                    updateCache("templates-" + getRegion(), templateIds);
                
                    // Clears old Template tiles, resets region label
                    const regionDict = {
                        "us-east-1": "N. Virginia",
                        "us-east-2": "Ohio",
                        "us-west-1": "N. California",
                        "us-west-2": "Oregon"
                    };
                    regionLabel.textContent = regionDict[getRegion()];
                
                    // Adds new tiles
                    primaryBody.innerHTML = '';
                    for(var counter = 0; counter < templates.length; counter++) {
                        addTile(counter);
                    }
                
                    updateColors();
                    displayOverlay(false);
                    loadingTemplates = false;
                }
            } else {
                // Stores templates AMI IDs in Cache
                var templateIds = [];
                for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                    templateIds.push(templates[templateIndex].id);
                }
                updateCache("templates-" + getRegion(), templateIds);
            
                // Clears old Template tiles, resets region label
                const regionDict = {
                    "us-east-1": "N. Virginia",
                    "us-east-2": "Ohio",
                    "us-west-1": "N. California",
                    "us-west-2": "Oregon"
                };
                regionLabel.textContent = regionDict[getRegion()];
            
                // Adds new tiles
                primaryBody.innerHTML = '';
                for(var counter = 0; counter < templates.length; counter++) {
                    addTile(counter);
                }
            
                updateColors();
                displayOverlay(false);
                loadingTemplates = false;
            }
        });
    }
}

/**
 * Adds a tile to the background with the appropriate template details.
 * @param {number} index The index of the template in 'templates' to add.
 */
function addTile(index) {
    const template = templates[index];
    // The main tile block.
    var newTile = document.createElement('div');
    newTile.className = "tile";

    // The Template name descriptor element.
    var newName = document.createElement('div');
    newName.className = "templateName";
    newName.textContent = template.amiName;
    newTile.appendChild(newName);

    // The server IP address descriptor element.
    if(template.name != "") {
        var newTagName = document.createElement('div');
        newTagName.className = "templateTagName";
        newTagName.textContent = "Given Name: " + template.name;
        newTile.appendChild(newTagName);
    }

    // The Template AMI ID descriptor element.
    var newId = document.createElement('div');
    newId.className = "templateId";
    newId.textContent = "ID: " + template.id;
    newTile.appendChild(newId);

    // The Template status icon.
    var newStatus = document.createElement('div');
    newStatus.className = "statusIcon";
    var newStatusLabel = document.createElement('div');
    newStatusLabel.className = "statusPopup";
    newStatusLabel.textContent = template.status;
    newStatus.appendChild(newStatusLabel);
    newTile.appendChild(newStatus);

    // The Template visibility label element.
    var newPlatformLabel = document.createElement('div');
    newPlatformLabel.className = "platformLabel";
    newPlatformLabel.textContent = "Platform";
    newTile.appendChild(newPlatformLabel);

    // The Template visibility descriptor element.
    var newTemplateVisibility = document.createElement('div');
    newTemplateVisibility.className = "templatePlatform";
    newTemplateVisibility.textContent = template.plat;
    newTile.appendChild(newTemplateVisibility);

    // The modify Template button.
    var newModifyButton = document.createElement('button');
    newModifyButton.className = "modifyButton";
    newModifyButton.textContent = "Modify";
    newModifyButton.addEventListener('mouseenter', function() {
        // If button is active, proceed.
        if(newModifyButton.value == "active") {
            newModifyButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newModifyButton.addEventListener('mouseleave', function() {
        newModifyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newTile.appendChild(newModifyButton);

    // The popup area that contains the modification buttons.
    var newModifyArea = document.createElement('div');
    newModifyArea.className = "modifyArea";
    newModifyArea.hidden = true;
    newModifyButton.addEventListener('click', function() {
        newModifyArea.focus();
        if(newModifyButton.value == "active") {
            newModifyArea.hidden = !newModifyArea.hidden;
        }
    });

    // The toggle visibility button.
    var newVisibilityButton = document.createElement('div');
    newVisibilityButton.className = "visibilityButton";
    newVisibilityButton.textContent = "Make Public";
    if(template.pub) {
        newVisibilityButton.textContent = "Make Private";
    }
    newVisibilityButton.id = "" + index;
    newVisibilityButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newVisibilityButton.value == "active") {
            newVisibilityButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newVisibilityButton.addEventListener('mouseleave', function() {
        newVisibilityButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newVisibilityButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newVisibilityButton.value == "active") {
            if(template.pub) {
                // Make the server private.
                displayOverlay(true);

                ApiCaller.changeAmiVisibility(templates[parseInt(newVisibilityButton.id)].id, false).then(function(result) {
                    if(result == "ERROR") {
                        console.log("ERROR");
                    }
                    loadTemplates();
                });
            } else {
                // Make the server public.
                displayOverlay(true);
                
                ApiCaller.changeAmiVisibility(templates[parseInt(newVisibilityButton.id)].id, true).then(function(result) {
                    if(result == "ERROR") {
                        console.log("ERROR");
                    }
                    loadTemplates();
                });
            }
        }
    });
    newModifyArea.appendChild(newVisibilityButton);

    // The toggle visibility button.
    var newCopyButton = document.createElement('div');
    newCopyButton.className = "copyButton";
    newCopyButton.textContent = "Copy to Different Region";
    newCopyButton.id = "" + index;
    newCopyButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newCopyButton.value == "active") {
            newCopyButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newCopyButton.addEventListener('mouseleave', function() {
        newCopyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newCopyButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newCopyButton.value == "active") {
            // Copy the Template to another region
            updateCache('copyTemplate', [templates[parseInt(newCopyButton.id)].id, templates[parseInt(newCopyButton.id)].amiName]);
            const remote = parent.require('electron').remote;
            let w = remote.getCurrentWindow();
            w.emit('newCopyTemplate');
            /*ApiCaller.copyImage(templates[parseInt(newCopyButton.id)].id, templates[parseInt(newCopyButton.id)].amiName, "us-east-2").then(function() {
                loadTemplates();
            });*/
        }
    });
    newModifyArea.appendChild(newCopyButton);
    
    // The permadelete Template button.
    var newTerminateButton = document.createElement('div');
    newTerminateButton.className = "terminateButton";
    if(template.owner == "self") {
        newTerminateButton.textContent = "Permadelete";
    } else {
        newTerminateButton.textContent = "Remove from My Templates"
    }
    newTerminateButton.id = "" + index;
    newTerminateButton.addEventListener('mouseenter', function() {
        // If the button is active, proceed.
        if(newTerminateButton.value == "active") {
            newTerminateButton.style.backgroundColor = Colors.backgroundPrimary();
        }
    });
    newTerminateButton.addEventListener('mouseleave', function() {
        newTerminateButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    newTerminateButton.addEventListener('click', function() {
        // If the button is active, proceed.
        if(newTerminateButton.value == "active") {
            if(templates[parseInt(newTerminateButton.id)].owner == "self") {
                // Terminate Template.
                displayOverlay(true);
                ApiCaller.deleteImage(templates[parseInt(newTerminateButton.id)].id).then(function() {
                    loadTemplates();
                });
            } else {
                // Removes that template from the user's My Templates
                templates.pop(parseInt(newTerminateButton.id));
                
                // Stores templates AMI IDs in Cache
                var templateIds = [];
                for(var templateIndex = 0; templateIndex < templates.length; templateIndex++) {
                    templateIds.push(templates[templateIndex].id);
                }
                
                // Updates the template ID cache
                updateCache("templates-" + getRegion(), templateIds);

                // Reload
                displayOverlay(true);
                loadTemplates();
            }
        }
    });
    newModifyArea.appendChild(newTerminateButton);


    newVisibilityButton.value = "inactive";
    newCopyButton.value = "inactive";
    newTerminateButton.value = "inactive";
    newModifyButton.value = "inactive";
    if(template.status == "available") {
        if(template.owner == "self") {
            newVisibilityButton.value = "active";
            newCopyButton.value = "active";
        }
        newTerminateButton.value = "active";
        newModifyButton.value = "active";
    }

    newTile.appendChild(newModifyArea);
    primaryBody.appendChild(newTile);
}

// ---------------------------------------------------------------------------------- //

// ---------------------------- refreshButton functions ----------------------------- //

refreshButton.addEventListener('click', function() {
    displayOverlay(true);
    loadTemplates();
});

refreshButton.addEventListener('mouseenter', function() {
    refreshButton.style.backgroundColor = Colors.backgroundPrimary();
});

refreshButton.addEventListener('mouseleave', function() {
    refreshButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

// ---------------------------------------------------------------------------------- //

// --------------------------- newTemplateButton functions -------------------------- //

newTemplateButton.addEventListener('click', function() {
    const remote = parent.require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('newTemplate');
});

newTemplateButton.addEventListener('mouseenter', function() {
    newTemplateButton.style.backgroundColor = Colors.backgroundPrimary();
});

newTemplateButton.addEventListener('mouseleave', function() {
    newTemplateButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

// ---------------------------------------------------------------------------------- //

// ----------------------------- miscellaneous functions ---------------------------- //

/**
 * Turns the overlay on or off.
 * @param {boolean} to Boolean representing turning the overlay on (true) or off (false)
 */
 function displayOverlay(to) {
    if(to) {
        overlay.style.display = "block";
        loader.style.display = "block";
    } else {
        overlay.style.display = "none";
        loader.style.display = "none";
    }
    const contenta = overlay.innerHTML;
    overlay.innerHTML = contenta;
    overlay.focus();
}

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

// ---------------------------------------------------------------------------------- //

/**
 * Updates the page elements' colors in accordance to the color theme.
 */
function updateColors() {
    // The top of the page
    topBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
    mainPageLabel.style.color = Colors.textPrimary();
    regionLabel.style.color = Colors.textSecondary();
    refreshButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    newTemplateButton.style.backgroundColor = Colors.backgroundPrimaryAccent();

    // The main body / server tiles.
    {
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();

        var tiles = document.getElementsByClassName("tile");
        for(var count = 0; count < tiles.length; count++) {
            tiles[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            tiles[count].style.borderColor = Colors.textSecondary();
        }

        var modifyButtons = document.getElementsByClassName("modifyButton");
        for(var count = 0; count < modifyButtons.length; count++) {
            modifyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if server is fully running or stopped.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                modifyButtons[count].style.color = Colors.textPrimary();
                modifyButtons[count].style.borderColor = Colors.textPrimary();
            } else {
                modifyButtons[count].style.color = Colors.textTertiary();
                modifyButtons[count].style.borderColor = Colors.textTertiary();
            }
        }

        var templateNames = document.getElementsByClassName("templateName");
        for(var count = 0; count < templateNames.length; count++) {
            templateNames[count].style.color = Colors.textPrimary();
        }

        var statusIcons = document.getElementsByClassName("statusIcon");
        for(var count = 0; count < statusIcons.length; count++) {
            // Adjusts the color depending on the server's status.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                statusIcons[count].style.backgroundColor = "#33cc33";
            } else if(state == "shutting-down" || state == "pending" || state == "stopping") {
                statusIcons[count].style.backgroundColor = "#cccc33";
            } else {
                statusIcons[count].style.backgroundColor = "#cc3333";
            }
            statusIcons[count].children[0].style.color = Colors.textSecondary();
        }
        
        var templateIds = document.getElementsByClassName("templateId");
        for(var count = 0; count < templateIds.length; count++) {
            templateIds[count].style.color = Colors.textSecondary();
        }
        
        var templateTagNames = document.getElementsByClassName("templateTagName");
        for(var count = 0; count < templateTagNames.length; count++) {
            templateTagNames[count].style.color = Colors.textSecondary();
        }

        var platformLabels = document.getElementsByClassName("platformLabel");
        for(var count = 0; count < platformLabels.length; count++) {
            platformLabels[count].style.color = Colors.textPrimary();
        }
        
        var templatePlatforms = document.getElementsByClassName("templatePlatform");
        for(var count = 0; count < templatePlatforms.length; count++) {
            templatePlatforms[count].style.color = Colors.textSecondary();
        }

        var modifyAreas = document.getElementsByClassName("modifyArea");
        for(var count = 0; count < modifyAreas.length; count++) {
            modifyAreas[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            modifyAreas[count].style.borderColor = Colors.textSecondary();
        }

        var visibilityButtons = document.getElementsByClassName("visibilityButton");
        for(var count = 0; count < visibilityButtons.length; count++) {
            visibilityButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available" && templates[count].owner == "self") {
                visibilityButtons[count].style.color = Colors.textPrimary();
            } else {
                visibilityButtons[count].style.color = Colors.textTertiary();
            }
        }

        var copyButtons = document.getElementsByClassName("copyButton");
        for(var count = 0; count < copyButtons.length; count++) {
            copyButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available" && templates[count].owner == "self") {
                copyButtons[count].style.color = Colors.textPrimary();
            } else {
                copyButtons[count].style.color = Colors.textTertiary();
            }
        }

        var terminateButtons = document.getElementsByClassName("terminateButton");
        for(var count = 0; count < terminateButtons.length; count++) {
            terminateButtons[count].style.backgroundColor = Colors.backgroundPrimaryAccent();
            // Enable if the Template is available and owned by the user.
            const state = templates[count].status.toLowerCase();
            if(state == "available") {
                terminateButtons[count].style.color = "#cc3333";
            } else {
                terminateButtons[count].style.color = "#882222";
            }
        }

        if(getTheme() == "Seros") {
            newTemplateButton.children[0].src = "../assets/Plus-White.png";
            refreshButton.children[0].src = "../assets/Refresh-White.png";
        } else {
            newTemplateButton.children[0].src = "../assets/Plus-White.png";
            refreshButton.children[0].src = "../assets/Refresh-White.png";
        }
    }
}