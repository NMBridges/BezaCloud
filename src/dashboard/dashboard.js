// Supplemental functions
const {
    Colors, getCacheValue
 } = parent.require("../seros.js");
const {
    Expenditure, ApiCaller
} = parent.require("../apiCaller.js");

// Document items
var mainGridContainer = document.getElementById("mainGridContainer");
var yearlySpendings = document.getElementById("yearlySpendings");
var yearlySpendingsLabel = document.getElementById("yearlySpendingsLabel");
var monthlySpendings = document.getElementById("monthlySpendings");
var monthlySpendingsLabel = document.getElementById("monthlySpendingsLabel");
var dailyButton = document.getElementById("dailyButton");
var monthlyButton = document.getElementById("monthlyButton");
var barChart = document.getElementById("barChart");
var mainPageLabel = document.getElementById("mainPageLabel");
var headerBar = document.getElementById("headerBar");

/** @type {string} Holds the type of chart that the dashboard should display. */
var spendingView = "daily";

/** @type {Expenditure[]} The expenditures of the last 30 days. */
var dailyExpenditures = [];
/** @type {Expenditure[]} The expenditures of the previous 11, and current, months. */
var monthlyExpenditures = [];

/** @type {boolean} The current status of whether the file is loading spending. */
var loadingSpending = false;

window.addEventListener('load', function() {

    if(getCacheValue("pullCost") == "On") {
        if(!loadingSpending) {
            loadSpending();
        }
    } else {
        barChart.textContent = '';

        var noPullLabel = document.createElement('div');
        noPullLabel.textContent = "Spending chart disabled in Options.";
        noPullLabel.style.color = Colors.textSecondary();
        noPullLabel.style.width = "calc(100vw - 70px)";
        noPullLabel.style.margin = "auto";
        noPullLabel.style.marginTop = "calc(45vh - 140px)";
        noPullLabel.style.textAlign = "center";
        barChart.appendChild(noPullLabel);
    }

});

/**
 * Loads the chart with the appropriate spending information.
 */
function loadChart() {
    // Clears the old chart of any children.
    barChart.textContent = '';
    var chartLine = document.createElement('div');
    chartLine.className = "outline";
    chartLine.style.backgroundColor = Colors.textTertiary();
    barChart.appendChild(chartLine);

    /** @type {Expenditure[]} The expenditures to base the chart on. */
    var selectedExpenditures = [];

    if(spendingView == "daily") {
        selectedExpenditures = dailyExpenditures;
    } else {
        selectedExpenditures = monthlyExpenditures;
    }

    /** @type {number} The maximum spending in a single day. */
    var maxSpending = 0.01;
    for(var index = 0; index < selectedExpenditures.length; index++) {
        const tempSpending = parseFloat(selectedExpenditures[index].spending);
        if(tempSpending > maxSpending) {
            maxSpending = tempSpending;
        }
    }

    maxSpending *= 1.15;

    const newLength = selectedExpenditures.length;
    barChart.style = "--cols:" + newLength + ";";
    for(var counter = 0; counter < newLength; counter++) {
        addChildToChart(selectedExpenditures[counter], maxSpending, counter + 1);
    }

    updateColors();
}

/**
 * Clears the old barChart and loads data for the new chart.
 * Calls loadChart() when finished.
 */
