import { is } from "@electron-toolkit/utils"
import { BASE_PATH } from "@main/defaultMessage"
import { pickTime } from "@main/utils/pickTime"
import { dialog, ipcMain } from "electron"
import { join } from "path"
import { Writable } from "stream"
import { BrowserWindow } from "electron"
import fsPromises from 'fs/promises'

import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';

export default (mainWindow: BrowserWindow) => {
    //选择修改歌单封面
    ipcMain.on('detail-pic', async (event) => {
        try {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                title: '选择一张图片或一段视频',
                filters: [
                    { name: '图片资源', extensions: ['jpg', 'png', 'jpeg', 'webp'] },
                ],
                properties: ['openFile', 'promptToCreate']
            });

            if (!canceled && filePaths.length > 0) {
                const data = await fsPromises.readFile(filePaths[0]);
                event.returnValue = data.toString('base64');
            } else {
                event.returnValue = null;
            }
        } catch (err: any) {
            event.returnValue = err.toString();
        }
    })
    //保存图片
    ipcMain.handle('save-image', async (_, { buffer, ext }) => {
        try {
            const { filePath, canceled } = await dialog.showSaveDialog(mainWindow, {
                title: '另存为',
                buttonLabel: '保存',
                defaultPath: `${Date.now()}${ext}`,
            });

            if (canceled || !filePath) return false;

            await fsPromises.writeFile(filePath, new Uint8Array(buffer));
            return true;
        } catch (err) {
            console.error(err);
            return false;
        }
    });
    //分享图片
    ipcMain.handle('add-share-image', async (_, length: number) => {
        try {
            const { canceled, filePaths } = await dialog.showOpenDialog(mainWindow, {
                title: '选择图片',
                filters: [
                    { name: '图片资源', extensions: ['jpg', 'png', 'jpeg'] },
                ],
                properties: ['openFile', 'multiSelections']
            });

            if (canceled) return [];

            const selectedPaths = filePaths.slice(0, 9 - length);
            const results = await Promise.allSettled(
                selectedPaths.map(path => fsPromises.readFile(path))
            );
            return results;
        } catch (err) {
            console.error(err);
            return [];
        }
    })

    //下载视频
    ipcMain.on('saveVideo', (event, { videoPath, coverPath }) => {
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            ffmpeg.setFfmpegPath(ffmpegPath.path);
        } else {
            ffmpeg.setFfmpegPath(join(__dirname, '../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
        }
        let total = '0'
        const ffmpegCommand = ffmpeg(videoPath)
            .nativeFramerate()
            .videoCodec('libx264')
            .format('mp4')
            .outputOptions(
                '-movflags', 'frag_keyframe+empty_moov+faststart',
                '-preset', 'faster', //以损失画质换取流畅度
                '-threads', 'auto',
                "-crf", "20"
            )
            .on('progress', function ({ timemark }) {
                event.reply("save-video-progress", { progress: Math.ceil(pickTime(timemark) / pickTime(total) * 100) })
                console.log(Math.ceil(pickTime(timemark) / pickTime(total) * 100));
            }).on('error', function (err) {
                if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
                    event.reply("save-video-error", { err })
                    ffmpegCommand.kill('SIGTERM')
                    console.log('An error occurred: ' + err.message);
                }
            })
        const chunks: Uint8Array[] = [];
        const writableStream = new Writable({
            write(chunk, encoding, callback) {
                chunks.push(chunk);
                callback();
            }
        });
        const fileName = new Date().getTime() + '.jpg'

        const abortHandler = () => {
            ffmpegCommand.kill("SIGTERM");
            writableStream.destroy()
            const imagePath = join(__dirname, BASE_PATH, fileName);
            fsPromises.unlink(imagePath).catch(() => { });
            ipcMain.off("dueTo-del-nedd-close-ffmpeg", abortHandler);
        };
        ipcMain.on("dueTo-del-nedd-close-ffmpeg", abortHandler);

        ffmpegCommand.output(writableStream).screenshots({
            timestamps: ['1'], // 获取视频的第一帧截图
            filename: fileName, // 保存为临时文件
            folder: join(__dirname, BASE_PATH), // 临时文件夹
        }).on('error', function (err) {
            ipcMain.off("dueTo-del-nedd-close-ffmpeg", abortHandler);
            if (!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')) {
                event.reply("save-video-error", { err })
                ffmpegCommand.kill('SIGTERM')
                console.log('An error occurred: ' + err.message);
            }
        })
            .on('end', async function () {
                ipcMain.off("dueTo-del-nedd-close-ffmpeg", abortHandler);
                ffmpegCommand.kill('SIGTERM')
                writableStream.destroy();
                const buffer = Buffer.concat(chunks);
                event.reply("save-video-progress", { progress: 100 })
                try {
                    const data = await fsPromises.readFile(join(__dirname, BASE_PATH, fileName));
                    event.reply('save-video-finish', { arrayBuffer: buffer.buffer, coverArrayBuffer: data.buffer });
                } catch (err) {
                    event.reply("save-video-error", { err })
                    console.error('Error reading image file:', err);
                } finally {
                    fsPromises.unlink(join(__dirname, BASE_PATH, fileName)).catch(() => { });
                }
            }).on('codecData', ({ duration }) => {
                total = duration
            })

        writableStream.on("error", (err) => {
            writableStream.destroy();
        })
    })
}