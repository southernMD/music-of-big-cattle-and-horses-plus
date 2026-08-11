import { useMain, useGlobalVar } from '@renderer/store';
import { ElMessage } from 'element-plus';
import { br } from './br';

export async function downloadMusic(id: number, name: string, customController?: AbortController) {
    const Main = useMain();
    const globalVar = useGlobalVar();
    
    // 1. Initialize or find download object in global list
    let downloadObj = globalVar.downloadList.find(item => item.id === id);
    if (!downloadObj) {
        const controller = customController || new AbortController();
        downloadObj = { id, name, controller, ifcancel: false, url: '', downloadingFlag: true };
        globalVar.downloadList.push(downloadObj);
    } else {
        downloadObj.downloadingFlag = true;
    }
    if (customController && downloadObj.controller !== customController) {
        downloadObj.controller = customController;
    }
    
    // 2. Setup chunks & determine if we are resuming
    let chunks: Uint8Array[] = globalVar.musicPick.get(id) || [];
    const loadedBase = globalVar.loadingValue.get(id)?.[0] || 0;
    let totalBase = globalVar.loadingValue.get(id)?.[1] || 1;
    
    // 3. Resolve download URL
    let url = downloadObj.url;
    let result;
    try {
        if (!url) {
            const detailRes = await Main.reqSongDetail([id]);
            const detail = detailRes.data.songs[0];
            const cleanName = detail ? `${detail.name}-${detail.ar.map((item: any) => item.name).join('/')}` : name;
            
            if (downloadObj.level) {
                url = await Main.reqSongUrl(id, '', 'song', downloadObj.level) || '';
            } else if (downloadObj.br) {
                result = await Main.reqSongDlUrl(id, downloadObj.br);
                url = result.data.data.url;
            } else {
                result = await Main.reqSongDlUrl(id, br(globalVar.setting.downloadlevel));
                url = result.data.data.url;
                if (!url) {
                    url = await Main.reqSongUrl(id, cleanName.replaceAll(" ", ""), "song", globalVar.setting.downloadlevel) || '';
                    downloadObj.level = globalVar.setting.downloadlevel;
                } else {
                    downloadObj.br = br(globalVar.setting.downloadlevel);
                }
            }
            downloadObj.url = url;
        }
    } catch (error) {
        globalVar.musicPick.set(id, chunks);
        downloadObj.ifcancel = true;
        throw error;
    }
    
    if (!url) {
        ElMessage({
            message: `${name} 下载失败`,
            type: 'error'
        });
        if (customController) customController.abort();
        else downloadObj.controller.abort();
        globalVar.downloadId = globalVar.downloadId.filter(item => item !== id);
        globalVar.loadingValue.delete(id);
        globalVar.downloadList = globalVar.downloadList.filter(item => item.id !== id);
        globalVar.musicPick.delete(id);
        return;
    }
    
    // 4. Setup Range header for resumable downloads if we have partial chunks
    const headers: HeadersInit = {};
    if (loadedBase > 0) {
        headers['Range'] = loadedBase === 0 && totalBase === 1 ? `bytes=${loadedBase}-` : `bytes=${loadedBase}-${totalBase}`;
    }
    
    // 5. Fetch and stream data
    return fetch(url, {
        headers,
        signal: downloadObj.controller.signal
    })
    .then(response => {
        let loaded = loadedBase;
        // If the server doesn't return 206 Partial Content, it means Range request was ignored/not supported.
        // We must discard already accumulated chunks and start downloading from 0.
        if (response.status !== 206) {
            loaded = 0;
            chunks = [];
            globalVar.musicPick.set(id, []);
            totalBase = +(response.headers.get('content-length') || 1);
        } else {
            if (loadedBase === 0 && totalBase === 1) {
                totalBase = +(response.headers.get('content-length') || 1);
            }
        }
        const reader = response.body?.getReader()!;
        if (!reader) throw new Error('Response body is null');
        
        return new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close();
                            return;
                        }
                        loaded += value.byteLength;
                        controller.enqueue(value);
                        chunks.push(value);
                        globalVar.loadingValue.set(id, [loaded, totalBase]);
                        push();
                    }).catch(error => {
                        globalVar.musicPick.set(id, chunks);
                        if (error.name !== 'AbortError') {
                            downloadObj!.ifcancel = true;
                            downloadObj!.downloadingFlag = false;
                        }
                    });
                }
                push();
            }
        });
    })
    .then(stream => new Response(stream))
    .then(response => response.arrayBuffer())
    .then(async (arrayBuffer) => {
        // 6. Build ID3 tags & save music via IPC
        const detailRes = await Main.reqSongDetail([id]);
        const detail = detailRes.data.songs[0];
        
        const title = `${detail.name}`;
        const artistId: any[] = [];
        const artist = (detail.ar.map((item: any) => {
            artistId.push(item.id);
            return `${item.name}`;
        })).join('/');
        const image = detail.al.picUrl;
        const album = `${detail.al.name}`;
        const id3 = {
            title, artist, image, album, ids: [detail.id, detail.al.id, ...artistId], time: detail.dt
        };
        
        const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
        let offset = 0;
        for (const chunk of chunks) {
            mergedChunks.set(chunk, offset);
            offset += chunk.byteLength;
        }
        
        window.electron.ipcRenderer.send('save-music', { arrayBuffer: mergedChunks.buffer, name, id3 });
        globalVar.musicPick.delete(id);
        globalVar.downloadList = globalVar.downloadList.filter(item => item.id !== id);
    })
    .catch((error) => {
        globalVar.musicPick.set(id, chunks);
        if (error.name !== 'AbortError') {
            downloadObj.ifcancel = true;
            downloadObj.downloadingFlag = false;
        }
        throw error;
    });
}
