<template>
    <div class="every-day-recommend-playList">
        <div class="bk">
            <div class="title">
                <span :class="{noDrag:!Main.dragMouse}">推荐歌单</span>
                <i class="iconfont icon-arrow-right-bold" :class="{noDrag:!Main.dragMouse}"></i>
            </div>
            <div class="img-list">
                <PlayListShow v-for="({},index) in playListRand" 
                    :url="playListRand[index].picUrl" 
                    :i="index"
                    :num="Math.floor(playListRand.length / 5)*5"
                    :idr="playListRand[index].id"
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
import { useMain, useBasicApi } from '@renderer/store'
import {sampleSize} from 'lodash'
import PlayListShow from '@renderer/components/myVC/PlayListShow.vue'
const Main = useMain()
const BasicApi = useBasicApi()
let playList = toRef(BasicApi,'everyDayPlayList') 
let playListRand = shallowRef(sampleSize(playList.value,10))

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