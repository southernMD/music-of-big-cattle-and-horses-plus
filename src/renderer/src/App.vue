<script setup lang="ts">
import { onErrorCaptured, onMounted, ref, toRef } from 'vue'
import { useGlobalVar, useMain } from './store';
import useColor from '@renderer/hooks/useColor';
import { RouterView } from 'vue-router';
import getWindowsWorker from '@renderer/workers/getWindowsWorker?worker'
const { background, fontColor } = window.electron.ipcRenderer.sendSync('get-background-color')
console.log(background, fontColor);
const globalVar = useGlobalVar()
useColor()
const Main = useMain()
let ciId = toRef(Main, 'ciId')
let mainId = toRef(Main, 'mainId')
let dragMessageId = toRef(Main, 'dragMessageId')
onMounted(() => {
    const windowsWorker = new getWindowsWorker()
    // 监听 Worker 的消息
    windowsWorker.addEventListener('message', (e) => {
        console.log(e.data);
        const { windowName, id } = e.data;
        if (id !== undefined) {
            // 将结果发送回主进程
            const idRes = window.electron.ipcRenderer.sendSync('getWindowId', windowName);
            console.log("主进程获得", windowName, "的id", idRes);
            if (idRes !== undefined) {
                windowsWorker.postMessage({ type: 'finished', windowName, id });
                switch (windowName) {
                    case 'drageMessage':
                        dragMessageId.value = idRes
                        break;
                    case 'Ci':
                        ciId.value = idRes
                        break;
                    case 'Main':
                        mainId.value = idRes
                        break;
                }
            }
        }
    });

    // 请求窗口 ID
    console.log("请求窗口 ID");
    windowsWorker.postMessage({ type: 'requestId', windowName: 'drageMessage' });
    windowsWorker.postMessage({ type: 'requestId', windowName: 'Ci' });
    windowsWorker.postMessage({ type: 'requestId', windowName: 'Main' });

})
window.addEventListener('keydown', (e) => {    
    //ctrl没有按下
    if(!e.ctrlKey){
        e.preventDefault()
    }
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
.contain {
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
    letter-spacing: 10px
}
</style>
