const { app, BrowserWindow } = require('electron');
const EventEmitter = require('events');
const path = require('path');
const {
  tryLicenseKey, cachedLicenseKey, createAwsDir,
  installAwsCli, hasAwsCliInstalled, awsDir
} = require("./mercor.js");

let licenseKeyWindow;
let loginWindow;
let primaryWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function newPopupWindow(header, body, button) {
  let popupWindow;
  
  popupWindow = new BrowserWindow({
    width: 400,
    height: 300,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  popupWindow.loadFile(path.join(__dirname, 'popup/popup.html'));
  //popupWindow.webContents.openDevTools();

  popupWindow.setResizable(false);
  
  popupWindow.webContents.on('did-finish-load', function() {
    popupWindow.webContents.executeJavaScript('updateColors();').then(function() {
      popupWindow.webContents.executeJavaScript('updateElements(\"' + header + '\", \"' + body + '\", \"' + button + '\");').then(function() {
        popupWindow.show();
      });
    });
  });
}

function newCreateServerWindow() {
  let createServerWindow;
  
  createServerWindow = new BrowserWindow({
    width: 400,
    height: 500,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  createServerWindow.loadFile(path.join(__dirname, 'newServer/newServer.html'));
  createServerWindow.webContents.openDevTools();

  createServerWindow.setResizable(false);
  
  createServerWindow.webContents.on('did-finish-load', function() {
    createServerWindow.webContents.executeJavaScript('updateColors();').then(function() {
      createServerWindow.webContents.executeJavaScript('resetElements();').then(function() {
        createServerWindow.show();
      });
    });
  });
}

// The main logic function that controls interaction between windows
function createWindows() {
  // Installs the AWS CLI if it is not already installed.
  hasAwsCliInstalled().then(function(result) {
    console.log(result);
    if(!result) {
        installAwsCli().then(function() {
          if(process.platform != 'win32') {
            newPopupWindow("AWS CLI is not installed. Please run the following in Terminal:", "sudo installer -pkg " + awsDir() + "/AWSCLIV2.pkg -target /", "Copy and Close");
          }
        });
    }
  });

  // ------------------------------      licenseKeyWindow     ----------------------------------------// 
  
   licenseKeyWindow = new BrowserWindow({
    width: 600,
    height: 400,
    frame: false,
    resizable: false,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  licenseKeyWindow.loadFile(path.join(__dirname, 'licenseKey/licenseKey.html'));
  //licenseKeyWindow.webContents.openDevTools();

  // When license key window closes (not hides), it closes the application
  licenseKeyWindow.on('close', () => {
    app.quit();
  });

  // When the license key is input manually, it will validate the key (like above)
  licenseKeyWindow.on('licenseKeySearched', () => {
    const validKeyExists = tryLicenseKey(cachedLicenseKey()).then( function(exists) {
      console.log("License key result for " + cachedLicenseKey() + ":", exists);
      if(exists) {
        licenseKeyWindow.hide();
        loginWindow.show();
      }
    });
  });
  // ---------------------------------------------------------------------------------------------------//


  // --------------------------------      loginWindow      --------------------------------------------//

   loginWindow = new BrowserWindow({
    width: 600,
    height: 400,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  loginWindow.loadFile(path.join(__dirname, 'login/login.html'));
  //loginWindow.webContents.openDevTools();

  loginWindow.setResizable(false);

  // When login window closes (not hides), it closes the application
  loginWindow.on('close', () => {
    app.quit();
  });

  loginWindow.on('loginSuccessful', () => {
    loginWindow.hide();
    primaryWindow.show();
  });

  // ---------------------------------------------------------------------------------------------------//


  // --------------------------------      primaryWindow      ------------------------------------------//

  primaryWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 600,
    minHeight: 400,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  primaryWindow.loadFile(path.join(__dirname, 'primary/primary.html'));
  primaryWindow.webContents.openDevTools();

  // Refreshes page elements
  primaryWindow.on('refreshContents', function() {
    primaryWindow.setSize(1201, 800);
  });

  // When login window closes (not hides), it closes the application
  primaryWindow.on('close', () => {
    app.quit();
  });

  // When a window calls for popup to be shown, it creates a popup window.
  primaryWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });

  // When a window calls for newServer window, it creates a newServer window.
  primaryWindow.on('newServer', () => {
    newCreateServerWindow();
  });

  // ---------------------------------------------------------------------------------------------------//

  // Hides all windows
  loginWindow.hide();
  licenseKeyWindow.hide();
  primaryWindow.hide();

  // Creates cache directory if it does not already exist
  createAwsDir();

  // Automatically checks if there is a valid key on the hard drive. If so, it
  // shows the login window. If not, it shows the license key window and waits
  // for manual user input.
  const validKeyExists = tryLicenseKey(cachedLicenseKey()).then( function(exists) {
    console.log("License key result for " + cachedLicenseKey() + ":", exists);
    if(exists) {
      licenseKeyWindow.hide();
      loginWindow.show();
    } else {
      licenseKeyWindow.show();
    }
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindows);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createLoginWindow();
  }
});