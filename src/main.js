const { app, BrowserWindow } = require('electron');
const EventEmitter = require('events');
const path = require('path');
const {
  tryLicenseKey, cachedLicenseKey, createAwsDir,
  installAwsCli, hasAwsCliInstalled, awsDir,
  cachedAwsCredentials, checkVersion
} = require("./seros.js");

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
      enableRemoteModule: true,
    },
    focusable: true
  });
  popupWindow.loadFile(path.join(__dirname, 'popup/popup.html'));
  //popupWindow.webContents.openDevTools();

  popupWindow.setResizable(false);
  
  popupWindow.webContents.on('ready-to-show', function() {
    popupWindow.webContents.executeJavaScript('updateColors();').then(function() {
      popupWindow.webContents.executeJavaScript('updateElements(\"' + header + '\", \"' + body + '\", \"' + button + '\");').then(function() {
        popupWindow.show();
      });
    });
  });

  popupWindow.on('exitApp', function() {
    app.quit();
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
  //createServerWindow.webContents.openDevTools();

  createServerWindow.setResizable(false);

  createServerWindow.on('close', function() {
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.loadServers();');
  });
  
  createServerWindow.webContents.on('ready-to-show', function() {
    createServerWindow.webContents.executeJavaScript('resetElements();').then(function() {
      createServerWindow.webContents.executeJavaScript('updateColors();').then(function() {
        createServerWindow.show();
      });
    });
  });
  
  // When a window calls for popup to be shown, it creates a popup window.
  createServerWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });
}

function newAddTemplateWindow() {
  let templateWindow;
  
  templateWindow = new BrowserWindow({
    width: 400,
    height: 300,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  templateWindow.loadFile(path.join(__dirname, 'newTemplate/newTemplate.html'));
  //templateWindow.webContents.openDevTools();

  templateWindow.setResizable(false);
  
  templateWindow.webContents.on('ready-to-show', function() {
    templateWindow.webContents.executeJavaScript('updateColors();').then(function() {
      templateWindow.webContents.executeJavaScript('resetElements();').then(function() {
        templateWindow.show();
      });
    });
  });

  // When a window calls for popup to be shown, it creates a popup window.
  templateWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });
  
  // When it closes, it should refresh the My Template list
  templateWindow.on('close', () => {
    primaryWindow.webContents.executeJavaScript('temp.contentWindow.displayOverlay(true);').then(function() {
      primaryWindow.webContents.executeJavaScript('temp.contentWindow.loadTemplates();');
    });
  });
}

function newCopyTemplateWindow() {
  let copyTemplateWindow;
  
  copyTemplateWindow = new BrowserWindow({
    width: 400,
    height: 370,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  copyTemplateWindow.loadFile(path.join(__dirname, 'copyTemplate/copyTemplate.html'));
  //copyTemplateWindow.webContents.openDevTools();

  copyTemplateWindow.setResizable(false);
  
  copyTemplateWindow.webContents.on('ready-to-show', function() {
    copyTemplateWindow.webContents.executeJavaScript('updateColors();').then(function() {
      copyTemplateWindow.webContents.executeJavaScript('resetElements();').then(function() {
        copyTemplateWindow.show();
      });
    });
  });

  // When a window calls for popup to be shown, it creates a popup window.
  copyTemplateWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });
  
  // When it closes, it should refresh the My Template list
  copyTemplateWindow.on('close', () => {
    primaryWindow.webContents.executeJavaScript('temp.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('temp.contentWindow.loadTemplates();');
  });
}

function newConnectionWindow() {
  let connectionWindow;
  
  connectionWindow = new BrowserWindow({
    width: 400,
    height: 380,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  connectionWindow.loadFile(path.join(__dirname, 'newConnection/newConnection.html'));
  //connectionWindow.webContents.openDevTools();

  connectionWindow.setResizable(false);
  
  connectionWindow.webContents.on('ready-to-show', function() {
    connectionWindow.webContents.executeJavaScript('updateColors();').then(function() {
      connectionWindow.webContents.executeJavaScript('updateElements();').then(function() {
        connectionWindow.show();
      });
    });
  });
  
  // When a window calls for a popup to be shown, it creates a popup window.
  connectionWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });

  // When the window is close, it will reload the primary window.
  connectionWindow.on('close', () => {
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.loadServers();');
  });
}

function newTaskWindow() {
  let taskWindow;
  
  taskWindow = new BrowserWindow({
    width: 400,
    height: 485,
    autoHideMenuBar: true,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
      enableRemoteModule: true
    }
  });
  taskWindow.loadFile(path.join(__dirname, 'newTask/newTask.html'));
  //taskWindow.webContents.openDevTools();

  taskWindow.setResizable(false);
  
  taskWindow.webContents.on('ready-to-show', function() {
    taskWindow.webContents.executeJavaScript('updateColors();').then(function() {
      taskWindow.webContents.executeJavaScript('updateElements();').then(function() {
        taskWindow.show();
      });
    });
  });
  
  // When a window calls for a popup to be shown, it creates a popup window.
  taskWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });

  // When the window is close, it will reload the primary window.
  taskWindow.on('close', () => {
    primaryWindow.webContents.executeJavaScript('task.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('task.contentWindow.loadTasks();');
  });
}

