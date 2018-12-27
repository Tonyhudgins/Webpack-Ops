import { app, BrowserWindow, dialog } from 'electron';
import { ipcMain } from 'electron';
import * as path from 'path';
import * as url from 'url';
import fs from 'fs';
import installExtension, { MOBX_DEVTOOLS } from 'electron-devtools-installer';

const { promisify } = require('util');
const exec = promisify(require('child_process').exec)

let generate = async function generateStats () {
  const stats = await exec("rimraf dist && webpack --watch --config ./webpack.dev.js --progress --colors --profile --json > webpack-stats.json")
  return { stats }
};


installExtension(MOBX_DEVTOOLS)
  .then((name: any) => console.log(`Added Extension: ${name}`))
  .catch((err: any) => console.log(`An error occurred: `, err));


let mainWindow: Electron.BrowserWindow;

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    height: 800,
    width: 1000,
  });

  // and load the index.html of the app.
  mainWindow.loadURL(
    url.format({
      pathname: path.join(__dirname, './index.html'),
      protocol: 'file:',
      slashes: true,
    })
  );

  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    mainWindow = null;
  });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On OS X it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it"s common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (mainWindow === null) {
    createWindow();
  }
});

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.

// interface Person {
//   first: string,
//   last: string;
//   [key: string]: any
// }

// const person: Person = {
//   first: 'Jeff',
//   last: 'Delaney'
// }

// type MyList = [number?, string?, boolean?]


/*********************************************
 * Event listeners from Renderer to Main
 *********************************************/ 

ipcMain.on('load-package.json', (event: any, arg: any) => {
  // arg unimportant. selectPackage shows file dialog
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')  // sends pong

  selectPackageJson()
})

ipcMain.on('read-config', (event: any, configNumber: any) => {
  // after package.json is loaded configs have been sent to renderer and user
  // has now selected one and we need to load
  console.log("on load-config")
  console.log("use configuration: ", configNumber) 
  readConfig(configNumber)
})




ipcMain.on('load-stats.json', (event: any, arg: any) => {
  // arg unimportant. User has selected to load a stats file. selectStatsJson() will present file loading dialog
  console.log(arg) // prints "ping"
  event.sender.send('asynchronous-reply', 'pong')

  selectStatsJson()
})

ipcMain.on('install-pluggins', (event: any, arrPluginsChecked: string[]) => {
  //npm install --prefix ./install/here mini-css-extract-plugin
  console.log(arrPluginsChecked)
  var exec = require('child_process').exec;
var child;
if (arrPluginsChecked.indexOf('checkedMini') > -1) {
  child = exec("npm install --prefix /Users/heiyeunglam/Desktop/Project/ProductionProject/Webpack-Optimizer mini-css-extract-plugin",
    function (error: any, stdout: any, stderr: any) {
      console.log('stdout: ' + stdout);
      console.log('stderr: ' + stderr);
      if (error !== null) {
          console.log('exec error: ' + error);
      }
    })
  }
});

/**
 * Event handlers - file loading / parsing
 * Loading parsing of package.json file
 * Selection of webpack config
 * Loading parsing of webpack config file
 **/ 

function selectPackageJson (){
  let file = dialog.showOpenDialog({ properties: ['openFile'] })[0]  // 'openDirectory', 'multiSelections'
  if (file != undefined) {
    loadPackage(file)
  }
}

function loadPackage(file: string) {
  console.log("loadPackage")
  fs.readFile(file, (err, data) => {
    if (err) {
      //    alert("An error ocurred updating the file" + err.message); //alert doesn't work.
      console.log(err);
      return;
    }
    selectConfig(JSON.parse(data.toString()));  
  });
}
  
// temp store variable. This shouldn't be global, but works for the moment.
const listOfConfigs: Array<string> = [];

function selectConfig(packageFile: any) {
  console.log("selectConfig")

  let output = "webpack configurations in package.json.\n" ;
  const entries = packageFile.scripts;
//  const listOfConfigs: Array<string> = [];  // made global for inter function communication
  for (let entry in entries) {
    if (entries[entry].includes('webpack')) {
      output += `${entry} - ${entries[entry]}\n`
      listOfConfigs.push(entries[entry])
    }
  }

  console.log(output + `\n`)

  mainWindow.webContents.send('choose-config', listOfConfigs)
}

