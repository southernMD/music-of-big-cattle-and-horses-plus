<template>
    <header type="true" id="header" ref="header" @dblclick="dbBig" @mousedown.stop="dragWin"
        :class="{ changeFontColor: changefontColor && MainMenu.colorBlock != 'NMblack' }">
        <div class="left">
            <el-image v-show="!songMenu" draggable="false" style="width: 25px; height: 25px" :src="iconSrc">
                <template #error>
                    <el-image draggable="false" :src="icon" style="width: 25px; height: 25px"></el-image>
                </template>
            </el-image>
            <span v-show="!songMenu" class="title" :class="{ noDrag: !Main.dragMouse }" @click="goHome">大牛马音乐only</span>
            <i v-show="songMenu" title="收起音乐详情页" class="iconfont icon-xiangxiajiantou" @click="Main.detailStatus = 'close'"
                :class="{ noDrag: !Main.dragMouse }"></i>
            <transition-group name="hideSearch">
                <div :key="1" class="option" v-show="scrollY == undefined || scrollY < 300">
                    <i class="iconfont icon-arrow-left-bold bold" @click="prev" @dblclick.stop
                        :class="{ noDrag: !Main.dragMouse }"></i>
                    <i class="iconfont icon-arrow-right-bold bold" @click="next" @dblclick.stop
                        :class="{ noDrag: !Main.dragMouse }"></i>
                </div>
                <div :key="2" class="search" v-show="scrollY == undefined || scrollY < 300">
                    <i class="iconfont icon-search"></i>
                    <input class="search-input" @input="searchSuggestThrottle" v-model="searchKey" @focus="flagSearch=true" @click="flagSearch=true" @keydown="goSearch" type="text" :class="{ noDragInput: !Main.dragMouse, dragMouseStyleCan: Main.dragMouse }">
                    <Teleport to="#header" v-if="flagSearch">
                        <SearchTip @close="flagSearch = false" @changeFlag="flag = true" :listTop="listTop" ></SearchTip>
                    </Teleport>
                </div>
            </transition-group>
        </div>
        <div class="right">
            <canvas ref="downloading" v-show="loadingIcon" width="22" height="22" @click="gotoDowload"></canvas>
            <div v-show="!songMenu" class="user" @click="loginOrPerson" ref="user">
                <el-image draggable="false" style="width:30px; height: 30px" :src="BasicApi.profile?.avatarUrl"
                    :class="{ noDrag: !Main.dragMouse }">
                    <template #error>
                        <el-image draggable="false" :src="icon" style="width: 30px; height: 30px"></el-image>
                    </template>
                </el-image>
                <div @dblclick.stop :class="{ noDrag: !Main.dragMouse }">
                    <span class="userName">{{ BasicApi.profile?.nickname || '未登陆' }}</span>
                    <i class="iconfont icon-xiajiantou"></i>
                </div>
                <Teleport to="#header" v-if="flagMessage">
                    <PersonalMessage :l="LeftValue" @close="flagMessage = false"></PersonalMessage>
                </Teleport>
            </div>
            <div class="other" ref="other">
                <i v-show="!songMenu" @click.stop="changeSkin" @dblclick.stop class="iconfont icon-huanfu"
                    :class="{ noDrag: !Main.dragMouse }"></i>
                <i class="iconfont icon-setting" @click="setting" :class="{ noDrag: !Main.dragMouse }"></i>
                <i class="iconfont icon-xinfeng" v-if="false" :class="{ noDrag: !Main.dragMouse }"></i>
                <Teleport to="#header" v-if="flagSkin">
                    <ChangeSkin :l="LeftValue" @close="flagSkin = false" @click.stop></ChangeSkin>
                </Teleport>
            </div>
            <i class="iconfont icon-anjianfengexian"></i>
            <div class="app-control">
                <i class="iconfont icon-zuixiaohua" @click="zuixiaohua" :class="{ noDrag: !Main.dragMouse }"></i>
                <i v-if="MainMenu.model" class="iconfont icon-24gl-minimize" @click="zhonghua"
                    :class="{ noDrag: !Main.dragMouse }"></i>
                <i v-else class="iconfont icon-3zuidahua-1" @click="zuidahua" :class="{ noDrag: !Main.dragMouse }"></i>
                <i class="iconfont icon-guanbi_o" @click="guanbi" :class="{ noDrag: !Main.dragMouse }"></i>
            </div>
        </div>
        <slot name="songLrc"></slot>
    </header>
    <MyDialog :flag="flag" @confirm="delAll" @cancel="flag = false" @closeDialog="close">
        <template #midle>
            确认删除历史记录？
        </template>
    </MyDialog>
