<template>
    <div class="AppSmall">
        <img src="" id="mainBackground" style="display: none;">
        <video hidden src="" ref="video" id="mainBackgroundVideo" :muted="true" loop type="video/mp4"></video>
        <canvas ref="videoCanvas"></canvas>
        <MyMainMenu></MyMainMenu>
        <!-- <LoadingBig></LoadingBig> -->
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
        <Loading :loading="true" message="" v-if="loadDefault" :width="20" tra="10"></Loading>
        <Loading :loading="false" :type="globalVar.loadMessageDefaultType" :showTime="1000"
            :message="globalVar.loadMessageDefault" v-if="globalVar.loadMessageDefaultFlag"
            @close="globalVar.loadMessageDefaultFlag = false"></Loading>
        <Teleport to="body">
            <rightBlock :index="index" :evid="evid" :commentType="commentType" :path="path" :download="download" :shareTxt="txt" 
            :shareAvg="pic" :id="id" :left="eventBlockLeft" :top="eventBlockTop" 
            :type="type" :rightFlag="rightFlag"
            :djName="djName"
            :djId="djId"
            :djprogramid="djprogramid"
            :djprogramName="djprogramName"
            :radioid="radioid"
            :videoFolderId="videoFolderId"
            :videoFolder="videoFolder"
            ></rightBlock>
        </Teleport>
        <MyDialog :flag="updateFlag" @closeDialog="closeUpdate" @confirm="confirmUpdate" @cancel="cancleUpdate" confirmName="现在更新">
            <template #header>
                <div class="title">{{ newVersion }}</div>
            </template>
            <template #midle>
                <div class="center">检测到新版本是否下载？</div>
            </template>
        </MyDialog>
    </div>
</template>

<script setup lang="ts">
import { toRef, onMounted, Ref, nextTick, provide, ref, watch, shallowRef, toRaw,ShallowRef, inject,defineAsyncComponent, watchEffect } from 'vue'
import { useMainMenu, useGlobalVar, useBasicApi, useMain,useNM } from '@renderer/store'
// const MusicRadio = shallowRef()
// const MyMainMenu = shallowRef()
// const Main = shallowRef()
// onMounted(()=>{
//     MusicRadio.value = defineAsyncComponent(() =>
//     import('@renderer/components/MusicRadio/index.vue'))
//     MyMainMenu.value = defineAsyncComponent(() =>
//     import('@renderer/components/MyMainMenu/index.vue'))
//     Main.value = defineAsyncComponent(() =>
//     import('@renderer/components/Main.vue'))
// })
const MusicRadio = defineAsyncComponent(() =>
    import('@renderer/components/MusicRadio/index.vue'))
const MyMainMenu = defineAsyncComponent(() =>
    import('@renderer/components/MyMainMenu/index.vue'))
const Main = defineAsyncComponent(() =>
    import('@renderer/components/Main.vue'))

import MyDialog from '@renderer/components/myVC/MyDialog.vue';
import rightBlock from '@renderer/components/myVC/RightBlock.vue'
import PromiseQueue from 'p-queue';
import { githubUpdate } from '@renderer/api';

const globalVar = useGlobalVar()
const BasicApi = useBasicApi();
const NM = useNM();
const MainPinia = useMain();
const flagLogin: Ref<boolean> = toRef(globalVar, 'flagLogin')
const loadDefault: Ref<boolean> = toRef(globalVar, 'loadDefault')
const downloadQueue = shallowRef(new PromiseQueue({ concurrency: 3 }))

globalVar.setting.version = window.electron.ipcRenderer.sendSync('app-version')

provide('downloadQueue', downloadQueue)
onMounted(() => {
    globalVar.oneself = Number(localStorage.getItem('oneself')) as 0 | 1
})
let BKbase64 = ref('')
provide('playListId', ref(-1))
provide('BKbase64', BKbase64)
const MainMenu = useMainMenu();
window.electron.ipcRenderer.on('memory-background', ({ }, { buffer, extname }) => {
    extname = '.' + extname
    console.log(buffer, extname);
    if (['.jpg', '.png', '.jpeg', '.webp'].includes(extname)) {
        const file = new File([buffer], `background.${extname}`, { type: `image/${extname}` });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function () {
            const newUrl = this.result;
            nextTick(()=>{
                const h: any = document.getElementById('mainBackground') as HTMLImageElement
                if (h) {
                    BKbase64.value = newUrl as string
                    h.src = newUrl
                    h.style.display = 'block'
                }
            })
        };
    }
    MainMenu.colorBlock = extname
    globalVar.oneself = 1
    nextTick(()=>{
        document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
        document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
        document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
        localStorage.setItem('MainTitle', `255, 255, 255`)
        localStorage.setItem('MainMenu', `255, 255, 255,.7`)
        localStorage.setItem('MainMenuHover', `255, 255, 255`)
        localStorage.setItem('colorBlock', extname);
        localStorage.setItem('oneself', '1')
    })
})
// window.electron.ipcRenderer.on('ffmpeg-path',({},data)=>{
//     console.log(data);
// })

