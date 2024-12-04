import { is } from "@electron-toolkit/utils";
import { ipcMain } from "electron";
import * as fs from "fs";
import fetch from 'node-fetch';
import { join } from "path";
import { Readable } from "stream";
import ffmpegPath from '@ffmpeg-installer/ffmpeg';
import ffmpeg from 'fluent-ffmpeg';
const UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/15.1 Safari/605.1.15'
let SESSDATA:string | undefined
const option = {
    headers: {
        'User-Agent': `${UA}`,
        'content-type': 'text/html; charset=utf-8',
        'cookie': `SESSDATA=${SESSDATA}`
    }
}
let basePath = ''
if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    basePath = '../../resources'
} else {
    basePath = '../../../app.asar.unpacked/resources'
}

const getVideoMsg = async (videoPath) => {
    try {
        let response = await fetch(videoPath, option);
        if (response.redirected) {
            return await getVideoMsg(response.url);
        } else {
            const html = await response.text();
            const reg = /<script>window\.__INITIAL_STATE__=([\s\S]*?);\(function\(\)/;
            if (!html) throw new Error('获取视频信息失败');
            const videoInfo = html.match(reg);
            if (!videoInfo) throw new Error('获取视频信息失败');
            const { videoData } = JSON.parse(videoInfo[1]);
            return videoData;
        }
    }catch (error) {
        throw error
    }
};

//获取视频清晰度列表
const getAcceptQuality = async (cid, bvid) => {
    const bfeId = ''
    const config = {
        headers: {
            'User-Agent': `${UA}`,
            cookie: `SESSDATA=${SESSDATA};bfe_id=${bfeId}`
        },
        responseType: 'json'
    }
    return await (await fetch(
        `https://api.bilibili.com/x/player/playurl?cid=${cid}&bvid=${bvid}&qn=127&type=&otype=json&fourk=1&fnver=0&fnval=80&session=68191c1dc3c75042c6f35fba895d65b0`,
        config
    )).json()
}


// /**
//  * @params videoInfo: 当前下载的视频详情 selected(移除)：所选的分p quality：所选的清晰度
//  * @returns 返回下载数据 json
//  */
const getVideoDowloadLink = async (cid, bvid) => {
    const acceptQuality = await getAcceptQuality(cid, bvid);
    return {
        accept_description: acceptQuality.data.accept_description,
        accept_quality: acceptQuality.data.accept_quality,
        video: getHighQualityVideo(acceptQuality.data.dash.video),
        audio: getHighQualityAudio(acceptQuality.data.dash.audio)
    };
}

const getHighQualityAudio = (audioArray) => {
    return audioArray.sort((a, b) => b.id - a.id)[0]
}

const getHighQualityVideo = (videoArray) => {
    return videoArray.sort((a, b) => b.id - a.id)[0]
}
let loading = Array(3).fill(0)
let abortController: AbortController[] = Array(3).fill(new AbortController())
const downloadFile = async (url: string, webUrl: string, type: number, index: number) => {
    let config = {};
    if (type === 1) {
        config = {
            headers: {
                'User-Agent': `${UA}`,
                cookie: `SESSDATA=${SESSDATA}`
            }
        };
    } else {
        config = {
            headers: {
                'User-Agent': `${UA}`,
                referer: webUrl,
            }
        };
    }

    return fetch(url, { ...config, signal: abortController[index].signal })
        .then((response: Response) => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            if (!response.body) {
                throw new Error('Response body is null or undefined');
            }

            const contentType = response.headers.get('Content-Type');
            let loaded = 0;
            let totalBase = +(response.headers.get('content-length') ?? 0);

            return new Promise<{ buffer: Buffer, contentType: string | null }>((resolve, reject) => {
                const chunks: Uint8Array[] = [];
                const stream = response.body as unknown as Readable;

                stream.on('data', (chunk: Uint8Array) => {
                    chunks.push(chunk);
                    loaded += chunk.length;
                    loading[index] = Math.round(loaded / totalBase * 100);
                });

                stream.on('end', () => {
                    resolve({ buffer: Buffer.concat(chunks), contentType });
                });

                stream.on('error', (err: Error) => {
                    reject(err);
                });
            });
        })
        .catch((err) => {
            // console.error('Download error:', err);
            throw err;
        });
};
const saveFile = async (path: string, data: any) => {
    return new Promise((resolve, reject) => {
        fs.writeFile(path, data, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });
}

function weightComputed(arr) {
    const [a, b, c] = arr;
    const weights = [0.7, 0.2, 0.1];
    const weightedSum = a * weights[0] + b * weights[1] + c * weights[2];
    return weightedSum;
}

let ffmpegCommand: ffmpeg.FfmpegCommand | null;
let intervalTimer:NodeJS.Timer | null;
const dowloading = async (videoData: any, url: string, event: Electron.IpcMainEvent) => {
    abortController = Array(3).fill(new AbortController())
    loading = Array(3).fill(0)
    const videoCover = videoData.pic
    const videoUrl = videoData.video.baseUrl
    const audioUrl = videoData.audio.baseUrl
    intervalTimer = setInterval(async () => {
        event.reply('download-bilibili-downloading', { progress: weightComputed(loading) })
    }, 500)
    const downloadTask = await Promise.all([
        downloadFile(audioUrl, url, 2, 1),
        downloadFile(videoUrl, url, 2, 0),
        downloadFile(videoCover, url, 1, 2)
    ])
    clearInterval(intervalTimer);
    intervalTimer = null
    event.reply('download-bilibili-downloading', { progress: 100 })
    //保存三个文件
    const nowTime = new Date().getTime().toString();
    const savePromise: Promise<any>[] = []
    const combinePath: string[] = []
    for (let i = 0; i < downloadTask.length; i++) {
        const item = downloadTask[i];
        if (item.contentType === "application/octet-stream" || item.contentType === "video/mp4") {
            savePromise.push(saveFile(join(__dirname, basePath, `${nowTime}-${i + 1}`), downloadTask[i].buffer))
            combinePath.push(join(__dirname, basePath, `${nowTime}-${i + 1}`))
        } else {
            savePromise.push(saveFile(join(__dirname, basePath, `${nowTime}.jpg`), downloadTask[i].buffer))
        }
    }
    await Promise.all(savePromise)
    return combineVideo(combinePath, join(__dirname, basePath, nowTime), nowTime)
}

const combineVideo = async (combinePath: string[], basecombinePath: string, filename: string) => {
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        ffmpeg.setFfmpegPath(ffmpegPath.path);
    } else {
        ffmpeg.setFfmpegPath(join(__dirname, '../../../app.asar.unpacked/node_modules/@ffmpeg-installer/win32-x64/ffmpeg.exe'));
    }
    let total = '0'
    return new Promise<{
        video: Buffer | undefined,
        cover: Buffer | undefined,
        filename: string
    }>((resolve, reject) => {
        ffmpegCommand = ffmpeg()
            .input(combinePath[0])
            .input(combinePath[1])
            .audioCodec('copy')
            .videoCodec('copy')
            .on('start', () => {
            })
            .on('progress', function ({ timemark }) {
                console.log(Math.ceil(pickTime(timemark) / pickTime(total) * 100));
            })
            .on('end', () => {
                const videoData: {
                    video: Buffer | undefined,
                    cover: Buffer | undefined,
                    filename: string
                } = {
                    video: undefined,
                    cover: undefined,
                    filename
                }
                videoData.video = fs.readFileSync(basecombinePath + '.mp4')
                videoData.cover = fs.readFileSync(basecombinePath + '.jpg')
                resolve(videoData)
                ffmpegCommand = null
            })
            .on('error', (err: any) => {
                ffmpegCommand = null
                reject(err)
            }).on('codecData', ({ duration }) => {
                total = duration
            })
            .save(basecombinePath + '.mp4')
    })
}
const pickTime = (time: string) => {
    let hao = +time.split('.')[1]
    let shi = +time.split(':')[0]
    let feng = +time.split(':')[1]
    let miao = +time.split(':')[2].split('.')[0]

    return +(shi * 60 * 60 * 100 + feng * 60 * 100 + miao * 100 + hao).toFixed(2)
}
const handleDeleteFile = (filename: string) => {
    fs.readdir(join(__dirname, basePath), (err, list) => {
        if (err) throw err
        for (let i = 0; i < list.length; i++) {
            if (list[i].startsWith(filename)) {
                fs.unlink(join(__dirname, basePath, list[i]), (err) => { throw err })
            }
        }
    })
}
let bilibiliFilename:string | null = null
ipcMain.on('download-bilibili', async (event, { videoPath,sessdata }) => {
    try {
        if(!sessdata || sessdata.trim() === '')throw new Error('SESSDATA is empty')
        SESSDATA = sessdata.trim()
        let videoData = await getVideoMsg(videoPath)
        if (videoData.pages.length > 1) {
            event.reply('download-bilibili-choice', { number: videoData.pages.length })
            videoData = await new Promise<any>((resolve, reject) => {
                ipcMain.once('download-bilibili-choice-result', async (e, { index }) => {
                    try {
                        if (index < 0 || index > videoData.pages.length) {
                            throw new Error('index error')
                        }
                        console.log(`选择的p数为${index}p`);
                        resolve({ ...videoData, ...(await getVideoDowloadLink(videoData.pages[index - 1].cid, videoData.bvid)) })
                    } catch (error) {
                        reject(error);
                    }
                })
            })
            const bilibiliVideo = await dowloading(videoData, videoPath, event)
            bilibiliFilename = bilibiliVideo.filename
            event.reply('download-bilibili-finish', { video: bilibiliVideo.video?.buffer, cover: bilibiliVideo.cover?.buffer })
            handleDeleteFile(bilibiliFilename)
        } else if (videoData.pages.length == 1) {
            videoData = { ...videoData, ...(await getVideoDowloadLink(videoData.pages[0].cid, videoData.bvid)) }
            const bilibiliVideo = await dowloading(videoData, videoPath, event)
            bilibiliFilename = bilibiliVideo.filename
            event.reply('download-bilibili-finish', { video: bilibiliVideo.video?.buffer, cover: bilibiliVideo.cover?.buffer })
            handleDeleteFile(bilibiliFilename)
            bilibiliFilename = null
        } else {
            throw new Error('获取视频信息失败')
        }
    } catch (error) {
        if(error instanceof Error && error.name !== 'AbortError'){
            abortController.forEach(item => item.abort())
            ffmpegCommand?.kill("SIGTERM");
            if(bilibiliFilename)handleDeleteFile(bilibiliFilename)
            if(intervalTimer)clearInterval(intervalTimer)
            intervalTimer = null
            bilibiliFilename = null
            ffmpegCommand = null
            SESSDATA = undefined
            console.log(error);
            event.reply('download-bilibili-error', { error })
        }
    }
})

ipcMain.on("dueTo-del-nedd-close-ffmpeg", () => {
    try {
        abortController.forEach(item => item.abort())
        ffmpegCommand?.kill("SIGTERM");
        if(bilibiliFilename)handleDeleteFile(bilibiliFilename)
        if(intervalTimer)clearInterval(intervalTimer)
        intervalTimer = null
        bilibiliFilename = null
        ffmpegCommand = null
        SESSDATA = undefined
    } catch (error) {
        if(bilibiliFilename)handleDeleteFile(bilibiliFilename)
        if(intervalTimer)clearInterval(intervalTimer)
        intervalTimer = null
        bilibiliFilename = null
        ffmpegCommand = null
        SESSDATA = undefined
    }

})