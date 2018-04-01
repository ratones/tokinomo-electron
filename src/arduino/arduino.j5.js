import  './firmataExtension';
import  './accelStepper';
import five from 'johnny-five';
import SerialPort from 'serialport';
import fs from 'fs';
import { Settings } from './../datamodels/status';
class Arduino {
  constructor() {
    let self = this;
    this.canGoHome = false;
    this.isMoving = true;
    this.motorPosition = 0;
    this.routineInProgress = false;
    this.melodyIndex = 0;
    this.timeoutPassed = true;//for pause detection

  }
  detectArduinoPort() {
    return new Promise((resolve) => {
      let p = '';
      SerialPort.list(function (err, ports) {
        ports.forEach(function (port) {
          if (port.comName != 'COM1') {
            resolve(port.comName);
          }
        });
        //resolve();
      });
    });
  }
  initialize() {
    let self = this;
    this.player.volume = 1;
    this.player.addEventListener('ended', () => {
      console.log('player ended');
      this.mutepin.low();
      this.melodyIndex = 0;
      this.timeoutPassed = true;//for pause detection
    });
    return new Promise((resolve, reject) => {
      // this.listFiles();
      this.detectArduinoPort().then((com) => {
        var board = new five.Board({
          port: com,
          repl: false
        });
        this.board = board;
        board.on("ready", function () {
          self.mutepin = new five.Pin(11);
          self.motorpin = new five.Pin(6);
          self.ledpin = new five.Pin(20);
          self.zeropin = new five.Pin('A0');
          self.movepin = new five.Pin('A8');
          self.usbpin = new five.Pin(7);
          self.fanpin = new five.Pin(10);
          self.stepper = new five.Stepper({
            type: five.Stepper.TYPE.DRIVER,
            stepsPerRev: 400,
            pins: {
              step: 4,
              dir: 5
            }
          });
          self.mutepin.low();
          self.motorpin.high();
          resolve();
        });
      });
    });
  }
  setPlayer(player) {
    this.player = player;
  }
  listFiles() {
    let self = this;
    this.files = [];
    return new Promise((resolve) => {
      fs.readdir('C:/Device/Files', (err, f) => {
        f.forEach(file => {
          console.log(file);
          self.files.push(file);
        });
        resolve();
        self.player.src = 'c:/Device/Files/' + self.files[0];
      });
    });
  }
  playFile(index) {
    this.mutepin.high()
    this.player.src = 'C:/Device/Files/' + this.files[index];
    this.player.play();
  }
  readVoltage() {
    return new Promise((resolve) => {
      let volts = '0';
      let amps = '0';
      var pinv = new five.Pin("A1");
      var pina = new five.Pin("A9");
      pinv.query(function (state) {
        volts = state.value;
        pina.query(function (state) {
          amps = state.value;
          resolve({ volts, amps });
        });
      });
      resolve({ volts, amps });
    });

  }
  readRTC() {
    return new Promise((resolve) => {

      this.board.i2cConfig();
      this.board.i2cReadOnce(0x68, 0x00, 7, function (res) {
        var sec = (res[0] >> 4) * 10 + (res[0] & 0x0F); 				// seconds
        var min = (res[1] >> 4) * 10 + (res[1] & 0x0F); 				// minutes
        var hour = ((res[2] & 0x30) >> 4) * 10 + (res[2] & 0x0F); 	// hours
        var mode = (res[2] & 0x40) >> 6 ? "12h" : "24h"; 			// hour mode default 24
        var day = res[3];											// day of week
        var mday = (res[4] >> 4) * 10 + (res[4] & 0x0F); 				// day of month
        var month = ((res[5] & 0x10) >> 4) * 10 + (res[5] & 0x0F);	// month
        var year = (res[6] >> 4) * 10 + (res[6] & 0x0F);				// year
        resolve(new Date(2000 + year, --month, mday, hour, min, sec));
      });
    });

  }

  writeRTC() {
    let datetime = new Date();
    var bytes = [];
    bytes[0] = Math.floor(datetime.getSeconds() / 10) << 4 | datetime.getSeconds() % 10;
    bytes[1] = Math.floor(datetime.getMinutes() / 10) << 4 | datetime.getMinutes() % 10;
    bytes[2] = Math.floor(datetime.getHours() / 10) << 4 | datetime.getHours() % 10;
    bytes[3] = datetime.getDay() + 1;
    bytes[4] = Math.floor(datetime.getDate() / 10) << 4 | datetime.getDate() % 10;
    var month = datetime.getMonth() + 1;
    bytes[5] = Math.floor(month / 10) << 4 | month % 10;
    var year = datetime.getYear() % 100;
    bytes[6] = Math.floor(year / 10) << 4 | year % 10;
    this.board.i2cConfig();
    this.board.i2cWrite(0x68, 0x00, bytes);
  }

