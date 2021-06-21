// Supplemental functions
const { hex, Colors } = parent.require("./mercor.js");

// Document items
var mainGridContainer = document.getElementById("mainGridContainer");
var yearlySpendings = document.getElementById("yearlySpendings");
var yearlySpendingsLabel = document.getElementById("yearlySpendingsLabel");
var monthlySpendings = document.getElementById("monthlySpendings");
var monthlySpendingsLabel = document.getElementById("monthlySpendingsLabel");
var dailyButton = document.getElementById("dailyButton");
var monthlyButton = document.getElementById("monthlyButton");

var spendingView = "daily";

window.addEventListener('load', function() {


    
});

// ----------------------- dailyButton functions ----------------------------- //

dailyButton.addEventListener('mouseenter', function() {
    dailyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

dailyButton.addEventListener('mouseleave', function() {
    if(spendingView == "daily") {
        dailyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    } else {
        dailyButton.style.backgroundColor = Colors.backgroundPrimary();
    }
});

dailyButton.addEventListener('click', function() {
    spendingView = "daily";
    updateColors();
});

// --------------------------------------------------------------------------- //

// ----------------------- monthlyButton functions --------------------------- //

monthlyButton.addEventListener('mouseenter', function() {
    monthlyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
});

monthlyButton.addEventListener('mouseleave', function() {
    if(spendingView == "monthly") {
        monthlyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    } else {
        monthlyButton.style.backgroundColor = Colors.backgroundPrimary();
    }
});

monthlyButton.addEventListener('click', function() {
    spendingView = "monthly";
    updateColors();
});

// --------------------------------------------------------------------------- //

/**
 * Updates the colors of the dashboard elements in accordance with the color theme.
 */
function updateColors() {
    mainGridContainer.style.backgroundColor = Colors.backgroundPrimary();
    yearlySpendings.style.color = Colors.textPrimary();
    yearlySpendingsLabel.style.color = Colors.textSecondary();
    monthlySpendings.style.color = Colors.textPrimary();
    monthlySpendingsLabel.style.color = Colors.textSecondary();
    if(spendingView == "daily") {
        dailyButton.style.color = Colors.textPrimary();
        dailyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
        monthlyButton.style.color = Colors.textSecondary();
        monthlyButton.style.backgroundColor = Colors.backgroundPrimary();
    } else {
        dailyButton.style.color = Colors.textSecondary();
        dailyButton.style.backgroundColor = Colors.backgroundPrimary();
        monthlyButton.style.color = Colors.textPrimary();
        monthlyButton.style.backgroundColor = Colors.backgroundPrimaryAccent();
    }

}