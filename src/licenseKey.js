const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');

var mysql = require('mysql');

keyTextBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        returnBtn.click();
    }
});
returnBtn.onclick = keySearched;

function keySearched() {
    var con = mysql.createConnection({
        host: "3.221.75.247",
        user: "typaCC",
        password: "sM1L6::@"
    });
    
    con.connect(function(err) {
        if (err) throw err;
        console.log("Connected!");
    });
    
    // check if license key is valid
}
