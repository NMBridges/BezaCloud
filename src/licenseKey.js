const keyTextBox = document.getElementById('keyTextBox');
const returnBtn = document.getElementById('returnBtn');

keyTextBox.addEventListener("keyup", function(event) {
    event.preventDefault();
    if (event.keyCode == 13) {
        returnBtn.click();
    }
});
returnBtn.onclick = keySearched;

function keySearched() {
    console.log("YOOO");
}