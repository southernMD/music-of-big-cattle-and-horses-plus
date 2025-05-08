import { app, shell, BrowserWindow, ipcMain, screen, dialog, session, Menu, Tray } from 'electron'
import { join, extname } from 'path'
import { windowIdMap } from './windowManager'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import fs from 'fs'
import os from 'os'
import Server from './server/index'
// import httpSever from './http/app'
import { createWindow, lrcwindow, dragWindw } from './windows'
import log,{cleanupOldLogs} from './utils/log'
import "./dowloadBiliBili"
import { findKeyByValue ,noPrintName } from './utils/findKeyByValue'
// import *  as bytenode from 'bytenode'
// 检查应用程序是否已经在运行
const argv = process.argv;
// fs.writeFileSync("C:\\Users\\southernMD\\Desktop\\txt.txt", argv.toString());
log.info(argv);
let path = ''
for (let arg of argv) {
  log.info(arg)
  if (arg.endsWith('.mp3')) {
    path = argv.slice(1).join(' ')
  }
}
log.info(path);
cleanupOldLogs()
const isAppAlreadyRunning = app.requestSingleInstanceLock();
if (!isAppAlreadyRunning) {
  // 如果应用程序已经在运行，则退出当前实例
  app.quit();
} else {
  if (!path) fs.mkdirSync('download', { recursive: true });
  app.setAppUserModelId('大牛马音乐')
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.bigNMusic')
    // if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    //   await session.defaultSession.loadExtension(
    //     join(os.homedir(),'AppData\\Local\\Google\\Chrome\\User Data\\Default\\Extensions\\nhdogjmejiglipccpnnnanhbledajbpd\\6.5.0_1')
    //   )
    // }
    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })
    // httpSever()
    const mainwin = await createWindow(path)
    Server()
    const lrcwin = lrcwindow()
    const dragWin = dragWindw()
    //托盘事件
    //右键菜单
    ipcMain.on('show-context-menu', (event) => {
      const menu = Menu.buildFromTemplate([{
        label: '刷新', type: 'normal', role: 'reload'
      },
      {
        label: '开发者工具', type: 'normal', role: 'toggleDevTools'
      }
      ])
      menu.popup()
    })

    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
    ipcMain.on("transpond-window-message", (event, { to, name, data }) => {
      if (!to) return
      const ids = Object.values(windowIdMap)
      if(ids.includes(to)){
        const winObjName = findKeyByValue(windowIdMap, to)
        if (!noPrintName.includes(name)) {
          console.log("窗口名id", to);
          console.log("窗口名",winObjName);
          console.log("转发名", name);
          console.log("转发数据", data);
        }
        switch (winObjName) {
          case "Ci":
            lrcwin!.webContents.send(name, { data })
            break;
          case "Main":
            mainwin!.webContents.send(name, { data })
            break;
          case "drageMessage":
            dragWin!.webContents.send(name, { data })
            break;
        }
      }
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