function loadSpending() {
    loadingSpending = true;

    // Clears the old chart of any children.
    barChart.textContent = '';

    // Resets the Expenditure lists.
    dailyExpenditures = [];
    monthlyExpenditures = [];

    var completionCounter = 0;

    // Gets the spending for the previous 11, and current, month.
    ApiCaller.getSpending("MONTHLY").then(function(result) {
        if(result != "ERROR") {
            if("ResultsByTime" in result) {
                const spending = result["ResultsByTime"];
                var spendingInLastYear = 0.0;
                
                // Loops through spending periods and adds them to the spending array.
                for(var index = 0; index < spending.length; index++) {
                    const expenditure = spending[index];
                    var timeStart = "n/a";
                    var timeEnd = "n/a";
                    var amount = 0.00;
                    var currency = "n/a";

                    // Gets the time periods.
                    if("TimePeriod" in expenditure) {
                        if("Start" in expenditure["TimePeriod"]) {
                            const startDate = expenditure["TimePeriod"]["Start"];
                            const day = startDate.substring(8, 10);
                            const mo = startDate.substring(5,7);
                            const yr = startDate.substring(0,4);
                            const months = [
                                "Jan", "Feb", "Mar", "Apr",
                                "May", "Jun", "Jul", "Aug",
                                "Sep", "Oct", "Nov", "Dec"
                            ];
                            timeStart = day + " " + months[mo - 1] + " " + yr;
                        }

                        if("End" in expenditure["TimePeriod"]) {
                            const endDate = expenditure["TimePeriod"]["End"];
                            const day = endDate.substring(8, 10);
                            const mo = endDate.substring(5,7);
                            const yr = endDate.substring(0,4);
                            const months = [
                                "Jan", "Feb", "Mar", "Apr",
                                "May", "Jun", "Jul", "Aug",
                                "Sep", "Oct", "Nov", "Dec"
                            ];
                            timeEnd = day + " " + months[mo - 1] + " " + yr;
                        }
                    }

                    // Gets the cost usage.
                    if("Total" in expenditure) {
                        if("BlendedCost" in expenditure["Total"]) {
                            if("Amount" in expenditure["Total"]["BlendedCost"]) {
                                amount = expenditure["Total"]["BlendedCost"]["Amount"];
                                spendingInLastYear += parseFloat(amount);
                            }

                            if("Unit" in expenditure["Total"]["BlendedCost"]) {
                                currency = expenditure["Total"]["BlendedCost"]["Unit"];
                            }
                        }
                    }

                    monthlyExpenditures.push(new Expenditure(timeStart, timeEnd, amount, currency));
                }

                console.log("Monthly ", monthlyExpenditures);
                completionCounter++;
                yearlySpendings.textContent = (monthlyExpenditures[0].currency == "USD" ? "$" : "") + spendingInLastYear.toFixed(2)
                                                    + " " + (monthlyExpenditures[0].currency == "USD" ? "" : monthlyExpenditures[0].currency);
                if(completionCounter > 1) {
                    loadingSpending = false;
                    loadChart();
                }
            }
        } else {
            
        }
    });

    // Gets the spending for the previous 30 days.
    ApiCaller.getSpending("DAILY").then(function(result) {
        if(result != "ERROR") {
            if("ResultsByTime" in result) {
                const spending = result["ResultsByTime"];
                var spendingInLastMonth = 0.0;
                
                // Loops through spending periods and adds them to the spending array.
                for(var index = 0; index < spending.length; index++) {
                    const expenditure = spending[index];
                    var timeStart = "n/a";
                    var timeEnd = "n/a";
                    var amount = 0.00;
                    var currency = "n/a";

                    // Gets the time periods.
                    if("TimePeriod" in expenditure) {
                        if("Start" in expenditure["TimePeriod"]) {
                            const startDate = expenditure["TimePeriod"]["Start"];
                            const day = startDate.substring(8, 10);
                            const mo = startDate.substring(5,7);
                            const yr = startDate.substring(0,4);
                            const months = [
                                "Jan", "Feb", "Mar", "Apr",
                                "May", "Jun", "Jul", "Aug",
                                "Sep", "Oct", "Nov", "Dec"
                            ];
                            timeStart = day + " " + months[mo - 1] + " " + yr;
                        }

                        if("End" in expenditure["TimePeriod"]) {
                            const endDate = expenditure["TimePeriod"]["End"];
                            const day = endDate.substring(8, 10);
                            const mo = endDate.substring(5,7);
                            const yr = endDate.substring(0,4);
                            const months = [
                                "Jan", "Feb", "Mar", "Apr",
                                "May", "Jun", "Jul", "Aug",
                                "Sep", "Oct", "Nov", "Dec"
                            ];
                            timeEnd = day + " " + months[mo - 1] + " " + yr;
                        }
                    }

                    // Gets the cost usage.
                    if("Total" in expenditure) {
                        if("BlendedCost" in expenditure["Total"]) {
                            if("Amount" in expenditure["Total"]["BlendedCost"]) {
                                amount = expenditure["Total"]["BlendedCost"]["Amount"];
                                spendingInLastMonth += parseFloat(amount);
                            }

                            if("Unit" in expenditure["Total"]["BlendedCost"]) {
                                currency = expenditure["Total"]["BlendedCost"]["Unit"];
                            }
                        }
                    }

                    dailyExpenditures.push(new Expenditure(timeStart, timeEnd, amount, currency));
                }

                console.log("Daily ", dailyExpenditures);
                completionCounter++;
                monthlySpendings.textContent = (dailyExpenditures[0].currency == "USD" ? "$" : "") + spendingInLastMonth.toFixed(2)
                                                + " " + (dailyExpenditures[0].currency == "USD" ? "" : dailyExpenditures[0].currency);
                if(completionCounter > 1) {
                    loadingSpending = false;
                    loadChart();
                }
            }
        } else {
            
        }
    });
}

