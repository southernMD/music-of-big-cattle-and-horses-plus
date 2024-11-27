<template>
    <div class="bk" id="bkChangeSkin">
        <div class="list">
            <Tag message="主题" :ifClick="flagList[0]" @click="changeTag(0)" name="zhuti"></Tag>
            <Tag message="纯色" :ifClick="flagList[1]" @click="changeTag(1)" name="cunse"></Tag>
            <Tag message="自定义" :ifClick="flagList[2]" @click="changeTag(2)" name="zidingyi"></Tag>
        </div>
        <div class="main">
            <div v-if="flagList[0]" class="zhuti">
                <div class="black" @click="changeNMblack">
                    <el-image :src="icon" style="width: 50px; height: 50px;"></el-image>
                    <div class="txt"><span>牛马黑</span></div>
                    <i class="iconfont icon-zhengque" v-show="flagC == 'NMblack'"></i>
                </div>
                <div class="red" @click="changeNMred">
                    <el-image :src="icon" style="width: 50px; height: 50px;"></el-image>
                    <div class="txt"><span>牛马红</span></div>
                    <i class="iconfont icon-zhengque" v-show="flagC == 'NMred'"></i>
                </div>
            </div>
            <div v-if="flagList[1]" class="chunse">
                <div class="top">
                    <div class="title">预选纯色</div>
                    <div class="yanse">
                        <ColorBlock v-for="index in 12" :index="index.toString()" :bkColor="bkColorList[index - 1]"
                            :border="index == 1 ? true : false"></ColorBlock>
                    </div>
                </div>
                <div class="bottom">
                    <div class="title">自定义颜色</div>
                    <div class="choic">
                        <ColorBlock index="Other" :other="true"></ColorBlock>
                        <ColorPick></ColorPick>
                    </div>
                </div>
            </div>
            <div v-if="flagList[2]" class="chunse">
                <div class="oneself">
                    <el-upload class="upload-demo" drag disabled
                    @click="upload"
                        >
                        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
                        <div class="el-upload__text">
                           上传一段视频或一张图片
                        </div>
                    </el-upload>
                    <el-button @click="recover">恢复默认</el-button>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose';
import { ref, toRef } from 'vue'
import {UploadFilled } from '@element-plus/icons-vue'
import { useMainMenu,useGlobalVar } from '@renderer/store'
import icon from '@renderer/assets/icon.png'
// import ColorPick from '@/components/ColorPick.vue';
const MainMenu = useMainMenu();
const globalVar = useGlobalVar();

let flagList = ref([true, false, false])
const changeTag = (index: number) => {
    flagList.value.forEach((value, i) => {
        if (i == index) {
            flagList.value[i] = true
        } else {
            flagList.value[i] = false
        }
    })
}

let deleteDilog: any;
const $emit = defineEmits(['close'])
useClickElsewhereToClose(deleteDilog, $emit, 'bkChangeSkin');

let flagC = toRef(MainMenu, 'colorBlock')

const bkColorList =
    ['#ffffff', '#ff5c8a', '#ff7a9e', '#717ff9', '#4791eb', '#39afea',
        '#28ab62', '#6acc19', '#cb9a10', '#e5804e', '#ef6c67', '#e94d48'
    ]

const changeNMblack = (e: MouseEvent) => {
    MainMenu.colorBlock = 'NMblack'
    MainMenu.iconSrc = icon
    localStorage.setItem('primaryColor', '236,65,65')
    document.documentElement.style.setProperty(`--primaryColor`, `rgb(236,65,65)`)
    localStorage.setItem('broundColor', '33,33,36,1')
    document.documentElement.style.setProperty(`--broundColor`, `rgba(33,33,36,1)`)
    localStorage.setItem('colorBlock', 'NMblack');
    document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
    document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
    document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
}

