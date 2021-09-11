// Suplemental functions
const { 
    Colors, getTheme, setTheme, setRegion,
    getRegion, updateCache, getCacheValue
} = parent.require("../mercor.js");

// Page elements
var headerBar = document.getElementById('optionsHeaderBar');
var headerBarLabel = document.getElementById('optionsHeaderBarLabel');
var primaryBody = document.getElementById('optionsPrimaryBody');
var regionButton = document.getElementById('regionButton');
var themeButton = document.getElementById('themeButton');
var costButton = document.getElementById('costButton');
var notiButton = document.getElementById('notiButton');
var regionSelect = document.getElementById('regionSelect');
var themeSelect = document.getElementById('themeSelect');
var costSelect = document.getElementById('costSelect');
var notiSelect = document.getElementById('notiSelect');

window.onload = function() {
    initElements();
};

/**
 * Initializes the page elements with their basic functions.
 */
function initElements() {

    // ------------------------  themeButton functions  -------------------------- //

    themeButton.addEventListener('mouseenter', function() {
        themeButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    themeButton.addEventListener('mouseleave', function() {
        themeButton.style.backgroundColor = Colors.backgroundPrimary();
    });
    themeButton.addEventListener('click', function() {
        regionSelect.style.visibility = "hidden";
        if(themeSelect.style.visibility != "visible") {
            themeSelect.style.visibility = "visible";
        } else {
            themeSelect.style.visibility = "hidden";
        }
    });

    // --------------------------------------------------------------------------- //

    // ------------------------  regionButton functions  ------------------------- //

    regionButton.addEventListener('mouseenter', function() {
        regionButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    regionButton.addEventListener('mouseleave', function() {
        regionButton.style.backgroundColor = Colors.backgroundPrimary();
    });
    regionButton.addEventListener('click', function() {
        themeSelect.style.visibility = "hidden";
        if(regionSelect.style.visibility != "visible") {
            regionSelect.style.visibility = "visible";
        } else {
            regionSelect.style.visibility = "hidden";
        }
    });

    // --------------------------------------------------------------------------- //

    // -------------------------  costButton functions  -------------------------- //

    costButton.addEventListener('mouseenter', function() {
        costButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    costButton.addEventListener('mouseleave', function() {
        costButton.style.backgroundColor = Colors.backgroundPrimary();
    });
    costButton.addEventListener('click', function() {
        costSelect.style.visibility = "hidden";
        if(costSelect.style.visibility != "visible") {
            costSelect.style.visibility = "visible";
        } else {
            costSelect.style.visibility = "hidden";
        }
    });

    // --------------------------------------------------------------------------- //

    // -------------------------  notiButton functions  -------------------------- //

    notiButton.addEventListener('mouseenter', function() {
        notiButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    });
    notiButton.addEventListener('mouseleave', function() {
        notiButton.style.backgroundColor = Colors.backgroundPrimary();
    });
    notiButton.addEventListener('click', function() {
        notiSelect.style.visibility = "hidden";
        if(notiSelect.style.visibility != "visible") {
            notiSelect.style.visibility = "visible";
        } else {
            notiSelect.style.visibility = "hidden";
        }
    });

    // --------------------------------------------------------------------------- //

    // ----------------------  themeSelectButton functions  ---------------------- //

    themeSelectButtons = document.getElementsByClassName('themeSelectButton');
    for(var index = 0; index < themeSelectButtons.length; index++) {
        const tsbi = themeSelectButtons[index];
        tsbi.addEventListener('mouseenter', function() {
            tsbi.style.backgroundColor = Colors.backgroundPrimaryAccent();
        });
        tsbi.addEventListener('mouseleave', function() {
            tsbi.style.backgroundColor = Colors.backgroundPrimary();
        });
        tsbi.addEventListener('click', function() {
            // change theme
            updateTheme(tsbi.id);
        });
    }

    // --------------------------------------------------------------------------- //

    // ---------------------  regionSelectButton functions  ---------------------- //

    regionSelectButtons = document.getElementsByClassName('regionSelectButton');
    for(var index = 0; index < regionSelectButtons.length; index++) {
        const rsbi = regionSelectButtons[index];
        rsbi.addEventListener('mouseenter', function() {
            rsbi.style.backgroundColor = Colors.backgroundPrimaryAccent();
        });
        rsbi.addEventListener('mouseleave', function() {
            rsbi.style.backgroundColor = Colors.backgroundPrimary();
        });
        rsbi.addEventListener('click', function() {
            // change region
            updateRegion(rsbi.id);
        });
    }

    // --------------------------------------------------------------------------- //
    
    // ----------------------  costSelectButton functions  ----------------------- //

    costSelectButtons = document.getElementsByClassName('costSelectButton');
    for(var index = 0; index < costSelectButtons.length; index++) {
        const csbi = costSelectButtons[index];
        csbi.addEventListener('mouseenter', function() {
            csbi.style.backgroundColor = Colors.backgroundPrimaryAccent();
        });
        csbi.addEventListener('mouseleave', function() {
            csbi.style.backgroundColor = Colors.backgroundPrimary();
        });
        csbi.addEventListener('click', function() {
            // Changes the cache for whether it pulls cost usage or not.
            updateCostPulling(csbi.id == "costYes");
        });
    }

    // --------------------------------------------------------------------------- //
    
    // ----------------------  notiSelectButton functions  ----------------------- //

    notiSelectButtons = document.getElementsByClassName('notiSelectButton');
    for(var index = 0; index < notiSelectButtons.length; index++) {
        const nsbi = notiSelectButtons[index];
        nsbi.addEventListener('mouseenter', function() {
            nsbi.style.backgroundColor = Colors.backgroundPrimaryAccent();
        });
        nsbi.addEventListener('mouseleave', function() {
            nsbi.style.backgroundColor = Colors.backgroundPrimary();
        });
        nsbi.addEventListener('click', function() {
            // Changes the cache for whether it pulls cost usage or not.
            updateNotiSending(nsbi.id == "notiYes");
        });
    }

    // --------------------------------------------------------------------------- //

}

/**
 * Updates the color theme to the inputted theme.
 * @param {string} newTheme The new theme to switch to.
 */
function updateTheme(newTheme) {
    setTheme(newTheme);
    themeButton.textContent = newTheme;
    themeSelect.style.visibility = "hidden";
    window.top.updateColors();
}

/**
 * Updates the AWS region to the inputted region.
 * @param {string} newRegion The new region to switch to.
 */
function updateRegion(newRegion) {
    setRegion(newRegion);
    const regionDict = {
        "us-east-1": "N. Virginia",
        "us-east-2": "Ohio",
        "us-west-1": "N. California",
        "us-west-2": "Oregon"
    };
    regionButton.textContent = regionDict[newRegion];
    regionSelect.style.visibility = "hidden";
}

/**
 * Updates whether cost pulling should be ran on start.
 * @param {string} newSetting The new boolean value to switch to.
 */
function updateCostPulling(newSetting) {
    updateCache("pullCost", newSetting ? "On" : "Off");
    costButton.textContent = newSetting ? "On" : "Off";
    costSelect.style.visibility = "hidden";
}

/**
 * Updates whether the program should send notifications for Server usage.
 * @param {string} newSetting The new boolean value to switch to.
 */
function updateNotiSending(newSetting) {
    updateCache("sendNotifications", newSetting ? "On" : "Off");
    notiButton.textContent = newSetting ? "On" : "Off";
    notiSelect.style.visibility = "hidden";
}

/**
 * Resets the buttons' values to be in accordance with the cache.
 */
function resetElements() {
    // Pull current region and theme from cache
    const regionDict = {
        "us-east-1": "N. Virginia",
        "us-east-2": "Ohio",
        "us-west-1": "N. California",
        "us-west-2": "Oregon"
    };
    regionButton.textContent = regionDict[getRegion()];
    themeButton.textContent = getTheme();
    
    const costVal = getCacheValue("pullCost");
    if(costVal == "ERROR") {
        costButton.textContent = "On";
        updateCache("pullCost", "On");
    } else {
        costButton.textContent = costVal;
    }

    const notiVal = getCacheValue("sendNotifications");
    if(notiVal == "ERROR") {
        notiButton.textContent = "On";
        updateCache("sendNotifications", "On");
    } else {
        notiButton.textContent = notiVal;
    }

    regionSelect.style.visibility = "hidden";
    themeSelect.style.visibility = "hidden";
    costSelect.style.visibility = "hidden";
    notiSelect.style.visibility = "hidden";
}

/**
 * Updates the elements of the page in accordance to the color theme.
 */
function updateColors() {
    if(headerBar != undefined) {
        headerBar.style.backgroundColor = Colors.backgroundPrimaryAccent();
        headerBarLabel.style.color = Colors.textPrimary();
        primaryBody.style.backgroundColor = Colors.backgroundPrimary();

        regionButton.style.backgroundColor = Colors.backgroundPrimary();
        regionButton.style.color = Colors.textPrimary();
        themeButton.style.backgroundColor = Colors.backgroundPrimary();
        themeButton.style.color = Colors.textPrimary();
        costButton.style.backgroundColor = Colors.backgroundPrimary();
        costButton.style.color = Colors.textPrimary();
        notiButton.style.backgroundColor = Colors.backgroundPrimary();
        notiButton.style.color = Colors.textPrimary();

        regionSelect.style.borderColor = Colors.textTertiary();
        themeSelect.style.borderColor = Colors.textTertiary();
        costSelect.style.borderColor = Colors.textTertiary();
        notiSelect.style.borderColor = Colors.textTertiary();

        regionSelectButtons = document.getElementsByClassName('regionSelectButton');
        for(var index = 0; index < regionSelectButtons.length; index++) {
            regionSelectButtons[index].style.color = Colors.textSecondary();
            regionSelectButtons[index].style.backgroundColor = Colors.backgroundPrimary();
        }

        themeSelectButtons = document.getElementsByClassName('themeSelectButton');
        for(var index = 0; index < themeSelectButtons.length; index++) {
            themeSelectButtons[index].style.color = Colors.textSecondary();
            themeSelectButtons[index].style.backgroundColor = Colors.backgroundPrimary();
        }

        costSelectButtons = document.getElementsByClassName('costSelectButton');
        for(var index = 0; index < costSelectButtons.length; index++) {
            costSelectButtons[index].style.color = Colors.textSecondary();
            costSelectButtons[index].style.backgroundColor = Colors.backgroundPrimary();
        }

        notiSelectButtons = document.getElementsByClassName('notiSelectButton');
        for(var index = 0; index < notiSelectButtons.length; index++) {
            notiSelectButtons[index].style.color = Colors.textSecondary();
            notiSelectButtons[index].style.backgroundColor = Colors.backgroundPrimary();
        }

        resetElements();
    }
}