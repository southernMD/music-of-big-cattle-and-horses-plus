<template>
    <div class="RecommendDjSong">
        <div class="bk">
            <div class="title">
                <span :class="{noDrag:!Main.dragMouse,oneself:globalVar.oneself}">热门播客</span>
                <i class="iconfont icon-arrow-right-bold" :class="{noDrag:!Main.dragMouse}"></i>
            </div>
            <div class="djsong-list">
                <DjSong v-for="(val,index) in songListRand"
                :song="val?.program.mainSong"
                :author="val?.program.dj"
                :radio="val?.program.radio"
                :url="val?.program.coverUrl"
                :listenerCount="val?.program.listenerCount"
                :duration="val?.program.duration"
                ></DjSong>
            </div>
        </div>

    </div>
</template>

<script lang='ts' setup>
import {sampleSize} from 'lodash'
import {shallowRef, toRef} from 'vue'
import {useBasicApi,useGlobalVar} from '@renderer/store'
import { useMain } from '@renderer/store'
import DjSong from './DjSong.vue'
const BasicApi = useBasicApi()
const Main = useMain()
const globalVar = useGlobalVar()
let songList = toRef(BasicApi,'hotDjProgram')
let songListRand = shallowRef(sampleSize(songList.value,6))


</script>

<style lang='less' scoped>
.RecommendDjSong {

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
        .djsong-list {
            display: flex;
            // flex-direction: column;
            flex-wrap:wrap;
            margin-bottom: 80px;
        }
    }
}
</style>