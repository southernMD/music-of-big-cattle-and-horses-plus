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
    <div class="location"><span @click="openCheck">选择目录</span></div>
    <div class="search">
      <input type="text" v-model="searchKey" placeholder="搜索我的本地音乐" :class="{
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
  <div class="music-list">
    <LocalSongList :list="list" :searchKey="searchKey" ref="LocalSongListRef"></LocalSongList>
  </div>
  <MyDialog :flag="flagC" @confirm="confirm" @cancel="addDir" @closeDialog="closeDialog" cancel-name="添加文件夹">
    <template #header>
      <div class="header">选择本地音乐文件夹</div>
    </template>
    <template #midle>
      <div class="midle">
        <div class="tip">将自动扫描您勾选的目录，文件增删实现同步(暂时只支持MP3格式)</div>
        <el-scrollbar>
          <div class="list">
            <el-checkbox v-model="Main.localListPathFlag[index]" :label="val" size="large" v-for="(val,index) in Main.localListPath"/>
          </div>
        </el-scrollbar>
      </div>
    </template>
  </MyDialog>
</template>

<script setup lang="ts">
import { Ref, ref ,shallowRef,ShallowRef,toRaw,watch} from 'vue'
import { useMain, useGlobalVar } from '@renderer/store';
import MyDialog from '@renderer/components/myVC/MyDialog.vue'
import LocalSongList from './LocalSongList/index.vue'
const Main = useMain()
const globalVar = useGlobalVar()
const searchKey = ref('')
window.electron.ipcRenderer.invoke('get-download-path').then((data:string) => {
  console.log('get-download-path',data);
  if(!Main.localListPath.includes(data)){
    Main.localListPath.push(data)
    Main.localListPathFlag.push(true)
  }
})
//清除搜索内容
const clearSearch = () => {
  searchKey.value = ''
}
const flagC = ref(false)
let shortTimeFlags:boolean[] = []
let shortTimePath:string[] = []
const openCheck = () => {
  console.log(flagC.value);
  shortTimeFlags = Object.assign([],toRaw(Main.localListPathFlag))
  shortTimePath = Object.assign([],toRaw(Main.localListPath))
  console.log(shortTimeFlags);
  flagC.value = true
}

const confirm = () => {
  flagC.value = false
  const readPath:string[] = []
  Main.localListPathFlag.forEach((item,index)=>{
    if(item == true){
      readPath.push(Main.localListPath[index])
    }
  })
  list.value = []
  window.electron.ipcRenderer.invoke('watch-files-toread-music',{readPath})
}

const closeDialog = (done: () => void) => {
  done()
  flagC.value = false
  Main.localListPathFlag = shortTimeFlags
  Main.localListPath = shortTimePath
  shortTimeFlags = []
  shortTimePath = []
}



const addDir = () => {
  window.electron.ipcRenderer.invoke('add-local-dir').then(({canceled, path})=>{
    if(!canceled){
      console.log(path[0]);
      const t1 = toRaw(Main.localListPath)
      t1.push(path[0])
      Main.localListPath = [...new Set(t1)]
      const t2 = Main.localListPathFlag
      t2.push(true)
      Main.localListPathFlag = [...new Set(t2)]
    }
  })
}
const list: Ref<id3Message[]> = ref([])
window.electron.ipcRenderer.on('local-music-paths-add',({},paths:id3Message[])=>{
  list.value.push(...paths)
})

window.electron.ipcRenderer.on('local-music-paths-del',({},paths)=>{
  list.value = list.value.filter((item)=>{
    return !paths.includes(item.path)
  })
})
const LocalSongListRef = ref<InstanceType<typeof LocalSongList>>()
const addAll = async()=>{
  if(Main.playingList.length == 0) playAll()
  else await LocalSongListRef.value!.pushPlayList(1)
}
//播放全部按钮
const playAll = async () => {
  await LocalSongListRef.value!.pushPlayList(undefined)
  Main.playingindex = 1
  Main.playStatus = 'play'
  Main.songType = 'song'
  Main.beforePlayListId = -2
  console.log(Main.playingList);
  Main.playing = Main.playingList[0].id
}
confirm()
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
    margin-left: 75px;
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
.music-list{
  padding-bottom: 100px;
}
.header {
  font-weight: bolder;
}

.midle {
  margin-top: -20px;

  >.tip {
    font-size: 13px;
    font-weight: bolder;
    user-select: none;
    margin-bottom: 10px;
  }

  .list {
    height: 200px;
    width: 100%;
    margin-left: 0;
    :deep(.el-checkbox__label){
      font-size: 12px;
      display: inline-block;
      width: 300px;
      text-overflow: ellipsis;
      overflow:hidden; 
    }
    :deep(.el-checkbox){
      --el-checkbox-checked-text-color: @primary-color;
      --el-checkbox-checked-input-border-color: @primary-color;
      --el-checkbox-checked-bg-color: @primary-color;
      --el-checkbox-input-border-color-hover: @primary-color;
    }
  }
}
</style>