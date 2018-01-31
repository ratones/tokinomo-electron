import fs from 'fs';
import { app, BrowserWindow } from "electron";
import png from 'pngjs';
import pixelmatch from 'pixelmatch';

const PNG = png.PNG;

export const listFiles = () => {
  let files = fs.readdirSync('C:/Device/Files');
  console.log(files)
  return files;
}
export const getSettings = ()=>{
  let settings = fs.readFileSync('C:/Device/settings.json')
  return JSON.parse(settings);
}

export const compareImages = (base64Data)=>{
  fs.exists('C:/Device/reference.png', (err) => {
    if (!err) {
      console.log('reference not found!')
      fs.writeFile("C:/Device/reference.png", base64Data, 'base64', function (err) {
        BrowserWindow.getFocusedWindow().webContents.send('integrity-checked',{result:true})
      });
    } else {
      console.log('reference found')
      fs.writeFile("C:/Device/compare.png", base64Data, 'base64', function (err) {
        // Util.log('Picture taken. Comparing images...');
        let img1 = fs.createReadStream('C:/Device/reference.png').pipe(new PNG()).on('parsed', doneReading);
        let img2 = fs.createReadStream('C:/Device/compare.png').pipe(new PNG()).on('parsed', doneReading);
        let filesRead = 0;
        function doneReading() {
          if (++filesRead < 2) return;
          var diff = new PNG({ width: img1.width, height: img1.height });

          let px = pixelmatch(img1.data, img2.data, diff.data, img1.width, img1.height, { threshold: 0.8 });
          if (px < 10) {
            BrowserWindow.getFocusedWindow().webContents.send('integrity-checked',{result:true});
          }else{
            BrowserWindow.getFocusedWindow().webContents.send('integrity-checked',{result:false});
          }
          // Util.log(px);
          img1 = null;
          img2 = null;
          diff.pack().pipe(fs.createWriteStream('C:/Device/diff.png'));
        }
      });
    }
  });
}
