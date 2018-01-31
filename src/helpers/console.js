class console{
  constructor(){
      this.console = document.querySelector('#deviceLog');
  }
  log(data){
      window.console.log(data);
      let node = document.createElement('div');
      node.innerText = data;
      this.console.appendChild(node);
      this.cleanup();
  }
  warn(data){
      window.console.warn(data);
      let node = document.createElement('div');
      node.style.color = 'orange';
      node.innerText = data;
      this.console.appendChild(node);
      this.cleanup();
      // this.console.value += '<span color="orange">' + data + '</span><br>';
  }
  error(data){
      window.console.error(data);
      let node = document.createElement('div');
      node.style.color = 'red';
      node.innerText = data;
      this.console.appendChild(node);
      this.cleanup();
      // this.console.value += '<span color="red">' + data + '</span><br>';
  }
  info(data){
      window.console.info(data);
      let node = document.createElement('div');
      node.style.color = 'blue';
      node.innerText = data;
      this.console.appendChild(node);
     this.cleanup();
      // this.console.value += '<span color="blue">' + data + '</span><br>';
  }
  cleanup(){
      if(this.console.childNodes.length > 50){
          this.console.removeChild(this.console.childNodes[0]);
      }
  }
}
export default new console();
