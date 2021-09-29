// Supplemental functions
const {
    Colors, getTheme, updateKeyCache
} = require("../seros.js");
const {
    connectionTest
} = require("../apiCaller.js");

var bod = document.body;
var wrapper = document.getElementById('wrapper');
var licenseKeyField = document.getElementById('licenseKeyField');
var submitBtn = document.getElementById('submitBtn');
var exitBtn = document.getElementById('exitBtn');
var fieldLabels = document.getElementsByClassName('fieldLabel');
var serosImg = document.getElementById("serosImg");

window.onload = function() {
    updateColors();
};

/**
 * Checks that the input license key is valid
 */
function keySearched() {
    if(submitBtn.value == "selected") { return; }
    submitBtn.value = "selected";

    updateKeyCache(licenseKeyField.value);
    
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.emit('licenseKeySearched');
}

// Checks for 'return' on license key text box
licenseKeyField.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        submitBtn.click();
    }
});

// ------------------------------------------------------------------------ //

submitBtn.addEventListener('mouseenter', () => {
    if(submitBtn.value == "selected") { return; }
    submitBtn.style.backgroundColor = "#dddddd";
});

submitBtn.addEventListener('mouseleave', () => {
    if(submitBtn.value == "selected") { return; }
    submitBtn.style.backgroundColor = "#ffffff";
});

submitBtn.addEventListener('click', () => {
    if(submitBtn.value == "selected") { return; }
    submitBtn.style.backgroundColor = "#555555";
    keySearched();
});

/**
 * Resets the submitButton on incorrect license key submission attempts.
 */
function resetSubmitButton() {
    submitBtn.value = "";
    submitBtn.style.backgroundColor = "#ffffff";

    const textBox1 = document.getElementById('licenseKeyField');
    textBox1.classList.add("shake");

    setTimeout(() => {
        textBox1.classList.remove("shake");
    }, 500);
}

exitBtn.addEventListener('mouseenter', () => {
    exitBtn.style.backgroundColor = "#dddddd";
});

exitBtn.addEventListener('mouseleave', () => {
    exitBtn.style.backgroundColor = "#ffffff";
});

exitBtn.addEventListener('click', () => {
    exitBtn.style.backgroundColor = "#555555";
    closeClicked();
});

/**
 * Closes the window when 'close' is clicked.
 */
function closeClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}

// ------------------------------------------------------------------------ //

/**
 * Updates the colors of the elements in accordance with the color theme.
 */
function updateColors() {
    bod.style.backgroundColor = Colors.backgroundPrimary();

    wrapper.style.backgroundColor = Colors.textPrimary();
    wrapper.style.color = Colors.backgroundPrimary();

    for(var index = 0; index < fieldLabels.length; index++) {
        fieldLabels[index].style.color = Colors.backgroundSecondary();
    }

    licenseKeyField.style.outlineColor = Colors.backgroundSecondary();
    licenseKeyField.style.borderColor = Colors.backgroundSecondary();

    submitBtn.style.color = Colors.backgroundSecondary();
    exitBtn.style.color = Colors.backgroundSecondary();

    if(getTheme() == "Dark") {
        serosImg.src = "../assets/MercorBannerx100-Dark.png";
    } else {
        serosImg.src = "../assets/MercorBannerx100.png";
    }
}