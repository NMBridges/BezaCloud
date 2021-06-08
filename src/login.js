const loginBtn = document.getElementById('loginBtn');
const exitBtn = document.getElementById('exitBtn');
loginBtn.onclick = loginClicked;
exitBtn.onclick = exitClicked;

function loginClicked() {
    
}

function exitClicked() {
    const remote = require('electron').remote;
    let w = remote.getCurrentWindow();
    w.close();
}



