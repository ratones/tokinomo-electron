// import {app, ipcMain} from 'electron';
// import console from './../helpers/console'
// import Main from './../main'
import { app, BrowserWindow } from "electron";

export const windowMenuTemplate = {
  label:'View',
  submenu:[
    {
      label:'Device settings',
      accelerator: "Alt+CmdOrCtrl+S",
      click:()=>{
        BrowserWindow.getFocusedWindow().webContents.send('menu-click',{window:'settings'})
      }
    },
    {
      label:'Test page',
      accelerator: "Alt+CmdOrCtrl+T",
      click:()=>{
        BrowserWindow.getFocusedWindow().webContents.send('menu-click',{window:'test'})
      }
    },
    {
      label:'File patterns',
      accelerator: "Alt+CmdOrCtrl+P",
      click:()=>{
        BrowserWindow.getFocusedWindow().webContents.send('menu-click',{window:'patterns'})
      }
    }
  ]
}
