import {Patterns} from './../datamodels/status';

export default class PatternsView {
  constructor() {

  }
  buildView() {
    let patterns = Patterns.getPatterns().sort((a, b) => {
      if (a.filename < b.filename) {
        return -1;
      }
      if (a.filename > b.filename) {
        return 1;
      }
      return 0;
    });
    let page = document.querySelector('#app-patterns');
    page.innerHTML = '';
    patterns.forEach(p => {
      //build file container
      let fieldset = document.createElement('fieldset');
      let legend = document.createElement('legend');
      legend.innerText = p.filename;
      fieldset.appendChild(legend);
      //add button
      let addBtn = document.createElement('button');
      addBtn.innerText = 'Add row';
      addBtn.id = p.fileid;
      addBtn.addEventListener('click', this.addRow.bind(this));
      fieldset.appendChild(addBtn);
      let saveBtn = document.createElement('button');
      saveBtn.innerText = 'Save Local';
      saveBtn.id = 'save' + p.fileid;
      saveBtn.addEventListener('click', this.savePatternLocal.bind(this));
      fieldset.appendChild(saveBtn);
      let saveBtnServer = document.createElement('button');
      saveBtnServer.innerText = 'Save Server';
      saveBtnServer.id = 'save' + p.fileid;
      saveBtnServer.addEventListener('click', this.savePatternServer.bind(this));
      fieldset.appendChild(saveBtnServer);

      let testBtn = document.createElement('button');
      testBtn.innerText = 'Test pattern';
      testBtn.id = 'test' + p.fileid;
      testBtn.addEventListener('click', this.runPatternTest.bind(this));
      fieldset.appendChild(testBtn);
      //patterns container
      let paternsTable = document.createElement('div');
      paternsTable.classList.add('file-patterns');
      paternsTable.id = 'file' + p.fileid;
      p.pattern.forEach(x => {
        let row = document.createElement('div');
        row.classList.add('patern-row');
        let pauseCol = document.createElement('div');
        pauseCol.classList.add('patern-column');
        let pauseEditor = document.createElement('input');
        pauseEditor.value = x.pause;
        pauseEditor.classList.add('pause-value');
        pauseCol.appendChild(pauseEditor);
        let distanceCol = document.createElement('div');
        distanceCol.classList.add('patern-column');
        let distanceEditor = document.createElement('input');
        distanceEditor.value = x.distance;
        distanceEditor.classList.add('direction-value');
        distanceCol.appendChild(distanceEditor);
        let idCol = document.createElement('div');
        idCol.classList.add('patern-column');
        let idEditor = document.createElement('input');
        idEditor.type = 'hidden';
        idEditor.value = x.id;
        idEditor.classList.add('id-value');
        idCol.appendChild(idEditor);
        let delBtn = document.createElement('button');
        delBtn.innerHTML = 'Delete';
        delBtn.id = x.id;
        delBtn.addEventListener('click', this.delRow);
        delBtn.classList.add('patern-column');
        row.appendChild(pauseCol);
        row.appendChild(distanceCol);
        row.appendChild(idCol);
        row.appendChild(delBtn);
        paternsTable.appendChild(row);
      });
      fieldset.appendChild(paternsTable);
      page.appendChild(fieldset);
    });

  }
  addRow(e) {
    let fileid = e.target.id;
    let paternsTable = document.querySelector('#file' + fileid);
    let row = document.createElement('div');
    row.classList.add('patern-row');
    let pauseCol = document.createElement('div');
    pauseCol.classList.add('patern-column');
    let pauseEditor = document.createElement('input');
    pauseEditor.value = 0;
    pauseEditor.classList.add('pause-value');
    pauseCol.appendChild(pauseEditor);
    let distanceCol = document.createElement('div');
    distanceCol.classList.add('patern-column');
    let distanceEditor = document.createElement('input');
    distanceEditor.value = 0;
    distanceEditor.classList.add('direction-value');
    distanceCol.appendChild(distanceEditor);
    let idCol = document.createElement('div');
    idCol.classList.add('patern-column');
    let idEditor = document.createElement('input');
    idEditor.type = 'hidden';
    idEditor.value = 0;
    idEditor.classList.add('id-value');
    idCol.appendChild(idEditor);
    let delBtn = document.createElement('button');
    delBtn.innerHTML = 'Delete';
    //delBtn.id=0;
    delBtn.addEventListener('click', this.delRow);
    delBtn.classList.add('patern-column');
    row.appendChild(pauseCol);
    row.appendChild(distanceCol);
    row.appendChild(idCol);
    row.appendChild(delBtn);
    paternsTable.appendChild(row);
  }
  delRow(e) {
    let row = e.target.parentNode;
    row.parentNode.removeChild(row);
  }
  savePatternServer(e) {
    let fileid = e.target.id.replace('save', '');
    let container = document.querySelector('#file' + fileid);
    let newPatterns = [];
    container.querySelectorAll('.patern-row').forEach((row) => {
      let pause = row.querySelector('.pause-value').value;
      let direction = row.querySelector('.direction-value').value;
      let id = row.querySelector('.id-value').value;
      newPatterns.push({ pause: pause, distance: direction, file_id: fileid });
    });
    console.log(newPatterns);
    Patterns.saveServer(fileid, newPatterns);
    //  let client = new HttpClient();
    //  client.postPattern(fileid,JSON.stringify(newPatterns)).then(()=>{
    //   let patterns = this.getPatterns();
    //   let fp = patterns.find(p=>{return p.fileid == fileid});
    //   fp.pattern = newPatterns;
    //   this.savePatterns(patterns);
    //  });
  }
  savePatternLocal(e) {
    let fileid = e.target.id.replace('save', '');
    let container = document.querySelector('#file' + fileid);
    let newPatterns = [];
    container.querySelectorAll('.patern-row').forEach((row) => {
      let pause = row.querySelector('.pause-value').value;
      let direction = row.querySelector('.direction-value').value;
      let id = row.querySelector('.id-value').value;
      newPatterns.push({ pause: pause, distance: direction, file_id: fileid });
    });
    console.log(newPatterns);
    Patterns.saveLocal(fileid,newPatterns);

  }

  runPatternTest(e) {
    let fileid = e.target.id.replace('test', '');
    let container = document.querySelector('#file' + fileid);
    let newPatterns = [];
    container.querySelectorAll('.patern-row').forEach((row) => {
      let pause = row.querySelector('.pause-value').value;
      let direction = row.querySelector('.direction-value').value;
      let id = row.querySelector('.id-value').value;
      newPatterns.push({ pause: pause, distance: direction, file_id: fileid });
    });
    console.log(newPatterns);

    Patterns.saveLocal(fileid,newPatterns)
    Patterns.runTest(fileid);
  }
}
