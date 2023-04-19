<template>
    <div class="LatelyPlay">
        <div class="title">
            <span>最近播放</span>
            <b>共{{ Main.latelyPlay.length }}首</b>
            <div class="clear" @click="clearAll">清空全部</div>
        </div>
        <div class="playAll">
            <div class="left" :class="{ noDrag: !Main.dragMouse }" @click="playAll">
                <i class="iconfont icon-bofang"></i>
                <span>播放全部</span>
            </div>
            <div class="right" :class="{ noDrag: !Main.dragMouse }" @click="addAll">
                <i class="iconfont icon-jiahao_o"></i>
            </div>
        </div>
        <div class="play-list-title" :class="{ 'play-list-title-oneself': globalVar.oneself == 1 }">
            <div class="song-name">
                <span>音乐标题</span>
            </div>
            <div class="song-hand">
                <span>歌手</span>
            </div>
            <div class="time">
                <span>播放时间</span>
            </div>
        </div>
        <div class="lately" id="lately">
            <LineMusic 
            @localPlay="localPlay"
            v-for="val,index in Main.latelyPlay" 
            :index="index + 1"
            :time="val.lately"
            :id="val.id" 
            :title="val.name"
            :singer="val.ar || ['']" 
            :show-index="true" 
            :oneself-color="true"
            :lately="true" 
            :local="Boolean(val.localPath)"
            ></LineMusic>
        </div>

    </div>
</template>

<script setup lang="ts">
import { } from 'vue'
import { useGlobalVar, useMain } from '@renderer/store'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'

const Main = useMain()
const globalVar = useGlobalVar()
const clearAll = ()=>{
    Main.latelyPlay.length = 0
}
const playAll = ()=>{
    Main.playingList = Main.latelyPlay
    Main.playingPrivileges = Main.latelyPlay.map((it)=>{
        return it.privilege
    })
    Main.beforePlayListId = -3
    Main.playingindex = 1
    Main.playing =  Main.latelyPlay[0].id
    Main.playStatus = 'play'
    let str = Main.latelyPlay[0].name + ' - ';
    let singerArr = Main.latelyPlay[0].ar as unknown as Array<any>
    singerArr.forEach((element, index) => {
        str += element.name
        if (index != singerArr.length - 1) str += ' / '
    })
    window.electron.ipcRenderer.send('change-play-thum', str)
    window.electron.ipcRenderer.send('render-play')
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}
const addAll = async () => {
    if (Main.playingList.length == 0) {
        playAll()
    } else {
        Main.latelyPlay.forEach((element: any) => {
            if (Main.playingList.every((base) => base.id != element.id)) {
                Main.playingList.push(element)
                Main.playingPrivileges.push(element.privileges)
            }
        });
    }
    globalVar.closePointOutMessage = '已添加到播放列表'
    globalVar.closePointOut = true
}

const localPlay = ({index,id})=>{
    Main.playingList = Main.latelyPlay
    Main.playingPrivileges = Main.latelyPlay.map((it)=>{
        return it.privilege
    })
    Main.beforePlayListId = -3
    Main.playingindex = index as number
    Main.playing =  id
    Main.playStatus = 'play'
}

</script>

<style scoped lang="less">
.LatelyPlay {
    .title {
        // width: 93%;
        margin: 0 auto;
        margin-top: 20px;
        margin-left: 30px;
        display: flex;
        align-items: center;
        user-select: none;

        >span {
            font-size: 20px;
            font-weight: bold;
            flex-basis: 100px;
        }

        >b {
            color: @small-font-color;
            font-size: 14px;
            margin-left: 5px;
            flex-basis: 75%;
        }

        .clear {
            color: @url-color;
            cursor: pointer;

            &:hover {
                color: @url-color-hover;
            }
        }
    }

    .playAll {
        display: flex;
        height: 32px;
        width: 150px;
        align-items: center;
        color: white;
        margin-left: 30px;
        margin-top: 20px;

        .left {
            width: 110px;
            height: inherit;
            display: flex;
            align-items: center;
            border-top-left-radius: 2em;
            border-bottom-left-radius: 2em;
            background-color: @small-font-red;
            font-size: 14px;
            border-right: 1px solid #ee5454;
            user-select: none;
            cursor: pointer;
            i {
                font-size: 14px;
                margin-right: 5px;
                padding-left: 18px;
            }

            &:hover {
                background-color: @play-all-button-hover;
            }
        }

        .right {
            width: 40px;
            height: inherit;
            background-color: @small-font-red;
            display: flex;
            align-items: center;
            border-top-right-radius: 2em;
            border-bottom-right-radius: 2em;
            cursor: pointer;
            &:hover {
                background-color: @play-all-button-hover;
            }

            i {
                margin-left: 8px;
                font-size: 20px;
            }
        }
    }

    .play-list-title {
        height: 35px;
        width: calc(100% - 8px);
        color: @small-font-color;
        display: flex;
        user-select: none;
        font-size: 14px;
        overflow: auto;
        margin-top: 20px;

        &>div {
            align-items: center;
            display: flex;
            position: relative;
            box-sizing: border-box;

            &>span {
                margin-left: 5px;
            }
        }

        &>.song-name {
            flex-basis: 40%;
            margin-left: 50px;
            height: inherit;
        }

        &>.song-hand {
            flex-basis: 30%;
            height: inherit;
        }

        &>.time {
            height: inherit;
            flex-basis: 20%;
        }

    }

    .play-list-title-oneself {
        background-color: rgba(65, 65, 65, .7);
        color: rgb(150, 150, 150);

        &:not(:first-child)>div {
            &:not(:first-child):hover {
                background-color: rgb(55, 55, 55) !important;
            }
        }

    }
    :deep(.caozuo){
        flex-basis: 50px;
    }
    :deep(.song-name){
        margin-left: 0px;
        flex-basis: 40%;
    }
    :deep(.song-hand) {
        flex-basis: 30%;
        height: inherit;
    }
    :deep(.time){
        flex-basis: 20%;
        >span{
            padding: 0 !important;
        }
    }
}
</style>