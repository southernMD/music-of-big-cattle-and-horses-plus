<template>
    <div class="myDj">
        <div class="title">
            <span>我的播客</span>
        </div>
        <div class="second-title">
            <div class="left">
                <sapn>创建的播客</sapn><span class="number">({{ createDjArr.length }})</span>
            </div>
            <div class="right">
                <div class="bk" :class="{ noDrag: !Main.dragMouse }" ref="page" @click="sendUrl"
                    href="https://music.163.com/st/ncreator/manage/voice/display" target="_blank">
                    <i class="iconfont icon-bianji"></i>
                    <span>管理播客</span>
                </div>
            </div>
        </div>
        <div class="DJblock-list">
            <HBlock v-for="val in createDjArr" :url="val?.picUrl" type="DJ" :Name="val?.name" :startNumber="val?.subCount" :songNumber="val?.programCount" :key="val?.id"></HBlock>
        </div>
        <div class="second-title">
            <div class="left">
                <sapn>收藏的播客</sapn><span class="number">({{ startDjArr.length }})</span>
            </div>
        </div>
        <div class="DJblock-list">
            <HBlock v-for="val in startDjArr" :url="val?.picUrl" type="DJ" :Name="val?.name" :startNumber="val?.subCount" :songNumber="val?.programCount" :key="val?.id"></HBlock>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { getCurrentInstance,toRef, ComponentInternalInstance } from 'vue'
import { useMain,useBasicApi } from '@renderer/store';
const Main = useMain()
const $el = getCurrentInstance() as ComponentInternalInstance
const BasicApi = useBasicApi()
let startDjArr = toRef(BasicApi,'startDjArr')
let createDjArr = toRef(BasicApi,'createDjArr')
const sendUrl = (e: Event) => {
    e.preventDefault();
    let t: HTMLElement = $el.refs.page as HTMLElement
    window.electron.ipcRenderer.send('new-window', t.getAttribute('href'))
}



</script>

<style lang='less' scoped>
.noDrag {
    cursor: pointer;
}

.myDj {
    .title {
        // width: 93%;
        margin: 0 auto;
        font-size: 20px;
        font-weight: bold;
        margin-top: 20px;
        margin-left: 20px;
        user-select: none;
    }

    .second-title {
        // width: 93%;
        margin: 0 auto;
        height: 60px;
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-left: 20px;
        user-select: none;

        .left {
            font-size: 14px;
            font-weight: bold;

            .number {
                font-size: 13px;
                color: @small-font-color;
                font-weight: normal;
            }
        }

        .right {
            .bk {
                width: 85px;
                height: 25px;
                border: 1px solid @split-line-color;
                border-radius: 2em;
                display: flex;
                justify-content: center;
                align-items: center;
                margin-right: 20px;

                >span {
                    font-size: 12px;
                }

                i {
                    font-size: 12px;
                    margin-right: 5px;
                }
            }
        }

    }

    .DJblock-list {
        :deep(>:nth-child(odd)) {
            background-color: @line-color-odd;
        }

        :deep(>:nth-child(even)) {
            background-color: @line-color-even;
        }
    }
}
</style>