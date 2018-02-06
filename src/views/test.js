import {ipcRenderer} from 'electron'
import { Settings } from '../datamodels/status';
import Arduino from './../arduino/arduino';

export default class Test {
  constructor() {
    this.stepsCtl = document.querySelector('#steps');
    this.dirCtl = document.querySelector('#direction');
    this.speedCtl = document.querySelector('#speed');
    this.rtcread = document.querySelector('#rtcread');
    this.addListeners();
    this.loadAudioFiles();
  }
  addListeners() {
    document.querySelector('#btnResetDevice').addEventListener('click', this.resetDevice.bind(this));
    document.querySelector('#btnMove').addEventListener('click', this.moveCustomMotor.bind(this));
    document.querySelector('#btnExtend').addEventListener('click', this.extendMotor.bind(this));
    document.querySelector('#btnGoHome').addEventListener('click', this.goHomeMotor.bind(this));
    document.querySelector('#btnBounceEven').addEventListener('click', this.bounceEvenMotor.bind(this));
    document.querySelector('#btnBounceRandom').addEventListener('click', this.bounceRandomMotor.bind(this));
    document.querySelector('#btnPattern').addEventListener('click', this.bouncePatternMotor.bind(this));

    document.querySelector('#checkstatus').addEventListener('change', this.ledCheck.bind(this));
    document.querySelector('#checkfan').addEventListener('change', this.fanCheck.bind(this));
    document.querySelector('#checksound').addEventListener('change', this.soundCheck.bind(this));
    document.querySelector('#checkusb').addEventListener('change', this.usbCheck.bind(this));
    document.querySelector('#btnReadRTC').addEventListener('click', this.readRTC.bind(this));
    document.querySelector('#btnWriteRTC').addEventListener('click', this.writeRTC.bind(this));
  }

  dispose(){

  }

  loadAudioFiles() {
    let self = this;
    this.files = [];
    this.audioSel = document.querySelector('#audioSelect');
    this.audioSel.addEventListener('change', () => {
      document.querySelector('#myAudio').src = self.audioSel.value;
    });
    self.audioSel.innerHTML = '';
    this.files = ipcRenderer.sendSync('sync-filelist','files');
    // fs.readdir(window.localPath + 'Files', (err, f) => {
      this.files.forEach(file => {
        let opt = document.createElement('option');
        opt.value = window.localPath + 'Files/' + file;
        opt.innerHTML = file;
        self.files.push(file);
        self.audioSel.appendChild(opt);
      });
    // });
  }

  enterTestMode() {
    this.stopRoutine();
    this.enableControls();
  }
  stopRoutine() {
    Arduino.stopProcedure.apply(Arduino, arguments);
  }
  startRoutine() {
    this.disableControls();
    Arduino.startProcedure();
  }

  enableControls() {
    // document.querySelector('.device-audio').removeEventListener('click',this.disableAudio);
    document.querySelectorAll('.device-test').forEach((cont) => {
      cont.classList.remove('disabled');
      cont.childNodes.forEach((el) => {
        if (el.tagName == 'INPUT' || el.tagName == 'BUTTON' || el.tagName == 'SELECT') {
          el.removeAttribute('disabled');
        }
      });
    });
    // $('.device')('input,button').attr('disabled',null);
  }

  disableControls() {
    document.querySelector('#myAudio').src = null;
    document.querySelectorAll('.device-test').forEach((cont) => {
      cont.classList.add('disabled');
      cont.childNodes.forEach((el) => {
        if (el.tagName == 'INPUT' || el.tagName == 'BUTTON' || el.tagName == 'SELECT') {
          el.setAttribute('disabled', 'disabled');
        }
      });
    });
  }

  disableAudio(e) {
    e.stopPropagation();
  }

  resetDevice() {
    Settings.resetDevice();
    // fs.unlink(window.localPath + 'reference.png');
    // fs.unlink(window.localPath + 'compare.png');
    // fs.unlink(window.localPath + 'activations.txt');
    // DeviceSettings.persistKey('activations', '0');
  }

  moveCustomMotor() {
    // let dir = Number(this.dirCtl.value);
    // let speedChar = this.speedCtl.value;
    // let steps = Number(this.stepsCtl.value);
    // let speed = 300;
    // switch(speedChar){
    //     case 'low':
    //     speed = 200;
    //     break;
    //     case 'medium':
    //     speed = 400;
    //     break;
    //     case 'high':
    //     speed = 600;
    //     break;
    // }
    // Arduino.routineInProgress = true;
    // Arduino.move(dir,steps,speed,0,0);
    let alarm = this.stepsCtl.value.split(':');
    let h = parseInt(alarm[0]);
    let m = parseInt(alarm[1]);
    let dt = new Date();
    dt.setHours(h);
    dt.setMinutes(m);

    // Arduino.setAlarmOne.call(Arduino, dt);
  }
  extendMotor() {
    Arduino.melodyIndex = this.getFileIndex();
    Arduino.runInOutRoutine();
  }
  goHomeMotor() {
    Arduino.goHome();
  }
  bounceEvenMotor() {
    Arduino.melodyIndex = this.getFileIndex();
    Arduino.runBounceRoutine();
    //Arduino.bounce();
  }
  bouncePatternMotor() {
    Arduino.melodyIndex = this.getFileIndex();
    Arduino.runPatternRoutine();
  }
  bounceRandomMotor() {
    Arduino.melodyIndex = this.getFileIndex();
    Arduino.runBounceRandomRoutine();
    // Arduino.bounceRandom();
  }
  getFileIndex() {
    let file = this.audioSel.value.replace(window.localPath + 'Files/', '');
    let fileIndex = this.files.indexOf(file);
    return fileIndex;
  }
  ledCheck(e) {
    let chk = e.target;
    console.log(chk.checked);
    if (chk.checked) Arduino.lightOn.apply(Arduino, arguments);
    else Arduino.lightOff.apply(Arduino, arguments);
  }
  fanCheck(e) {
    let chk = e.target;
    console.log(chk.checked);
    if (chk.checked) Arduino.fanOn.apply(Arduino, arguments);
    else Arduino.fanOff.apply(Arduino, arguments);
  }
  soundCheck(e) {
    let chk = e.target;
    console.log(chk.checked);
    if (chk.checked) Arduino.soundOn.apply(Arduino, arguments);
    else Arduino.soundOff.apply(Arduino, arguments);
  }
  usbCheck(e) {
    let chk = e.target;
    console.log(chk.checked);
    if (chk.checked) Arduino.usbOn.apply(Arduino, arguments);
    else Arduino.usbOff.apply(Arduino, arguments);
  }

  readRTC() {
    Arduino.readRTC.apply(Arduino, arguments).then((date) => {
      this.rtcread.innerHTML = date;
    });
  }
  writeRTC() {
    Arduino.writeRTC.apply(Arduino, arguments);
  }
}
