<template>
    <div class="AppSmall">
        <img src="" alt="" id="mainBackground">
        <video src="" id="mainBackgroundVideo" :muted="true" loop></video>
        <MyMainMenu></MyMainMenu>
        <LoadingBig></LoadingBig>
        <Main></Main>
        <MusicRadio></MusicRadio>
        <Teleport to="body">
            <Suspense v-if="flagLogin">
                <template #default>
                    <LoginPage v-if="flagLogin"></LoginPage>
                </template>
                <template #fallback>
                    <Loading :loading="true" message="正在加载登陆页，请稍后"></Loading>
                </template>
            </Suspense>
        </Teleport>
        <MyDialog :flag="downloadFlag" @cancel="closed" @confirm="toDownload" @closeDialog="closed">
            <template #header>
                <span class="title">下载音质选择</span>
            </template>
            <template #midle>
                <el-radio-group v-model="level" class="list">
                    <el-radio :label="levelListEn[index]" size="large" v-for="({}, index) in levelListLength">{{
                        levelList[index]
                    }}</el-radio>
                </el-radio-group>
            </template>
        </MyDialog>
        <Loading :loading="true" message="" v-if="loadDefault" :width="20"></Loading>
        <Loading :loading="false" :type="globalVar.loadMessageDefaultType" :showTime="1000" :message="globalVar.loadMessageDefault" v-if="globalVar.loadMessageDefaultFlag" @close="globalVar.loadMessageDefaultFlag = false"></Loading>
    </div>
</template>

<script setup lang="ts">
import { toRef, onMounted, Ref, nextTick, provide, ref, watch, shallowRef, ShallowRef, inject } from 'vue'
import { useMainMenu, useGlobalVar, useBasicApi, useMain } from '@renderer/store'
import useColor from '@renderer/hooks/useColor';
import MyDialog from '@renderer/components/myVC/MyDialog.vue';
import PromiseQueue from 'p-queue';
const globalVar = useGlobalVar()
const BasicApi = useBasicApi();
const MainPinia = useMain();
const flagLogin: Ref<boolean> = toRef(globalVar, 'flagLogin')
const loadDefault: Ref<boolean> = toRef(globalVar, 'loadDefault')
const downloadQueue = shallowRef(new PromiseQueue({ concurrency: 3 }))
provide('downloadQueue', downloadQueue)
useColor()
onMounted(() => {
    globalVar.oneself = Number(localStorage.getItem('oneself')) as 0 | 1
})
let BKbase64 = ref('')
provide('playListId', ref(-1))
provide('BKbase64', BKbase64)
const MainMenu = useMainMenu();
window.electron.ipcRenderer.sendSync('renderer-ready')
window.electron.ipcRenderer.on('memory-background', ({ }, { buffer, extname }) => {
    extname = '.' + extname
    console.log(buffer, extname);
    if (['.jpg', '.png', '.jpeg', '.webp'].includes(extname)) {
        const file = new File([buffer], `background.${extname}`, { type: `image/${extname}` });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const newUrl = this.result;
            const t = setInterval(() => {
                const h: any = document.getElementById('mainBackground') as HTMLImageElement
                if (h) {
                    BKbase64.value = newUrl as string
                    h.src = newUrl
                    clearInterval(t)
                }
            }, 500)
        };
    }
    document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
    document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
    document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
    MainMenu.colorBlock = extname
    localStorage.setItem('colorBlock', extname);
    localStorage.setItem('oneself', '1')
    globalVar.oneself = 1
})
// window.electron.ipcRenderer.on('ffmpeg-path',({},data)=>{
//     console.log(data);
// })

window.electron.ipcRenderer.on('mp4-ready', ({ }, { flag }) => {
    if (!flag) globalVar.loadingMp4Bk = true
    fetch(`http://127.0.0.1:2233/video`).then((response) => {
        return response.arrayBuffer()
    }).then((buffer) => {
        console.log(buffer);
        const url = URL.createObjectURL(new Blob([buffer], {
            type: "video/m3u8"
        }))
        const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
        v.src = url
        v.play()
        const h = document.getElementById('mainBackground') as HTMLImageElement
        h.src = ''
        document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
        document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
        document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
        localStorage.setItem('MainTitle', `255, 255, 255`)
        localStorage.setItem('MainMenu', `255, 255, 255,.7`)
        localStorage.setItem('MainMenuHover', `255, 255, 255`)
        localStorage.setItem('oneself', '1')
        globalVar.oneself = 1
    })
})

//换被景图
window.electron.ipcRenderer.on('file-ready', ({ }, { liu, extname }) => {
    console.log(liu, extname);
    const file = new File([liu], `background.${extname}`, { type: `image/${extname}` });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        const newUrl = this.result;
        const h: any = document.getElementById('mainBackground') as HTMLImageElement
        h.src = newUrl
        const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
        v.src = ''
    };
    // const h = document.querySelector('#header') as HTMLElement
    // h.style.backgroundImage =   "data:image/png;base64," + base64
    localStorage.setItem('broundColor', '33,33,36,.8')
    document.documentElement.style.setProperty(`--broundColor`, `rgba(33,33,36,.8)`)
    document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
    document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
    document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
    MainMenu.colorBlock = extname
    localStorage.setItem('colorBlock', extname);
    localStorage.setItem('oneself', '1')
    globalVar.oneself = 1

})

