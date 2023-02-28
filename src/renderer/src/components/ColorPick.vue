<template>
    <div class="pick-color">
        <div class="hue">
            <canvas id="canvasHue" width="240" height="4"></canvas>
            <div class="btn btnT btnX" ref="btnT"  @mousedown="beginMove"></div>
        </div>
        <div class="mask">
            <canvas id="canvasSMask" width="240" height="4"></canvas>
            <div class="btn btnB btnX" ref="btnB"  @mousedown="beginMove"></div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted,toRef,watch,getCurrentInstance,ComponentInternalInstance,nextTick } from 'vue';
import { hsl } from '../utils/hsl'
import {getPxColor} from '../utils/getCanvasColor'
import {useMainMenu,useGlobalVar} from '@renderer/store'
import icon from '@renderer/assets/icon.png'

const MainMenu = useMainMenu();
const globalVar = useGlobalVar()
let flagC = toRef(MainMenu,'colorBlock')
let clickX: number;
let _that: HTMLElement;
let which: HTMLElement;
const $el = getCurrentInstance() as ComponentInternalInstance 
let Hue: HTMLCanvasElement;
let SMask: HTMLCanvasElement

watch(flagC,()=>{
    nextTick(()=>{
        const bT = $el.refs.btnT as HTMLElement
        const bB = $el.refs.btnB as HTMLElement
        if(flagC.value !== 'Other' && !flagC.value.startsWith('.')){
            localStorage.setItem('baseT','0')
            localStorage.setItem('baseB','0')
            bT.style.left = 0 + 'px'
            bB.style.left = 0 + 'px'
        }
    })

},{immediate:true})

onMounted(()=>{
    const bT = $el.refs.btnT as HTMLElement
    const bB = $el.refs.btnB as HTMLElement
    bT.style.left = localStorage.getItem('baseT') + 'px'
    bB.style.left = localStorage.getItem('baseB') + 'px'
})

