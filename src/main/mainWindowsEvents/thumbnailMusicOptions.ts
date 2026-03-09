import { type BrowserWindow, ipcMain, nativeImage } from "electron"
import prevIcon from '@build/prev.png?asset'
import playIcon from '@build/play.png?asset'
import stopIcon from '@build/stop.png?asset'
import nextIcon from '@build/next.png?asset'

export default (mainWindow: BrowserWindow) => {
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
    //改变播放缩略图信息
    ipcMain.on('change-play-thum', (_, message) => {
        console.log(message);

        mainWindow.setThumbnailToolTip(message)
        mainWindow.setTitle(message)
    })
}