/**
 * Appends a new bar to the bar chart.
 * @param {Expenditure} expenditure The Expenditure object for the new bar on the chart.
 * @param {number} maxSpending The max spending of any Expenditure object on the chart.
 * @param {number} index The column index of the new bar, used for placement.
 */
function addChildToChart(expenditure, maxSpending, index) {
    var newChild = document.createElement('div');
    newChild.style = "--col:" + index + ";--hei:" + (expenditure.spending / maxSpending) + ";";
    newChild.className = "bar";
    
    var newChildStatus = document.createElement('div');
    newChildStatus.className = "barPopup";
    newChildStatus.textContent = (spendingView == "daily" ? expenditure.start : expenditure.start.substring(3)) + "\n"
                                + (expenditure.currency == "USD" ? "$" : "") + parseFloat(expenditure.spending).toFixed(2)
                                     + (expenditure.currency != "USD" ? " " + expenditure.currency : "");
    newChild.appendChild(newChildStatus);
    
    barChart.appendChild(newChild);
}

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
    monthlyButton.style.backgroundColor = Colors.backgroundPrimary();
    if(getCacheValue("pullCost") == "On") {
        if(barChart.children.length < 5) {
            loadSpending();
        } else {
            loadChart();
        }
    } else if(barChart.children.length >= 12) {
        loadChart();
    }
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
    dailyButton.style.backgroundColor = Colors.backgroundPrimary();
    if(getCacheValue("pullCost") == "On") {
        if(barChart.children.length < 5) {
            loadSpending();
        } else {
            loadChart();
        }
    } else if(barChart.children.length >= 12) {
        loadChart();
    }
});

// --------------------------------------------------------------------------- //

// --------------------------------------------------------------------------- //

/**
 * Loads the chart when dashboard is switched to.
 */
function loadOnSwitch() {
    if(!loadingSpending) {
        if(getCacheValue("pullCost") == "On") {
            if(barChart.children.length < 5) {
                loadSpending();
            } else {
                loadChart();
            }
        } else if(barChart.children.length >= 12) {
            loadChart();
        }
    }
}

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

    mainPageLabel.style.color = Colors.textPrimary();
    headerBar.style.backgroundColor = Colors.backgroundPrimaryAccent();

    for(var count = 0; count < barChart.children.length; count++) {
        if(barChart.children[count].className == "bar") {
            barChart.children[count].style.backgroundColor = Colors.chartColor();
            barChart.children[count].children[0].style.color = Colors.textSecondary();
        }
    }

    document.getElementsByClassName('topRightGridContainer')[0].style.borderColor = Colors.textSecondary();
    document.getElementsByClassName('topLeftGridContainer')[0].style.borderColor = Colors.textSecondary();
    document.getElementsByClassName('bottomGridContainer')[0].style.borderColor = Colors.textSecondary();
}