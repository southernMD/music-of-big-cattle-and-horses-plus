<template>
    <div class="background">
        <img src="" alt="" id="mainBackground">
        <video src="" id="mainBackgroundVideo" :muted="true" loop></video>
        <MyMainMenu></MyMainMenu>
        <LoadingBig></LoadingBig>
    </div>
</template>

<script setup lang="ts">
import {toRef,onMounted} from 'vue'
import {useMainMenu} from '@renderer/store'
import useColor from '@renderer/hooks/useColor';
useColor()
onMounted(()=>{
})
const MainMenu = useMainMenu();
window.electron.ipcRenderer.sendSync('renderer-ready')
window.electron.ipcRenderer.on('memory-background',({},{buffer,extname})=>{
    extname = '.'+extname
    console.log(buffer,extname);
    const them = localStorage.getItem('colorBlock') as string
    if(!['.jpg','.png','.jpeg','.webp','.mp4'].includes(them))return
    if(['.jpg','.png','.jpeg','.webp'].includes(extname)){
        // needImage.value = true
        // needVedio.value = false
        const file = new File([buffer], `background.${extname}`, { type: `image/${extname}` });
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = function(){
            const newUrl = this.result;
            const h:any = document.getElementById('mainBackground') as HTMLImageElement
            h.src = newUrl
        };
    }else if(['.mp4'].includes(extname)){
        // needVedio.value = true
        // needImage.value = false
        // var file = new File([buffer], `background${extname}`, { type: `video/${extname}` });
        // console.log(buffer.toString('base64'));
        // var reader = new FileReader();
        // reader.readAsDataURL(file);
        // reader.onload = function() {
        //     var newUrl = this.result;
            // const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
            // v.src = newUrl
            // const h:any = document.getElementById('mainBackground') as HTMLImageElement
            // h.src = newUrl
        // };
    }
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
})
// window.electron.ipcRenderer.on('ffmpeg-path',({},data)=>{
//     console.log(data);
// })

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