</template>

<script lang="ts" setup>
import { Component, ref, Ref, toRef, watch, defineAsyncComponent, nextTick, watchEffect } from 'vue'
import MyDialog from '@renderer/components/myVC/MyDialog.vue';
// import { useElectronToApp, useMainMenu, useBasicApi, useMain,useGlobalVar } from '@renderer/store'  //pinia
import { useMainMenu, useMain, useGlobalVar, useBasicApi } from '@renderer/store'
import { onMounted, getCurrentInstance, ComponentInternalInstance } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import icon from '@renderer/assets/icon.png'
import iconRed from '@renderer/assets/iconRed.png'
import {throttle} from 'lodash'
// const ChangeSkin = defineAsyncComponent(() => import('./changeSkin/index.vue'))
// const PersonalMessage = defineAsyncComponent(() => import('./PersonalMessage/index.vue'))
// const LoginPage = defineAsyncComponent(() => import('../LoginPage.vue'))
// const ElectronToApp = useElectronToApp();
const BasicApi = useBasicApi();
const MainMenu = useMainMenu();
const Main = useMain()
const globalVar = useGlobalVar();
const $el = getCurrentInstance() as ComponentInternalInstance;
const $router = useRouter();
const $route = useRoute();
let model: Ref<boolean> = toRef(MainMenu, 'model')
let flagLogin: Ref<boolean> = toRef(globalVar, 'flagLogin')
// let time: any = null;
let moveFlag: Ref<boolean> = ref(false)
let mouseX: number = 0;
let mouseY: number = 0;
let flagMessage: Ref<boolean> = ref(false)
let flagSkin: Ref<boolean> = ref(false)
let iconSrc = toRef(MainMenu, 'iconSrc')

defineProps<{
    songMenu?: boolean
    changefontColor?: boolean
    scrollY?: number
}>()

// window.electron.ipcRenderer.send('get-screen-X-Y')
// window.electron.ipcRenderer.on('there-X-Y',(event,message)=>{
//     const {width} = message
//     if(width == 1021){
//         model.value = false
//     }else{
//         model.value = true
//     }
// })
watch(model, () => {
    setTimeout(() => {
        MainMenu.width = window.innerWidth
        MainMenu.Height = window.innerHeight
    }, 100)
}, { immediate: true })

const prev = () => {
    if ($route.name == 'moreComment' && +$route.query.type! == 0 && Main.songType != 'FM' && Main.playing == +$route.query.id!) Main.detailStatus = 'open'
    if ($el.props.songMenu) Main.detailStatus = 'close'
    else $router.go(-1)
}
const next = () => {
    console.log(window.history.length);
    if ($route.name == 'moreComment' && +$route.query.type! == 0 && Main.songType != 'FM' && Main.playing == +$route.query.id!) Main.detailStatus = 'open'
    if ($el.props.songMenu) Main.detailStatus = 'close'
    else $router.go(1)
}
//退出
const guanbi = () => {
    window.electron.ipcRenderer.send('to-close',globalVar.setting.quitmodel)
}

//中化
const zhonghua = () => {
    model.value = false
    window.electron.ipcRenderer.send('to-middle')
    if (flagMessage.value) {
        let t = setTimeout(() => {
            let dom: HTMLElement = $el.refs.user as HTMLElement
            reSetLeft(dom)
            clearTimeout(t)
        }, 100)
    }
}

//最大化
const zuidahua = () => {
    model.value = true
    window.electron.ipcRenderer.send('to-big')
    if (flagMessage.value) {
        let t = setTimeout(() => {
            let dom: HTMLElement = $el.refs.user as HTMLElement
            reSetLeft(dom)
            clearTimeout(t)
        }, 100)
    }
}

