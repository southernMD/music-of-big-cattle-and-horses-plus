import express from 'express';
// import ffmpegPath from '@ffmpeg-installer/ffmpeg';
// import ffmpeg from 'fluent-ffmpeg';
import {is} from '@electron-toolkit/utils'
import {join} from 'path'
import cors from 'cors'
import { ipcMain,BrowserWindow } from 'electron';
import portfinder from 'portfinder'
import fs from 'fs'
export default async(window:BrowserWindow) =>{
    const app = express();
    app.use(cors())
    app.get('/video', (req, res) => {
        let {path} = req.query
        console.log(path);
        let pathSrc = ''
        if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
            pathSrc = join(__dirname,'../../resources/background.mp4') 
        } else {
            pathSrc = join(__dirname,'../../../app.asar.unpacked/resources/background.mp4') 
        }
        //@ts-ignore
        if(path != 'undefined')pathSrc = path
        res.setHeader('Content-Type', 'video/mp4');
        const stream = fs.createReadStream(pathSrc)
        stream.pipe(res)
    })
    const port = await portfinder.getPortPromise({
        port: 2233
    })
    ipcMain.on('vedio-server-port', (event) => {
        event.returnValue = port;
    });
    app.listen(port, () => {
        console.log(`http open in ${port}`);
    })
}

// const pickTime = (time:string)=>{
//     let hao = +time.split('.')[1]
//     let shi = +time.split(':')[0]
//     let feng = +time.split(':')[1]
//     let miao = +time.split(':')[2].split('.')[0]
//     console.log(shi,feng,miao,hao);
    
//     return +(shi * 60 * 60 * 100+ feng * 60 * 100 + miao * 100 + hao).toFixed(2)
// }

// app.get('/video', (req, res) => {
//     let {path} = req.query
//     console.log(path);
//     let pathSrc = ''
//     if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
//         pathSrc = join(__dirname,'../../resources/background.mp4') 
//         ffmpeg.setFfmpegPath(ffmpegPath.path);
//     } else {
//         pathSrc = join(__dirname,'../../../app.asar.unpacked/resources/background.mp4') 
//         ffmpeg.setFfmpegPath(join(__dirname,'../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
//     }
//     //@ts-ignore
//     if(path != 'undefined')pathSrc = path
//     // if (ffmpegCommand !== null) {
//     //     ffmpegCommand.kill();
//     //     ffmpegCommand = null;
//     // }
//     let total = '0'
//     ffmpegCommand = ffmpeg(pathSrc)
//         .input(pathSrc)
//         .nativeFramerate()
//         .videoCodec('libx264')
//         .audioCodec('aac')
//         .format('mp4')
//         .seekInput(0)
//         .noAudio()
//         .outputOptions(
//             '-movflags', 'frag_keyframe+empty_moov+faststart',
//             '-preset', 'faster', //以损失画质换取流畅度
//             '-g', '18',
//             '-threads', '2'
//             )
//         .on('progress', function ({timemark}) {
//             window.webContents.send('loading-mp4',{p:Math.ceil(pickTime(timemark)/pickTime(total)*100)})
//             console.log(Math.ceil(pickTime(timemark)/pickTime(total)*100));
//         })
//         .on('error', function (err) {
//             console.log(err);
//             if(!(err.message == 'ffmpeg was killed with signal SIGKILL' || err.message == 'Output stream closed')){
//                 console.log('An error occurred: ' + err.message);
//                 window.webContents.send('ffmpeg-error')
//             }

//         })
//         .on('end', function () {
//             window.webContents.send('loading-mp4',{p:100})
//             ffmpegCommand.kill()
//             console.log('Processing finished !');
//         }).on('codecData',({duration})=>{
//             total = duration
//         })
//         res.setHeader('Content-Type', 'video/mp4');
//         res.setHeader('Transfer-Encoding', 'chunked'); // U

//     let videoStream = ffmpegCommand.pipe();
//     videoStream.pipe(res);
// })