function readConfig(entry: number) {
  console.log("readConfig")
  console.log("listOfConfigs", listOfConfigs)
  console.log("User selected entry", entry)
  console.log(`selecting ${entry? "1st": "second"} configuration.\n` );
  

  let config = listOfConfigs[entry].split("--config" )[1].trimLeft().split(" ")[0]
  console.log(config)
  fs.readFile(config, (err, data) => {
    if (err) {
      console.log("An error ocurred loading: " + err.message);
      console.log(err);
      return;
    }
    const configFile: string = data.toString();
    console.log(configFile);
    parseConfig(configFile)
  });
}
//// using AST

//// without using AST
function parseConfig(entry: string) {
  // todo: use Acorn AST parsing instead 
  console.log("doing parseConfig")
  function findObjects (entry: string) {
    const arr = []
    // find first object definition start
    let index = entry.search(/\w+\s*=\s*{/)

      console.log(entry.substr(index, 20))
    // from that starting point find the matched {}
    let end: number = findMatched(entry.substring(index), "}", "{")
    //loop
    arr.push(entry.substr(index, end))
    return arr
  }
  let webpackObjs: Array<string> = findObjects(entry); 
  console.log('hi')
  console.log(webpackObjs.toString());
  return webpackObjs.toString()
}

function findMatched (str: string, char: string , nestedChar: string): number {
  // replace this with Acorn Abstract Syntax Tree parsing  (parse JS module)
  // desire to preserve Comments

  console.log("doing findMatched")
  // if ()
  let i = str.search(/[{}]/)
  console.log(str[i])
  if (str[i] === char) return i
  if (str[i] === nestedChar) {
    console.log(str.substr(0, i))
   // return  findMatched(str.substring(i + findMatched(str[i], "}", "{")) , "}", "{")
  }
}



/**
 * Event handlers - file loading / parsing
 * Loading parsing of webpack stats file
 **/ 

function selectStatsJson (){
  let file = dialog.showOpenDialog({ properties: ['openFile'] })[0]
  if (file != undefined) {
    loadStats(file)
  }
}

function loadStats(file: string) {
  fs.readFile(file, (err, data) => {
    if (err) {
      //    alert("An error ocurred updating the file" + err.message); //alert doesn't work.
      console.log(err);
      return;
    }
    // clean and send back JSON stats file
    //let content = data.toString()
    let content = data.toString();

    //console.log(content)
    content = content.substr(content.indexOf("{"));

    //splits multiple JSON objects if more than one exists in file
    content = content.split(/(?<=})[\n\r\s]+(?={)/)[1]  
    content = JSON.parse(content)
    //let content1 = JSON.parse(content)
    while (!content.hasOwnProperty("builtAt")) {
      content = content.children[0]
    }
    let returnObj = {};
    returnObj.timeStamp = Date.now();
    returnObj.time = content.time;
    returnObj.hash = content.hash;
    returnObj.errors = content.errors
    returnObj.size = content.assets.reduce((size: number , asset: any): void => size + asset.size, 0)
    returnObj.assets = content.assets.map(asset => ({
      name: asset.name,
      chunks: asset.chunks,
      size: asset.size,
    }));

    returnObj.chunks = content.chunks.map(chunk => ({
      size: chunk.size,
      files: chunk.files,
      modules: chunk.modules ?
        chunk.modules.map(module => ({
          name: module.name,
          size: module.size,
          id: module.id,
        }))
        : [],
    }));

    let Pdata: any = []
    Pdata.push(returnObj)
    //loops through assets
    let i = 0; // or the latest build
    let path: string;
    let sizeStr: string;
    let sunBurstData = [];


    for (var k = 0; k < Pdata[i].chunks.length; k++) {
      for (var l = 0; l < Pdata[i].chunks[k].modules.length; l++) {
        sizeStr = Pdata[i].chunks[k].modules[l].size.toString();
        path = Pdata[i].chunks[k].modules[l].name.replace("./", "");
        sunBurstData.push([path, sizeStr])
      }
    }
    const sunBurstDataSum: number = sunBurstData.reduce((sum: number, el:any):number => {
      return sum += parseInt(el[1])
    },0)
  
  

    console.log(sunBurstDataSum)
    //console.log(co)
    // console.log(content.substring(0, 40))
    mainWindow.webContents.send('display-stats-reply', sunBurstData)

    //mainWindow.webContents.send('display-stats-reply', JSON.parse(content))
  });
}
