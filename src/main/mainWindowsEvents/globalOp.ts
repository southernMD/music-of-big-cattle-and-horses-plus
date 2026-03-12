import { BrowserWindow, globalShortcut, ipcMain } from "electron"

const OP_EVENTS = [
    'main-play',
    'main-prev',
    'main-next',
    'main-add-volum',
    'main-reduce-volum',
    'main-like',
    'main-open-ci'
];

export default (mainWindow: BrowserWindow) => {

    //全局快捷键
    ipcMain.handle('set-global-op', async (_, keys: string[]) => {
        globalShortcut.unregisterAll()

        return keys.map((op, index) => {
            op = op.replaceAll(" ", "")

            // 无快捷键绑定
            if (op === '空') {
                return true
            }
            // 绑定处于不完整状态 (如 "Ctrl+")
            else if (op.endsWith('+')) {
                return false
            }
            // 正常绑定
            else {
                globalShortcut.unregister(op)

                const eventName = OP_EVENTS[index]
                if (eventName) {
                    globalShortcut.register(op, () => {
                        mainWindow.webContents.send(eventName)
                    })
                    return globalShortcut.isRegistered(op)
                }

                return true
            }
        })
    })
}