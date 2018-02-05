import Serial from './serial';
import fs from 'fs';
import { Settings } from './../datamodels/status';
class Arduino {
  constructor() {
    this.melodyIndex = 0;
    this.timeoutPassed = true;

  }
  initialize() {
    let self = this;
    return new Promise((resolve) => {
      Serial.initialize().then(() => {
        self.listFiles().then(resolve);
      });
    })
  }

  /**PLAYER */
  setPlayer(player) {
    this.player = player;
    this.player.volume = 1;
    this.player.addEventListener('ended', () => {
      console.log('player ended');
      this.playFinnished();
    });
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
    this.soundOn()
    this.player.src = 'C:/Device/Files/' + this.files[index];
    this.player.play();
  }


  /***SENSORS PINS */
  lightOn() {
    return new Promise((resolve) => {
      Serial.write_digital(20, 1);
      resolve();
    });
  }

  lightOff() {
    return new Promise((resolve) => {
      Serial.write_digital(20, 0);
      if (this.lightInterval) {
        clearInterval(this.lightInterval);
        this.lightInterval = null;
      }
      resolve();
    });
  }
  blinkLED() {
    let count = parseInt(Settings.get('BLITZ_COUNT'));
    if (count > 1) {
      let state = true;
      let interval = parseInt(Settings.get('BLITZ_DELAY'));
      this.lightInterval = setInterval(() => {
        if (state) {
          Serial.write_digital(20, 1);
          state = !state
        } else {
          Serial.write_digital(20, 0);
          state = !state;
        }
      }, interval);
    } else {
      this.lightOn();
    }
  }

  /**
   * SENSORS
   */
  fanOn() {
    return new Promise((resolve) => {
      Serial.write_digital(10, 1);
      resolve();
    });
  }

  fanOff() {
    return new Promise((resolve) => {
      Serial.write_digital(10, 0);
      resolve();
    });
  }

  soundOn() {
    return new Promise((resolve) => {
      Serial.write_digital(11, 1);
      resolve();
    });
  }

  soundOff() {
    return new Promise((resolve) => {
      Serial.write_digital(11, 0);
      resolve();
    });
  }

  usbOn() {
    return new Promise((resolve) => {
      Serial.write_digital(6, 1);
      resolve();
    });
  }

  usbOff() {
    return new Promise((resolve) => {
      Serial.write_digital(6, 0);
      resolve();
    });
  }
  readVoltage() {
    return new Promise((resolve) => {
      let volts = '0';
      let amps = '0';
      Serial.read_analog("A1").then((v) => {
        volts = v;
        Serial.read_analog("A9").then((a) => {
          amps = a;
          resolve({ volts, amps });
        })
      });
    });
  }

  readRTC() {
    return Serial.readRTC();
  }
  writeRTC(date) {
    Serial.writeRTC(date);
  }
  setAlarm(date) {
    Serial.setAlarm(date);
  }

  /**MOVES */
  goHome() {
    return new Promise((resolve)=>{

      this.soundOff();
      let speed = Settings.get('SPEED');
      let accel = Settings.get('ACCELERATION');
      Serial.stepper_home(speed, accel, accel).then(() => {
        this.lightOff();
        this.routineInProgress = false;
        console.log('motor is home');
        resolve();
      });
    });
  }

  extendMax() {
    return new Promise((resolve) => {
      let self = this;
      self.routineInProgress = true;
      let speed = Settings.get('SPEED');
      let accel = Settings.get('ACCELERATION');
      let steps = Settings.get('RANGE_MAX_POSITION');
      let delay = Settings.get('DELAY_INTERVAL');
      Serial.stepper_move(1, steps, speed, accel, accel, delay).then(() => {
        console.log('extended');
        resolve();
      });
    });
  }

  bounce() {
    let speed = Settings.get('SPEED');
    let accel = Settings.get('ACCELERATION');
    let amplitude = Settings.get('SWING_MAX_RETRACT');
    Serial.stepper_bounce(speed, accel, accel, amplitude);
  }

  bounceRandom() {
    let speed = Settings.get('SPEED');
    let accel = Settings.get('ACCELERATION');
    let amplitude = Settings.get('SWING_MAX_RETRACT');
    Serial.stepper_bounce_rand(speed, accel, accel, amplitude, amplitude);
  }

  playFinnished() {
    this.goHome().then(()=>{
      this.melodyIndex ++;
      if (this.melodyIndex >= this.files.length)
      this.melodyIndex = 0;
      setTimeout(()=>{
          this.timeoutPassed = true;
      },parseInt(Settings.get('WAITING_TIME')));
    });
  }

  /**ROUTINES */
  runInOutRoutine() {
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }
  runBounceRoutine() {
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
      this.bounce();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }
  runBounceRandomRoutine() {
    this.extendMax().then(() => {
      if (Settings.get('USE_BLITZ')) this.blinkLED();
      this.bounceRandom();
    });
    this.playFile(this.melodyIndex);
    this.isPlaying = true;
  }

  start_routine() {
    if(Settings.get('USE_MOTION_SENSOR')){
      Serial.attachCommand("1", 123, this.sensor_received);
    }
    else{
      // run loop
    }
  }

  stop_routine(self) {
    this.goHome();
    Board.detach_command("1", 123)
  }

  sensor_received(value) {
    if (this.routineInProgress) return;
    if (this.timeoutPassed) {
      let sensor_value = parseInt(value);
      if (sensor_value > 400) {
        console.log("Movement detected");
        this.movement_detected();
      }
    }
  }

  movement_detected() {
    this.writeActivation();
    this.timeoutPassed = false;
    if (Settings.get('CONTINUOS_MOVE')) {
      if (Settings.get('USE_PATTERN_MOVEMENT')) {
        this.runPatternRoutine();
      } else if (Settings.get('USE_RANDOM_MOVEMENT')) {
        this.runBounceRandomRoutine();
      } else {
        this.runBounceRoutine();
      }
    } else {
      this.runInOutRoutine();
    }
  }


}
export default new Arduino();