// The main logic function that controls interaction between windows
function createWindows() {
  /*
    ---------   ---------   ---------   ---------   ---------   ---------   ---
      No longer necessary due to AWS resolving issues with the JavaScript SDK.
    ---   ---------   ---------   ---------   ---------   ---------   ---------

  // Installs the AWS CLI if it is not already installed.
  hasAwsCliInstalled().then(function(result) {
    if(!result) {
      installAwsCli().then(function() {
        if(process.platform != 'win32') {
          newPopupWindow("AWS CLI is not installed. Please run the following in Terminal:", "sudo installer -pkg " + awsDir() + "/AWSCLIV2.pkg -target /", "Copy and Close");
        }
      });
    }
  });*/

  // ------------------------------      licenseKeyWindow     ----------------------------------------// 
  
   licenseKeyWindow = new BrowserWindow({
    width: 600,
    height: 300,
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
      } else {
        licenseKeyWindow.webContents.executeJavaScript("resetSubmitButton();");
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
    primaryWindow.show();
    loginWindow.hide();
    primaryWindow.webContents.executeJavaScript('dash.contentWindow.loadChart();');
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('serv.contentWindow.loadServers();');
    primaryWindow.webContents.executeJavaScript('temp.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('temp.contentWindow.loadTemplates();');
    primaryWindow.webContents.executeJavaScript('task.contentWindow.displayOverlay(true);');
    primaryWindow.webContents.executeJavaScript('task.contentWindow.loadTasks();');
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
    },
    show: false
  });
  primaryWindow.loadFile(path.join(__dirname, 'primary/primary.html'));
  //primaryWindow.webContents.openDevTools();

  // When login window closes (not hides), it closes the application
  primaryWindow.on('close', () => {
    app.quit();
  });

  // On Mac, refreshes contents by resizing the window.
  primaryWindow.on('refreshContents', () => {
    primaryWindow.setSize(1201, 800);
  });

  // When a window calls for a popup to be shown, it creates a popup window.
  primaryWindow.on('showPopup', () => {
    primaryWindow.webContents.executeJavaScript("getPopupValues();").then(function(result) {
      newPopupWindow(result[0], result[1], result[2]);
    });
  });

  // When a window calls for a newConnection winodw to be shown, it creates a newConnection window.
  primaryWindow.on('newConnection', () => {
    newConnectionWindow();
  });

  // When a window calls for newServer window, it creates a newServer window.
  primaryWindow.on('newTask', () => {
    newTaskWindow();
  });

  // When a window calls for newServer window, it creates a newServer window.
  primaryWindow.on('newServer', () => {
    newCreateServerWindow();
  });

  // When a window calls for newTemplate window, it creates a newTemplate window.
  primaryWindow.on('newTemplate', () => {
    newAddTemplateWindow();
  });

  // When a window calls for copyTemplate window, it creates a newTemplate window.
  primaryWindow.on('newCopyTemplate', () => {
    newCopyTemplateWindow();
  });

  // When the window calls for logOut, it logs the user out of AWS.
  primaryWindow.on('logOut', () => {
    primaryWindow.hide();
    loginWindow.webContents.executeJavaScript("updateColors();").then(function() {
      loginWindow.show();
    });
  });

  // ---------------------------------------------------------------------------------------------------//

  // Hides all windows
  loginWindow.hide();
  licenseKeyWindow.hide();
  primaryWindow.hide();

  // Creates cache directory if it does not already exist
  createAwsDir();

  checkVersion().then(function(versionInfo) {
    if(versionInfo[0]) {
      if(versionInfo[1]) {
        newPopupWindow("Version Notice", versionInfo[2], "Close");
      }
      // Automatically checks if there is a valid key on the hard drive. If so, it
      // shows the login window. If not, it shows the license key window and waits
      // for manual user input.
      tryLicenseKey(cachedLicenseKey()).then( function(exists) {
        console.log("License key result for " + cachedLicenseKey() + ":", exists);
        if(exists) {
          // Autologin with AWS credentials.
          loginWindow.webContents.executeJavaScript("autofillTextboxes();").then(function() {
            loginWindow.webContents.executeJavaScript("loginClicked();").then(function(success) {
              if(!success) {
                licenseKeyWindow.hide();
                loginWindow.show();
              } else {
                primaryWindow.show();
              }
            });
          });
        } else {
          licenseKeyWindow.show();
        }
      });
    } else {
      newPopupWindow("Invalid Version", versionInfo[2], "Exit");
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