  alterRegister(register, mask, clearSet) {

    var byte = mask;
    this.board.i2cConfig();
    this.board.i2cReadOnce(0x68, register, register + 1, function (err, res) {

      if (clearSet == "clear")

        byte &= res[0];

      else

        byte |= res[0];

    });

    this.board.i2cWrite(0x68, register, [byte]);
  }
  disableAlarmOne() {
    this.alterRegister(0x0E, 0xFE, "clear");
  }
  enableAlarmOne() {
    this.alterRegister(0x0E, 0x01, "set");
  }
  setAlarmOne(datetime) {
    // let ppin = new five.Pin(12);
    // ppin.low();
    let self = this;
    if (!datetime instanceof Date) throw new Error();
    var bytes = [];
    this.board.i2cConfig();
    // this.board.i2cReadOnce(0x68, 0x07, 4, function(err, res) {
    //     bytes[0] = res[0] & 0x80;
    //     bytes[1] = res[1] & 0x80;
    //     bytes[2] = res[2] & 0x80;
    //     bytes[3] = res[3] & 0x80;
    bytes[0] |= Math.floor(datetime.getSeconds() / 10) << 4 | datetime.getSeconds() % 10;
    bytes[1] |= Math.floor(datetime.getMinutes() / 10) << 4 | datetime.getMinutes() % 10;
    bytes[2] |= Math.floor(datetime.getHours() / 10) << 4 | datetime.getHours() % 10;
    bytes[3] |= Math.floor(datetime.getDate() / 10) << 4 | datetime.getDate() % 10;
    console.log(bytes);
    // self.board.i2cConfig();
    self.board.i2cWrite(0x68, 0x07, bytes);
    self.board.i2cWrite(0x68, 0x0E, [0xFE]);
    // });
  };


  /**MOVES */

  goHome() {
    this.mutepin.low();
    this.stepper.home();
    //self.motorpin.high();
    this.lightOff();
    this.routineInProgress = false;
    console.log('motor is home');
  }
  extendMax() {
    return new Promise((resolve) => {
      let self = this;
      self.routineInProgress = true;
      this.move(1,2000,2000,0).then(()=>{
          console.log('extended');
      });
    });
  }

  bounce() {
    let self = this;
    let dir = 0;
    let speed = 400;
    let steps = parseInt(DeviceSettings.get('SWING_MAX_RETRACT'));
    // self.move(dir, steps, speed, 0, 0).then(() => {
    //   dir = dir === 0 ? 1 : 0;
    //   if (self.isPlaying) {
    //     self.move(dir, steps, speed, 0, 0).then(() => {
    //       if (self.isPlaying) self.bounce();
    //       else {
    //         console.log('should go home');
    //         self.goHome();
    //       }
    //     });
    //   } else {
    //     console.log('should go home');
    //     self.goHome();
    //   }
    // });
  }
  bounceRandom() {
    let self = this;
    let dir = 0;
    let speed = 400;
    // let steps = Math.round(Math.random() * 1000);
    // if (steps < 200) steps += 200;
    // self.move(dir, steps, speed, 0, 0).then(() => {
    //   dir = dir === 0 ? 1 : 0;
    //   if (self.isPlaying) {
    //     self.move(dir, steps, speed, 0, 0).then(() => {
    //       if (self.isPlaying) self.bounceRandom();
    //       else self.goHome();
    //     });
    //   } else {
    //     self.goHome();
    //   }
    // });
  }

  patternMove() {
    let self = this;
    let patterns = DeviceSettings.getPatterns();
    let playingFile = this.files[this.melodyIndex];
    let pattern = patterns.find((p) => { return p.filename == playingFile });
    let sets = pattern.pattern;
    let chain = Promise.resolve();
    let commands = [];
    for (let index = 0; index < sets.length; index++) {
      const p = sets[index];
      let delay = p.pause;
      let steps = Math.abs(Number(p.distance));
      let dir = Number(p.distance) >= 0 ? 1 : 0;
      console.log(index);
      commands.push(self.move.bind(self, dir, steps, 400, 0, 0, delay));
    }
    for (const func of commands) {
      chain = chain.then(func);
    }
    this.isDonePlaying().then(() => {
      this.goHome();
    });
  }

  move(dir, steps, speed, accel, decel, timeout) {
    if (!timeout) timeout = 0;
    return new Promise((resolve) => {
      setTimeout(() => {
        this.isMoving = true;
        this.stepper.go(
          steps,
          dir,
          speed,
          accel
          , () => {
            this.motorPosition = dir === 0 ? this.motorPosition - steps : this.motorPosition + steps;
            this.isMoving = false;
            this.motorpin.high();
            resolve();
          });
      }, timeout);
    });
  }