onMounted(()=>{
    window.electron.ipcRenderer.send('renderer-ready')
})
const videoCanvas = ref()
const video = ref()
let context
window.electron.ipcRenderer.on('mp4-ready', ({ }, { flag,filePath }) => {
    if (!flag) globalVar.loadingMp4Bk = true
    const port = window.electron.ipcRenderer.sendSync('vedio-server-port');
    nextTick(()=>{
        video.value.src = `http://127.0.0.1:${port}/video?path=${filePath}`
        video.value.play()
        context = videoCanvas.value.getContext('2d')

        video.value.addEventListener('loadedmetadata',()=>{
            videoCanvas.value.width = video.value.videoWidth;
            videoCanvas.value.height = video.value.videoHeight;
            context.imageSmoothingEnabled = false;
        })
        video.value.addEventListener("play", function () {
            const drawFrame = () => {
                if (context && !video.value.paused && !video.value.ended) {
                    context.drawImage(video.value, 0, 0, videoCanvas.value.width, videoCanvas.value.height);
                    requestAnimationFrame(drawFrame);
                }
            };
            drawFrame();
        })
        const h = document.getElementById('mainBackground') as HTMLImageElement
        h.style.display = 'none'
        h.src = ''
    })
    // fetch(`http://127.0.0.1:${port}/video?path=${filePath}`).then((response) => {
    //     return response.arrayBuffer()
    // }).then((buffer) => {
    //     console.log(buffer);
    //     const url = URL.createObjectURL(new Blob([buffer], {
    //         type: "video/m3u8"
    //     }))
    //     const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
    //     v.src = url
    //     v.play()
    //     const h = document.getElementById('mainBackground') as HTMLImageElement
    //     h.style.display = 'none'
    //     h.src = ''
    // })

        MainMenu.colorBlock = '.mp4'
        nextTick(()=>{
            document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
            document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
            document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
            localStorage.setItem('MainTitle', `255, 255, 255`)
            localStorage.setItem('MainMenu', `255, 255, 255,.7`)
            localStorage.setItem('MainMenuHover', `255, 255, 255`)
            localStorage.setItem('oneself', '1')
            globalVar.oneself = 1
        })
    // })
})
window.electron.ipcRenderer.on('mp4-error',({},{ msg })=>{
    alert(msg)
})
window.electron.ipcRenderer.on('mp4-msg',({},{ msg })=>{
    alert(msg)
})

//换被景图
//与下面代码无关

window.electron.ipcRenderer.on('file-ready', ({ }, { liu, extname }) => {
    console.log(liu, extname);
    const file = new File([liu], `background.${extname}`, { type: `image/${extname}` });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function () {
        const newUrl = this.result;
        const h: any = document.getElementById('mainBackground') as HTMLImageElement
        h.src = newUrl
        h.style.display = 'block'
        const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
        v.pause();
        v.src = ''
    };
    // const h = document.querySelector('#header') as HTMLElement
    // h.style.backgroundImage =   "data:image/png;base64," + base64
    globalVar.oneself = 1
    MainMenu.colorBlock = extname
    nextTick(()=>{
        localStorage.setItem('broundColor', '33,33,36,.8')
        document.documentElement.style.setProperty(`--broundColor`, `rgba(33,33,36,.8)`)
        document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
        document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
        document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
        localStorage.setItem('MainTitle', `255, 255, 255`)
        localStorage.setItem('MainMenu', `255, 255, 255,.7`)
        localStorage.setItem('MainMenuHover', `255, 255, 255`)
        localStorage.setItem('colorBlock', extname);
        localStorage.setItem('oneself', '1')
    })
  
})

