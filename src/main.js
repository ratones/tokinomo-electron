import { ipcRenderer } from 'electron'
import Test from './views/test'
import DeviceSettings from './views/settings'
import PatternsView from './views/patterns'
import SelfTest from './selftest/selftest';
import HttpClient from './network/client';
import {Status,Settings, Patterns} from './datamodels/status';
import { start } from 'repl';
import Arduino from './arduino/arduino';

class Main{
  constructor(){
    this.testTab = null;
    this.settingsTab = null;
    this.patternsTab = null;
    this.checkRoutineInterval = null;
    this.canStartRoutine = false;
    this.serverDateTimeSet = false;
    ipcRenderer.on('menu-click', (event, arg) => {
      console.log(arg) // prints "pong"
      this.openTab(arg.window)
    })

    document.querySelector('#btnStartRoutine').addEventListener('click',this.main.bind(this));
  }

  main(){
    let self = this;
    const st = new SelfTest()
    const client = new HttpClient();
    client.checkConnection().then((conn)=>{
      if(conn){
        st.runSelfTest().then((mov)=>{
          st.destroyVideo();
          self.postStatus(mov)
        });
      }
      else{
        console.log('No internet connection!');
        self.tryUSBConnect();
      }
    })
  }

  selfCheck(){
    let self = this;
    const st = new SelfTest()
    this.stopDevice();
    st.runSelfTest().then((mov)=>{
      st.destroyVideo();
      self.postStatus(mov)
    });
  }

  tryUSBConnect(){
    let self = this;
    let client = new HttpClient();
    let tryes = 0;
    // TODO : set datetime from RTC?
    console.log('No internet connection');
    //try to connect with GPRS 10 times
    let checkinterval = null;
    Arduino.powerUSB().then(() => {
        console.log('Start GPRS connection');
        setTimeout(() => {
            client.checkConnection().catch(() => {
                // try every 10 seconds
                checkinterval = setInterval(() => {
                    tryes++;
                    if (tryes > 10) {
                        clearInterval(checkinterval);
                        console.log('No GPRS connection');
                    }
                    client.checkConnection().then(res => {
                        if (res) {
                            clearInterval(checkinterval);
                            console.log('GPRS connection established');
                            self.poolServer();
                        }
                    });
                }, 10000);

            }).then(() => {
                self.poolServer();
            });
        }, 30000);
    });
  }

  startDevice(){
    console.info('Device started on ' + new Date().toDateString())
  }

  stopDevice(){
    this.canStartRoutine = false;
    console.error('Device stopped on ' + new Date().toDateString())
  }



  postStatus(mov){
    const client = new HttpClient();
    let formData = new FormData();
    let deviceID = Settings.persistKey('deviceID')
    formData.append('sound', Status.sound);
    formData.append('product', Status.integrity);
    //TODO get data from device!!!
    formData.append('mechanism', Status.mechanism);
    formData.append('battery', Status.battery);
    formData.append('activations', Settings.persistKey('activations'));
    formData.append('id', deviceID);
    let fileOfBlob = new File([mov.video], deviceID + '.ogg');
    formData.append('files', fileOfBlob);
    client.postFormData(formData).then((response)=>{
      console.log(response);
      Settings.save(response.settings);
      Patterns.savePatterns(response.patterns);
      if(response.servertime){
        let utc = parseInt(response.servertime.replace('/','').replace('Date','').replace('(','').replace(')',''));
        let dt = new Date(utc);
        console.log(dt)// TODO: Set system date time and write it to RTC
        this.serverDateTimeSet = true;
        Settings.setSystemDate(dt);
      }
      if (response.activations_request) {
        client.postActivations();
      }
      //wait for files
      this.loadFiles();
      if (this.canStartRoutine) {
        clearInterval(this.checkRoutineInterval);
        this.startDevice();
    } else {
        this.checkRoutineInterval = setInterval(() => {
            if (this.canStartRoutine) {
                clearInterval(this.checkRoutineInterval);
                this.startDevice();
                this.poolServer();
            }
        }, 1000);
    }
    });
  }

  poolServer(){
    let self = this;
    let client = new HttpClient();
    setInterval(()=>{
              client.getStatus().then((result) => {
                  if(!self.serverDateTimeSet){
                      let utc = parseInt(result.servertime.replace('/','').replace('Date','').replace('(','').replace(')',''));
                      let dt = new Date(utc);
                      Settings.setSystemDate(dt);
                      self.serverDateTimeSet = true;
                  }
                  /**
                   * if requested status we stop routine
                   * get status and activations then start routine again
                   */
                  if (result.request_status || result.request_activations || result.request_reset) {
                      //Arduino.stopProcedure().then(() => {
                          if (result.request_status) {
                              // perform selfcheck then flag to restart arduino
                              self.selfCheck();
                          }
                          if (result.request_reset) {
                              Settings.resetDevice();
                          }
                          if (result.request_activations) {
                              client.postActivations().then(() => {
                                  //ready to start arduino
                              });
                          }
                          // });
                      }
                  })
              },30000);
  }

  loadFiles(){
    const client = new HttpClient();
    client.downloadMelodies().then(() => {
      this.canStartRoutine = true;
    })
  }


  openTab(name) {
    let self = this;
    if (document.querySelector(`#${name}-tab`)) {
      this.setActiveTab(name);
      return;
    }
    let markup = `<div class="tab-item active" id="${name}-tab" target="app-${name}">
    <span class="icon icon-cancel icon-close-tab" id="close-${name}"></span>
    Tab ${name}
    </div>`;
    document.querySelector('#app-tabs').insertAdjacentHTML('beforeend', markup);
    if(name != 'console')
    document.querySelector(`#close-${name}`).addEventListener('click', self.closeTab.bind(self,name))
    document.querySelector(`#${name}-tab`).addEventListener('click', () => {
      self.setActiveTab(name);
    })
    self.setActiveTab(name);
    console.log('settings page')
  }
  closeTab(name) {
    console.log(event)
    event.stopImmediatePropagation()
    this.setActiveTab('console')
    let tab = document.querySelector(`#${name}-tab`)
    tab.parentNode.removeChild(tab);
    // switch(name){
    //   case 'test':
    //     this.testTab.dispose();
    //     this.testTab = null;
    //   break;
    //   case 'settings':
    //     this.settingsTab.dispose();
    //     this.settingsTab = null;
    //   break
    //   case 'patterns':
    //     this.patternsTab.dispose();
    //     this.patternsTab = null;
    //   break
    // }
  }
  setActiveTab(name) {
    let tab = document.querySelector(`#${name}-tab`);
    let target = tab.getAttribute('target');
    document.querySelectorAll('.tab-item').forEach((el) => {
      el.classList.remove('active');
      let t = el.getAttribute('target');
      document.querySelector(`#${t}`).classList.add('hide');
      document.querySelector(`#${t}`).classList.remove('show');
    })
    tab.classList.add('active');
    document.querySelector(`#${target}`).classList.remove('hide');
    document.querySelector(`#${target}`).classList.add('show');

    switch(name){
      case 'test':
        if(!this.testTab){
          this.testTab = new Test();
        }
        this.testTab.enableControls();
      break;
      case 'settings':
        if(!this.settingsTab){
          this.settingsTab = DeviceSettings;
        }
        DeviceSettings.bindValues();

      break
      case 'patterns':
        if(!this.patternsTab){
          this.patternsTab = new PatternsView();
        }
        this.patternsTab.buildView();
      break
    }
  }

}




export default new Main()