if (!sessionStorage.getItem('youkeCookie')) {
    let result: any = await BasicApi.reqAnonimous(); //游客登陆
    if (result.data.code == 200) {
        sessionStorage.setItem('youkeCookie', result.data.cookie)
    }
}
let cookie = localStorage.getItem('cookieUser')
if (sessionStorage.getItem('NMcookie')) {

}
else if (!(cookie == '' || cookie == null || cookie == undefined)) {
    BasicApi.reqLogin(cookie as string).then(() => {
        MainPinia.reqUserPlaylist(BasicApi.account?.id)
        MainPinia.reqUserLike(BasicApi.account?.id)
        BasicApi.reqStartDj()
        BasicApi.reqCreateDj(BasicApi.account?.id)
        MainPinia.reqUserSubcount()
    })
}
const p1 = BasicApi.reqRecommendSongs()
const p2 = BasicApi.reqRecommendPlayList()
const p3 = BasicApi.reqDjProgramToplist(10)
const p4 = BasicApi.reqPlayListTags()
await Promise.allSettled([p1, p2, p3,p4])
MainPinia.reqPersonal_fm()
BasicApi.reqartistSublist()
BasicApi.reqalbumSublist()

let flagC = toRef(MainMenu, 'colorBlock')
flagC.value = localStorage.getItem('colorBlock') as string
const downloadFlag = toRef(globalVar, 'downloadFlag')
const downloadLevel = toRef(globalVar, 'downloadLevel')
const level = ref('standard')
const closed = (done?:()=>void) => {
    downloadFlag.value = false
    if(done)done()
}
const levelList = ['标准(128kbit/s)', '较高(192kbit/s)', '极高(320kbit/s)', '无损(999kbit/s)']
const levelListEn = ['standard', 'higher', 'exhigh', 'lossless']
const levelListLength = ref(0)
const dlWay = ref(-1)
watch(downloadLevel, () => {
    console.log(downloadLevel.value);
    const pl = weight(downloadLevel.value.play)
    const dl = weight(downloadLevel.value.download)
    levelListLength.value = Math.max(pl, dl)
    if (pl > dl) { //play接口
        dlWay.value = 0
    } else {  //dl接口
        dlWay.value = 1
    }
}, { deep: true })

const weight = (str: string) => {
    if (str == 'none') return 0
    else if (str == 'standard') return 1
    else if (str == 'higher') return 2
    else if (str == 'exhigh') return 3
    else return 4
}

const br = (str: string) => {
    if (str == 'standard') return 128000
    else if (str == 'higher') return 192000
    else if (str == 'exhigh') return 320000
    else return 999000
}
const WaitdownloadList = toRef(globalVar, 'downloadList')

const toDownload = () => {
    const controller = new AbortController()
    downloadQueue.value.add(() => getUrl(controller), { signal: controller.signal })
}
const getUrl = async (controller: AbortController) => {
    let result
    let url = ''
    globalVar.initDownloadButton = true
    const id = downloadLevel.value.id
    downloadFlag.value = false
    globalVar.loadingValue.set(id, [0, 1])
    globalVar.downloadId.push(id)
    globalVar.downloadList.push({ id: id, name: downloadLevel.value.songName, controller, ifcancel: false, url: '' })
    const downloadObj = globalVar.downloadList[globalVar.downloadList.length - 1]
    let chunks: Uint8Array[]
    if (globalVar.musicPick.get(id) == undefined) { //切片数据)
        //@ts-ignore
        chunks = []
    } else {
        //@ts-ignore
        chunks = globalVar.musicPick.get(id)
    }
    try {
        if (dlWay.value == 0) {
            result = await MainPinia.reqSongUrl(id, level.value)
            url = result.data.data[0].url
            downloadObj.level = level.value
        } else {
            result = await MainPinia.reqSongDlUrl(id, br(level.value))
            url = result.data.data.url
            downloadObj.br = br(level.value)
        }
    } catch (error) {
        globalVar.musicPick.set(id, chunks)
        downloadObj.ifcancel = true
    }
    let loaded = 0 //下载量
    downloadObj.url = url
    return fetch(url, {
        signal: downloadObj.controller.signal
    }).then(response => {
        const total = response.headers.get('content-length') as string//响应体大小
        const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
        return new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close()
                            return
                        }

                        loaded += value.byteLength
                        controller.enqueue(value)
                        chunks.push(value)
                        // 计算进度
                        globalVar.loadingValue.set(id, [loaded, (+total)])
                        push()
                    }).catch(error => {
                        console.log(error);
                        console.log(error.name);
                        if (error.name === 'AbortError') {
                            globalVar.musicPick.set(id, chunks)
                            return null

                        } else {
                            globalVar.musicPick.set(id, chunks)
                            //@ts-ignore
                            downloadObj.ifcancel = true
                            return null

                        }
                    })
                }
                push()
            }
        })
    })
        .then(stream => new Response(stream))
        .then(response => response.arrayBuffer())
        .then(async () => {
            const detail = (await MainPinia.reqSongDetail([id])).data.songs[0]
            console.log(detail);
            const title = `${detail.name}`
            const artistId:any[] = []
            const artist = (detail.ar.map((item)=>{
                artistId.push(item.id)
                return `${item.name}`
            })).join('/')
            const image = detail.al.picUrl
            const album = `${detail.al.name}`
            const id3 = {
                title,artist,image,album,ids:[detail.id,detail.al.id,...artistId],time:detail.dt
            }
            const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                mergedChunks.set(chunk, offset);
                offset += chunk.byteLength;
            }
            const arrayBuffer = mergedChunks.buffer;
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: downloadLevel.value.songName,id3 })
            globalVar.musicPick.delete(id)
            WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
            // window.electron.ipcRenderer.send('save-music-pick',{name:downloadLevel.value.songName})
            // globalVar.loadingValue.delete(id)
            // globalVar.downloadId = globalVar.downloadId.filter(item => item != id)
        }).catch((err) => {
            console.log(err);
            globalVar.musicPick.set(id, chunks)
            //@ts-ignore
            downloadObj.ifcancel = true
        })
}
const downloadList = ref([])
window.electron.ipcRenderer.send('get-download-list')
window.electron.ipcRenderer.on('look-download-list', ({ }, args: any[]) => {
    //@ts-ignore
    downloadList.value = args.map((it: string) => it.split('.mp3')[0])
})


