import { app, shell, BrowserWindow, ipcMain, screen, dialog, session, nativeImage, globalShortcut, Menu, Tray, MessageChannelMain } from 'electron'
import { join, extname, parse, resolve, basename } from 'path'
import fs from 'fs'
import exfs from 'fs-extra'
import os from 'os'
import icon from '../../build/favicon.ico?asset'
import iconW from '../../build/faviconW.ico?asset'
import prevIcon from '../../build/prev.png?asset'
import playIcon from '../../build/play.png?asset'
import stopIcon from '../../build/stop.png?asset'
import nextIcon from '../../build/next.png?asset'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { registerWindowId, removeWindowId } from './windowManager'
import chokidar from 'chokidar'
import NodeID3 from 'node-id3'
import request from 'request'
import crypto from 'crypto'
import fontList from 'font-list'
import { exec, spawn } from 'child_process'
import { Worker } from 'worker_threads'
import moveFileWorker from './moveFile?nodeWorker'
import log from 'electron-log'

import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { Writable } from 'stream'
import { BASE_PATH, DEFAULT_ID3_MESSAGE, DELAY_MS } from './defaultMessage'
import { getFileHashes } from './utils/createhash'
import { cloneDeep } from 'lodash';
import { id3Message } from './types'
export const createWindow = async (path?: string): Promise<BrowserWindow> => {
  // let windowX: number = 0, windowY: number = 0; //中化后的窗口坐标
  // let X: number, Y: number; //鼠标基于显示器的坐标
  let screenMove: any = null;  //鼠标移动监听
  // const primaryDisplay = screen.getPrimaryDisplay()
  // const { width, height } = primaryDisplay.workAreaSize
  let fontColor
  let downloadPath
  const background = await new Promise<string>((res, reject) => {
    fs.readFile(join(__dirname, BASE_PATH, 'color.json'), 'utf8', (err, jsonString) => {
      if (err) {
        // 文件不存在，创建文件并写入内容
        fs.writeFileSync(join(__dirname, BASE_PATH, 'color.json'), `{"background":"rgb(255,255,255)","color":"rgba(0,0,0,.7)"}`, 'utf8');
        fontColor = "rgba(0,0,0,.7)"
        res("rgb(255,255,255)")
      } else {
        // 文件存在，输出文件内容
        fontColor = JSON.parse(jsonString).color
        res(JSON.parse(jsonString).background)
      }
    });
  })
  downloadPath = await new Promise<string>((res, reject) => {
    fs.readFile(join(__dirname, BASE_PATH, 'dowloadPath.json'), 'utf8', (err, jsonString) => {
      if (err) {
        // 文件不存在，创建文件并写入内容
        fs.writeFileSync(join(__dirname, BASE_PATH, 'dowloadPath.json'), `{"dowloadPath":"${resolve("download").replaceAll("\\", "\\\\")}"}`, 'utf8');
        res(resolve('download'))
      } else {
        res(JSON.parse(jsonString).dowloadPath.replaceAll('\\\\', '\\'))
      }
    })
  })
  console.log('下载目录是', downloadPath);
  console.log('主题颜色是', background);
  const mainWindow = new BrowserWindow({
    width: 1020,
    height: 670,
    backgroundColor: background,
    frame: false, //隐藏默认控件
    // resizable: false,
    // maxHeight: 670,
    minHeight: 670,
    minWidth: 1020,
    title: '大牛马音乐',
    // autoHideMenuBar: true,
    icon: iconW,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      webgl: true,
      sandbox: false
    }
  })
  mainWindow.setAppDetails({
    appId: '大牛马音乐'
  })
  mainWindow.webContents.toggleDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  //第二次点击
  app.on('second-instance', async (event, argv, workingDirectory, additionalData) => {
    try {
      console.log(argv, '__________', workingDirectory, '__________', additionalData);
      if (mainWindow) {
        if (mainWindow.isMinimized()) {
          mainWindow.restore();
        }
        mainWindow.focus();
        let path = argv.slice(2).join(' ')
        if (path.endsWith('.mp3')) {
          const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE),path,title: basename(path)},NodeID3.read(path))
          if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
            t.comment.text = pares163Key(t.comment.text)
          }
          const songIdObject = t.userDefinedText.find(item=>item.description == 'song id')
          
          if(songIdObject && songIdObject!.value.length == 0){
            const endHash = (await getFileHashes([path]))
            songIdObject.value = endHash[0]
          }
          // 向主窗口发送消息，以触发相应的聚焦逻辑
          mainWindow.webContents.send('load-local-music', { msg: t })
        }
      }
    } catch (error) {
      mainWindow.webContents.send('load-local-music', { error })
    }

  })
  //右键点击
  ipcMain.on('right-click', async ({ }, { path, flag }) => {
    if (!path.endsWith('.mp3')) path += '.mp3'
    try {
      const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE),path,title: basename(path)},NodeID3.read(path))
      if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
        t.comment.text = pares163Key(t.comment.text)
      }
      const songIdObject = t.userDefinedText.find(item=>item.description == 'song id')
          
      if(songIdObject && songIdObject!.value.length == 0){
        const endHash = (await getFileHashes([path]))
        songIdObject.value = endHash[0]
      }
      // 向主窗口发送消息，以触发相应的聚焦逻辑
      mainWindow.webContents.send('load-local-music', { msg: t, flag })
    } catch (error) {
      console.log(error);
      mainWindow.webContents.send('load-local-music', { error })
    }

  })
  let pathRead: any = null
  let ok = false
  let err

  if (path) {
    try {
      log.info(path)
      pathRead = setInterval(async () => {
        const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE),path,title: basename(path)},NodeID3.read(path))
        if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
          t.comment.text = pares163Key(t.comment.text)
        }
        const songIdObject = t.userDefinedText.find(item=>item.description == 'song id')
          
        if(songIdObject && songIdObject!.value.length == 0){
          const endHash = (await getFileHashes([path]))
          songIdObject.value = endHash[0]
        }
        mainWindow.webContents.send('load-local-music', { msg: t, err })
        if (ok) clearInterval(pathRead)
      }, 5000)
    } catch (error) {
      console.log(error);
      log.info(error)
      err = error
    }
  }
  ipcMain.on('radio-ok', () => {
    ok = true
    clearInterval(pathRead)
  })
  //托盘事件
  let appIcon = new Tray(iconW)
  appIcon.on('double-click', () => {
    mainWindow.show()
  })
  const contextMenu = Menu.buildFromTemplate([
    {
      label: '退出', type: 'normal', click: () => {
        app.quit()
      }
    },
    {
      label: '显示主页面', type: 'normal', click: () => {
        mainWindow.show();
      }
    }
  ])
  appIcon.setContextMenu(contextMenu)
  //托盘事件结束
  //应用版本
  console.log('当前版本', app.getVersion());

  ipcMain.handle('app-version', (event) => {
    return app.getVersion()
  })
  //记忆背景
  ipcMain.on('renderer-ready', () => {
    fs.readdir(join(__dirname, BASE_PATH), (err, list) => {
      let ext = ''
      if (err) console.log(err);
      else {
        list.forEach((item) => {
          if (item.startsWith('background')) {
            console.log(item, ext);
            if (ext == '' || ext != '' && item.split('.')[1] != 'mp4') {
              ext = item.split('.')[1]
            }
          }
        })
        if (list.some((item) => {
          return item.startsWith('background')
        })) {
          fs.readFile(join(__dirname, BASE_PATH, `background.${ext}`), (err, data) => {
            if (!err) {
              if (!ext.endsWith('mp4')) {
                mainWindow.webContents.send('memory-background', { buffer: data, extname: ext })
              } else {
                mainWindow.webContents.send('mp4-ready', { flag: true })
              }
            } else {
              console.log(err);
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
          mainWindow.webContents.send('main-prev', true)
        }
      },
      {
        tooltip: '暂停',
        icon: nativeImage.createFromPath(stopIcon),
        click() {
          stop()
          mainWindow.webContents.send('main-play', true)
        }
      },
      {
        tooltip: '下一首',
        icon: nativeImage.createFromPath(nextIcon),
        click() {
          mainWindow.webContents.send('main-next', true)
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
          mainWindow.webContents.send('main-prev', true)
        }
      },
      {
        tooltip: '播放',
        icon: nativeImage.createFromPath(playIcon),
        click() {
          play();
          mainWindow.webContents.send('main-play', true)
        }
      },
      {
        tooltip: '下一首',
        icon: nativeImage.createFromPath(nextIcon),
        click() {
          mainWindow.webContents.send('main-next', true)

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
  ipcMain.on('to-close', ({ }, flag) => {
    if (flag) mainWindow.hide();
    else app.quit()
  })
  //   mainWindow.on('close', (e) => {
  //     // e.preventDefault()
  //     // app.quit();
  //     mainWindow.hide();
  //     //点击关闭按钮向渲染进程请求页面
  //     //选择退出模式
  //     // let giveWayToMain = (event: Electron.IpcMainEvent, message?: string) => {
  //     //     ipcMain.removeListener('give-way-to-main', giveWayToMain)
  //     //     //选择已存在方案
  //     //     if (message === 'quit') {
  //     //         win.destroy();
  //     //     } else if (message === 'leave') {
  //     //         win.hide();
  //     //     } else {
  //     //         //展示退出面板
  //     //         event.reply('main-back-way-to-render', { ifToClose: true })
  //     //     }
  //     // }
  //     // win.webContents.send('check-up-quit-way')
  //     // ipcMain.on('give-way-to-main', giveWayToMain)
  // })
  ipcMain.on('to-small', () => {
    mainWindow.minimize();
  })
  ipcMain.on('to-middle', (e) => {
    // console.log("??????");
    // mainWindow.setContentBounds({ x: windowX, y: windowY, width: 1020, height: 670 })
    // mainWindow.setBounds({ x: windowX, y: windowY, width: 1020, height: 670 })
    mainWindow.restore()
    mainWindow.webContents.send('to-changeFished-finshed')
  })
  ipcMain.on('to-big', () => {
    // windowX = mainWindow.getBounds().x
    // windowY = mainWindow.getBounds().y
    // mainWindow.setContentBounds({ x: 0, y: 0, width, height })
    // mainWindow.setBounds({ x: 0, y: 0, width, height })
    mainWindow.maximize()
    mainWindow.webContents.send('to-changeFished-finshed')
  })
  // ipcMain.on('move-screen', (e, obj) => {
  //   let { mouseX, mouseY } = obj //鼠标按下时的坐标
  //   let { x, y } = mainWindow.getBounds();  //左上点坐标
  //   console.log('按下时',screenMove);
  //   if(!screenMove){
  //       console.log('beginmoving');
  //       screenMove = setInterval(() => {
  //           X = screen.getCursorScreenPoint().x
  //           Y = screen.getCursorScreenPoint().y
  //           let nW = mainWindow.getContentBounds().width
  //           let nH = mainWindow.getContentBounds().height
  //           mainWindow.setContentBounds({width:nW,height:nH,x:x + (X - (mouseX + x)),y:y + (Y - (mouseY + y))})
  //       }, 10)
  //   }
  // })
  // ipcMain.on('cancel-screen', () => {
  //   console.log('endmoving');
  //   clearInterval(screenMove)
  //   screenMove = null;
  // })
  //获取当前窗口的宽高
  ipcMain.on('get-screen-X-Y', (e) => {
    e.reply('there-X-Y', { width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
  })
  //上传背景图片
  ipcMain.on('upload-background', (event) => {
    dialog.showOpenDialog(mainWindow, {
      title: '选择一张图片或一段视频',
      filters: [
        { name: '图片资源', extensions: ['jpg', 'png', 'jpeg', 'webp'] },
        { name: '视频资源', extensions: ['*'] }
      ],
      properties: ['openFile', 'promptToCreate']
    }).then(async (obj) => {
      let ifNeedChangeExtname = false
      const { canceled, filePaths } = obj
      if (!canceled) {
        const filePath = filePaths[0]
        await new Promise<any>((resolve, reject) => {
          fs.readFile(filePath, (err, data) => {
            if (!err) {
              console.log(filePath, extname(filePath));

              if (['.jpg', '.png', '.jpeg', '.webp'].includes(extname(filePath))) {
                event.reply('file-ready', { liu: data, extname: extname(filePath) })
              } else {
                //如果视频大小不为MP4或者大小超过50m
                if (extname(filePath) == '.mp4' && data.length <= 52428800) {
                  event.reply('mp4-ready', { flag: false, filePath })
                } else {
                  // 尝试对目标进行转码成MP4
                  ifNeedChangeExtname = true
                }
              }
              resolve('ok')
            } else {
              console.log(err);
              reject(err)
            }
          })
        })
        if (!ifNeedChangeExtname) {
          const path = join(__dirname, BASE_PATH, `background${extname(filePath)}`)
          const p1 = new Promise((resolve, reject) => {
            fs.readdir(join(__dirname, BASE_PATH), (err, list) => {
              resolve(list)
            })
          }).then((list: any) => {
            for (let i = 0; i < list.length; i++) {
              console.log(list);
              if (list[i].startsWith('background')) {
                exfs.removeSync(join(__dirname, BASE_PATH, list[i]))
              }
            }
          })
          Promise.all([p1]).then((value) => {
            let readStream = fs.createReadStream(filePath)
            let writeStream = fs.createWriteStream(path)
            readStream.pipe(writeStream)
          })
        } else {
          event.reply('mp4-msg', { msg: "目标格式需要进行转码请稍后" })
          console.log("开始进行视频转码");
          if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            ffmpeg.setFfmpegPath(ffmpegPath.path);
          } else {
            ffmpeg.setFfmpegPath(join(__dirname, '../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
          }
          let total = '0'
          const ffmpegCommand = ffmpeg(filePath)
            .nativeFramerate()
            .videoCodec('libx264')
            .format('mp4')
            .noAudio()
            .outputOptions(
              '-movflags', 'frag_keyframe+empty_moov+faststart',
              '-preset', 'faster', //以损失画质换取流畅度
              '-threads', 'auto'
            )
            .on('progress', function ({ timemark }) {
              console.log(Math.ceil(pickTime(timemark) / pickTime(total) * 100));
            })
            .on('error', function (err) {
              console.log('An error occurred: ' + err.message);
              if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
                event.reply("mp4-error", { msg: "视频上传发生错误，请检查上传文件" })
                exfs.removeSync(join(__dirname, BASE_PATH, `background_temporarily.mp4`))
                ffmpegCommand.kill('SIGTERM')
                console.log('An error occurred: ' + err.message);
              }
            })
            .on('end', function () {
              ffmpegCommand.kill('SIGTERM')
              //删除background.mp4然后把background_temporarily.mp4重命名为background.mp4
              exfs.removeSync(join(__dirname, BASE_PATH, `background.mp4`))
              exfs.renameSync(join(__dirname, BASE_PATH, `background_temporarily.mp4`), join(__dirname, BASE_PATH, `background.mp4`))
              event.reply('mp4-ready', { flag: false, filePath: join(__dirname, BASE_PATH, `background.mp4`) })
              console.log('Processing finished !');
            }).on('codecData', ({ duration }) => {
              total = duration
            })
          //filePath
          let videoStream = ffmpegCommand.pipe();
          videoStream.pipe(fs.createWriteStream(join(__dirname, BASE_PATH, `background_temporarily.mp4`)))
        }
        // const path = join(__dirname,`../renderer/assets/background${extname(filePath)}`)
      }
    })
  })
  const pickTime = (time: string) => {
    let hao = +time.split('.')[1]
    let shi = +time.split(':')[0]
    let feng = +time.split(':')[1]
    let miao = +time.split(':')[2].split('.')[0]

    return +(shi * 60 * 60 * 100 + feng * 60 * 100 + miao * 100 + hao).toFixed(2)
  }
  ipcMain.on('recove-background', () => {
    new Promise((resolve, reject) => {
      fs.readdir(join(__dirname, BASE_PATH), (err, list) => {
        resolve(list)
      })
    }).then((list: any) => {
      for (let i = 0; i < list.length; i++) {
        if (list[i].startsWith('background')) {
          fs.unlink(join(__dirname, BASE_PATH, list[i]), () => { })
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
  ipcMain.on('save-music', (e, { arrayBuffer, name, id3 }) => {
    const buffer = Buffer.from(arrayBuffer);
    const imageUrl = id3.image
    fs.mkdirSync('download', { recursive: true });
    const cleanFileName = name.replace(/[\\/:\*\?"<>\|]/g, "");
    arrayBuffer = new Uint8Array(arrayBuffer);
    request.get(imageUrl, { encoding: null }, function (error, response, body) {
      if (error) console.log(error);
      const image = {
        mime: `image/${parse(imageUrl).ext}`,
        imageBuffer: body,
      };
      const oldtags = NodeID3.read(arrayBuffer);
      const newTags = Object.assign({}, oldtags, id3);
      newTags['image'] = image
      newTags['userDefinedText'] =
        [{
          "description": "song id",
          "value": id3.ids[0]
        }, {
          "description": "al id",
          "value": id3.ids[1]
        }, {
          "description": "ar ids",
          "value": id3.ids.slice(2).join(',')
        }]
      NodeID3.update(newTags, arrayBuffer, function (err, buffer) {
        if (err) {
          console.error(err);
          return;
        }
        fs.writeFileSync(`${downloadPath}/${cleanFileName}.mp3`, buffer);
        console.log(NodeID3.read(`${downloadPath}/${cleanFileName}.mp3`))
      });
      e.reply('save-music-finished', { which: cleanFileName, id: id3.ids[0] })
    })

  })
  ipcMain.on('get-download-list', (e) => {
    console.log(downloadPath, '空的你在搞笑么');
    if (fs.existsSync(downloadPath)) {
      const Files = fs.readdirSync(downloadPath)
      e.reply('look-download-list', Files)
    } else {
      e.reply('look-download-list', [])
    }
  })
  ipcMain.on('get-download-list-detail', (e) => {
    if (fs.existsSync(downloadPath)) {
      console.log(downloadPath);
      const Files = fs.readdirSync(downloadPath)
      const detail: any[] = []
      Files.forEach((item) => {
        detail.push(Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE),path: downloadPath + '\\' + item,title: item},NodeID3.read(`${downloadPath}/${item}`)))
      })
      e.reply('look-download-list-detail', detail)
    } else {
      e.reply('look-download-list-detail', [])
    }
  })
  //下载目录文件变化

  const watcher = chokidar.watch(downloadPath, {
    persistent: true
  });
  const delMusic = (path: string) => {
    // console.log(path,'delMusic');
    // const Files = fs.readdirSync(downloadPath).filter(item=>item.endsWith('mp3'))
    // mainWindow.webContents.send('look-download-list',Files)
    // const detail:any[] = []
    // Files.forEach((item)=>{
    //   detail.push(NodeID3.read(`${downloadPath}/${item}`))
    // })
    mainWindow.webContents.send('look-download-list-del-path', path)
  }
  const addMuisc = (path: string) => {
    // console.log(path,'addMuisc');
    mainWindow.webContents.send('look-download-list-add-path', NodeID3.read(path))
  }
  const delDir = (path: string) => {
    console.log(path, 'delDir');
    watcher.off('unlink', delMusic)
    watcher.off('add', delMusic)
    watcher.off('unlinkDir', delDir)
    watcher.close()
    fs.mkdirSync(downloadPath, { recursive: true });
    watcher.on('unlink', delMusic)
    watcher.on('unlink', delMusic)
    watcher.on('unlinkDir', delDir)
  }
  watcher.on('unlink', delMusic);
  watcher.on('add', addMuisc);
  watcher.on('unlinkDir', delDir);
  watcher.add(downloadPath);

  //获取默认下载目录路径
  ipcMain.handle('get-download-path', () => {
    return downloadPath ?? resolve('download')
  })

  ipcMain.handle('change-download-path', ({ }, path) => {
    watcher.off('unlink', delMusic);
    watcher.off('add', addMuisc);
    watcher.off('unlinkDir', delDir);
    watcher.close();
    if (path != downloadPath) {
      moveFileWorker({ workerData: { downloadPath, destinationPath: path } }).on('message', () => {
        downloadPath = path;
        console.log('完成');
        watcher.add(downloadPath);
        watcher.on('unlink', delMusic);
        watcher.on('add', addMuisc);
        watcher.on('unlinkDir', delDir);
        return 'ok'
      })
    }
  })
  ipcMain.on('open-download-dir', () => {
    shell.openPath(downloadPath)
  })
  //获取本地音乐
  ipcMain.handle('get-local-music', ({ }, { path }) => {
    try {
      const buffer = Buffer.from(fs.readFileSync(path))
      return { base64: buffer.toString('base64') }
    } catch (error) {
      return { error }
    }
  })
  //添加本地文件目录
  ipcMain.handle('add-local-dir', ({ }) => {
    const paths: string[] | undefined = dialog.showOpenDialogSync(mainWindow, {
      title: '选择添加目录',
      properties: ['openDirectory', 'dontAddToRecent'],
    })
    console.log(paths);
    if (paths == undefined) {
      return { canceled: true, path: [] }
    } else {
      // fs.writeFileSync(join(__dirname, BASE_PATH, 'dowloadPath.json'), `{"dowloadPath":"${paths[0].replaceAll("\\", "\\\\")}"}`, 'utf8');
      return { canceled: false, path: paths };
    }
  })
  //删除音乐文件
  ipcMain.handle('del-music', async (_, path) => {
    if (!path.endsWith('.mp3')) path += '.mp3';
    return new Promise((resolve, reject) => {
      try {
        fs.unlink(path, (err) => {
          if (err) {
            resolve(err);
          } else {
            resolve('');
          }
        });
      } catch (error) {
        resolve(error);
      }
    });
  });
  let watcherLocalMusic: chokidar.FSWatcher | null = null;

  // let timer;
  // let timer2;
  ipcMain.handle('watch-files-toread-music', ({ }, { readPath }) => {
    console.log(readPath);
    if (watcherLocalMusic !== null) {
      watcherLocalMusic.close(); // 如果 watcher 已经存在，关闭它
    }
    watcherLocalMusic = chokidar.watch(readPath, {
      persistent: true,
    })
    watcherLocalMusic.on('all', async (event, path) => {
      let paths: id3Message[] = [];
      let delPath: any[] = []
      if (extname(path) == '.mp3') {
        console.log(event, path);
        if (event == 'add' || event == 'change') {
          const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE),path,title: basename(path)},NodeID3.read(path))
          
          if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
            t.comment.text = pares163Key(t.comment.text)
          }
          const songIdObject = t.userDefinedText.find(item=>item.description == 'song id')
          
          if(songIdObject && songIdObject!.value.length == 0){
            const endHash = (await getFileHashes([path]))
            songIdObject.value = endHash[0]
          }
          paths.push(t);
          // clearTimeout(timer);
          // timer = setTimeout(() => {
            console.log("发送前的值",paths.map(item=>item.userDefinedText));
            mainWindow.webContents.send('local-music-paths-add', paths);
            paths = [];
          // }, DELAY_MS);
        } else if (event == 'unlink') {
          delPath.push(path)
          // clearTimeout(timer2);
          // timer2 = setTimeout(() => {
            mainWindow.webContents.send('local-music-paths-del', delPath);
            delPath = [];
          // }, DELAY_MS);
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
  //获取音乐路径
  ipcMain.handle('get-song-path', ({ }, cleanFileName) => {
    return downloadPath + '\\' + cleanFileName
  })
  //打开指定目录
  ipcMain.on('open-path', ({ }, path) => {
    // path+'.mp3'
    if (!path.endsWith('.mp3')) path += '.mp3'
    shell.showItemInFolder(path)
  })
  //全局播放
  ipcMain.handle('set-global-op', async ({ }, keys) => {
    globalShortcut.unregisterAll()
    const promise: Promise<any>[] = []
    // console.log(keys);
    keys.forEach((op, index) => {
      op = op.replaceAll(" ", "")
      // console.log(op);
      if (op == '空') {
        promise.push(new Promise<boolean>((resolve, reject) => {
          resolve(true)
        }))
      } else if (op.endsWith('+')) {
        promise.push(new Promise<boolean>((resolve, reject) => {
          resolve(false)
        }))
      } else {
        globalShortcut.unregister(op)
        switch (index) {
          case 0:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-play')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 1:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-prev')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 2:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-next')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 3:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-add-volum')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 4:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-reduce-volum')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 5:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-like')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          case 6:
            promise.push(new Promise<boolean>((resolve, reject) => {
              globalShortcut.register(op, () => {
                mainWindow.webContents.send('main-open-ci')
              })
              resolve(globalShortcut.isRegistered(op))
            }))
            break
          default:
            promise.push(new Promise<boolean>((resolve, reject) => {
              resolve(true)
            }))
        }
      }
    })
    return await Promise.all(promise)
  })
  // ipcMain.handle('check-global-op',async({},keys:string[])=>{
  //   const promise:Promise<any>[] = []
  //   keys.forEach((op)=>{
  //     op = op.replaceAll(" ","")
  //     if(op.endsWith('+') || op == '空'){
  //       promise.push(new Promise<any>((resolve, reject) => {
  //         resolve(false)
  //       }))
  //     }else{
  //       promise.push(new Promise<any>((resolve, reject) => {
  //         resolve(globalShortcut.isRegistered(op))
  //       }))
  //     }
  //   })
  //   return await Promise.all(promise)
  // })
  // globalShortcut.register('Ctrl+Alt+Left',()=>{
  //   mainWindow.webContents.send('main-prev')
  // })
  // globalShortcut.register('Ctrl+Alt+P',()=>{
  //   mainWindow.webContents.send('main-play')
  // })
  // globalShortcut.register('Ctrl+Alt+Right',()=>{
  //   mainWindow.webContents.send('main-next')
  // })
  //歌词请求出现详情页面
  ipcMain.on('lrc-open-playDetail', () => {
    mainWindow.show()
  })
  //选择修改歌单封面
  ipcMain.on('detail-pic', (event) => {
    dialog.showOpenDialog(mainWindow, {
      title: '选择一张图片或一段视频',
      filters: [
        { name: '图片资源', extensions: ['jpg', 'png', 'jpeg', 'webp'] },
      ],
      properties: ['openFile', 'promptToCreate']
    }).then((obj) => {
      const { canceled, filePaths } = obj
      if (!canceled) {
        const filePath = filePaths[0]
        fs.readFile(filePath, (err, data) => {
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
  //保存图片
  ipcMain.handle('save-image', (event, { buffer, ext }) => {
    return new Promise((resolve, reject) => {
      dialog
        .showSaveDialog(mainWindow, {
          title: '另存为',
          buttonLabel: '保存',
          defaultPath: `${new Date().getTime()}${ext}`,
        })
        .then(({ filePath, canceled }) => {
          if (canceled) {
            resolve('');
            return
          }
          if (filePath) {
            fs.writeFile(filePath, Buffer.from(buffer), (err) => {
              if (err) {
                console.error(err);
                resolve(false);
              } else {
                resolve(true);
              }
            });
          } else {
            resolve(false);
          }
        })
        .catch((err) => {
          console.error(err);
          resolve(false);
        });
    });
  });
  //字体列表
  ipcMain.handle('get-font-list', () => {
    return new Promise<any>((resolve, reject) => {
      fontList.getFonts()
        .then(fonts => {
          resolve(fonts)
          // console.log(fonts)
        })
        .catch(err => {
          console.log(err)
        })
    })
  })
  //设置默认播放器
  ipcMain.handle('to-link-local', ({ }, flag) => {
    return new Promise<any>((resolve, reject) => {
      if (flag) {
        exec("reg add HKCU\\Software\\Classes\\.mp3 /ve /d mp3file /f", (err) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          exec('reg add HKCU\\Software\\Classes\\mp3file\\shell\\open\\command /ve /d "\"' + process.execPath + '\" \"%1\"" /f', (err) => {
            if (err) {
              console.log(err);
              resolve(false);
            }
            resolve(true);
          })
        })
      } else {
        exec("reg delete HKCU\\Software\\Classes\\.mp3 /f", (err) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          exec('reg delete HKCU\\Software\\Classes\\mp3file\\shell\\open\\command /f', (err) => {
            if (err) {
              console.log(err);
              resolve(false);
            }
            resolve(true);
          })
        })
      }
    })
  })
  //设置开机自启
  ipcMain.handle('auto-open', ({ }, flag) => {
    return new Promise<any>((resolve, reject) => {
      if (flag) {
        exec('reg add HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v "bigNMusice" /d "\"' + process.execPath + '\" /f', (err) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        })
      } else {
        exec('reg delete HKCU\\Software\\Microsoft\\Windows\\CurrentVersion\\Run /v "bigNMusice" /f', (err) => {
          if (err) {
            console.log(err);
            resolve(false);
          }
          resolve(true);
        })
      }
    })
  })
  //分享图片
  ipcMain.handle('add-share-image', ({ }, length) => {
    return new Promise<any>((resolve, reject) => {
      dialog.showOpenDialog(mainWindow, {
        title: '选择图片',
        filters: [
          { name: '图片资源', extensions: ['jpg', 'png', 'jpeg'] },
        ],
        properties: ['openFile', 'multiSelections']
      }).then(async ({ canceled, filePaths }) => {
        if (!canceled) {
          //file-re
          filePaths = filePaths.slice(0, 9 - length)
          const lius = await Promise.allSettled(filePaths.map((path) => {
            return new Promise<any>((resolve, reject) => {
              fs.readFile(path, (err, data) => {
                if (err) reject(err)
                else resolve(data)
              })
            })
          }))
          resolve(lius)
        }
      })
    })

  })
  //记忆启动色
  ipcMain.on('set-background-color', ({ }, arr) => {
    console.log(arr[0], arr[1]);
    fs.writeFileSync(join(__dirname, BASE_PATH, 'color.json'), `{"background":"${arr[0]}","color":"${arr[1]}"}`)
  })
  ipcMain.on('get-background-color', (event) => {
    event.returnValue = { background, fontColor }
  })
  //下载视频
  ipcMain.on('saveVideo', (event, { videoPath, coverPath }) => {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      ffmpeg.setFfmpegPath(ffmpegPath.path);
    } else {
      ffmpeg.setFfmpegPath(join(__dirname, '../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
    }
    let total = '0'
    const ffmpegCommand = ffmpeg(videoPath)
      .nativeFramerate()
      .videoCodec('libx264')
      .format('mp4')
      .outputOptions(
        '-movflags', 'frag_keyframe+empty_moov+faststart',
        '-preset', 'faster', //以损失画质换取流畅度
        '-threads', 'auto',
        "-crf","20"
      )
      .on('progress', function ({ timemark }) {
        event.reply("save-video-progress", { progress: Math.ceil(pickTime(timemark) / pickTime(total) * 100) })
        console.log(Math.ceil(pickTime(timemark) / pickTime(total) * 100));
      }).on('error', function (err) {
        if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
          event.reply("save-video-error", {err})
          ffmpegCommand.kill('SIGTERM')
          console.log('An error occurred: ' + err.message);
        }
      })
    const chunks: Uint8Array[] = [];
    const writableStream = new Writable({
      write(chunk, encoding, callback) {
        chunks.push(chunk);
        callback();
      }
    });
    const fileName = new Date().getTime() + '.jpg'
    ffmpegCommand.output(writableStream).screenshots({
      timestamps: ['1'], // 获取视频的第一帧截图
      filename:  fileName, // 保存为临时文件
      folder: join(__dirname, BASE_PATH) , // 临时文件夹
    }).on('error', function (err) {
      if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
        event.reply("save-video-error",{err})
        ffmpegCommand.kill('SIGTERM')
        console.log('An error occurred: ' + err.message);
      }
    })
    .on('end', function () {
      ffmpegCommand.kill('SIGTERM')
      writableStream.destroy();
      const buffer = Buffer.concat(chunks);
      event.reply("save-video-progress", { progress: 100 })
      fs.readFile(join(__dirname, BASE_PATH,fileName), (err, data) => {
        if (err) {
          event.reply("save-video-error", {err})
          console.error('Error reading image file:', err);
          return;
        }
        event.reply('save-video-finish', { arrayBuffer:buffer.buffer,coverArrayBuffer:data.buffer });
        // 删除图片
        fs.unlink(join(__dirname, BASE_PATH,fileName), (err) => {
          if (err) {
            event.reply('save-video-error',  {err});
          }
        });
      });
    }).on('codecData', ({ duration }) => {
      total = duration
    })
    ipcMain.on("dueTo-del-nedd-close-ffmpeg",()=>{
      ffmpegCommand.kill("SIGTERM");
      writableStream.destroy()
      if(fs.existsSync(join(__dirname, BASE_PATH,fileName))){
        fs.unlink(join(__dirname, BASE_PATH,fileName), (err) => {
          if (err) {
            event.reply('save-video-error',  {err});
          }
        });
      }
    })
    writableStream.on("error",(err)=>{
      writableStream.destroy();
    })
  })

  return mainWindow
}

const pares163Key = (comment: string) => {
  const key = comment.substring(22); // 移除 163 key(Don't modify):
  const aes128ecbDecipher = crypto.createDecipheriv('aes-128-ecb', '#14ljk_!\\]&0U<\'(', '');
  //@ts-ignore
  const aesd = aes128ecbDecipher.update(key, 'base64') + aes128ecbDecipher.final(); // Base64 解码，AES 解密
  if (aesd.startsWith('dj')) {
    const djMessage = JSON.parse(aesd.substring(aesd.indexOf(':') + 1))
    return Object.assign(djMessage.mainMusic, {
      programId: djMessage.programId,
      djId: djMessage.djId,
      djName: djMessage.djName,
      programName: djMessage.programName,
      brand: djMessage.brand,
    }) // 移除 music: 并解析 JSON
  } else if (aesd.startsWith('music')) {
    return JSON.parse(aesd.substring(aesd.indexOf(':') + 1)) // 移除 music: 并解析 JSON
  } else {
    return {}
  }
}


export const lrcwindow = (): BrowserWindow => {
  const child = new BrowserWindow({
    frame: false, //隐藏默认控件
    transparent: true,
    backgroundColor: '#00000000',
    hasShadow: false,
    minWidth: 616,
    minHeight: 123,
    width: 616,
    height: 291,
    maxHeight: 291,
    show: false,
    skipTaskbar: true,
    // titleBarStyle:'hidden',
    alwaysOnTop: true,
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      preload: join(__dirname, "../preload/index.mjs"),
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
    child.loadURL(`file://${__dirname}/../renderer/index.html#/lyric`)
  }

  function SendXY() {
    child.webContents.send('lyric-x-y', { x: child.getSize()[0], y: child.getSize()[1] })
  }

  child.on('will-resize', SendXY)
  //得到宽高
  ipcMain.on('get-child-x-y', (event) => {
    event.returnValue = { x: child.getSize()[0], y: child.getSize()[1] }
  })
  ipcMain.on('send-child-y', (e, y) => {
    child.setBounds({ height: parseInt(y) })
    e.returnValue = 'ok'
  })

  //移动
  let X, Y;
  let screenMoveChil: any;
  ipcMain.on('move-child', (e, obj) => {
    let { mouseX, mouseY, width, height } = obj;
    let { x, y } = child.getBounds();  //左上点坐标
    if (!screenMoveChil) {
      screenMoveChil = setInterval(() => {
        X = screen.getCursorScreenPoint().x
        Y = screen.getCursorScreenPoint().y
        child.setBounds({ width, height, x: x + (X - (mouseX + x)), y: y + (Y - (mouseY + y)) })
      }, 10)
    }
  })
  ipcMain.on('destory-move-child', () => {
    clearInterval(screenMoveChil)
    screenMoveChil = null;
  })

  //打开歌词子窗口
  ipcMain.on('open-lyric', (e, flag) => {
    child.setAlwaysOnTop(true, 'pop-up-menu')
    if (flag == true) {
      child.showInactive()
    } else {
      child.hide();
    }
  })

  //锁定与不锁定
  ipcMain.on('no-resizable', () => {
    child.setResizable(false)
  })
  ipcMain.on('can-resizable', () => {
    child.setResizable(true)
  })

  ipcMain.on('mouse-can', () => {
    child.setIgnoreMouseEvents(false)
  })
  ipcMain.on('mouse-no', () => {
    child.setIgnoreMouseEvents(true, { forward: true })
  })
  ipcMain.on('change-lrc-position', ({ }, flag) => {
    child.setAlwaysOnTop(flag, 'pop-up-menu')
  })

  return child
}

export const dragWindw = (): BrowserWindow => {
  const win = new BrowserWindow({
    width: 100,
    height: 23,
    minHeight: 0,
    frame: false,
    // show:false,
    transparent: true,
    backgroundColor: '#00000000',
    // useContentSize:true,
    skipTaskbar: true,
    alwaysOnTop: true,
    // titleBarStyle:'hidden'
    webPreferences: {
      nodeIntegration: true,
      // contextIsolation: false,
      preload: join(__dirname, "../preload/index.mjs"),
    },
  })
  win.setPosition(9999, 9999)
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
    win.loadURL(`file://${__dirname}/../renderer/index.html#/dragMessage`)
  }
  let ifChanged = false
  let hM = 25
  let wM = 25
  ipcMain.on('change-drag-width', (e, message) => {
    if (message.width + 5 < 25) {
      wM = 25
      hM = 25
    } else {
      wM = message.width + 5
      hM = 25
    }
    ifChanged = true
  })
  let mouseListener: any
  ipcMain.on('begin-drag', (e) => {
    // let {message,backGroundColor} = messageObj
    let X = screen.getCursorScreenPoint().x
    let Y = screen.getCursorScreenPoint().y
    win.setPosition(X + 30, Y)
    if (!mouseListener) {
      mouseListener = setInterval(() => {
        if (ifChanged) {
          X = screen.getCursorScreenPoint().x
          Y = screen.getCursorScreenPoint().y
          win.setContentBounds({ width: wM, height: hM, x: X + 30, y: Y })
        }
      }, 10)
    }
    win.showInactive()
  })
  ipcMain.on('end-drag', (e) => {
    clearInterval(mouseListener)
    mouseListener = null
    ifChanged = false
    win.hide()
  })
  return win
}


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