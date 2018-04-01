import  Firmata from 'firmata';

var END_SYSEX = 0xF7;
var START_SYSEX = 0xF0;
var STEPPER = 0x72;

function writeToTransport(board, data) {
    board.pending++;
    board.transport.write(new Buffer(data), function() {
      board.pending--;
    });
  }

Firmata.prototype.stepperHome = function(deviceNum,speed,accel){
    var data = [
      START_SYSEX,
      STEPPER,
      0x02,
      deviceNum,
      speed & 0x7F, (speed >> 7) & 0x7F,
      accel & 0x7F, (accel >> 7) & 0x7F,
      accel & 0x7F, (accel >> 7) & 0x7F,
      END_SYSEX
    ];
    writeToTransport(this, data);
  }

  Firmata.prototype.stepperGo = function(deviceNum, direction, steps, speed, accel, callback) {
    var data = [
      START_SYSEX,
      STEPPER,
      0x01, // STEPPER_STEP from firmware
      deviceNum,
      direction, // one of this.STEPPER.DIRECTION.*
      steps & 0x7F, (steps >> 7) & 0x7F, (steps >> 14) & 0x7f,
      speed & 0x7F, (speed >> 7) & 0x7F
    ];
      data.push(
        accel & 0x7F, (accel >> 7) & 0x7F,
        accel & 0x7F, (accel >> 7) & 0x7F
      );
    data.push(END_SYSEX);
    writeToTransport(this, data);
    this.once("stepper-done-" + deviceNum, callback);
  };
  export default Firmata;