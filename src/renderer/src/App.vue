<script setup lang="ts">
import {ref} from 'vue'
import { useGlobalVar } from './store';
import useColor from '@renderer/hooks/useColor';
const {background,fontColor} = window.electron.ipcRenderer.sendSync('get-background-color')
console.log(background,fontColor);
const globalVar = useGlobalVar()
useColor()
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