  /**
   * ROUTINES
   */
  runInOutRoutine() {
    this.motorpin.low();
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }
  runRoutine() {
    this.motorpin.low();
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
      this.bounce();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }
  runRandomRoutine() {
    this.motorpin.low();
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
      this.bounceRandom();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }
  runPatternRoutine() {
    this.motorpin.low();
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
      this.patternMove();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }

  /**
   * LIGHT ROUTINES
   */
  blinkLED() {
    let count = parseInt(Settings.get('BLITZ_COUNT'));
    if (count > 1) {
      let state = true;
      let interval = parseInt(Settings.get('BLITZ_DELAY'));
      this.lightInterval = setInterval(() => {
        if (state) {
          this.ledpin.high();
          state = !state
        } else {
          this.ledpin.low();
          state = !state;
        }
      }, interval);
    } else {
      this.lightOn();
    }
  }

  lightOn() {
    return new Promise(() => {
      this.ledpin.high(() => {
        resolve();
      });
    });
  }

  lightOff() {
    return new Promise((resolve) => {
      this.ledpin.low();
      if (this.lightInterval) {
        clearInterval(this.lightInterval);
        this.lightInterval = null;
      }
      resolve();
    });
  }

  /**
   * SENSORS
   */
  fanOn() {
    return new Promise(() => {
      this.fanpin.high(() => {
        resolve();
      });
    });
  }

  fanOff() {
    return new Promise((resolve) => {
      this.fanpin.low();
      resolve();
    });
  }

  soundOn() {
    return new Promise(() => {
      this.mutepin.high(() => {
        resolve();
      });
    });
  }

  soundOff() {
    return new Promise((resolve) => {
      this.mutepin.low();
      resolve();
    });
  }

  usbOn() {
    return new Promise(() => {
      this.motorpin.high(() => {
        resolve();
      });
    });
  }

  usbOff() {
    return new Promise((resolve) => {
      this.motorpin.low();
      resolve();
    });
  }


  /**
   * SHUTDOWN PROCEDURE
   */
  isDonePlaying() {
    return new Promise((resolve) => {
      let interv = setInterval(() => {
        if (!this.isPlaying) {
          clearInterval(interv);
          resolve();
        }
      });
    });
  }
  isMotorHome() {
    return new Promise((resolve) => {
      let counter = 0;
      let interv = setInterval(() => {
        counter++;
        if (this.zeroPinValue < 500) {
          clearInterval(interv);
          resolve();
        } else {
          if (counter > 10) this.goHome()// don't wait more then 2 secs - else something went wrong
        }
      }, 200);
    });
  }
  stopProcedure() {
    return new Promise((resolve) => {
      this.player.pause();
      this.mutepin.low();
      clearInterval(this.moveInterval);
      this.isPlaying = false;
      this.lightOff();
      this.isMotorHome().then(() => {
        resolve();
      });
    });
  }
  startProcedure() {
    if (Settings.get('USE_MOTION_SENSOR')) {
      this.moveInterval = setInterval(() => {
        this.movepin.query((state) => {
          // console.log(v);
          if (state.value > 400) this.sensorRead();
        });
      }, 100);
    } else {
      this.runLoop();
    }
  }
  sensorRead() {
    if (this.routineInProgress) return;
    if (this.timeoutPassed) {
      if (Settings.get('USE_DELAY')) {
        let delay = parseInt(Settings.get('DELAY_INTERVAL'));
        setTimeout(this.runOnMove, delay);
      } else {
        this.runOnMove();
      }
      // this.runOnMove();
    }
  }

  runOnMove() {
    FileSystem.writeActivation();
    this.timeoutPassed = false;
    if (Settings.get('CONTINUOS_MOVE')) {
      if (Settings.get('USE_PATTERN_MOVEMENT')) {
        this.runPatternRoutine();
      } else if (Settings.get('USE_RANDOM_MOVEMENT')) {
        this.runRandomRoutine();
      } else {
        this.runRoutine();
      }
    } else {
      this.runInOutRoutine();
    }
  }

  runLoop() {
    console.log('not suposed to rich here')
  }

  writeActivation() {
    let activations = Settins.persistKey('activations');
    if (!activations) activations = 0;
    activations++;
    let dt = new Date();
    let date = dt.getDate() + '.' + (dt.getMonth() + 1) + '.' + dt.getFullYear();
    let time = dt.getHours() + ':' + dt.getMinutes() + ':' + dt.getSeconds();
    fs.appendFileSync('C:/Device/activations.txt', `\r\n${activations}\t${date}\t${time}`);
    Settins.persistKey('activations', activations);
  }
}
export default new Arduino();
