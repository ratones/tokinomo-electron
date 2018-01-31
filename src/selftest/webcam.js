export default class CamHandler{
  constructor(options){
    if(!document.querySelector('#myVideo')){

      let video = document.createElement('video');
      video.setAttribute('id', 'myVideo');
      video.classList.add('video-js');
      video.classList.add('vjs-default-skin');
      document.querySelector('.video-control').appendChild(video);
    }
    let player = videojs("myVideo", {
          controls: true,
          width: 320,
          height: 240,
          fluid: false,
          plugins: {
              record: options
          }
      }, function(){
          // print version information at startup
          videojs.log('Using video.js', videojs.VERSION,
              'with videojs-record', videojs.getPluginVersion('record'),
              'and recordrtc', RecordRTC.version);
      });
      // error handling
      player.on('deviceError', function() {
          // Util.log('device error:', player.deviceErrorCode);
      });
      player.on('error', function(error) {
          // Util.log('error:', error);
      });
      // user clicked the record button and started recording
      player.on('startRecord', function() {
          // Util.log('started recording!');
      });
      // user completed recording and stream is available
      // player.on('finishRecord', function() {
      //     // the blob object contains the recorded data that
      //     // can be downloaded by the user, stored on server etc.
          // Util.log('finished recording: ', player.recordedData);
      //     player.record().saveAs({'video': 'my-video-file-name.webm'});
      // });
      this.player = player;
  }
  setVideo(options){
      if(this.player)
          this.player.record().destroy();
      let video = document.createElement('video');
      video.setAttribute('id', 'myVideo');
      video.classList.add('video-js');
      video.classList.add('vjs-default-skin');
      document.querySelector('.video-control').appendChild(video);
      this.player = videojs("myVideo", {
          controls: true,
          width: 600,
          height: 300,
          fluid: false,
          plugins: {record:options}
      }, function() {
          // print version information at startup
          videojs.log('Using video.js', videojs.VERSION,
          'with videojs-record', videojs.getPluginVersion('record'),
          '+ videojs-wavesurfer', videojs.getPluginVersion('wavesurfer'),
          'and recordrtc', RecordRTC.version);
      });
  }

  start(){
      this.player.record().getDevice();
  }
  stop(){
      this.player.record().reset();
  }
  destroy(){
      this.player.record().destroy();
  }
  reset(){
      this.player.record().reset();
  }
  snapshot(){
      return new Promise((resolve,reject)=>{
          this.player.record().getDevice();
          this.player.on('deviceReady',()=>{
              this.player.record().start();
          })
          this.player.on('finishRecord',()=>{
              resolve(this.player.recordedData);
              this.player.off('deviceReady');
              this.player.off('finishedRecord');
              this.player.off('error');
          });
          this.player.on('error', function(error) {
              reject(error);
              this.player.off('deviceReady');
              this.player.off('finishedRecord');
              this.player.off('error');
          });
      });
  }
  record(){
      return new Promise((resolve,reject)=>{
          this.player.record().getDevice();
          this.player.on('deviceReady',()=>{
              this.player.record().start();
          })
          this.player.on('finishRecord',()=>{
              resolve(this.player.recordedData);
              this.player.off('deviceReady');
              this.player.off('finishedRecord');
              this.player.off('error');
              // this.player.record().destroy();
          });
          this.player.on('error', function(error) {
              reject(error);
              this.player.off('deviceReady');
              this.player.off('finishedRecord');
              this.player.off('error');
              // this.player.record().destroy();
          });
      });
  }
}
