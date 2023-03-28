import { app, shell, BrowserWindow, ipcMain,screen, dialog,session ,nativeImage, globalShortcut, Menu} from 'electron'
import { join,extname, parse, resolve } from 'path'
import fs from 'fs'
import os from 'os'
import icon from '../../build/favicon.ico?asset'
import prevIcon from '../../build/prev.png?asset'
import playIcon from '../../build/play.png?asset'
import stopIcon from '../../build/stop.png?asset'
import nextIcon from '../../build/next.png?asset'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import {registerWindowId,removeWindowId} from './windowManager'
import chokidar from 'chokidar'
import NodeID3 from 'node-id3'
import request from 'request'
import crypto from 'crypto'
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
      icon:icon,
      webPreferences: {
        preload: join(__dirname, '../preload/index.js'),
        sandbox: false
      }
    })
    mainWindow.setAppDetails({
      appId:'大牛马音乐'
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
                icon: nativeImage.createFromPath(prevIcon),
                click() {
                    mainWindow.webContents.send('main-prev')
                }
            },
            {
                tooltip: '暂停',
                icon: nativeImage.createFromPath(stopIcon),
                click() {
                    stop()
                    mainWindow.webContents.send('main-play')
                }
            },
            {
                tooltip: '下一首',
                icon: nativeImage.createFromPath(nextIcon),
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
                icon: nativeImage.createFromPath(prevIcon),
                click() {
                    mainWindow.webContents.send('main-prev')
                }
            },
            {
                tooltip: '播放',
                icon: nativeImage.createFromPath(playIcon),
                click() {
                    play();
                    mainWindow.webContents.send('main-play')
                }
            },
            {
                tooltip: '下一首',
                icon: nativeImage.createFromPath(nextIcon),
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

    // const albumImage = nativeImage.createFromPath('resources/background.jpg');
    // const hwnd = mainWindow.getNativeWindowHandle().readUInt32LE(0);

    // const user32 = new ffi.Library('user32.dll', {
    //   'SendMessageA': ['long', ['long', 'int', 'long', 'long']],
    // });


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
    ipcMain.on('to-middle', (e) => {
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

    ipcMain.on('save-music',(e,{arrayBuffer,name,id3})=>{
      const buffer = Buffer.from(arrayBuffer);
      const imageUrl = id3.image
      fs.mkdirSync('download', { recursive: true });
      const cleanFileName = name.replace(/[\\/:\*\?"<>\|]/g, "");
      arrayBuffer = new Uint8Array(arrayBuffer);
      request.get(imageUrl, { encoding: null },function(error, response, body){
        if(error)console.log(error);
        const image = {
          mime: `image/${parse(imageUrl).ext}`,
          imageBuffer: body,
        };
        const oldtags = NodeID3.read(arrayBuffer);
        const newTags = Object.assign({},oldtags, id3);
        newTags['image'] = image
        newTags['userDefinedText']=
        [{
          "description":"song id",
          "value":id3.ids[0]
        },{
          "description":"al id",
          "value":id3.ids[0]
        },{
          "description":"ar ids",
          "value":id3.ids.slice(2).join(',')
        }]
        NodeID3.update(newTags, arrayBuffer, function(err, buffer) {
          if (err) {
            console.error(err);
            return;
          }
          fs.writeFileSync(`download/${cleanFileName}.mp3`, buffer);
          console.log(NodeID3.read(`download/${cleanFileName}.mp3`))
        });
        e.reply('save-music-finished',cleanFileName)
      })

    })
    ipcMain.on('get-download-list',(e)=>{
      if (fs.existsSync('download')) {
        const Files = fs.readdirSync('download')
        e.reply('look-download-list',Files)
      }else {
        e.reply('look-download-list',[])
      }
    })
    ipcMain.on('get-download-list-detail',(e)=>{
      if (fs.existsSync('download')) {
        const Files = fs.readdirSync('download')
        const detail:any[] = []
        Files.forEach((item)=>{
          detail.push(Object.assign(NodeID3.read(`download/${item}`),{path:resolve(`download/${item}`)}))
        })
        e.reply('look-download-list-detail',detail)
      }else {
        e.reply('look-download-list-detail',[])
      }
    })
    //下载目录文件变化
    const watcher = chokidar.watch('download', {
      persistent: true
    });
    const delMusic = (path:string)=>{
      const Files = fs.readdirSync('download')
      mainWindow.webContents.send('look-download-list',Files)
      const detail:any[] = []
      Files.forEach((item)=>{
        detail.push(NodeID3.read(`download/${item}`))
      })
      mainWindow.webContents.send('look-download-list-detail',detail)
    }
    const delDir = (path:string)=>{
      watcher.off('unlink', delMusic)
      watcher.off('unlinkDir', delDir)
      watcher.close()
      fs.mkdirSync('download', { recursive: true });
      watcher.on('unlink',delMusic)
      watcher.on('unlinkDir',delDir)
    }
    watcher.on('unlink',delMusic)
    watcher.on('unlinkDir',delDir)

    //合并音频切片
    // ipcMain.on('save-music-pick',async(e,{name})=>{
    //   name = name.replace(/[\\/:\*\?"<>\|]/g, "");
    //   console.log(name);
    //   const Files = fs.readdirSync('download')
    //   const fixName = name.endsWith('.mp3')?name:name+ '.mp3'
    //   const writeStream = fs.createWriteStream(`download/${fixName}`);
    //   for (const fileName of Files) {
    //     if(fileName.includes(name)){
    //       const readStream = fs.createReadStream('download/'+fileName);
    //       await new Promise<any>((resolve, reject) => {
    //         readStream.pipe(writeStream, { end: false });
    //         readStream.on('end', () => {
    //           console.log('end',fileName);
    //           fs.unlink('download/'+fileName,(err)=>{
    //             console.log('ok',fileName);
    //             if(err)console.log(err);
    //             resolve('ok')
    //           })
    //         });
    //       })
    //     }
    //   }
    //   writeStream.on('finish', () => {
    //     console.log('save-music-finished');
    //     if(!name.endsWith('.mp3'))name+='.mp3'
    //     e.reply('save-music-finished',name)
    //   });
    //   writeStream.end()
    // })
    //获取下载目录路径
    ipcMain.handle('get-download-path',()=>{
      return resolve('download')
    })
    ipcMain.on('open-download-dir',()=>{
      shell.openPath(resolve('download'))
    })
    //获取本地音乐
    ipcMain.handle('get-local-music',({},{path})=>{
      const buffer = Buffer.from(fs.readFileSync(path))
      return {base64:buffer.toString('base64')}
    })
    //添加本地文件目录
    ipcMain.handle('add-local-dir',({})=>{
       const paths:string[] | undefined = dialog.showOpenDialogSync(mainWindow,{
        title:'选择添加目录',
        properties:['openDirectory','promptToCreate','dontAddToRecent'],
      })
      if(paths == undefined){
        return {canceled:true,path:[]}
      }else{
        return {canceled:false,path:paths}
      }
    })
    let watcherLocalMusic: chokidar.FSWatcher | null = null;
    let paths:any[] = [];
    let delPath:any[] = []
    const DELAY_MS = 500; // 设定延迟时间为 500ms
    let timer;
    let timer2;
    ipcMain.handle('watch-files-toread-music',({},{readPath})=>{
      console.log(readPath);
      if (watcherLocalMusic !== null) {
        watcherLocalMusic.close(); // 如果 watcher 已经存在，关闭它
      }
      watcherLocalMusic = chokidar.watch(readPath, {
        persistent: true,
      })
      watcherLocalMusic.on('all', (event, path) => {
        if(extname(path) == '.mp3'){
          console.log(event, path);
          if(event == 'add' || event == 'change'){
            const t = Object.assign(NodeID3.read(path),{path})
            if(t.comment && t.comment.text.startsWith("163 key(Don't modify)")){
              t.comment.text = pares163Key(t.comment.text)
            }
            paths.push(t);
            clearTimeout(timer);
            timer = setTimeout(() => {
              mainWindow.webContents.send('local-music-paths-add', paths);
              paths = [];
            }, DELAY_MS);
          }else if(event == 'unlink'){
            delPath.push(path)
            clearTimeout(timer2);
            timer2 = setTimeout(() => {
              mainWindow.webContents.send('local-music-paths-del', delPath);
              delPath = [];
            }, DELAY_MS);
          }
        }
      })
      // const delMusic = ()=>{
      //   const Files = fs.readdirSync('download')
      //   const detail:any[] = []
      //   Files.forEach((item)=>{
      //     detail.push(NodeID3.read(`download/${item}`))
      //   })
      //   mainWindow.webContents.send('local-music',{Files,detail})
      //   return {Files,detail}
      // }
      // const delDir = (path:string)=>{
      //   watcher.off('unlink', delMusic)
      //   watcher.off('unlinkDir', delDir)
      //   watcher.close()
      //   fs.mkdirSync('download', { recursive: true });
      //   watcher.on('unlink',delMusic)
      //   watcher.on('unlinkDir',delDir)
      // }
      // watcher.on('unlink',delMusic)
      // watcher.on('unlinkDir',delDir)
      // return delMusic()
    })
    //全局播放
    globalShortcut.register('Ctrl+Alt+Left',()=>{
      mainWindow.webContents.send('main-prev')
    })
    globalShortcut.register('Ctrl+Alt+P',()=>{
      mainWindow.webContents.send('main-play')
    })
    globalShortcut.register('Ctrl+Alt+Right',()=>{
      mainWindow.webContents.send('main-next')
    })
    //歌词请求出现详情页面
    ipcMain.on('lrc-open-playDetail',()=>{
      mainWindow.show()
    })
    //选择修改歌单封面
    ipcMain.on('detail-pic', (event) => {
      dialog.showOpenDialog(mainWindow,{
        title:'选择一张图片或一段视频',
        filters:[
          {name:'图片资源',extensions:['jpg','png','jpeg','webp']},
        ],
        properties:['openFile','promptToCreate']
      }).then((obj)=>{
        const {canceled,filePaths} = obj
        if(!canceled){
          const filePath = filePaths[0]
          fs.readFile(filePath,(err,data)=>{
            if (err) {
              event.returnValue = err.toString()
            } else {
              event.returnValue = data.toString('base64')
            }
          })
        } else {
          event.returnValue = null
        }
      })
    })
    
    return mainWindow
}

const pares163Key = (comment:string)=>{
  const key = comment.substring(22); // 移除 163 key(Don't modify):
  const aes128ecbDecipher = crypto.createDecipheriv('aes-128-ecb', '#14ljk_!\\]&0U<\'(', '');
  //@ts-ignore
  const aesd = aes128ecbDecipher.update(key, 'base64') + aes128ecbDecipher.final(); // Base64 解码，AES 解密
  return JSON.parse(aesd.substring(6)) // 移除 music: 并解析 JSON
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
  // child.webContents.toggleDevTools()
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

export const dragWindw = ():BrowserWindow=>{
  const win = new BrowserWindow({
      width:100,
      height:23,
      minHeight:0,
      frame: false,
      // show:false,
      transparent: true,
      backgroundColor: '#00000000',
      // useContentSize:true,
      skipTaskbar: true,
      alwaysOnTop:true,
      // titleBarStyle:'hidden'
      webPreferences: {
          nodeIntegration: true,
          // contextIsolation: false,
          preload: join(__dirname, "../preload/index.js"),
      },
  })
  win.setPosition(9999,9999)
  win.webContents.on('did-finish-load', () => {
      // 二、注册窗口id
      registerWindowId('drageMessage', win.webContents.id);
  })
  win.webContents.on('destroyed', () => {
      // 三、销毁窗口 id
      removeWindowId('drageMessage');
  })
  Menu.setApplicationMenu(null);
  win.setContentSize(100, 25)
  win.setSize(100, 25)
  win.setIgnoreMouseEvents(true)
  // win.webContents.toggleDevTools()
  // win.loadURL(`http://${process.env["VITE_DEV_SERVER_HOST"]}:${process.env["VITE_DEV_SERVER_PORT"]}/#/dragMessage`)
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    win.loadURL(`${process.env['ELECTRON_RENDERER_URL']}/#/dragMessage`)
  } else {
    win.loadFile(join(__dirname, '../renderer/index.html#dragMessage'))
  }
  let ifChanged = false
  let hM = 25
  let wM = 25
  ipcMain.on('change-drag-width',(e,message)=>{
      if(message.width + 5 < 25){
          wM = 25
          hM = 25
      }else{
          wM = message.width + 5
          hM = 25
      }
      ifChanged = true
  })
  let mouseListener:any
  ipcMain.on('begin-drag',(e)=>{
      // let {message,backGroundColor} = messageObj
      let X = screen.getCursorScreenPoint().x
      let Y = screen.getCursorScreenPoint().y
      win.setPosition(X+30,Y)
      if(!mouseListener){
          mouseListener = setInterval(()=>{
              if(ifChanged){
                  X = screen.getCursorScreenPoint().x
                  Y = screen.getCursorScreenPoint().y
                  win.setContentBounds({width:wM,height:hM,x:X+30,y:Y})
              }
          },10)
      }
      win.showInactive()
  })
  ipcMain.on('end-drag',(e)=>{
      clearInterval(mouseListener)
      mouseListener = null
      ifChanged = false
      win.hide()
  })
  return win
}