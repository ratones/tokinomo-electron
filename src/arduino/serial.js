import SerialPort from 'serialport';
const analog_sensors = {
    'A0': 0, 'A1': 1, 'A2': 2, 'A3': 3, 'A4': 4, 'A5': 5, 'A6': 6, 'A7': 7, 'A8': 8, 'A9': 9
}
class Serial {
    constructor() {
        this.commands = [];
    }

    attachCommand(command, identifier, callback) {
        let cmd = { command, identifier, callback };
        let can_attach = true;
       this.commands.forEach(c=> {
            if (c['command'] == command && c['identifier'] == identifier) {
                console.log("Command already attached");
                can_attach = false;
                return;
            }
        });
        if (can_attach) this.commands.push(cmd);
    }
    detach_command(command, identifier) {
        let index;
        this.commands.forEach((c, i) => {
            if (c['command'] == command && c['identifier'] == identifier) {
                index = i //command found
                // break;
            }
        });
        if (index)
            this.commands.splice(index, 1);
        else
            console.log("No command found");
    }
    detectArduinoPort() {
        let portname = "";
        return new Promise((resolve)=>{
            SerialPort.list(function (err, ports) {
                ports.forEach(function (port, i) {
                    console.log(port.comName);
                    //console.log(port.pnpId);
                    //console.log(port.manufacturer);
                    if (port.comName != "COM1") {
                        portname = port.comName;
                        resolve(portname);
                    }
                });
            });
        });
    }
    initialize() {
        return new Promise((resolve) => {
            this.detectArduinoPort().then(portname=>{
                resolve();
                // const parsers = SerialPort.parsers;
                // // Use a `\r\n` as a line terminator
                // const parser = new parsers.Readline({
                //     delimiter: '\r\n'
                // });
                // const port = new SerialPort(portname, {
                //     baudRate: 57600,
                //     autoOpen:false
                // });
                // port.pipe(parser);
                // port.on('open', () => {
                //     console.log('Port open');
                //     resolve();
                // });
                // parser.on('data', this.dataReceived.bind(this));
                // this.port = port
                // port.open();
            });
        });
    }
    dataReceived(data) {
        // console.log(data);
        let args = data.trim().replace(';', '').split(',');
        this.commands.forEach(c=>{
            if (c['command'] == args[0])
                c['callback'](args.slice(1, args.length));
        });
    }

    read_analog(sensor) {
        let self = this;
        let value;
        // # generate a temporary identifier for command
        let identifier = Math.random() * 1000;
        return new Promise((resolve, reject) => {
            // # send command to arduino and attach a callback to get the response
            self.attachCommand('2', identifier, (val) => {
                self.detach_command('2', identifier);
                resolve(val[0]);
            });
            self.send_command('2', [analog_sensors[sensor]])
        });
    }
    read_digital(sensor) {
        let self = this;
        let value;
        // # generate a temporary identifier for command
        let identifier = Math.random() * 1000;
        return new Promise((resolve, reject) => {
            // # send command to arduino and attach a callback to get the response
            self.attachCommand('3', identifier, (val) => {
                self.detach_command('3', identifier);
                resolve(val[0]);
            });
            self.send_command('3', [sensor]);
        });
    }
    write_analog(sensor, value) {
        this.send_command('5', [analog_sensors[sensor], value]);
    }

    write_digital(sensor, value) {
        this.send_command('4', [sensor, value]);
    }

    readRTC(){
      let self = this;
      let value;
      // # generate a temporary identifier for command
      let identifier = Math.random() * 1000;
      return new Promise((resolve, reject) => {
          // # send command to arduino and attach a callback to get the response
          self.attachCommand('10', identifier, (val) => {
              self.detach_command('10', identifier);
              resolve(val);
          });
          self.send_command('10', [0]);
      });
    }
    writeRTC(){
      let datetime = new Date();
      this.send_command('11', [datetime.getDate(), datetime.getMonth(), datetime.getFullYear(), datetime.getHours(), datetime.getMinutes(), datetime.getSeconds()]);
    }
    setRTCAlarm(date){
      this.send_command('12', [date.getSeconds(), date.getMinutes(), date.getHours(), date.getDate()]);
    }

    /**STEPPER */
    stepper_move(direction,steps,speed,accel,decel=0,delay=0){
        let self = this;
        let identifier = Math.random() *1000;
        return new Promise((resolve)=>{
            this.attachCommand('6',identifier,(val)=>{
                self.detach_command('6',identifier)
                resolve(val);
            });
            setTimeout(()=>{
                self.send_command('6',[direction,steps,speed,accel,decel]);
            },delay)
        });
    }

    stepper_home(speed,accel,decel){
        let self = this;
        let identifier = Math.random() *1000;
        return new Promise((resolve)=>{
            this.attachCommand('7',identifier,(val)=>{
                self.detach_command('7',identifier)
                resolve(val);
            });
            this.send_command('7',[speed,accel,decel])
        });
    }

    stepper_bounce(speed,accel,decel,amplitude){
        this.send_command('8',[speed,accel,decel,amplitude]);
    }

    stepper_bounce_rand(speed,accel,decel,maxamplitude,minamplitude){
        this.send_command('9',[speed,accel,decel,maxamplitude,minamplitude])
    }


    send_command(command, args) {
        let params = args.join(',');
        let cmd = `${command},${params};`;
        this.port.write(cmd)
    }
    disconnect() {
        this.port.close();
    }
}

export default new Serial();