if (!sessionStorage.getItem('youkeCookie')) {
    let result: any = await BasicApi.reqAnonimous(); //游客登陆
    if (result.data.code == 200) {
        sessionStorage.setItem('youkeCookie', result.data.cookie)
    }
}
let cookie = localStorage.getItem('cookieUser')
if (localStorage.getItem('NMcookie')) {
    NM.reqLogin().then(()=>{
        NM.reqUserPlaylist(BasicApi.profile?.userId)
        NM.reqUserLike(BasicApi.profile?.userId)
        NM.reqUserSubcount()
        NM.reqartistSublist()
        NM.reqalbumSublist()
        NM.requserFollows(BasicApi.profile?.userId,99999999,0)
    })
}
else if (!(cookie == '' || cookie == null || cookie == undefined)) {
    BasicApi.reqLogin(cookie as string).then(() => {
        MainPinia.reqUserPlaylist(BasicApi.account?.id)
        MainPinia.reqUserLike(BasicApi.account?.id)
        BasicApi.reqStartDj()
        BasicApi.reqCreateDj(BasicApi.account?.id)
        MainPinia.reqUserSubcount()
        BasicApi.reqartistSublist()
        BasicApi.reqalbumSublist()
        BasicApi.requserFollows(BasicApi.account!.id)
    })
}
const p0 = localStorage.getItem('NMcookie')? NM.reqLogin():BasicApi.reqLogin(cookie as string)
const p1 = BasicApi.reqRecommendSongs()
let p2
if(localStorage.getItem('NMcookie')){
    p2 = NM.reqRecommendPlayList()
}else{
    p2 = BasicApi.reqRecommendPlayList()
}
// const p3 = BasicApi.reqDjProgramToplist(10)
const p4 = BasicApi.reqPlayListTags()
await Promise.allSettled([p0,p1, p2, p4])

onMounted(async()=>{
    if(localStorage.getItem('NMcookie')){
        Promise.allSettled([
            NM.reqUserPlaylist(BasicApi.profile?.userId),
            NM.reqUserLike(BasicApi.profile?.userId),
            NM.reqUserSubcount(),
            NM.requserFollows(BasicApi.profile?.userId,99999999,0)
        ])
    }else if(!(cookie == '' || cookie == null || cookie == undefined)){
        Promise.allSettled([
            MainPinia.reqUserPlaylist(BasicApi.account?.id),
            MainPinia.reqUserLike(BasicApi.account?.id),
            MainPinia.reqUserSubcount(),
            BasicApi.requserFollows(BasicApi.account!.id)
        ])
        
    }
})

const fontList:string[] = await window.electron.ipcRenderer.invoke('get-font-list')
globalVar.fontList = fontList.map(str=>str.replaceAll('\"','')).map(it=>{return {name:it}})
globalVar.fontList.unshift({name:'默认'})

let flagC = toRef(MainMenu, 'colorBlock')
flagC.value = localStorage.getItem('colorBlock') as string
const downloadFlag = toRef(globalVar, 'downloadFlag')
const downloadLevel = toRef(globalVar, 'downloadLevel')
const level = ref('standard')
const closed = (done?: () => void) => {
    downloadFlag.value = false
    if (done) done()
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
            const artistId: any[] = []
            const artist = (detail.ar.map((item) => {
                artistId.push(item.id)
                return `${item.name}`
            })).join('/')
            const image = detail.al.picUrl
            const album = `${detail.al.name}`
            const id3 = {
                title, artist, image, album, ids: [detail.id, detail.al.id, ...artistId], time: detail.dt
            }
            const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                mergedChunks.set(chunk, offset);
                offset += chunk.byteLength;
            }
            const arrayBuffer = mergedChunks.buffer;
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: downloadLevel.value.songName, id3 })
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
    console.log('这里是下载的列表',args);
    //@ts-ignore
    downloadList.value = args.map((it: string) => it.split('.mp3')[0])
})


provide('downloadList', downloadList)

