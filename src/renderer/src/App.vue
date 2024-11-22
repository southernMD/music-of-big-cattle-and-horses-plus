<script setup lang="ts">
import {ref,toRef} from 'vue'
import { useGlobalVar,useMain } from './store';
import useColor from '@renderer/hooks/useColor';
const {background,fontColor} = window.electron.ipcRenderer.sendSync('get-background-color')
console.log(background,fontColor);
const globalVar = useGlobalVar()
useColor()
const Main = useMain()
let ciId = toRef(Main,'ciId') 
let mainId = toRef(Main,'mainId')
let dragMessageId = toRef(Main,'dragMessageId')
let t1 =setInterval(()=>{
    dragMessageId.value = window.electron.ipcRenderer.sendSync('getWindowId', 'drageMessage')
    if(dragMessageId.value != undefined){
        clearInterval(t1)
    }
},5000)
let t3 =setInterval(()=>{
    ciId.value = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci')
    if(ciId.value != undefined){
        clearInterval(t3)
    }
},5000)
let t2 =setInterval(()=>{
  mainId.value = window.electron.ipcRenderer.sendSync('getWindowId', 'Main')
    if(mainId.value != undefined){
        clearInterval(t2)
    }
},5000)
window.addEventListener('keydown',(e)=>{
    e.preventDefault()
})
</script>

<template>
<div class="contain" v-if="!globalVar.radioReady && $route.path.includes('/app') && !globalVar.lrcFlag">大牛马音乐</div>
<Suspense>
    <template #default>
        <RouterView></RouterView>
    </template>
</Suspense>
</template>

<style lang="less" scoped>
.contain{
    width: 100vw;
    height: 100vh;
    background-color: v-bind('background');
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 13;
    position: absolute;
    font-size: 50px;
    color: v-bind('fontColor');
    font-family: '方正准圆简体';
    user-select: none;
    letter-spacing:10px
}
</style>