// //最小化
const zuixiaohua = () => {
    window.electron.ipcRenderer.send('to-small')
}

//双击最大化 待优化
const dbBig = (e: Event) => {
    e.preventDefault();
    e.stopPropagation();
    // const header: HTMLElement = $el.refs.header as HTMLElement
    if (model.value === false) {
        zuidahua();
    } else {
        zhonghua();
    }
}

//单击拖动
const dragWin = (e: any) => {
    console.log('e.path.length', e.path.length);
    if (e.path.length == 8 || e.path.length == 7 || ((e.path.length == 9 || e.path.length == 10) && Main.detailStatus == 'open')) {
        moveFlag.value = true;
        mouseX = e.pageX
        mouseY = e.pageY
        // console.log('mousedown');

        window.addEventListener('mouseup', destroyDragWin);
    }
}

watch(moveFlag, (newValue) => {
    if (newValue && !model.value) {
        window.electron.ipcRenderer.send('move-screen', { mouseX, mouseY })
    } else {
        window.electron.ipcRenderer.send('cancel-screen')
    }
})

const destroyDragWin = () => {
    moveFlag.value = false;
    // console.log('mouseup');
    window.removeEventListener('mouseup', destroyDragWin);
}

// //右上角的叉点击
// interface T {
//     ifToClose: boolean
// }
// electronIpc.ipcOn('check-up-quit-way', () => {
//     electronIpc.ipcSend('give-way-to-main', localStorage.getItem('XWay') ? localStorage.getItem('XWay') as string : '')
// })
// electronIpc.ipcOn('main-back-way-to-render', (event: any, message: T) => {
//     ElectronToApp.ifToCloseWindow = message.ifToClose
// })



onMounted(() => {
    if (localStorage.getItem('broundColor')?.startsWith('245,245,245')) {
        MainMenu.iconSrc = iconRed
    } else {
        MainMenu.iconSrc = icon
    }
    const header: HTMLElement = $el.refs.header as HTMLElement
    MainMenu.$patch({
        Height: header.offsetHeight,
        width: header.offsetWidth
    })
    if (header.offsetWidth > 1200) {
        model.value = true
    } else {
        model.value = false
    }
})

// //正式业务开始
let userMessage = toRef(BasicApi, 'profile')


const loginOrPerson = async (e: any): Promise<any> => {
    let arr = [...e.target.classList]
    if (!userMessage.value) { //无信息则扫码登陆
        flagLogin.value = true;
    } else if (arr.includes('el-image__inner')) {
        $router.push({
            name:'PersonalCenter',
            query:{
                id:BasicApi.profile?.userId
            }
        })
    } else {
        flagMessage.value = !flagMessage.value
        flagSkin.value = false
        let dom: HTMLElement = $el.refs.user as HTMLElement
        reSetLeft(dom)
    }
}

// //个人信息
// // const personalMessage = () => {
// //     console.log('1234');

// //     if (userMessage.value) {

// //     }
// // }

let LeftValue: Ref<number> = ref(0)

const reSetLeft = (dom: HTMLElement) => {
    LeftValue.value = dom.offsetLeft
}