let draggable = toRef(MainPinia, 'dragMouse')
//拖动监视
let dragMessageId = toRef(MainPinia,"dragMessageId") 
// let t = 1
// let t = setInterval(() => {
//     dragMessageId = window.electron.ipcRenderer.sendSync('getWindowId', 'drageMessage');
//     if (dragMessageId) {
//         clearInterval(t);
//     }
// }, 5000)
watch(draggable, (newValue, oldValue) => {
    console.log(newValue, oldValue);
    if (newValue == true) {
        console.log('拖动开始');
        window.electron.ipcRenderer.send('begin-drag')
        window.electron.ipcRenderer.sendTo(dragMessageId.value as number, 'send-to-drag-Message', { message: MainPinia.dragMessage })
    }
    if (newValue == false) {
        console.log('拖动结束');
        window.electron.ipcRenderer.send('end-drag')
        window.electron.ipcRenderer.sendTo(dragMessageId.value as number, 'send-to-drag-end')

    }
})
watch(() => MainMenu.colorBlock, (newValue) => {
    if (newValue === 'NMblack' || globalVar.oneself) {
        let t = setInterval(() => {
            if (dragMessageId.value) {
                window.electron.ipcRenderer.sendTo(dragMessageId.value, 'send-to-drag-bkColor',
                    {
                        backGroundColor: document.documentElement.style.getPropertyValue('--otherBkColor'),
                        fontColor: document.documentElement.style.getPropertyValue('--fontColor')
                    })
                clearInterval(t);
            }
        }, 100)
    } else {
        let t = setInterval(() => {
            if (dragMessageId.value) {
                window.electron.ipcRenderer.sendTo(dragMessageId.value as number, 'send-to-drag-bkColor',
                    {
                        backGroundColor: document.documentElement.style.getPropertyValue('--otherBkColor'),
                        fontColor: document.documentElement.style.getPropertyValue('--fontColor')
                    })
                clearInterval(t)
            }
        }, 100)
    }
}, { immediate: true })

const rightFlag = ref(false)
const eventBlockLeft = ref(0)
const eventBlockTop = ref(0)
const type = ref('')
const id = ref('0')
const txt = ref('')
const pic = ref('')
const evid = ref('')
const download = ref('')
const path = ref('')
const commentType = ref('')
const index = ref('')
const djName = ref('')
const djId = ref('')
const djprogramid = ref('')
const djprogramName = ref('')
const radioid = ref('')
const videoFolderId = ref('')
const videoFolder = ref('')

window.addEventListener('contextmenu', (event) => {
  rightFlag.value = false 
  event.preventDefault(); // 阻止默认的右键菜单弹出
  console.log(event.composedPath());
  const doms = event.composedPath() as HTMLElement[]
  for(let i = 0 ;i<doms.length;i++){
    if(doms[i] instanceof HTMLElement && Boolean(eval(doms[i].getAttribute('data-right')!))){
        console.log(doms[i],event.clientX,event.clientY);
        type.value = doms[i].getAttribute('data-type')! ?? ''
        id.value = doms[i].getAttribute('data-id')! ?? ''
        pic.value = doms[i].getAttribute('data-pic')! ?? ''
        txt.value = doms[i].getAttribute('data-txt')! ?? ''
        download.value = eval(doms[i].getAttribute('data-download')!) ?? ''
        path.value = doms[i].getAttribute('data-path')! ?? ''
        commentType.value =  doms[i].getAttribute('data-commentType')! ?? ''
        evid.value =  doms[i].getAttribute('data-evid')! ?? ''
        index.value =  doms[i].getAttribute('data-index')! ?? ''
        djName.value =  doms[i].getAttribute('data-djName')! ?? ''
        djId.value =  doms[i].getAttribute('data-djId')! ?? ''
        djprogramid.value =  doms[i].getAttribute('data-djprogramid')! ?? ''
        djprogramName.value =  doms[i].getAttribute('data-djprogramname')! ?? ''
        radioid.value =  doms[i].getAttribute('data-radioid')! ?? ''

        videoFolderId.value =  doms[i].getAttribute('data-video-folderId')! ?? ''
        videoFolder.value =  doms[i].getAttribute('data-video-folder')! ?? ''
        
        const x = event.clientX; // 鼠标点击位置相对于浏览器窗口左上角的横坐标
        const y = event.clientY; // 鼠标点击位置相对于浏览器窗口左上角的纵坐标
        eventBlockLeft.value = x
        eventBlockTop.value = y
        if(type.value.length!=0)rightFlag.value = true 
        console.log(id.value,evid.value);
        break
    }
  }

// topValue.value = top
// leftValue.value = left
});
window.addEventListener('click',(event)=>{
    if(globalVar.rightClick){
        globalVar.rightClick =false
    }else{
        rightFlag.value = false 
    }
})

