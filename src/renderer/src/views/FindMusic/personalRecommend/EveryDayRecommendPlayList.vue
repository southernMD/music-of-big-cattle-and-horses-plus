<template>
    <div class="every-day-recommend-playList">
        <div class="bk">
            <div class="title">
                <span :class="{noDrag:!Main.dragMouse}">推荐歌单</span>
                <i class="iconfont icon-arrow-right-bold" :class="{noDrag:!Main.dragMouse}"></i>
            </div>
            <div class="img-list">
                <PlayListShow
                data-type="playList"
                v-for="({},index) in playListRand" 
                    :url="playListRand[index].picUrl" 
                    :i="index"
                    :num="Math.floor(playListRand.length / 5)*5"
                    :idr="playListRand[index].id"
                    type="playList"
                    @go="go"
                    @play-all="playAll"
                    >
                    <template #default>
                        <div class="message">
                            {{playListRand[index].name}}
                        </div>
                    </template>
                </PlayListShow>
            </div>
        </div>
        
    </div>
</template>

<script lang='ts' setup>
import { toRef,shallowRef } from 'vue'
import { useMain, useBasicApi ,useGlobalVar} from '@renderer/store'
import{useRouter} from 'vue-router'
import {sampleSize} from 'lodash'
import PlayListShow from '@renderer/components/myVC/PlayListShow.vue'
const globalVar = useGlobalVar()
const Main = useMain()
const BasicApi = useBasicApi()
const $router = useRouter()

let playList = toRef(BasicApi,'everyDayPlayList') 
let playListRand = shallowRef(sampleSize(playList.value,10))
const playAll = async (id)=>{
    let result = (await Main.reqPlaylistTrackAll(id.value)).data;
    Main.playingList = result.songs
    Main.playingPrivileges = result.privileges
    Main.playingindex = 1
    Main.playing = result.songs[0].id as number
    Main.beforePlayListId = id.value
    Main.playStatus = 'play'
    let str = result.songs[0].name +' - ';
    let singerArr = result.songs[0].ar as unknown as Array<any>
    singerArr.forEach((element,index)=>{
        str+=element.name
        if(index != singerArr.length - 1)str+=' / '
    })
    window.electron.ipcRenderer.send('change-play-thum',str)
    window.electron.ipcRenderer.send('render-play')
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}

const go = ({id})=>{
    $router.push({
        name:'songPlaylist',
        query:{
            id,my:'false',type:'歌单'
        }
    })
}
</script>

<style lang='less' scoped>
.every-day-recommend-playList {
    width: 100%;
    height: auto;
    border-radius: 0.5em;
    // align-items: start;
    // -webkit-backdrop-filter: blur(10px);
    // backdrop-filter: blur(10px);
    padding-bottom: 100px;
    .bk {
        width: calc(150px + 75%);
        max-width: 1200px;
        display: flex;
        flex-direction: column;
        margin: 0 auto;
        .title {
            font-size: 20px;
            color: @font-color;
            user-select: none;
            margin-top: 5px;
            margin-bottom: 15px;
            font-weight: bolder;
            margin-left: 2%;
            margin-right: auto;
            width: 100%;
        }

        .img-list {
            display: flex;
            justify-content: start;
            flex-wrap: wrap;
            margin-bottom: 20px;
        }
    }
}
</style>