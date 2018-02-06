import * as $ from 'jquery';
// import console from './../util';
import { Settings } from './../datamodels/status';
import path from 'path';
import os from 'os';
import child_process from 'child_process';
const exec = child_process.exec
const spawn = child_process.spawn;
import fs from 'fs';
import http from 'http';
import AdmZip from 'adm-zip';
import {Shared} from './../shared';

export default class HttpClient {
  constructor() {
    this.checkUrl = 'http://www.tokinomo.com?' + new Date();
    this.baseUrl = 'http://www.monitor.tokinomo.com';
  }

  checkConnection() {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.checkUrl,
        type: 'GET',
        success: () => {
          resolve(true);
        },
        error: () => {
          reject();
        }
      });
    });
  }

  postFormData(data) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.baseUrl + '/api/index.php/utils/updates',
        data: data,
        type: 'POST',
        contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
        processData: false, // NEEDED, DON'T OMIT THIS
        // ... Other options like success and etc
        success: (response) => {
          resolve(response);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  postActivations() {
    return new Promise((resolve, reject) => {

      let deviceID = Settings.persistKey('deviceID');
      let formData = new FormData();
      formData.append('id', deviceID);
      let blob = fs.readFileSync(Shared.localPath + 'activations.txt');
      let dt = new Date();
      let date = String(dt.getDate()) + String((dt.getMonth() + 1)) + String(dt.getFullYear()) + '_' + String(dt.getHours()) + String(dt.getMinutes()) + String(dt.getSeconds());
      let fileOfBlob = new File([blob], 'Activations' + deviceID + '_' + date + '.txt');
      formData.append('files', fileOfBlob);
      $.ajax({
        url: this.baseUrl + '/api/index.php/utils/uploadactivations',
        data: formData,
        type: 'POST',
        contentType: false, // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
        processData: false, // NEEDED, DON'T OMIT THIS
        // ... Other options like success and etc
        success: (response) => {
          resolve(response);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  postSettings(data) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.baseUrl + '/api/index.php/utils/updatesettings',
        data: data,
        type: 'POST',
        contentType: 'application/json', // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
        processData: false, // NEEDED, DON'T OMIT THIS
        // ... Other options like success and etc
        success: (response) => {
          resolve(response);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  postPattern(fileid, data) {
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.baseUrl + '/api/index.php/files/pattern/' + fileid,
        data: data,
        type: 'POST',
        contentType: 'application/json', // NEEDED, DON'T OMIT THIS (requires jQuery 1.6+)
        processData: false, // NEEDED, DON'T OMIT THIS
        // ... Other options like success and etc
        success: (response) => {
          resolve(response);
        },
        error: (err) => {
          reject(err);
        }
      });
    });
  }

  getFiles() {
    let id = Settings.persistKey('deviceID');
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.baseUrl + '/api/index.php/utils/melody/' + id,
        type: 'GET',
        success: (response) => {
          if (response == 'noupdates') {
            resolve();
          } else {
            setTimeout(() => { resolve() }, 2000);
          }
        },
        error: () => {
          resolve();
        }
      });
    });
  }

  getStatus() {
    let deviceID = Settings.persistKey('deviceID');
    return new Promise((resolve, reject) => {
      $.ajax({
        url: this.baseUrl + '/api/index.php/utils/statusrequest/' + deviceID,
        type: 'GET',
        success: (response) => {
          resolve(response);
        },
        error: () => {
          resolve();
        }
      });
    });
  }

  downloadMelodies() {
    let id = Settings.persistKey('deviceID');
    return new Promise((resolve, reject) => {

      var self = this;
      var xhr = new XMLHttpRequest();
      xhr.open('GET', this.baseUrl + '/api/index.php/utils/melody/' + id, true);
      xhr.responseType = 'blob';

      xhr.onload = function (e) {
        if (this.status == 200) {
          if (this.response == 'noupdates') {
            resolve();
            return;
          }
          // get binary data as a response
          var blob = this.response;
          var fileReader = new FileReader();
          var filepath = path.join(os.tmpdir(), 'test.zip');
          console.log(os.tmpdir());
          fileReader.onload = function () {
            console.log('Writing file...');
            fs.writeFileSync(filepath, Buffer(new Uint8Array(this.result)));
            console.log('Unpacking melodies...');
            self.deleteDirectory(Shared.localPath + 'Files').then(() => {
              let zp = new AdmZip(filepath);
              zp.extractAllTo(Shared.localPath + 'Files', true);
              resolve();
            });
          };
          fileReader.readAsArrayBuffer(blob);
        }
      };
      xhr.onerror = function () {
        resolve();
      };
      xhr.send();
    });
  }

  unpackUpdate() {
    var self = this;
    var filename = path.join(os.tmpdir(), 'test.zip');
    exec('"' + path.resolve(process.cwd(), 'tools/unzip.exe') + '" -u -o "' +
      filename + '" -d "' + path.join(process.cwd(), '') + '" > NUL',
      function (err) {
        if (err) {
          // self.statusEl = null;
          // self.progressEl= null;
          //self.callback.call(err);
          return;
        } else {
          // self.run();
        }
      });
  }

  deleteFile(dir, file) {
    return new Promise(function (resolve, reject) {
      var filePath = path.join(dir, file);
      fs.lstat(filePath, function (err, stats) {
        if (err) {
          return reject(err);
        }
        if (stats.isDirectory()) {
          resolve(deleteDirectory(filePath));
        } else {
          fs.unlink(filePath, function (err) {
            if (err) {
              return reject(err);
            }
            resolve();
          });
        }
      });
    });
  }

  deleteDirectory(dir) {
    let self = this;
    return new Promise(function (resolve, reject) {
      if (!fs.existsSync(dir)) {
        resolve();
      }
      fs.access(dir, function (err) {
        if (err) {
          return reject(err);
        }
        fs.readdir(dir, function (err, files) {
          if (err) {
            return reject(err);
          }
          Promise.all(files.map(function (file) {
            return self.deleteFile(dir, file);
          })).then(function () {
            fs.rmdir(dir, function (err) {
              if (err) {
                return reject(err);
              }
              resolve();
            });
          }).catch(reject);
        });
      });
    });
  }
}