provide('downloadList', downloadList)

let draggable = toRef(MainPinia,'dragMouse')
//拖动监视
let dragMessageId:number | null = null;
let t = setInterval(()=>{
    dragMessageId = window.electron.ipcRenderer.sendSync('getWindowId','drageMessage');
    if(dragMessageId){
        clearInterval(t);
    }
},100)
watch(draggable,(newValue,oldValue)=>{
    console.log(newValue,oldValue);
    if(newValue == true){
        console.log('拖动开始');
        window.electron.ipcRenderer.send('begin-drag')
        window.electron.ipcRenderer.sendTo(dragMessageId as number,'send-to-drag-Message',{message:MainPinia.dragMessage})
    }
    if(newValue == false){
        console.log('拖动结束');
        window.electron.ipcRenderer.send('end-drag')
        window.electron.ipcRenderer.sendTo(dragMessageId as number,'send-to-drag-end')

    }
})
watch(()=>MainMenu.colorBlock,(newValue)=>{
    if(newValue === 'NMblack'  || globalVar.oneself){
        let t = setInterval(()=>{
            if(dragMessageId){
                window.electron.ipcRenderer.sendTo(dragMessageId,'send-to-drag-bkColor',
                {backGroundColor:document.documentElement.style.getPropertyValue('--otherBkColor'),
                    fontColor:document.documentElement.style.getPropertyValue('--fontColor')
                })
                clearInterval(t);
            }
        },100)
    }else{
        let t = setInterval(()=>{
            if(dragMessageId){
                window.electron.ipcRenderer.sendTo(dragMessageId as number,'send-to-drag-bkColor',
                {backGroundColor:document.documentElement.style.getPropertyValue('--otherBkColor'),
                    fontColor:document.documentElement.style.getPropertyValue('--fontColor')
                })
                clearInterval(t)
            }
        },100)
    }
},{immediate:true})
</script>

<style scoped lang="less">
img {
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1000;
    height: 100vh;
    width: 100vw;
}

video {
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1000;
    height: 100%;
    width: 100%;
    object-fit: fill;
}

:deep(.el-overlay) {
    background-color: rgba(0, 0, 0, 0);
}

:deep(.el-dialog) {
    min-height: 270px;
    width: 500px;
    background-color: @other-bk-color;
    border-radius: .2em;
    .el-dialog__headerbtn {
        color: @font-color !important;
        width: auto;
        height: auto;
        text-shadow: none;
        right: 5px;

        .el-dialog__close {
            font-size: 25px;

            &:hover {
                color: @font-color !important;
            }

            :not(:hover) {
                color: @font-color !important;
            }
        }
    }

    header {
        text-align: center;
    }

    .title {
        color: @font-color;
        font-weight: bolder;
    }

    .list {
        margin-left: 40px;
        flex-direction: column;
        align-items: start;
    }

    label {
        height: 25px;

        .el-radio__label {
            font-size: 13px;
            color: @font-color;
        }
    }

    .is-checked {
        .el-radio__inner {
            border-color: @primary-color;
            background-color: @primary-color;
        }

        .el-radio__label {
            color: @primary-color;
        }
    }

    footer {
        text-align: center;
    }

    .go {
        background-color: @primary-color;
        border: none;
        color: #fff;
        border-radius: 2em;
        width: 100px;

        &:hover {
            background-color: @play-all-button-hover ;
        }
    }

    .fa {
        background-color: rgba(0, 0, 0, 0);
        border: @split-line-color 1px solid;
        width: 100px;
        border-radius: 2em;

        &:hover {
            background-color: @span-color-hover !important;
        }
    }
}
</style>