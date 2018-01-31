let myconsole = document.querySelector('#deviceLog');

function log(data){
  let node = document.createElement('div');
  node.innerText = data;
  myconsole.appendChild(node);
  cleanup();
}
function warn(data){
  let node = document.createElement('div');
  node.style.color = 'orange';
  node.innerText = data;
  myconsole.appendChild(node);
  cleanup();
  // myconsole.value += '<span color="orange">' + data + '</span><br>';
}
function error(data){
  let node = document.createElement('div');
  node.style.color = 'red';
  node.innerText = data;
  myconsole.appendChild(node);
  cleanup();
  // myconsole.value += '<span color="red">' + data + '</span><br>';
}
function info(data){
  let node = document.createElement('div');
  node.style.color = 'blue';
  node.innerText = data;
  myconsole.appendChild(node);
 cleanup();
  // myconsole.value += '<span color="blue">' + data + '</span><br>';
}
function cleanup(){
  if(myconsole.childNodes.length > 50){
      myconsole.removeChild(myconsole.childNodes[0]);
  }
  myconsole.scrollTop = myconsole.scrollHeight;
}


function proxy(context, method, message) {
  return function() {
    switch(message){
      case 'Log:':
        log(Array.prototype.slice.apply(arguments));
      break;
      case 'Error:':
        error(Array.prototype.slice.apply(arguments));
      break;
      case 'Warning':
        warn(Array.prototype.slice.apply(arguments));
      break;
      case 'Info:':
        info(Array.prototype.slice.apply(arguments));
      break;
    }
    method.apply(context, [message].concat(Array.prototype.slice.apply(arguments)))
  }
}

// let's do the actual proxying over originals
console.log = proxy(console, console.log, 'Log:')
console.error = proxy(console, console.error, 'Error:')
console.warn = proxy(console, console.warn, 'Warning:')
console.info = proxy(console, console.info, 'Info:')
