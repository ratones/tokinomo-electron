// This is main process of Electron, started as first thing when your
// app starts. It runs through entire life of your application.
// It doesn't have any windows which you can see on screen, but we can open
// window from here.

import path from "path";
import url from "url";
import { app, Menu, ipcMain,remote } from "electron";
import { devMenuTemplate } from "./menu/dev_menu_template";
import { editMenuTemplate } from "./menu/edit_menu_template";
import { windowMenuTemplate } from "./menu/window_menu_template";
import { deviceMenuTemplate } from "./menu/device_menu_template";
import createWindow from "./helpers/window";

import Arduino from './arduino/arduino';


// Special module holding environment variables which you declared
// in config/env_xxx.json file.
import env from "env";
import { attachCommEvents } from "./node/comm";

const setApplicationMenu = () => {
  const menus = [devMenuTemplate, editMenuTemplate, windowMenuTemplate, deviceMenuTemplate];
  // if (env.name !== "production") {
  //   menus.push(devMenuTemplate);
  // }
  Menu.setApplicationMenu(Menu.buildFromTemplate(menus));
};

var canQuit = false;

/**PROMPT REPLACEMENT */
var promptResponse
ipcMain.on('prompt', function (eventRet, arg) {
  promptResponse = null
  var promptWindow = createWindow("prompt",{
    width: 300,
    height: 200,
    show: false,
    resizable: false,
    movable: false,
    alwaysOnTop: true,
    frame: false
  })
  arg.val = arg.val || ''
  const promptHtml = '<label for="val">' + arg.title + '</label>\
  <input id="val" value="' + arg.val + '" autofocus />\
  <button onclick="require(\'electron\').ipcRenderer.send(\'prompt-response\', document.getElementById(\'val\').value);window.close()">Ok</button>\
  <button onclick="window.close()">Cancel</button>\
  <style>body {font-family: sans-serif;} button {float:right; margin-left: 10px;} label,input {margin-bottom: 10px; width: 100%; display:block;}</style>'
  promptWindow.loadURL('data:text/html,' + promptHtml)
  promptWindow.show()
  promptWindow.on('closed', function () {
    eventRet.returnValue = promptResponse
    promptWindow = null
  })
})
ipcMain.on('prompt-response', function (event, arg) {
  if (arg === '') { arg = null }
  promptResponse = arg
})



// Save userData in separate folders for each environment.
// Thanks to this you can use production and development versions of the app
// on same machine like those are two separate apps.
if (env.name !== "production") {
  const userDataPath = app.getPath("userData");
  app.setPath("userData", `${userDataPath} (${env.name})`);
}

app.on("ready", () => {
  attachCommEvents();
  setApplicationMenu();

  const mainWindow = createWindow("main", {
    width: 1000,
    height: 600,
    preload: __dirname + '/views/prompt.js'
  });

  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, "app.html"),
      protocol: "file:",
      slashes: true
    })
  );

  if (env.name === "development") {
    mainWindow.openDevTools();
  }
  // mainWindow.on('close',(e)=>{
  //   while(!canQuit){
  //     ;
  //   }
  //   app.quit();
  // })
});

// app.on("window-all-closed", (e) => {
//   e.preventDefault();
//   Arduino.stopProcedure().then(()=>{
//     app.quit();
//   })
// });




