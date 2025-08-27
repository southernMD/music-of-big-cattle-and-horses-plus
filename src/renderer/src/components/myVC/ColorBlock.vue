<template>
    <div class="color-block" :id="`dom${index}`">
        <canvas :id="`canvas${index}`" width="38" height="38" @click.self="showColor"></canvas>
        <i class="iconfont icon-zhengque" v-show="flagC == index"></i>
    </div>

</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted, toRef ,nextTick} from 'vue';
import { getPxColor } from '@renderer/utils/getCanvasColor'
import { applyTheme } from '@renderer/hooks/useColor'
import icon from '@renderer/assets/icon.png'
import iconRed from '@renderer/assets/iconRed.png'
import pickColorOther from '@renderer/assets/pickColorOther.json'
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
            const pickColorOtherUint8 = new Uint8ClampedArray(pickColorOther)
            const newImageData = ctx.createImageData(Math.sqrt(pickColorOtherUint8.length / 4),Math.sqrt(pickColorOtherUint8.length / 4));
            newImageData.data.set(pickColorOtherUint8)
            ctx.putImageData(newImageData, 0, 0);
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

        // 使用白色主题类
        const html = document.documentElement
        html.classList.remove('theme-dark', 'theme-custom')
        html.classList.add('theme-white')

        if(globalVar.oneself){
            html.classList.add('oneself')
        } else {
            html.classList.remove('oneself')
        }

        localStorage.setItem('primaryColor',`236,65,65`)
        localStorage.setItem('broundColor',`245,245,245`)
        localStorage.setItem('MainTitle',`49,49,49`)
        localStorage.setItem('MainMenu',`0,0,0,.7`)
        localStorage.setItem('MainMenuHover',`255,255,255`)
        localStorage.setItem('colorBlock','1');
        flagC.value = $el?.props.index as string
        MainMenu.primaryColor = 'rgb(236,65,65)'
    }else{
        MainMenu.iconSrc = icon
        let imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let arr = getPxColor(imageData, 0, 0)

        // 使用自定义主题类，然后设置自定义颜色
        const html = document.documentElement
        html.classList.remove('theme-dark', 'theme-white')
        html.classList.add('theme-custom')

        if(globalVar.oneself){
            html.classList.add('oneself')
        } else {
            html.classList.remove('oneself')
        }

        // 使用新的主题应用函数设置自定义颜色
        // debugger
        applyTheme($el?.props.index,globalVar.oneself === 1,{
            primaryColor: `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`,
            broundColor: `rgba(${arr[0]}, ${arr[1]}, ${arr[2]},${globalVar.oneself ? '.8' : '1'})`,
            MainTitle: `rgb(255, 255, 255)`,
            MainMenu: `rgba(255, 255, 255,.7)`,
            MainMenuHover: `rgb(255, 255, 255)`
        })
        // debugger
        localStorage.setItem('primaryColor',`${arr[0]},${arr[1]},${arr[2]}`)
        localStorage.setItem('broundColor',`${arr[0]},${arr[1]},${arr[2]},${globalVar.oneself ? '.8' : '1'}`)
        localStorage.setItem('MainTitle',`255, 255, 255`)
        localStorage.setItem('MainMenu',`255, 255, 255,.7`)
        localStorage.setItem('MainMenuHover',`255, 255, 255`)
        localStorage.setItem('colorBlock',`${$el?.props.index}`);
        flagC.value = $el?.props.index as string
        MainMenu.primaryColor = `rgb(${arr[0]}, ${arr[1]}, ${arr[2]})`
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