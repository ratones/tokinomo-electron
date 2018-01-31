import {ipcRenderer} from 'electron'

export default class Test {
  constructor() {
    this.stepsCtl = document.querySelector('#steps');
    this.dirCtl = document.querySelector('#direction');
    this.speedCtl = document.querySelector('#speed');
    this.ledStatusCtl = document.querySelector('#ledstatus');
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
    document.querySelector('#btnReadRTC').addEventListener('click', this.readRTC.bind(this));
    document.querySelector('#btnWriteRTC').addEventListener('click', this.writeRTC.bind(this));
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
    // fs.readdir('C:/Device/Files', (err, f) => {
      this.files.forEach(file => {
        let opt = document.createElement('option');
        opt.value = 'C:/Device/Files/' + file;
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
    // Arduino.stopProcedure.apply(Arduino, arguments);
  }
  startRoutine() {
    this.disableControls();
    // Arduino.startProcedure();
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
    // fs.unlink('C:/Device/reference.png');
    // fs.unlink('C:/Device/compare.png');
    // fs.unlink('C:/Device/activations.txt');
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
    // Arduino.motorpin.low();
    // Arduino.extendMax();
  }
  goHomeMotor() {
    // Arduino.goHome();
  }
  bounceEvenMotor() {
    // Arduino.melodyIndex = this.getFileIndex();
    // Arduino.runRoutine();
  }
  bouncePatternMotor() {
    // Arduino.melodyIndex = this.getFileIndex();
    // Arduino.runPatternRoutine();
  }
  bounceRandomMotor() {
    // Arduino.melodyIndex = this.getFileIndex();
    // Arduino.runRandomRoutine();
  }
  getFileIndex() {
    let file = this.audioSel.value.replace('C:/Device/Files/', '');
    let fileIndex = this.files.indexOf(file);
    return fileIndex;
  }
  ledCheck(e) {
    let chk = e.target;
    console.log(chk.checked);
    // if (chk.checked) Arduino.lightOn.apply(Arduino, arguments);
    // else Arduino.lightOff.apply(Arduino, arguments);
    let rclass = chk.checked ? 'red' : 'green';
    let aclass = chk.checked ? 'green' : 'red';
    this.ledStatusCtl.classList.remove(rclass);
    this.ledStatusCtl.classList.add(aclass);
  }

  readRTC() {
    // Arduino.readRTC.apply(Arduino, arguments).then((date) => {
    //   this.rtcread.innerHTML = date;
    // });
  }
  writeRTC() {
    // Arduino.writeRTC.apply(Arduino, arguments);
  }
}
