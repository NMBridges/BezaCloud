// Suplemental functions
const { Colors, setTheme, setRegion } = parent.require("../mercor.js");

// Page elements
var headerBar = document.getElementById('optionsHeaderBar');
var headerBarLabel = document.getElementById('optionsHeaderBarLabel');
var primaryBody = document.getElementById('optionsPrimaryBody');
var regionButton = document.getElementById('regionButton');
var themeButton = document.getElementById('themeButton');
var regionSelect = document.getElementById('regionSelect');
var themeSelect = document.getElementById('themeSelect');

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

function resetElements() {
    // Pull current region and theme from cache
    // regionButton.textContent = REGION
    // themeButton.textContent = THEME

    regionSelect.style.visibility = "hidden";
    themeSelect.style.visibility = "hidden";
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

        regionSelect.style.borderColor = Colors.textTertiary();
        themeSelect.style.borderColor = Colors.textTertiary();

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

        resetElements();
    }
}