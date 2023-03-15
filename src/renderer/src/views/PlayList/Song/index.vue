<template>
    <div class="play-list-title" :class="{'play-list-title-oneself':globalVar.oneself==1}">
        <div class="caozuo"><span>操作</span></div>
        <div class="song-name">
            <span>标题</span>
            <i class="iconfont icon-paixu"></i>
        </div>
        <div class="song-hand">
            <span>歌手</span>
            <i class="iconfont icon-paixu"></i>
        </div>
        <div class="zhuanji">
            <span>专辑</span>
            <i class="iconfont icon-paixu"></i>
        </div>
        <div class="time">
            <span>时间</span>
            <i class="iconfont icon-paixu"></i>
        </div>
    </div>
    
    <SongList></SongList>
</template>

<script setup lang="ts">
// const SongList = () => import('./SongList/index.vue')
import SongList from './SongList/index.vue'
import { useGlobalVar } from '@renderer/store';
const globalVar = useGlobalVar()
</script>

<style lang="less" scoped>
.play-list-title {
    height: 35px;
    width: calc(100% - 8px);
    color: @small-font-color;
    display: flex;
    user-select: none;
    font-size: 14px;
    overflow: auto;
    &:not(:first-child)>div {
        align-items: center;
        display: flex;
        position: relative;
        box-sizing: border-box;

        &>span {
            margin-left: 5px;
        }

        &>i {
            position: absolute;
            right: 10px;
            display: none;
        }

        &:not(:first-child):hover i {
            display: block;
        }

        &:not(:first-child):hover {
            background-color: @line-color-hover ;
        }
    }

    &>.caozuo {
        width: 110px;
        height: inherit;
        position: relative;
        display: flex;
        align-items: center;
        box-sizing: border-box;

        &>span {
            position: absolute;
            right: 25%;
        }
    }

    &>.song-name {
        width: calc((100% - 110px) * 0.42);
        height: inherit;
    }

    &>.song-hand {
        width: calc((100% - 110px) * 0.2);
        height: inherit;
    }

    &>.zhuanji {
        width: calc((100% - 110px) * 0.272);
        height: inherit;
    }

    &>.time {
        width: calc((100% - 110px) * 0.108);
        height: inherit;
    }
}
.play-list-title-oneself{
    background-color: rgba(65, 65, 65,.7);
    color: rgb(150, 150, 150);
    &:not(:first-child)>div {
        &:not(:first-child):hover {
            background-color: rgb(55, 55, 55) !important;
        }
    }

}

</style>