import { app, shell, BrowserWindow, ipcMain,screen, dialog,session ,nativeImage} from 'electron'
import { join,extname } from 'path'
import fs from 'fs'
import os from 'os'
import icon from '../../resources/icon.png?asset'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {registerWindowId,removeWindowId} from './windowManager'
export const createWindow = ():BrowserWindow=>{
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
                if(!ext.endsWith('mp4')){
                  setTimeout(()=>{
                    mainWindow.webContents.send('memory-background',{buffer:data,extname:ext})
                  },2000)
                }else{
                  setTimeout(()=>{
                    mainWindow.webContents.send('mp4-ready',{flag:true})
                  },2000)
                }
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
    //缩略图
    function play() {
        return mainWindow.setThumbarButtons([
            {
                tooltip: '上一首',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/prev.png')),
                click() {
                    mainWindow.webContents.send('main-prev')
                }
            },
            {
                tooltip: '暂停',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/stop.png')),
                click() {
                    stop()
                    mainWindow.webContents.send('main-play')
                }
            },
            {
                tooltip: '下一首',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/next.png')),
                click() {
                    mainWindow.webContents.send('main-next')
                }
            }
        ])
    }

    function stop() {
        mainWindow.setThumbarButtons([
            {
                tooltip: '上一首',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/prev.png')),
                click() {
                    mainWindow.webContents.send('main-prev')
                }
            },
            {
                tooltip: '播放',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/play.png')),
                click() {
                    play();
                    mainWindow.webContents.send('main-play')
                }
            },
            {
                tooltip: '下一首',
                icon: nativeImage.createFromPath(join(__dirname, '../icons/next.png')),
                click() {
                    mainWindow.webContents.send('main-next')

                }
            }
        ])
    }
    stop();
    ipcMain.on('render-play', () => {
        play();
    })
    ipcMain.on('render-play-fail', () => {
        stop();
    })
    mainWindow.setThumbnailClip({ x: 10, y: 0, width: 150, height: 60 })
    mainWindow.setThumbnailToolTip('大牛马音乐')
    ipcMain.on('change-play-thum', (e, message) => {
        console.log(message);

        mainWindow.setThumbnailToolTip(message)
        mainWindow.setTitle(message)
    })
    //缩略图
    ipcMain.on('new-window', (e, message) => {
        e.preventDefault();
        shell.openExternal(message);
    })
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
                event.reply('mp4-ready',{flag:false})
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
    ipcMain.on('recove-background',()=>{
      let basePath = ''
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        basePath = '../../resources'
      } else {
        basePath = '../../../app.asar.unpacked/resources'
      }
      new Promise((resolve, reject)=>{
        fs.readdir(join(__dirname,basePath),(err,list)=>{
          resolve(list)
        })
      }).then((list:any)=>{
        for(let i=0 ;i<list.length;i++){
          if(list[i].startsWith('background')){
              fs.unlink(join(__dirname,basePath,list[i]),()=>{})
          }
        }
      })
    })
    //注册名称
    mainWindow.webContents.on('did-finish-load', () => {
        // 二、注册窗口id
        registerWindowId('Main', mainWindow.webContents.id);
    })

    mainWindow.webContents.on('destroyed', () => {
        // 三、销毁窗口 id
        removeWindowId('Main');
    })
    return mainWindow
}

export const lrcwindow = (): any => {
  const child = new BrowserWindow({
      frame: false, //隐藏默认控件
      transparent: true,
      backgroundColor: '#00000000',
      hasShadow:false,
      minWidth:616,
      minHeight:123,
      width:616,
      height:123,
      maxHeight:291,
      show: false,
      skipTaskbar: true,
      // titleBarStyle:'hidden',
      alwaysOnTop:true,
      webPreferences: {
        nodeIntegration: true,
        // contextIsolation: false,
        preload: join(__dirname, "../preload/index.js"),
      },
  })
  child.webContents.toggleDevTools()
  //注册名称
  child.webContents.on('did-finish-load', () => {
      // 二、注册窗口id
      registerWindowId('Ci', child.webContents.id);
  })
  
  child.webContents.on('destroyed', () => {
      // 三、销毁窗口 id
      removeWindowId('Ci');
  })
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    child.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/lyric`)
  } else {
    child.loadFile(join(__dirname, '../renderer/index.html#lyric'))
  }
  function SendXY(){
      child.webContents.send('lyric-x-y',{x:child.getSize()[0],y:child.getSize()[1]})
  }

  child.on('will-resize',SendXY)
  //得到宽高
  ipcMain.on('get-child-x-y',(event)=>{
      event.returnValue = {x:child.getSize()[0],y:child.getSize()[1]}
  })

  //移动
  let X,Y;
  let screenMoveChil:any;
  ipcMain.on('move-child',(e,obj)=>{
      let {mouseX,mouseY,width,height} = obj;
      let { x, y } = child.getBounds();  //左上点坐标
      if(!screenMoveChil){
          screenMoveChil = setInterval(() => {
              X = screen.getCursorScreenPoint().x
              Y = screen.getCursorScreenPoint().y
              child.setBounds({width:width,height:height,x:x + (X - (mouseX + x)),y:y + (Y - (mouseY + y))})
          }, 10)
      }
  })
  ipcMain.on('destory-move-child',()=>{
      clearInterval(screenMoveChil)
      screenMoveChil = null;
  })

  //打开歌词子窗口
  ipcMain.on('open-lyric', (e, flag) => {
      child.setAlwaysOnTop(true, 'pop-up-menu')
      if (flag == true) {
          child.show()
      } else {
          child.hide();
      }
  })

  //锁定与不锁定
  ipcMain.on('no-resizable',()=>{
      child.setResizable(false)
  })
  ipcMain.on('can-resizable',()=>{
      child.setResizable(true)
  })

  ipcMain.on('mouse-can',()=>{
      child.setIgnoreMouseEvents(false)
  })
  ipcMain.on('mouse-no',()=>{
      child.setIgnoreMouseEvents(true,{forward:true})
  })


  return child
}
  