<template>
  <div class="options">
    <div class="playAll">
      <div class="left" :class="{ noDrag: !Main.dragMouse }" @click="playAll">
        <i class="iconfont icon-bofang"></i>
        <span>播放全部</span>
      </div>
      <div class="right" :class="{ noDrag: !Main.dragMouse }" @click="addAll">
        <i class="iconfont icon-jiahao_o"></i>
      </div>
    </div>
    <div class="location">存储目录:{{ path }}<span @click="openDir">打开目录</span></div>
    <div class="search">
      <input type="text" v-model="searchKey" placeholder="搜索我下载的音乐" :class="{
        noDragInput: !Main.dragMouse,
        dragMouseStyleNo: Main.dragMouse
      }" @keydown.stop>
      <i class="iconfont icon-search" v-if="!searchKey"></i>
      <i class="iconfont icon-guanbi_o" v-else @click="clearSearch" :class="{ noDrag: !Main.dragMouse }"></i>
    </div>
  </div>
  <div class="play-list-title" :class="{ 'play-list-title-oneself': globalVar.oneself == 1 }">
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
  </div>
  <div class="l">
    <DownloadSongList ref="DownloadSongListRef" :searchKey="searchKey"></DownloadSongList>
  </div>
</template>

<script setup lang="ts">
import { ref, toRef } from 'vue'
import { useGlobalVar, useMain } from '@renderer/store'
import DownloadSongList from './DownloadSongList/index.vue'
const Main = useMain()
const globalVar = useGlobalVar()
const path = toRef(globalVar.setting,'downloadPath')

const searchKey = ref('')
//清除搜索内容
const clearSearch = () => {
  searchKey.value = ''
}

const DownloadSongListRef = ref<InstanceType<typeof DownloadSongList>>()
//播放全部按钮
const playAll = async () => {
  await DownloadSongListRef.value!.pushPlayList(undefined)
  Main.playingindex = 1
  Main.playStatus = 'play'
  Main.songType = 'song'
  Main.beforePlayListId = 0
  console.log(Main.playingList);
  Main.playing = Main.playingList[0].id
}

//添加所有的音乐
const addAll = async () => {
  if(Main.playingList.length == 0)playAll()
  else await DownloadSongListRef.value!.pushPlayList(1)
}
const openDir = () => {
  window.electron.ipcRenderer.send('open-download-dir')
}
</script>

<style scoped lang="less">
.noDrag {
  cursor: pointer;
}

.options {
  display: flex;
  align-items: center;
  margin-top: 20px;
  .playAll {
    display: flex;
    height: 32px;
    width: 150px;
    align-items: center;
    color: white;

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

      &:hover {
        background-color: @play-all-button-hover;
      }

      i {
        margin-left: 8px;
        font-size: 20px;
      }
    }
  }

  .location {
    color: @small-font-color;
    font-size: 13px;
    user-select: none;
    font-weight: bolder;
    margin-left: 10px;

    >span {
      color: @url-color ;
      margin-left: 5px;
      font-weight: normal;
      cursor: pointer;

      :hover {
        color: @url-color-hover;
      }
    }
  }

  .search {
    width: 200px;
    height: 30px;
    background-color: rgba(0, 0, 0, .05);
    border-radius: 2em;
    position: relative;

    input {
      background-color: rgba(0, 0, 0, .0);
      color: @small-font-color;
      height: 30px;
      width: 160px;
      margin-left: 10px;
    }

    i {
      position: absolute;
      right: 10px;
      top: 25%;
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

    &>i {
      position: absolute;
      right: 10px;
      display: none;
    }

    &:hover i {
      display: block;
    }

    &:hover {
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
    margin-left:75px ;
    width: calc((100%) * 0.32);
    height: inherit;
  }

  &>.song-hand {
    width: calc((100%) * 0.3);
    height: inherit;
  }

  &>.zhuanji {
    width: calc((100%) * 0.28);
    height: inherit;
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
.l{
  padding-bottom: 80px;
}
</style>