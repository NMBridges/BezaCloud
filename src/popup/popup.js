// Supplemental functions
const { Colors, awsDir } = parent.require("../mercor.js");
const clipboardy = parent.require('clipboardy');
const { exec, execSync } = parent.require('child_process');

// Window elements
var boundingBox = document.getElementById('boundingBox');
var headerLabel = document.getElementById('headerLabel');
var bodyLabel = document.getElementById('bodyLabel');
var continueButton = document.getElementById('continueButton');

window.onload = function() {

    // ------------------------------ continueButton functions ------------------------------ //

    continueButton.addEventListener('mouseenter', function() {
        continueButton.style.backgroundColor = Colors.backgroundSecondaryMouseHover();
    });

    continueButton.addEventListener('mouseleave', function() {
        continueButton.style.backgroundColor = Colors.backgroundSecondary();
    });

    continueButton.addEventListener('click', function() {
        if(continueButton.value == "selected") { return; }
        continueButton.value = "selected";
        
        console.log(continueButton.textContent);
        if(continueButton.textContent == 'Copy and Continue') {
            clipboardy.writeSync(bodyLabel.textContent);
            const cmd1 = "open " + awsDir() + "/connections/server.rdp";
            const e1 = execSync(cmd1);
        } else if(continueButton.textContent == 'Copy and Close') {
            clipboardy.writeSync(bodyLabel.textContent);
        }
        window.top.close();
    });

    // -------------------------------------------------------------------------------------- //

};

/**
 * Updates the window's elements accordingly.
 * @param {string} header The header text to update the header with.
 * @param {string} body The body text to update the body with.
 * @param {string} button The button text to update the button with. Blank if
 *                          the button should be hidden.
 */
function updateElements(header, body, button) {
    headerLabel.textContent = header;
    bodyLabel.textContent = body;
    if(button == "") {
        continueButton.hidden = true;
    } else {
        continueButton.hidden = false;
        continueButton.textContent = button;
    }
}

/**
 * Updates the colors of the document elements in accordance to the color theme.
 */
function updateColors() {
    boundingBox.style.backgroundColor = Colors.backgroundPrimary();
    
    headerLabel.style.color = Colors.textPrimary();
    bodyLabel.style.color = Colors.textSecondary();

    continueButton.style.backgroundColor = Colors.backgroundSecondary();
    continueButton.style.color = Colors.textPrimary();
}