const quickGlobal = toRef(globalVar.setting,'quickGlobal')
const errGlobal = toRef(globalVar.setting,'errGlobal')
const quick = toRef(globalVar.setting,'quick')
if(quick.value.length == 0)quick.value = ['Ctrl + P','Ctrl + Left','Ctrl+ Right','Ctrl + Up','Ctrl + Down','Ctrl + M','Ctrl + L']
if(quickGlobal.value.length == 0)quickGlobal.value = ['Ctrl + Alt + P','Ctrl + Alt + Left','Ctrl + Alt + Right','Ctrl + Alt + Up','Ctrl + Alt + Down','Ctrl + Alt + M','Ctrl + Alt + L']
if(errGlobal.value.length == 0)errGlobal.value = [false,false,false,false,false,false,false]
watch(quickGlobal,()=>{
    setQuickButton()
},{deep:true})
onMounted(()=>{
    setQuickButton()
})
const setQuickButton = ()=>{
    window.electron.ipcRenderer.invoke('set-global-op',toRaw(quickGlobal.value)).then((ress)=>{
        console.log(ress);
        ress.forEach((val,index)=>{
            if(!val)errGlobal.value[index] = true
            else errGlobal.value[index] = false
        })
    })
}

if(globalVar.setting.downloadPath == ''){
    window.electron.ipcRenderer.invoke('get-download-path').then((data) => {
        globalVar.setting.downloadPath = data
    })
}

watch(()=>globalVar.setting.downloadPath,async()=>{
    if(globalVar.setting.downloadPath != ''){
        await window.electron.ipcRenderer.invoke('change-download-path',globalVar.setting.downloadPath)
        window.electron.ipcRenderer.send('get-download-list')
    }
},{immediate:true})

let ciId = toRef(MainPinia,"ciId")

window.electron.ipcRenderer.on('lrc-ready',()=>{
    console.log('lrc准备完毕');
    window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-fontFamily',globalVar.setting.lrcFontFamily)
    window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-fontSize',globalVar.setting.lrcSize )
    window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-fontWeight',globalVar.setting.lrcWeigth)
    window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-LrcBorder',globalVar.setting.lrcBorder)
    window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-changeLrcborderColor',toRaw(globalVar.setting.borderColor))
    if(globalVar.setting.lrcColor == '默认'){
        window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-changeLrcColor',{
            top:'rgb(255,255,0)',
            bottom:'rgb(255,0,0)'
        })
    }else{
        window.electron.ipcRenderer.sendTo(ciId.value!,'lrc-changeLrcColor',{
            top:toRaw(globalVar.setting.topColor),
            bottom:toRaw(globalVar.setting.bottomColor)
        })
    }

})
window.electron.ipcRenderer.on('setting-size',({},{size})=>{
    globalVar.setting.lrcSize = parseInt(size)
})


const newVersion = toRef(globalVar.setting,'newVersion')
const url = toRef(globalVar.setting,'updataUrl')
const updateFlag = toRef(globalVar.setting,'updateFlag')
const searchUpdate = async()=>{
    // globalVar.loadDefault = true
    let res =  await githubUpdate()
    // globalVar.loadDefault = false
    if(res == null){
    }else{
        const v = res.data.name.split('v')[1]
        console.log(v,globalVar.setting.version);
        if(v <= globalVar.setting.version){
        }else{
            newVersion.value = res.data.name
            updateFlag.value = true
            url.value = res.data.assets[0].browser_download_url
            // const assets = response.data.assets;
            // console.log(assets,response.data);
        }
    }
}

onMounted(()=>{
    searchUpdate()
})

const closeUpdate = (done:()=>void)=>{
    done()
    updateFlag.value = false
}

const confirmUpdate = ()=>{
    updateFlag.value = false
    open(url.value,'_blank')
}

const cancleUpdate = ()=>{
    updateFlag.value = false
}

watch(()=>globalVar.downloadId,()=>{
    console.log(globalVar.downloadId,'下载id列表变化');
    
})
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
    z-index: -999;
    height: 100%;
    width: 100%;
    object-fit: fill;
}
canvas{
    position: fixed;
    left: 0;
    top: 0;
    z-index: -999;
    height: 100%;
    width: 100%;
    object-fit: fill;
}

.center{
    width: 100%;
    text-align: center;
    color: @font-color;
}


</style>