const changeNMred = () => {
    MainMenu.colorBlock = 'NMred'
    MainMenu.iconSrc = icon
    localStorage.setItem('primaryColor', '236,65,65')
    document.documentElement.style.setProperty(`--primaryColor`, `rgb(236,65,65)`)
    localStorage.setItem('broundColor', '236,65,65,1')
    document.documentElement.style.setProperty(`--broundColor`, `rgba(236,65,65,1)`)
    localStorage.setItem('colorBlock', 'NMred');
    document.documentElement.style.setProperty(`--MainTitle`, `rgb(255, 255, 255)`)
    document.documentElement.style.setProperty(`--MainMenu`, `rgba(255, 255, 255,.7)`)
    document.documentElement.style.setProperty(`--MainMenuHover`, `rgb(255, 255, 255)`)
    localStorage.setItem('MainTitle', `255, 255, 255`)
    localStorage.setItem('MainMenu', `255, 255, 255,.7`)
    localStorage.setItem('MainMenuHover', `255, 255, 255`)
}

const upload = ()=>{
    window.electron.ipcRenderer.send('upload-background')
    $emit('close')
}

const recover = ()=>{
    const v = document.getElementById('mainBackgroundVideo') as HTMLVideoElement
    v.src = ''
    const h:any = document.getElementById('mainBackground') as HTMLImageElement
    h.src = ''
    window.electron.ipcRenderer.send('recove-background')
    changeNMred()
    localStorage.setItem('oneself','0')
    globalVar.oneself = 0
    const s = document.getElementById('songDetail') as HTMLImageElement
    s.style.backgroundImage = ''
}

// window.electron.ipcRenderer.on('ffmpeg-error',()=>{
//     recover()
//     globalVar.loadMessageDefault = '加载视频出错请重试'
//     globalVar.loadMessageDefaultFlag = true
//     globalVar.loadMessageDefaultType = 'error'
// })


</script>

<style lang="less" scoped>
.bk {
    width: 320px;
    height: 270px;
    background-color: @mianban-bk-color;
    position: absolute;
    top: 60px;
    right: 0;
    transform: translate(-50px, 2px);
    border-radius: 0.5em;
    box-shadow: @shadow;
    z-index: 9999;

    .list {
        display: flex;
        align-items: center;
        height: 50px;
        width: 100%;

        &>div {
            margin: 0px 5px;
        }
    }

    .main {
        height: calc(100% - 60px);

        .zhuti {
            display: flex;
            justify-content: center;
            align-items: center;
            height: calc(100% - 50px);

            >div {
                height: 90px;
                width: 90px;
                margin: 10px;
                border-radius: 0.5em;
                display: flex;
                justify-content: center;
                align-items: center;
                flex-direction: column;
                position: relative;
                cursor: pointer;

                >.txt {
                    height: 25%;
                    width: 100%;
                    color: white;
                    font-size: 12px;
                    position: absolute;
                    bottom: 0px;
                    left: 0px;
                    background-color: rgba(0, 0, 0, .3);
                    border-bottom-right-radius: 0.6em;
                    border-bottom-left-radius: 0.6em;
                    text-indent: 5%;

                    span {
                        display: inline-block;
                        width: 100%;
                        transform: translateY(5px);
                    }
                }

            }

            i {
                position: absolute;
                right: -5px;
                bottom: -5px;
                color: #d13f3a;
                z-index: 999;
                background-color: white;
                font-size: 25px;
                border-radius: 50%;
            }

            .black {
                background-color: #292c31;
                :deep(.el-image ){
                    transform: translateY(-10px);
                }
                :deep(.el-image__placeholder) {
                    display: none;
                }
            }

            .red {
                background-color: #d13f3a;
                :deep(.el-image ){
                    transform: translateY(-10px);
                }
                :deep(.el-image__placeholder) {
                    display: none;
                }
            }
        }

        .chunse {
            display: flex;
            flex-direction: column;

            .title {
                color: @font-color;
                font-size: 13px;
                padding-left: 14px;
            }

            .top {
                height: 130px;
                width: 100%;

                .yanse {
                    display: flex;
                    flex-wrap: wrap;
                    padding-left: 10px;
                    padding-top: 5px;

                    // transform: translateX(10px);
                    .color-block {
                        margin: 5px 5px;
                    }
                }
            }

            .bottom {
                display: flex;
                flex-direction: column;

                .choic {
                    display: flex;
                    align-items: flex-end;
                    padding-left: 10px;
                    margin-top: 15px;

                    :first-child {
                        margin-left: 3px;
                    }
                }
            }
            .oneself{
                width: 80%;
                height: 80%;
                margin: 0 auto;
                .el-button{
                    width: 100%;
                    height: 25px;
                }
            }
        }
    }

}
</style>