import { app, shell, BrowserWindow, ipcMain,screen, dialog,session } from 'electron'
import { join,extname } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import os from 'os'
import videoServer from './video-server'
// import *  as bytenode from 'bytenode'
const createWindow = ():BrowserWindow=>{
  let windowX: number = 0, windowY: number = 0; //中化后的窗口坐标
  let X: number, Y: number; //鼠标基于显示器的坐标
  let screenMove: any = null;  //鼠标移动监听
  const primaryDisplay = screen.getPrimaryDisplay()
  const { width, height } = primaryDisplay.workAreaSize
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1020,
    height: 670,
    // backgroundColor: '#00000000',
    frame: false, //隐藏默认控件
    resizable: false,
    maxHeight: 670,
    title: '大牛马音乐',
    // autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.webContents.toggleDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })
  //记忆背景
  ipcMain.on('renderer-ready',()=>{
    let basePath = ''
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      basePath = '../../resources'
    } else {
      basePath = '../../../app.asar.unpacked/resources'
    }
    fs.readdir( join(__dirname,basePath),(err,list)=>{
      let ext = ''
      if(err)console.log(err);
      else{
        if(list.some((item)=>{
          if(item.startsWith('background')) ext = item.split('.')[1]
          return item.startsWith('background')
        })){
          fs.readFile(join(__dirname,basePath,`background.${ext}`),(err,data)=>{
            if(!err){
              setTimeout(()=>{
                mainWindow.webContents.send('memory-background',{buffer:data,extname:ext})
              },2000)
            }
          })
        }
      }

    })
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
  ipcMain.on('to-close', () => {
    mainWindow.close();
  })
  ipcMain.on('to-small', () => {
    mainWindow.minimize();
  })
  ipcMain.on('to-middle', () => {
      mainWindow.setContentBounds({ x: windowX, y: windowY, width: 1020, height: 670 })
      mainWindow.setBounds({ x: windowX, y: windowY, width: 1020, height: 670 })
      mainWindow.webContents.send('to-changeFished-finshed')
  })
  ipcMain.on('to-big', () => {
      windowX = mainWindow.getBounds().x
      windowY = mainWindow.getBounds().y
      mainWindow.setContentBounds({ x: 0, y: 0, width, height })
      mainWindow.setBounds({ x: 0, y: 0, width, height })
      mainWindow.webContents.send('to-changeFished-finshed')
  })
  ipcMain.on('move-screen', (e, obj) => {
    let { mouseX, mouseY } = obj //鼠标按下时的坐标
    let { x, y } = mainWindow.getBounds();  //左上点坐标
    console.log('按下时',screenMove);
    if(!screenMove){
        console.log('beginmoving');
        screenMove = setInterval(() => {
            X = screen.getCursorScreenPoint().x
            Y = screen.getCursorScreenPoint().y
            let nW = mainWindow.getContentBounds().width
            let nH = mainWindow.getContentBounds().height
            mainWindow.setContentBounds({width:nW,height:nH,x:x + (X - (mouseX + x)),y:y + (Y - (mouseY + y))})
        }, 10)
    }
  })
  ipcMain.on('cancel-screen', () => {
    console.log('endmoving');
    clearInterval(screenMove)
    screenMove = null;
  })
  //获取当前窗口的宽高
  ipcMain.on('get-screen-X-Y', (e) => {
    e.reply('there-X-Y', { width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
  })
  //上传背景图片
  ipcMain.on('upload-background',(event)=>{
    dialog.showOpenDialog(mainWindow,{
      title:'选择一张图片或一段视频',
      filters:[
        {name:'图片资源',extensions:['jpg','png','jpeg','webp']},
        {name:'视频资源',extensions:['mp4']}
      ],
      properties:['openFile','promptToCreate']
    }).then((obj)=>{
      const {canceled,filePaths} = obj
      if(!canceled){
        const filePath = filePaths[0]
        fs.readFile(filePath,(err,data)=>{
          if(!err){
            if(!extname(filePath).endsWith('mp4'))event.reply('file-ready', {liu:data,extname:extname(filePath)})
            else {
              event.reply('mp4-ready')
            }
          }else{
            console.log(err);
          }
        })
        //打包环境与开发环境
        let basePath = ''
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
          basePath = '../../resources'
        } else {
          basePath = '../../../app.asar.unpacked/resources'
        }
        const path = join(__dirname,basePath,`background${extname(filePath)}`)
        let fsL:any[] = []
        const p1 = new Promise((resolve, reject)=>{
          fs.readdir(join(__dirname,basePath),(err,list)=>{
            resolve(list)
          })
        }).then((list:any)=>{
          for(let i=0 ;i<list.length;i++){
            if(list[i].startsWith('background')){
              fsL.push(new Promise((resolve, reject) => {
                fs.unlink(join(__dirname,basePath,list[i]),()=>{
                  resolve('ok')
                })
              }))
            }
          }
        })
        Promise.all([p1,...fsL]).then((value)=>{
          let readStream = fs.createReadStream(filePath)
          let writeStream = fs.createWriteStream(path)
          readStream.pipe(writeStream)
        })
        // const path = join(__dirname,`../renderer/assets/background${extname(filePath)}`)
      }
    })
  })
  return mainWindow
}


// encryptFile()

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
// function encryptFile(){
//   bytenode.compileFile({
//     filename:__dirname + '/index.js',
//     output:__dirname+'/index.jsc'
//   })
//   const tpl = `require('bytenode');
//   require(__dirname + '/index.jsc');
//   `
//   writeFileSync(__dirname + '/index.js',tpl);
// }
app.whenReady().then(async() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await session.defaultSession.loadExtension(
      join(os.homedir(),'/AppData/Local/Google/Chrome/User Data/Default/Extensions/nhdogjmejiglipccpnnnanhbledajbpd/6.4.5_0')
    )
  }
  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })
  videoServer(createWindow())
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