const beginMove = (e: MouseEvent) => {
    clickX = e.pageX
    _that = e.target as HTMLElement //点击的按钮
    which = _that?.parentNode as HTMLElement     //修改的对象
    window.addEventListener('mousemove', movingFn)
    window.addEventListener('mouseup', endMove)
    //改字
    MainMenu.iconSrc = icon
    MainMenu.colorBlock = 'Other'
    localStorage.setItem('colorBlock','Other');
    localStorage.setItem('MainTitle',`255, 255, 255`)
    localStorage.setItem('MainMenu',`255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover',`255, 255, 255`)
    document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
    document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
    document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
}


function movingFn(e: MouseEvent) {
    let baseT = Number(localStorage.getItem('baseT'))
    let baseB = Number(localStorage.getItem('baseB'))
    if (which.classList.contains('hue')) {
        let moveDistance = e.pageX - clickX + baseT
        if (moveDistance < 0) moveDistance = 0
        else if (moveDistance > 240 - 14) moveDistance = 240 - 14
        _that.style.left = moveDistance + 'px'
        //上侧取出颜色
        let ctx = Hue.getContext('2d') as CanvasRenderingContext2D;
        let imageData = ctx.getImageData(0, 0, Hue.width, Hue.height)
        let color = getPxColor(imageData, moveDistance, 2);
        document.documentElement.style.setProperty(`--bottomLinearColor`, `hsl(${hsl(color)[0]}, 100%, 70%)`)
        //取出下侧颜色 重画canvas
        ctx = SMask.getContext('2d') as CanvasRenderingContext2D;
        let linearGradient = ctx.createLinearGradient(0, 0, 240, 0) //创建线性渐变
        linearGradient.addColorStop(0, 'hsl(0, 0%, 20%)');
        let t = getComputedStyle(document.documentElement).getPropertyValue('--bottomLinearColor'); 
        linearGradient.addColorStop(1, t);
        ctx.fillStyle = linearGradient;
        ctx.fillRect(0, 0, 240, 4);
        ctx = SMask.getContext('2d') as CanvasRenderingContext2D;
        imageData = ctx.getImageData(0, 0, SMask.width, SMask.height)
        color = getPxColor(imageData, baseB, 2);
        document.documentElement.style.setProperty(`--primaryColor`, `rgb(${color[0]}, ${color[1]}, ${color[2]})`)
        document.documentElement.style.setProperty(`--broundColor`, `rgba(${color[0]}, ${color[1]}, ${color[2]},1)`)
        localStorage.setItem('primaryColor',`${color[0]},${color[1]},${color[2]}`)
        localStorage.setItem('broundColor',`${color[0]},${color[1]},${color[2]},1`)
        MainMenu.primaryColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        if(globalVar.oneself){
            document.documentElement.style.setProperty(`--broundColor`, `rgba(${color[0]}, ${color[1]}, ${color[2]},.8)`)
            localStorage.setItem('broundColor',`${color[0]},${color[1]},${color[2]},.8`)
        }
    } else if (which.classList.contains('mask')) {
        let moveDistance = e.pageX - clickX + baseB
        if (moveDistance < 0) moveDistance = 0
        else if (moveDistance > 240 - 14) moveDistance = 240 - 14
        _that.style.left = moveDistance + 'px'
        let ctx = SMask.getContext('2d') as CanvasRenderingContext2D;
        let imageData = ctx.getImageData(0, 0, SMask.width, SMask.height)
        let color = getPxColor(imageData, moveDistance, 2);
        document.documentElement.style.setProperty(`--primaryColor`, `rgb(${color[0]}, ${color[1]}, ${color[2]})`)
        document.documentElement.style.setProperty(`--broundColor`, `rgba(${color[0]}, ${color[1]}, ${color[2]},1)`)
        localStorage.setItem('primaryColor',`${color[0]},${color[1]},${color[2]}`)
        localStorage.setItem('broundColor',`${color[0]},${color[1]},${color[2]},1`)
        MainMenu.primaryColor = `rgb(${color[0]}, ${color[1]}, ${color[2]})`
        if(globalVar.oneself){
            document.documentElement.style.setProperty(`--broundColor`, `rgba(${color[0]}, ${color[1]}, ${color[2]},.8)`)
            localStorage.setItem('broundColor',`${color[0]},${color[1]},${color[2]},.8`)
        }
    }
}
function endMove(): void {
    let str = _that.style.left
    window.removeEventListener('mousemove', movingFn)
    window.removeEventListener('mouseup', endMove)
    if (which.classList.contains('hue')) {
        localStorage.setItem('baseT',str.substring(0, str.length - 2))
    } else if (which.classList.contains('mask')) {
        localStorage.setItem('baseB',str.substring(0, str.length - 2))
    }
}

//canvas设置
onMounted(() => {
    document.documentElement.style.setProperty(`--btnT`, `${Number(localStorage.getItem('baseT'))}px`)
    document.documentElement.style.setProperty(`--btnB`, `${Number(localStorage.getItem('baseB'))}px`)
    Hue = document.querySelector('#canvasHue') as HTMLCanvasElement;
    SMask = document.querySelector('#canvasSMask') as HTMLCanvasElement;
    //上颜色
    let ctx = Hue.getContext('2d') as CanvasRenderingContext2D;
    let linearGradient = ctx.createLinearGradient(0, 0, 240, 0) //创建线性渐变

    // 颜色断点 
    // background: linear-gradient(to right, #ff0000 0%, #ffff00 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f0f 100%);
    linearGradient.addColorStop(0, '#ff0000');
    linearGradient.addColorStop(.17, '#ffff00');
    linearGradient.addColorStop(.33, '#0f0');
    linearGradient.addColorStop(.5, '#0ff');
    linearGradient.addColorStop(.67, '#00f');
    linearGradient.addColorStop(.8, '#f0f');
    linearGradient.addColorStop(.9, '#f0f');
    linearGradient.addColorStop(1, '#ff0000');

    //设置渐变
    ctx.fillStyle = linearGradient;

    //绘制矩形
    ctx.fillRect(0, 0, 240, 4);

    let imageData = ctx.getImageData(0, 0, Hue.width, Hue.height)
    let color = getPxColor(imageData, Number(localStorage.getItem('baseT')), 2);
    document.documentElement.style.setProperty(`--bottomLinearColor`, `hsl(${hsl(color)[0]}, 100%, 70%)`)
    //下颜色
    ctx = SMask.getContext('2d') as CanvasRenderingContext2D;
    linearGradient = ctx.createLinearGradient(0, 0, 240, 0) //创建线性渐变
    linearGradient.addColorStop(0, 'hsl(0, 0%, 20%)');
    let t = getComputedStyle(document.documentElement).getPropertyValue('--bottomLinearColor'); 
    linearGradient.addColorStop(1, t);

    ctx.fillStyle = linearGradient;

    ctx.fillRect(0, 0, 240, 4);

})

</script>

<style lang="less" scoped>
.pick-color {
    display: flex;
    flex-direction: column;
    align-self: start;
    margin-left: 10px;
    canvas {
        position: absolute;
        top: 0px;
        left: 0px;
        border-radius: 2em;
    }

    .btn {
        height: 13px;
        width: 13px;
        position: absolute;
        left: 0;
        top: -6px;
        border: 1px solid #cacaca;
        background-color: #ffffff;
        box-shadow: 0px 0px 3px rgba(0, 0, 0, .4);
        border-radius: 2em;
        cursor: pointer;
    }
    .btnT{
        left: @btnT;
    }
    .btnB{
        left: @btnB;
    }
    .hue {
        position: relative;
        width: 240px;
        height: 4px;
        border-radius: 2em;
        margin-top: 5px;
        order: 1;
    }


    .mask {
        /* 饱和度x轴实现：从左到右，纯白 >>> 透明的渐变 */
        position: relative;
        width: 240px;
        height: 4px;
        margin-top: 15px;
        order: 2;
        margin-left: 3px;
    }
}
</style>