import { app, Menu, Tray, type BrowserWindow } from "electron"
import icon from '@build/favicon.ico?asset'
import iconW from '@build/faviconW.ico?asset'
export default function (mainWindow: BrowserWindow, osColorTheme: boolean) {
    //托盘事件
    let appIcon = new Tray(!osColorTheme ? icon : iconW)
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
        },
        {
            label: '打开开发者工具', type: 'normal', click: () => {
                mainWindow.webContents.openDevTools()
            }
        }
    ])
    appIcon.setContextMenu(contextMenu)
    //托盘事件结束
}