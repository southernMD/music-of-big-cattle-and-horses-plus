import { app, ipcMain, shell, type BrowserWindow } from "electron";

export default (mainWindow: BrowserWindow) => {

    ipcMain.handle('app-version', (event) => {
        return app.getVersion()
    })
    //获取当前窗口的宽高
    ipcMain.on('get-screen-X-Y', (e) => {
        e.reply('there-X-Y', { width: mainWindow.getBounds().width, height: mainWindow.getBounds().height })
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
    ipcMain.on('to-small', () => {
        mainWindow.minimize();
    })
    ipcMain.on('to-middle', (e) => {
        mainWindow.restore()
        mainWindow.webContents.send('to-changeFished-finshed')
    })
    ipcMain.on('to-big', () => {
        mainWindow.maximize()
        mainWindow.webContents.send('to-changeFished-finshed')
    })
    //歌词请求出现详情页面
    ipcMain.on('lrc-open-playDetail', () => {
        mainWindow.show()
    })
}