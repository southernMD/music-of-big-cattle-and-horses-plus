import { exec } from "child_process"
import { ipcMain } from "electron"
import fontList from 'font-list'


export default () => {
    //字体列表
    ipcMain.handle('get-font-list', async () => {
        try {
            return await fontList.getFonts()
        } catch (error) {
            console.log(error)
            return []
        }
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

}
