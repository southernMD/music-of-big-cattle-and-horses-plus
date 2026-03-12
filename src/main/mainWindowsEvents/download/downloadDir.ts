

import { BrowserWindow, dialog, shell } from "electron";
import chokidar from 'chokidar'
import NodeID3 from 'node-id3'
import { ipcMain } from 'electron'
import { resolve } from 'path'
import fs from 'fs'
import fsPromises from 'fs/promises'
import { cloneDeep } from 'lodash';
import { extname, basename, join } from 'path'
import moveFileWorker from '@main/workers/moveFile?nodeWorker'
import { id3Message } from "@main/types";
import { DEFAULT_ID3_MESSAGE } from "@main/defaultMessage";
import { pares163Key } from "../parseLocalPlayMessage";
import { getFileHashes } from "@main/utils/createhash";

export default (downloadPath: string, mainWindow: BrowserWindow) => {
    //下载目录文件变化

    const watcher = chokidar.watch(downloadPath, {
        persistent: true
    });
    const delMusic = (path: string) => {
        mainWindow.webContents.send('look-download-list-del-path', path)
    }
    const addMuisc = (path: string) => {
        mainWindow.webContents.send('look-download-list-add-path', NodeID3.read(path))
    }
    const delDir = (path: string) => {
        console.log(path, 'delDir');
        watcher.off('unlink', delMusic)
        watcher.off('add', addMuisc)
        watcher.off('unlinkDir', delDir)
        watcher.removeAllListeners()
        watcher.close()
        fs.mkdirSync(downloadPath, { recursive: true });

        // 重新监听
        watcher.on('unlink', delMusic)
        watcher.on('add', addMuisc)
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
        if (path !== downloadPath) {
            moveFileWorker({ workerData: { downloadPath, destinationPath: path } }).on('message', () => {
                downloadPath = path;
                console.log('完成转移音乐文件');
                watcher.add(downloadPath);

                // 重新挂载事件
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
            const buffer = fs.readFileSync(path)
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
            return { canceled: false, path: paths };
        }
    })
    //删除音乐文件
    ipcMain.handle('del-music', async (_, path) => {
        if (!path.endsWith('.mp3')) path += '.mp3';
        try {
            await fsPromises.unlink(path);
            return '';
        } catch (error) {
            return error;
        }
    });
    let watcherLocalMusic: chokidar.FSWatcher | null = null;

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
                    const t = Object.assign({ ...cloneDeep(DEFAULT_ID3_MESSAGE), path, title: basename(path) }, NodeID3.read(path))

                    if (t.comment && t.comment.text.startsWith("163 key(Don't modify)")) {
                        t.comment.text = pares163Key(t.comment.text)
                    }
                    const songIdObject = t.userDefinedText.find(item => item.description == 'song id')

                    if (songIdObject && songIdObject!.value.length == 0) {
                        const endHash = (await getFileHashes([path]))
                        songIdObject.value = endHash[0]
                    }
                    paths.push(t);
                    console.log("发送前的值", paths.map(item => item.userDefinedText));
                    mainWindow.webContents.send('local-music-paths-add', paths);
                    paths = [];
                } else if (event == 'unlink') {
                    delPath.push(path)
                    mainWindow.webContents.send('local-music-paths-del', delPath);
                    delPath = [];
                }
            }
        })
    })
    //获取音乐路径
    ipcMain.handle('get-song-path', ({ }, cleanFileName) => {
        return join(downloadPath, cleanFileName)
    })
    //打开指定目录
    ipcMain.on('open-path', ({ }, path) => {
        // path+'.mp3'
        if (!path.endsWith('.mp3')) path += '.mp3'
        shell.showItemInFolder(path)
    })
}