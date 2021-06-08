const { app, BrowserWindow } = require('electron');
const EventEmitter = require('events');
const path = require('path');
const { tryLicenseKey, cachedLicenseKey, createMercorConnectDir, updateKeyCache } = require("./mercor.js");

let licenseKeyWindow;
let loginWindow;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) { // eslint-disable-line global-require
  app.quit();
}

function createWindows() {
  /**
   *  License key window
   */
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
  licenseKeyWindow.loadFile(path.join(__dirname, 'licenseKey.html'));
  licenseKeyWindow.webContents.openDevTools();

  /**
   *  Login window
   */
  loginWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  loginWindow.loadFile(path.join(__dirname, 'login.html'));
  //loginWindow.webContents.openDevTools();

  // Hides all windows
  loginWindow.hide();

  // Shows license key window when ready to show
  licenseKeyWindow.show();

  createMercorConnectDir();

  // Automatically checks if there is a valid key on the hard drive. If so, it
  // shows the login window. If not, it shows the license key window and waits
  // for manual user input.
  const validKeyExists = tryLicenseKey(cachedLicenseKey()).then( function(exists) {
    console.log("License key result for " + cachedLicenseKey() + ":", exists);
    if(exists) {
      licenseKeyWindow.hide();
      loginWindow.show();
    }
  });


  // ------------------------------      licenseKeyWindow     ----------------------------------------// 
  
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

  // When login window closes (not hides), it closes the application
  loginWindow.on('close', () => {
    app.quit();
  });

  // ---------------------------------------------------------------------------------------------------//
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

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.