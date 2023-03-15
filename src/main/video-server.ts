import express from 'express';
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
import {is} from '@electron-toolkit/utils'
import {join} from 'path'
import cors from 'cors'
import { ipcMain,BrowserWindow } from 'electron';
import portfinder from 'portfinder'
export default async(window:BrowserWindow) =>{
    const app = express();
    app.use(cors())
    let ffmpegCommand:any = null;
    app.get('/video', (req, res) => {
        let pathSrc = ''
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            pathSrc = '../../resources/background.mp4'
            ffmpeg.setFfmpegPath(ffmpegPath.path);
          } else {
            pathSrc = '../../../app.asar.unpacked/resources/background.mp4'
            ffmpeg.setFfmpegPath(join(__dirname,'../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
          }
        if (ffmpegCommand !== null) {
            ffmpegCommand.kill();
            ffmpegCommand = null;
        }
        let total = '0'
        ffmpegCommand = ffmpeg(join(__dirname,pathSrc))
            .input(join(__dirname,pathSrc))
            .nativeFramerate()
            .videoCodec('libx264')
            .audioCodec('aac')
            .format('mp4')
            .seekInput(0)
            .outputOptions(
                '-movflags', 'frag_keyframe+empty_moov+faststart',
                '-preset', 'veryfast', //以损失画质换取流畅度
                '-g', '18',
                )
            .on('progress', function ({timemark}) {
                window.webContents.send('loading-mp4',{p:Math.ceil(pickTime(timemark)/pickTime(total)*100)})
                console.log(Math.ceil(pickTime(timemark)/pickTime(total)*100));
            })
            .on('error', function (err) {
                console.log('An error occurred: ' + err.message);
                // window.webContents.send('ffmpeg-path',{p:ffmpegPath.path,d:__dirname,err:err.message})
            })
            .on('end', function () {
                window.webContents.send('loading-mp4',{p:100})
                console.log('Processing finished !');
            }).on('codecData',({duration})=>{
                total = duration
            })
        let videoStream = ffmpegCommand.pipe();
        videoStream.pipe(res);
    })
    const port = await portfinder.getPortPromise({
        port: 2233
    })
    app.listen(port, () => {
        console.log(`http open in ${port}`);
    })
}

const pickTime = (time:string)=>{
    let hao = +time.split('.')[1]
    let shi = +time.split(':')[0]
    let feng = +time.split(':')[1]
    let miao = +time.split(':')[2].split('.')[0]
    console.log(shi,feng,miao,hao);
    
    return +(shi * 60 * 60 * 100+ feng * 60 * 100 + miao * 100 + hao).toFixed(2)
}