// //换肤
const changeSkin = () => {
    flagSkin.value = !flagSkin.value
    flagMessage.value = false
    let dom: HTMLElement = $el.refs.other as HTMLElement
    reSetLeft(dom)
}
let animationId;
// 定义圆弧的起始角度和结束角度
let startAngle1 = Math.PI * 2 / 9 + Math.PI / 2;
let endAngle1 = Math.PI * 14 / 18 + Math.PI / 2;
let startAngle2 = Math.PI * 22 / 18 + Math.PI / 2;
let endAngle2 = Math.PI * 16 / 9 + Math.PI / 2;
const radius = 10;
const lineWidth = 1;
const speed = 0.05;
let canvas 
let ctx 
let strokeStyle 
onMounted(() => {
    canvas = $el.refs.downloading as HTMLCanvasElement
    ctx = canvas.getContext('2d') as CanvasRenderingContext2D

    // 定义圆弧的半径、线宽、线条颜色等样式属性
    strokeStyle = document.documentElement.style.getPropertyValue('--primaryColor');
    // 定义两段圆弧旋转的速度

    // 开始动画循环
    draw();
})
// 绘制两段圆弧并旋转角度
function drawStatic(){
    const width = canvas.width
    const height = canvas.height
    ctx.clearRect(0, 0, width, height);

    ctx.lineWidth = lineWidth;
    ctx.strokeStyle = strokeStyle;

    // 绘制第一段圆弧
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, startAngle1, endAngle1);
    ctx.stroke();
    // 绘制第二段圆弧
    ctx.beginPath();
    ctx.arc(width / 2, height / 2, radius, startAngle2, endAngle2);
    ctx.stroke();

    //画箭头
    // 绘制路径
    // 圆角半径
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    // 画箭头
    ctx.lineWidth = lineWidth;

    ctx.beginPath();
    ctx.moveTo(width / 2, height / 2 - 5);
    ctx.lineTo(width / 2, height / 2 + 6);
    ctx.moveTo(width / 2 - 4, height / 2 + 1);
    ctx.lineTo(width / 2, height / 2 + 6);
    ctx.moveTo(width / 2 + 4, height / 2 + 1);
    ctx.lineTo(width / 2, height / 2 + 6);
    ctx.stroke();
}
function draw() {
    drawStatic()
    // 更新圆弧的角度
    startAngle1 += speed;
    endAngle1 += speed;
    startAngle2 += speed;
    endAngle2 += speed;

    // 如果超过了2π，则重置角度
    if (startAngle1 >= Math.PI * 2 + Math.PI * 2 / 9 + Math.PI / 2) {
        startAngle1 = Math.PI * 2 / 9 + Math.PI / 2;
        endAngle1 = Math.PI * 14 / 18 + Math.PI / 2;
        startAngle2 = Math.PI * 22 / 18 + Math.PI / 2;
        endAngle2 = Math.PI * 16 / 9 + Math.PI / 2;
    }

    // 请求下一帧动画
    animationId = requestAnimationFrame(draw);
}
const endDraw = () => {
    cancelAnimationFrame(animationId)
    animationId = null
    startAngle1 = Math.PI * 2 / 9 + Math.PI / 2;
    endAngle1 = Math.PI * 14 / 18 + Math.PI / 2;
    startAngle2 = Math.PI * 22 / 18 + Math.PI / 2;
    endAngle2 = Math.PI * 16 / 9 + Math.PI / 2;
    drawStatic()
}
const downloadId = toRef(globalVar,'downloadId')
const loadingIcon = ref(false)
watchEffect(()=>{
    if(downloadId.value.length != 0 && loadingIcon.value == false){
        loadingIcon.value = true
    }else if(downloadId.value.length == 0 && loadingIcon.value == true){
        endDraw()
    }else if(downloadId.value.length != 0 && loadingIcon.value == true && animationId == null){
        draw()
    }
})
const gotoDowload = ()=>{
    Main.detailStatus = 'close'
    if(downloadId.value.length != 0 && loadingIcon.value == true){  //在下
        console.log('zai');
        $router.push({
            name:'downloading'
        })
    }else if(downloadId.value.length == 0 && loadingIcon.value == true && animationId == null){ //下完
        console.log('wan');
        loadingIcon.value = false
        $router.push({
            name:'downloaded'
        })
    }
}
let mainColor = toRef(MainMenu, 'colorBlock')
watch(mainColor,()=>{
    if(mainColor.value == 'NMred' || mainColor.value == '12') strokeStyle = '#fff'
    else strokeStyle = document.documentElement.style.getPropertyValue('--primaryColor');
    if(downloadId.value.length == 0 && loadingIcon.value == true){
        endDraw()
    }else if(downloadId.value.length != 0 && loadingIcon.value == true && animationId != null){
        cancelAnimationFrame(animationId)
        draw()
    }
})
//搜锁
const searchKey = toRef(globalVar,'searchKey')
const goSearch = (e:KeyboardEvent)=>{
    if(e.code == 'Enter' && searchKey.value.trim().length != 0){
        flagSearch.value = false
        Main.searchHistory.push(searchKey.value.trim())
        if(Main.detailStatus == 'open')Main.detailStatus = 'close'
        $router.push({
            name:'1',
            query:{
                key:searchKey.value.trim()
            }
        })
    }
}
const flagSearch = ref(false)
const flag = ref(false)
const delAll = ()=>{
    Main.searchHistory = []
    flag.value= false
}
const close = (done: () => void)=>{
    done()
    flag.value = false
}
const listTop = ref({allMatch:[]})
const searchSuggest = async()=>{
    listTop.value = (await Main.reqSearchSuggest(searchKey.value.trim(),'mobile')).allMatch
}
const searchSuggestThrottle = throttle(searchSuggest,500)
const setting = ()=>{
    Main.detailStatus = 'close'
    $router.push({
        name:'setting'
    })
}

