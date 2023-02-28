<template>
    <div class="color-block" :id="`dom${index}`">
        <canvas :id="`canvas${index}`" width="38" height="38" @click.self="showColor"></canvas>
        <i class="iconfont icon-zhengque" v-show="flagC == index"></i>
    </div>

</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, toRef ,nextTick} from 'vue';
import { getPxColor } from '@renderer/utils/getCanvasColor'
import icon from '@renderer/assets/icon.png'
import iconRed from '@renderer/assets/iconRed.png'

import {useMainMenu,useGlobalVar} from '@renderer/store'
let MainMenu = useMainMenu();
let globalVar = useGlobalVar()
let $el = getCurrentInstance()
defineProps<{
    bkColor?: string,
    index:string
    other?:boolean
    border?:boolean
}>()

let canvas: HTMLCanvasElement
let ctx: CanvasRenderingContext2D

let flagC = toRef(MainMenu,'colorBlock')
onMounted(() => {
    nextTick(()=>{
        canvas = document.querySelector(`#canvas${$el?.props.index}`) as HTMLCanvasElement
        ctx = canvas.getContext('2d') as CanvasRenderingContext2D
        if($el?.props.other){
            let ctx = canvas.getContext('2d') as CanvasRenderingContext2D
            ctx.beginPath()
            let gradient = ctx.createRadialGradient(19,19,8,19,19,20);
            gradient.addColorStop(1,"#7bf57e");
            gradient.addColorStop(0,"white");
            ctx.fillStyle = gradient;
            ctx.rect(0,0,19,19)
            ctx.fill()
            ctx.closePath()
            ctx.beginPath()
            gradient = ctx.createRadialGradient(19,19,8,19,19,20);
            gradient.addColorStop(1,"#6cc4de");
            gradient.addColorStop(0,"white");
            ctx.fillStyle = gradient;
            ctx.rect(0,19,19,19)
            ctx.fill()
            ctx.closePath()
            ctx.beginPath()
            gradient = ctx.createRadialGradient(19,19,8,19,19,20);
            gradient.addColorStop(1,"#ffdb76");
            gradient.addColorStop(0,"white");
            ctx.fillStyle = gradient;
            ctx.rect(19,0,19,19)
            ctx.fill()
            ctx.closePath()
            ctx.beginPath()
            gradient = ctx.createRadialGradient(19,19,8,19,19,20);
            gradient.addColorStop(1,"#f67260");
            gradient.addColorStop(0,"white");
            ctx.fillStyle = gradient;
            ctx.rect(19,19,19,19)
            ctx.fill()
            ctx.closePath()
        }else{
            ctx.fillStyle = $el?.props.bkColor as string
            ctx.fillRect(0, 0, canvas.width, canvas.height)
        }
        if(!$el?.props.border){
            let dom = document.querySelector(`#dom${$el?.props.index}`) as HTMLElement
            dom.style.border = 'none'
        }
    })

})

const showColor = () => {
    if($el?.props.other){   //彩色
        flagC.value = $el?.props.index as string
    }else if($el?.props.index == '1'){  //白色
        MainMenu.iconSrc = iconRed
        document.documentElement.style.setProperty(`--primaryColor`, `rgb(236,65,65)`)
        document.documentElement.style.setProperty(`--broundColor`, `rgba(245,245,245,1)`)
        document.documentElement.style.setProperty(`--MainTitle`, `rgb(49,49,49)`)
        document.documentElement.style.setProperty(`--MainMenu`, `rgba(0,0,0,.7)`)
        document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(0,0,0)`)
        localStorage.setItem('primaryColor',`236,65,65`)
        localStorage.setItem('broundColor',`245,245,245`)
        localStorage.setItem('MainTitle',`49,49,49`)
        localStorage.setItem('MainMenu',`0,0,0,.7`)
        localStorage.setItem('MainMenuHover',`255,255,255`)
        localStorage.setItem('colorBlock','1');
        flagC.value = $el?.props.index as string
        MainMenu.primaryColor = 'rgb(236,65,65)'
        if(globalVar.oneself){
            document.documentElement.style.setProperty(`--broundColor`, `rgba(245,245,245,.8)`)
            localStorage.setItem('broundColor',`rgba(245,245,245,.8)`)
        }
    }else{
        MainMenu.iconSrc = icon
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let arr = getPxColor(imageData, 0, 0)
        document.documentElement.style.setProperty(`--primaryColor`, `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`)
        document.documentElement.style.setProperty(`--broundColor`, `rgba(${arr[0]}, ${arr[1]}, ${arr[2]},1)`)
        document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
        document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
        document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
        localStorage.setItem('primaryColor',`${arr[0]},${arr[1]},${arr[2]}`)
        localStorage.setItem('broundColor',`${arr[0]},${arr[1]},${arr[2]},1`)
        localStorage.setItem('MainTitle',`255, 255, 255`)
        localStorage.setItem('MainMenu',`255, 255, 255,.7`)
        localStorage.setItem('MainMenuHover',`255, 255, 255`)
        localStorage.setItem('colorBlock',`${$el?.props.index}`);
        flagC.value = $el?.props.index as string
        MainMenu.primaryColor = `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`
        if(globalVar.oneself){
            document.documentElement.style.setProperty(`--broundColor`, `rgba(${arr[0]}, ${arr[1]}, ${arr[2]},.8)`)
            localStorage.setItem('broundColor',`${arr[0]},${arr[1]},${arr[2]},.8`)
        }
    }

}
</script>

<style lang="less" scoped>
.color-block {
    position: relative;
    width: 40px;
    height: 40px;
    cursor: pointer;
    box-sizing: border-box;
    border: 1px solid #ccc;
    border-radius: 0.4em;
    canvas {
        border-radius: 0.4em;
    }
    i {
        position: absolute;
        right: -5px;
        bottom: -5px;
        color: #d13f3a;
        z-index: 999;
        background-color: white;
        font-size: 20px;
        border-radius: 50%;
    }
}
</style>