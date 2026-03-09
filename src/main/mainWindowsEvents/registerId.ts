import { BrowserWindow } from "electron";
import { registerWindowId, removeWindowId } from "../windowManager";

export default (mainWindow: BrowserWindow) => {

    //注册名称
    mainWindow.webContents.on('did-finish-load', () => {
        // 二、注册窗口id
        registerWindowId('Main', mainWindow.webContents.id);
    })

    mainWindow.webContents.on('destroyed', () => {
        // 三、销毁窗口 id
        removeWindowId('Main');
    })
}