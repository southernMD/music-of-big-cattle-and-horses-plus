import { dialog, ipcMain, type BrowserWindow } from "electron";
import { extname, join } from "node:path";
import * as fs from "fs";
import { BASE_PATH } from "../defaultMessage";
import exfs from 'fs-extra'
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import { pickTime } from "../utils/pickTime";
import { is } from "@electron-toolkit/utils";

export default (mainWindow: BrowserWindow) => {

    //记忆背景
    ipcMain.on('renderer-ready', () => {
        fs.readdir(join(__dirname, BASE_PATH), (err, list) => {
            let ext = ''
            if (err) console.log(err);
            else {
                list.forEach((item) => {
                    if (item.startsWith('background')) {
                        console.log(item, ext);
                        if (ext == '' || ext != '' && item.split('.')[1] != 'mp4') {
                            ext = item.split('.')[1]
                        }
                    }
                })
                if (list.some((item) => {
                    return item.startsWith('background')
                })) {
                    fs.readFile(join(__dirname, BASE_PATH, `background.${ext}`), (err, data) => {
                        if (!err) {
                            if (!ext.endsWith('mp4')) {
                                mainWindow.webContents.send('memory-background', { buffer: data, extname: ext })
                            } else {
                                mainWindow.webContents.send('mp4-ready', { flag: true, filePath: join(__dirname, BASE_PATH, `background.${ext}`) })
                            }
                        } else {
                            console.log(err);
                        }
                    })
                }
            }

        })
    })

    //上传背景图片
    ipcMain.on('upload-background', (event) => {
        dialog.showOpenDialog(mainWindow, {
            title: '选择一张图片或一段视频',
            filters: [
                { name: '图片资源', extensions: ['jpg', 'png', 'jpeg', 'webp'] },
                { name: '视频资源', extensions: ['*'] }
            ],
            properties: ['openFile', 'promptToCreate']
        }).then(async (obj) => {
            let ifNeedChangeExtname = false
            const { canceled, filePaths } = obj
            if (!canceled) {
                const filePath = filePaths[0]
                try {
                    const data = await exfs.readFile(filePath);
                    console.log(filePath, extname(filePath));

                    if (['.jpg', '.png', '.jpeg', '.webp'].includes(extname(filePath))) {
                        event.reply('file-ready', { liu: data, extname: extname(filePath) })
                    } else {
                        //如果视频大小不为MP4或者大小超过50m
                        if (extname(filePath) == '.mp4' && data.length <= 52428800) {
                            event.reply('mp4-ready', { flag: false, filePath })
                        } else {
                            // 尝试对目标进行转码成MP4
                            ifNeedChangeExtname = true
                        }
                    }
                } catch (err) {
                    console.log(err);
                    return;
                }

                if (!ifNeedChangeExtname) {
                    const path = join(__dirname, BASE_PATH, `background${extname(filePath)}`)
                    try {
                        const list = await exfs.readdir(join(__dirname, BASE_PATH));
                        for (let i = 0; i < list.length; i++) {
                            console.log(list[i]);
                            if (list[i].startsWith('background')) {
                                exfs.removeSync(join(__dirname, BASE_PATH, list[i]))
                            }
                        }

                        let readStream = fs.createReadStream(filePath)
                        let writeStream = fs.createWriteStream(path)
                        readStream.pipe(writeStream)
                    } catch (err) {
                        console.error(err);
                    }
                } else {
                    event.reply('mp4-msg', { msg: "目标格式需要进行转码请稍后" })
                    console.log("开始进行视频转码");
                    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
                        ffmpeg.setFfmpegPath(ffmpegPath.path);
                    } else {
                        ffmpeg.setFfmpegPath(join(__dirname, '../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
                    }
                    let total = '0'
                    const ffmpegCommand = ffmpeg(filePath)
                        .nativeFramerate()
                        .videoCodec('libx264')
                        .format('mp4')
                        .noAudio()
                        .outputOptions(
                            '-movflags', 'frag_keyframe+empty_moov+faststart',
                            '-preset', 'faster', //以损失画质换取流畅度
                            '-threads', 'auto'
                        )
                        .on('progress', function ({ timemark }) {
                            console.log(Math.ceil(pickTime(timemark) / pickTime(total) * 100));
                        })
                        .on('error', function (err) {
                            console.log('An error occurred: ' + err.message);
                            if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
                                event.reply("mp4-error", { msg: "视频上传发生错误，请检查上传文件" })
                                exfs.removeSync(join(__dirname, BASE_PATH, `background_temporarily.mp4`))
                                ffmpegCommand.kill('SIGTERM')
                                console.log('An error occurred: ' + err.message);
                            }
                        })
                        .on('end', function () {
                            ffmpegCommand.kill('SIGTERM')
                            //删除background.mp4然后把background_temporarily.mp4重命名为background.mp4
                            exfs.removeSync(join(__dirname, BASE_PATH, `background.mp4`))
                            exfs.renameSync(join(__dirname, BASE_PATH, `background_temporarily.mp4`), join(__dirname, BASE_PATH, `background.mp4`))
                            event.reply('mp4-ready', { flag: false, filePath: join(__dirname, BASE_PATH, `background.mp4`) })
                            console.log('Processing finished !');
                        }).on('codecData', ({ duration }) => {
                            total = duration
                        })
                    //filePath
                    let videoStream = ffmpegCommand.pipe();
                    videoStream.pipe(fs.createWriteStream(join(__dirname, BASE_PATH, `background_temporarily.mp4`)))
                }
                // const path = join(__dirname,`../renderer/assets/background${extname(filePath)}`)
            }
        })
    })

    ipcMain.on('recove-background', async () => {
        try {
            const list = await exfs.readdir(join(__dirname, BASE_PATH));
            for (let i = 0; i < list.length; i++) {
                if (list[i].startsWith('background')) {
                    fs.unlink(join(__dirname, BASE_PATH, list[i]), () => { })
                }
            }
        } catch (err) {
            console.error(err);
        }
    })
}