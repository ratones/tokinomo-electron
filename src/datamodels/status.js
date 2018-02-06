import fs from 'fs';
import HttpClient from './../network/client';
//import sys from 'node-windows';
import cp from 'child_process';

export const Status = {
  sound: 'No data',
  battery: 'No data',
  integrity: 'No data',
  mechanism: 'No data',
};
export const Settings = {
  data: [],
  loadSettings(){
    if(this.data.length == 0){
      let settings = fs.readFileSync(window.localPath + 'settings.json')
      this.data =  JSON.parse(settings);
    }
    return this.data;
  },
  save(data) {
    this.data = data;
    fs.writeFileSync(window.localPath + 'settings.json', JSON.stringify(data));
  },
  saveServer(data) {
    const client = new HttpClient();
    client.postSettings(JSON.stringify(data)).then(() => {
      this.save(data);
    });
  },

  get(key) {
    if(this.data.length == 0) this.loadSettings();
    let s = this.data.find((s) => { return s.name === key });
    if (s.val === 'true') return true;
    if (s.val === 'false') return false;
    return s.val;
  },
  persistKey(key, value) {
    if (!key) return;
    if (value) {
      localStorage.setItem(key, value);
    } else {
      let v = localStorage.getItem(key);
      if (!v) return null;
      else return v;
    }
  },
  setRTCDateTime() {

  },

  setSystemDate(date) {
    let h = date.getHours();
    let m = date.getMinutes();
    let s = date.getSeconds();
    let d = date.getDate();
    let mt = date.getMonth();
    let y = date.getFullYear();
    // sys.elevate(`setdt.bat ${h}:${m}:${s} ${d}/${mt}/${y}`, (err) => {
    //   console.log(err)
    // });
    if(process.platform == 'win32'){
      cp.exec(`setdt.bat ${h}:${m}:${s} ${d}/${mt}/${y}`, (err) => {
        console.log(err)
      });
    }else{
      cp.exec(`setdt.sh ${h}:${m}:${s} ${d}/${mt}/${y}`, (err) => {
        console.log(err)
      });
    }
  },
  resetDevice() {
    fs.unlink(window.localPath + 'reference.png');
    fs.unlink(window.localPath + 'compare.png');
    fs.unlink(window.localPath + 'activations.txt');
    this.persistKey('activations', 0);
  }

};
export const Patterns = {
  data: [],
  getPatterns() {
    if (this.data.length == 0) {
      let patterns = fs.readFileSync(window.localPath + 'patterns.json')
      this.data = JSON.parse(patterns);
    }
    return this.data;
  },
  saveServer(fileid, data) {
    let client = new HttpClient();
    client.postPattern(fileid, JSON.stringify(data)).then(() => {
      let patterns = this.getPatterns();
      let fp = patterns.find(p => { return p.fileid == fileid });
      fp.pattern = data;
      this.savePatterns(patterns);
    });
  },
  saveLocal(fileid, newPatterns) {
    let patterns = this.getPatterns();
    let fp = patterns.find(p => { return p.fileid == fileid });
    fp.pattern = newPatterns;
    this.savePatterns(patterns);
  },
  savePatterns(data) {
    this.data = data;
    fs.writeFileSync(window.localPath + 'patterns.json', JSON.stringify(data));
  },
  runTest(fileid) {
    let fileIndex = 0;
    let fp = this.data.find(x => x.fileid == fileid);
    fs.readdir(window.localPath + 'Files', (err, f) => {
      f.forEach((file, index) => {
        if (fp.filename == file) {
          fileIndex = index;
        }
      });
      // Arduino.melodyIndex = fileIndex;
      console.log(fileIndex);
      // Arduino.runPatternRoutine();
    });
  }
};