const goHome = ()=>{
    $router.push({
        path:'/app/findMusic/find1'
    })
}
</script> 

<style lang="less" scoped>
.dragMouseStyleCan {
    cursor: url('@renderer/assets/stop.png'), auto;

    div,
    span {
        cursor: url('@renderer/assets/stop.png'), auto;
    }
}

.noDrag {
    cursor: pointer;
}

.noDragInput {
    cursor: text;
}

.changeFontColor {
    i {
        color: @font-color !important;
    }
}

.hideSearch-enter-from,
.songLrc-leave-to {
    opacity: 0;
}

.hideSearch-enter-active,
.songLrc-leave-active {
    transition: all 0.3s linear;
}

.hideSearch-enter-to,
.songLrc-leave-from {
    opacity: 1;
}

header {
    user-select: none;
    width: 100vw;
    height: 60px;
    background-color: @bround-color;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    position: relative;

    .left {
        display: flex;
        align-items: center;

        .icon-xiangxiajiantou {
            margin-left: 3.5vw;
            color: @main-menu;
            margin-right: 9.35vw;
        }

        :deep(.el-image) {
            padding-left: 15px;
            padding-right: 8px;

            >img {
                cursor: pointer;
            }
        }

        :deep(.el-image__placeholder) {
            display: none;
        }

        .title {
            display: inline-block;
            font-size: 18px;
            font-weight: 550;
            color: @main-title;
            letter-spacing: 0.1em;
            font-family: '方正准圆简体';
        }

        .option {
            margin-left: 7vw;

            .bold {
                display: inline-block;
                height: 20px;
                width: 20px;
                font-size: 14px;
                line-height: 20px;
                text-align: center;
                border-radius: 50%;
                color: rgba(255, 255, 255, .5);
                margin: 0 7px;
                background-color: rgba(0, 0, 0, .05);
            }
        }

        .search {
            display: flex;
            height: 30px;
            align-items: center;
            background-color: rgba(0, 0, 0, .05);
            border-radius: 2em;
            width: 150px;
            margin-left: 0.5vw;

            i {
                margin-left: 7%;
                color: @main-menu;
            }

            input {
                background-color: rgba(0, 0, 0, .0);
                color: white;
                height: 30px;
                width: 100px;
            }
        }

    }

    .right {
        display: flex;
        align-items: center;

        canvas {
            margin-right: 15px;
            cursor: pointer;
        }

        .user {
            display: flex;
            align-items: center;
            color: @main-menu;
            font-size: 13px;
            position: relative;

            >:deep(.el-image) {
                margin-right: 1vw;

                img {
                    border-radius: 2em;
                }
            }

            :deep(.el-image__placeholder) {
                display: none;
            }

            i {
                margin-left: 0.5vw;
                font-size: 10px;

                &:hover {
                    color: @main-menu-hover;
                }
            }

            .userName {
                &:hover {
                    color: @main-menu-hover;
                }
            }
        }

        .other {
            margin-left: 2.5vw;

            i {
                font-size: 20px;
                color: @main-menu;
                margin: 0 0.5vw;

                &:hover {
                    color: @main-menu-hover;
                }
            }
        }

        .icon-anjianfengexian {
            color: @main-menu;
        }

        .app-control {
            margin-right: 2vw;

            i {
                font-size: 20px;
                color: @main-menu;
                margin: 0 0.5vw;

                &:hover {
                    color: @main-menu-hover;
                }
            }
        }
    }

}
</style>