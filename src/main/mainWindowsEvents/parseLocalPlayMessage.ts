import { app, ipcMain, BrowserWindow } from 'electron'
import { basename } from 'path'
import { cloneDeep } from 'lodash'
import NodeID3 from 'node-id3'
import crypto from 'crypto'
import log from 'electron-log'
import { DEFAULT_ID3_MESSAGE } from '../defaultMessage'
import { getFileHashes } from '../utils/createhash'

const getLoaclSongID3message = async (path: string) => {
    const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE), path, title: basename(path) }, NodeID3.read(path))
    if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
        t.comment.text = pares163Key(t.comment.text)
    }
    const songIdObject = t.userDefinedText.find(item => item.description == 'song id')

    if (songIdObject && songIdObject!.value.length == 0) {
        const endHash = (await getFileHashes([path]))
        songIdObject.value = endHash[0]
    }

    return t
}

export default async function (mainWindow: BrowserWindow, path?: string) {
    //第二次点击
    app.on('second-instance', async (_, argv, workingDirectory, additionalData) => {
        try {
            console.log(argv, '__________', workingDirectory, '__________', additionalData);
            if (mainWindow) {
                if (mainWindow.isMinimized()) mainWindow.restore();
                mainWindow.focus();
                let path = argv.slice(2).join(' ')
                if (path.endsWith('.mp3')) {
                    const t = await getLoaclSongID3message(path)
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
            const t = await getLoaclSongID3message(path)
            // 向主窗口发送消息，以触发相应的聚焦逻辑
            mainWindow.webContents.send('load-local-music', { msg: t, flag })
        } catch (error) {
            console.log(error);
            mainWindow.webContents.send('load-local-music', { error })
        }

    })

    let pathRead: any = null
    let ok = false
    let err: any = null

    if (path) {
        try {
            log.info(path)
            const t = await getLoaclSongID3message(path)
            pathRead = setInterval(async () => {
                console.log(ok, '读取本地');
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
}

export const pares163Key = (comment: string) => {
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
