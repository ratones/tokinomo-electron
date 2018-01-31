import {ipcMain} from 'electron';
import { listFiles,getSettings,compareImages } from './files';

export const attachCommEvents = ()=>{
  ipcMain.on('sync-filelist', (evt,args)=>{
    console.log(args)
    let files = listFiles();
    evt.returnValue = files;
  });

  ipcMain.on('sync-settings', (evt,args)=>{
    let settings = getSettings();
    evt.returnValue = settings;
  });

  ipcMain.on('check-integrity', (evt,args)=>{
    console.log('comm received')
    compareImages(args);
  });
}
