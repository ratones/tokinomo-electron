import {ipcRenderer} from 'electron'
import {Settings} from './../datamodels/status';

class DeviceSettings {
  constructor() {
    this.settings = Settings.data;
    // this.USE_BATTERY_RESET = false;
    // this.BATTERY_RESET_INTERVAL = 30000;
    document.querySelector('#btnSaveLocal').addEventListener('click', this.saveLocal.bind(this));
    document.querySelector('#btnSaveServer').addEventListener('click', this.saveServer.bind(this));
  }

  loadSettings() {
    let settings = Settings.persistKey('deviceSettings');
    if (settings) {
      this.settings = JSON.parse(settings);
    }else{
      this.settings = ipcRenderer.sendSync('sync-settings');
    }
  }

  bindValues() {
    let self = this;
    this.settings = Settings.loadSettings();
    this.settings.forEach((key) => {
      let el = document.querySelector('#' + key.name);
      if (el) {
        if (el.type == 'checkbox') {
          el.checked = key.val == 'true' ? true : false;
        } else {
          if (el.id.search('TIME') != -1 && el.id != "WAITING_TIME") {
            let dt = new Date(key.val);
            //el.value = dt;
            // dt.setHours(dt.getHours() + this.UTC_DIFF);
            el.value = String('00' + dt.getHours()).slice(-2) + ':' + String('00' + dt.getMinutes()).slice(-2) + ':' + String('00' + dt.getSeconds()).slice(-2);
          } else {
            el.value = key.val;
          }
        }
        el.addEventListener('change', this.valueChanged.bind(self,el))
      }
    });
  }

  valueChanged(el){
    let setting = this.settings.find(x=>x.name == el.id);
    if (el.type == 'checkbox') {
      setting.val =  el.checked ? 'true' : 'false';
    } else {
      if (el.id.search('TIME') != -1 && el.id != "WAITING_TIME") {
        let dt = new Date();
        dt.setHours(el.value.split(':')[0]);
        dt.setMinutes(el.value.split(':')[1]);
        dt.setSeconds(el.value.split(':')[2]);
        //el.value = dt;
        // dt.setHours(dt.getHours() + this.UTC_DIFF);
        setting.val = dt;
      } else {
       setting.val = el.value;
      }
  }
}

  saveLocal(){
    Settings.save(this.settings);
  }
  saveServer(){
    Settings.saveServer(this.settings);
  }


}
export default new DeviceSettings();
