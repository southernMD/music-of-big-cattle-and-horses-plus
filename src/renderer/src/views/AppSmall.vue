<template>
    <div class="background">
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
    </div>
</template>

<script setup lang="ts">
import {toRef,onMounted,Ref,nextTick,provide,ref} from 'vue'
import {useMainMenu,useGlobalVar,useBasicApi,useMain} from '@renderer/store'
import useColor from '@renderer/hooks/useColor';
const globalVar = useGlobalVar()
const BasicApi = useBasicApi();
const MainPinia = useMain();
const flagLogin: Ref<boolean> = toRef(globalVar,'flagLogin')
useColor()
onMounted(()=>{
    globalVar.oneself = Number(localStorage.getItem('oneself')) as 0 | 1
})

provide('playListId', ref(-1))

const MainMenu = useMainMenu();
window.electron.ipcRenderer.sendSync('renderer-ready')
window.electron.ipcRenderer.on('memory-background',({},{buffer,extname})=>{
    extname = '.'+extname
    console.log(buffer,extname);
    if(['.jpg','.png','.jpeg','.webp'].includes(extname)){
        const file = new File([buffer], `background.${extname}`, { type: `image/${extname}` });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(){
            const newUrl = this.result;
            const t = setInterval(()=>{
                const h:any = document.getElementById('mainBackground') as HTMLImageElement
                if(h){
                    h.src = newUrl
                    clearInterval(t)
                }
            },500)
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
    localStorage.setItem('oneself','1')
    globalVar.oneself = 1
})
// window.electron.ipcRenderer.on('ffmpeg-path',({},data)=>{
//     console.log(data);
// })

window.electron.ipcRenderer.on('mp4-ready',({},{flag})=>{
    if(!flag)globalVar.loadingMp4Bk = true
    fetch(`http://127.0.0.1:2233/video`).then((response)=>{
        return response.arrayBuffer()
    }).then((buffer)=>{
        console.log(buffer);
        const url = URL.createObjectURL(new Blob([buffer],{
            type:"video/m3u8"
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
        localStorage.setItem('oneself','1')
        globalVar.oneself = 1
    })
})

//换被景图
window.electron.ipcRenderer.on('file-ready',({},{liu,extname})=>{
    console.log(liu,extname);
    const file = new File([liu], `background.${extname}`, { type: `image/${extname}` });
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = function() {
        const newUrl = this.result;
        const h:any = document.getElementById('mainBackground') as HTMLImageElement
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
    localStorage.setItem('oneself','1')
    globalVar.oneself = 1

})

if (!sessionStorage.getItem('youkeCookie')) {
    let result: any = await BasicApi.reqAnonimous(); //游客登陆
    if (result.data.code == 200) {
        sessionStorage.setItem('youkeCookie', result.data.cookie)
    }
}
let cookie = localStorage.getItem('cookieUser')
if(sessionStorage.getItem('NMcookie')){

}
else if (!(cookie == '' || cookie == null || cookie == undefined)) {
    BasicApi.reqLogin(cookie as string).then(()=>{
        MainPinia.reqUserPlaylist(BasicApi.account?.id)
        MainPinia.reqUserLike(BasicApi.account?.id)
        BasicApi.reqStartDj()
        BasicApi.reqCreateDj(BasicApi.account?.id)
        MainPinia.reqUserSubcount()
    })
}
BasicApi.reqRecommendSongs()
BasicApi.reqRecommendPlayList()
BasicApi.reqDjProgramToplist(10)
MainPinia.reqPersonal_fm()

let flagC = toRef(MainMenu, 'colorBlock')
flagC.value = localStorage.getItem('colorBlock') as string
</script>

<style scoped lang="less">
img{
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1000;
    height: 100vh;
    width: 100vw;
}
video{
    position: fixed;
    left: 0;
    top: 0;
    z-index: -1000;
    height: 100%;
    width: 100%;
    object-fit: fill;
}
</style>