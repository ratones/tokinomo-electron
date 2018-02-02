import "./stylesheets/main.css";

import "./proxy";
// Small helpers you might want to keep
import "./helpers/context_menu.js";
import "./helpers/external_links.js";

import Arduino from './arduino/arduino'
// ----------------------------------------------------------------------------
// Everything below is just to show you how it works. You can delete all of it.
// ----------------------------------------------------------------------------

import { remote } from "electron";
import jetpack from "fs-jetpack";
import { greet } from "./hello_world/hello_world";

import Main from './main'

import env from "env";

const app = remote.app;
const appDir = jetpack.cwd(app.getAppPath());

// menu callbacks


// Holy crap! This is browser window with HTML and stuff, but I can read
// files from disk like it's node.js! Welcome to Electron world :)
const manifest = appDir.read("package.json", "json");

const osMap = {
  win32: "Windows",
  darwin: "macOS",
  linux: "Linux"
};



document.querySelector("#app").style.display = "block";
Arduino.setPlayer(document.querySelector('#myAudio'));
Main.openTab('console');
Arduino.initialize().then(()=>{
  Main.main(); // start the program after Arduino is ready
});

window.onbeforeunload = (e) => {
  // e.preventDefault();
  Arduino.stopProcedure()
  .then(() => {
    remote.getCurrentWindow().destroy(); // 'remote' being electron.remote here
  })
  .catch(()=>{
    remote.getCurrentWindow().destroy();
  });

  e.returnValue = true;
  // prevent the window from closing immediately
};
// document.querySelector("#greet").innerHTML = greet();
document.querySelector("#os").innerHTML = osMap[process.platform];
// document.querySelector("#author").innerHTML = manifest.author;
document.querySelector("#env").innerHTML = env.name;
document.querySelector("#electron-version").innerHTML =   process.versions.electron;
