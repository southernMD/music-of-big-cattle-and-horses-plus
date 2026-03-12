import { app, shell, BrowserWindow, ipcMain, screen, nativeTheme, globalShortcut, Menu, session } from 'electron'
import { join } from 'path'
import fs from 'fs'
import icon from '@build/favicon.ico?asset'
import iconW from '@build/faviconW.ico?asset'

import { is } from '@electron-toolkit/utils'
import { registerWindowId, removeWindowId } from './windowManager'

import setupLocalPlay from './mainWindowsEvents/parseLocalPlayMessage'
import setupLoadMenu from './mainWindowsEvents/loadMenu'
import setupThumbnailMusicOptions from './mainWindowsEvents/thumbnailMusicOptions'
import setupControlWindow from './mainWindowsEvents/controlWindow'
import setupBackground from './mainWindowsEvents/background'
import setupRegisterId from './mainWindowsEvents/registerId'
import setupDownloadMusic from './mainWindowsEvents/download/downloadMusic'
import setupDownloadDir from './mainWindowsEvents/download/downloadDir'
import setupGlobalOp from './mainWindowsEvents/globalOp'
import setupSystem from './mainWindowsEvents/system'
import setupLoadFileOptions from './mainWindowsEvents/loadFileOptions'
import { BASE_PATH } from './defaultMessage'
import { getFileBackground } from './utils/getFileBackground'
import { getDownloadPath } from './utils/getDownloadPath'
export const createWindow = async (path?: string): Promise<BrowserWindow> => {
  // let windowX: number = 0, windowY: number = 0; //中化后的窗口坐标
  // let X: number, Y: number; //鼠标基于显示器的坐标
  // let screenMove: any = null;  //鼠标移动监听
  // const primaryDisplay = screen.getPrimaryDisplay()
  // const { width, height } = primaryDisplay.workAreaSize
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    //查看文件夹resources是否存在
    if (!fs.existsSync(join(__dirname, BASE_PATH))) {
      fs.mkdirSync(join(__dirname, BASE_PATH))
    }
  }

  const { background, color: fontColor } = await getFileBackground()
  const downloadPath = await getDownloadPath()
  console.log('下载目录是', downloadPath);
  console.log('主题颜色是', background);
  const osColorTheme = nativeTheme.shouldUseDarkColorsForSystemIntegratedUI
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
    icon: !osColorTheme ? icon : iconW,
    webPreferences: {
      preload: join(__dirname, '../preload/index.mjs'),
      webgl: true,
      sandbox: false
    }
  })
  mainWindow.setAppDetails({
    appId: '大牛马音乐'
  })
  if (is.dev) mainWindow.webContents.toggleDevTools()

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  //在浏览器中打开链接
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  //获取本地缓存信息
  setupLocalPlay(mainWindow, path)
  //加载右键菜单
  setupLoadMenu(mainWindow, osColorTheme)
  //应用版本
  console.log('当前版本', app.getVersion());

  //加载缩略图下方的音乐工具按钮
  setupThumbnailMusicOptions(mainWindow)

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }

  mainWindow.setThumbnailToolTip('大牛马音乐')

  //加载控制窗口事件
  setupControlWindow(mainWindow)

  //设置背景
  setupBackground(mainWindow)

  //注册窗口Id
  setupRegisterId(mainWindow)

  //下载音乐
  setupDownloadMusic(downloadPath)

  //监听下载目录和本地音乐目录
  setupDownloadDir(downloadPath, mainWindow)

  //全局操作
  setupGlobalOp(mainWindow)

  setupSystem()

  //本地文件操作
  setupLoadFileOptions(mainWindow)

  return mainWindow
}




export const lrcWindow = (): BrowserWindow => {
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

export const dragWindow = (): BrowserWindow => {
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

export const loginWindow = async (mainWindow: BrowserWindow): Promise<void> => {
  let loginTimer: NodeJS.Timeout;
  const loginSession = session.fromPartition("persist:login");
  // 清除 Cookie
  await loginSession.clearStorageData({
    storages: ["cookies", "localstorage"],
  });

  const loginWin = new BrowserWindow({
    parent: mainWindow,
    title: "登录网易云音乐（ 若遇到无响应请关闭后重试 ）",
    width: 1280,
    height: 800,
    center: true,
    autoHideMenuBar: true,
    icon,
    // resizable: false,
    // movable: false,
    // minimizable: false,
    // maximizable: false,
    webPreferences: {
      session: loginSession,
      sandbox: false,
      webSecurity: false,
      preload: join(__dirname, "../preload/index.mjs"),
    },
  });

  // 打开网易云
  loginWin.loadURL("https://music.163.com/#/login/");

  // 阻止新窗口创建
  loginWin.webContents.setWindowOpenHandler(() => {
    return { action: "deny" };
  });

  // 检查是否登录
  const checkLogin = async () => {
    try {
      loginWin.webContents.executeJavaScript(
        "document.title = '登录网易云音乐（ 若遇到无响应请关闭后重试 ）'",
      );
      // 是否登录？判断 MUSIC_U
      const MUSIC_U = await loginSession.cookies.get({
        name: "MUSIC_U",
      });
      if (MUSIC_U && MUSIC_U?.length > 0) {
        if (loginTimer) clearInterval(loginTimer);
        const value = `MUSIC_U=${MUSIC_U[0].value};`;
        // 发送回主进程
        mainWindow?.webContents.send("send-cookies", value);
        loginWin.destroy();
      }
    } catch (error) {
      console.error(error);
    }
  };

  // 循环检查
  loginWin.webContents.once("did-finish-load", () => {
    loginWin.show();
    loginTimer = setInterval(checkLogin, 1000);
    loginWin.on("closed", () => {
      clearInterval(loginTimer);
    });
  });

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