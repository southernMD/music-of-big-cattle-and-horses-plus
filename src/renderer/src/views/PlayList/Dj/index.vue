<template>
  <div class="DjSong">
    <div class="contain" v-if="!loading">
      <HBlock v-show="searchKey.length == 0" v-for="val,index in djListShowLength" :url="djListShow[index]?.coverUrl" 
      :Name="djListShow[index]?.name" 
      :likedCount="djListShow[index]?.likedCount"
      :playCount="djListShow[index]?.listenerCount ?? 0"
      :createTime="djListShow[index]?.createTime"
      :songTime="djListShow[index]?.mainSong?.bMusic?.playTime ?? 0"
      :id="djListShow[index]?.mainSong?.id"
      :subscribed="djListShow[index]?.subscribed"
      :index="index + 1 + (nowPage - 1)*100"
      :showIndex="index + 1 + (nowPage - 1)*100"
      :key="djListShow[index]?.mainSong?.id"
      :djprogramid="djListShow[index].id"
      :djName="djListShow[index].dj.nickname"
      :path="djListShow[index].path"
      :dataType="djListShow[index].path?'DJprogrameLocal':'DJprograme'"
      type="DJprograme"
      @playDj="playDj"
      ></HBlock>
      <HBlock v-show="searchKey.length != 0" v-for="val,index in djCopyListShowLength" 
      :url="djListShowCopy[index]?.coverUrl" 
      :Name="djListShowCopy[index]?.name" 
      :likedCount="djListShowCopy[index]?.likedCount"
      :playCount="djListShowCopy[index]?.listenerCount ?? 0"
      :createTime="djListShowCopy[index]?.createTime"
      :songTime="djListShowCopy[index]?.mainSong?.bMusic?.playTime ?? 0"
      :id="djListShowCopy[index]?.mainSong?.id"
      :subscribed="djListShowCopy[index]?.subscribed"
      :index="djListShowCopy[index]?.indexList"
      :showIndex="index + 1"
      :key="djListShowCopy[index]?.mainSong?.id"
      :djprogramid="djListShowCopy[index].id"
      :djName="djListShowCopy[index].dj.nickname"
      :path="djListShowCopy[index].path"
      :dataType="djListShowCopy[index].path?'DJprogrameLocal':'DJprograme'"
      type="DJprograme"
      @playDj="playDj"
      ></HBlock>
      <div class="pagination" v-show="searchKey.length == 0">
          <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
              :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
      </div>
    </div>
    <div class="loading" v-else>加载中</div>
  </div>
</template>

<script setup lang="ts">
import {ref,toRaw,watch,nextTick,inject,Ref,toRef} from 'vue'
import { useMain,useGlobalVar} from '@renderer/store';
import { throttle } from 'lodash'
import {useRoute} from 'vue-router'
const Main = useMain()
const globalVar = useGlobalVar()
const $route = useRoute()
let djList:any[] = []
const djListShow = ref()
const djListShowCopy = ref()

const loading = ref(true)

const djListShowLength = ref(0)
const djCopyListShowLength = ref(0)


const downloadList = inject<Ref<string[]>>('downloadList') as Ref<string[]>
console.log(downloadList);
const getPath = async(Name,djName)=>{
  const name = (djName + ' - ' + Name).replace(/[\\/:\*\?"<>\|]/g, "");
  console.log(name);
  if(downloadList.value.includes(name)){
      const replyMessage = await window.electron.ipcRenderer.invoke('get-song-path',name)
      console.log(replyMessage);
      return replyMessage
  }else{
    return undefined
  }
}
const foundDownloadVoice = (arr:any[])=>{
   return Promise.all(arr.map(async(item)=>{
    item['path'] = await getPath(item.name,item.dj.nickname)
    return item
  })) 
}

djList = await Main.reqdjProgram($route.query.id,100,0) ?? []
djList = await foundDownloadVoice(djList)
djListShow.value = JSON.parse(JSON.stringify(djList))

djListShowLength.value = djList.length
loading.value = false
console.log(+$route.query.count!);
const total = ref(+$route.query.count!)
const totalPage = ref(Math.ceil(total.value / 100))
const nowPage = ref(1)
watch(total,()=>{
    totalPage.value = Math.ceil(total.value / 100)
})
const numberMemory = new Set()
numberMemory.add(1)
watch(nowPage,async()=>{
  if(!numberMemory.has(nowPage.value)){
    loading.value = true
    const newValue = await Main.reqdjProgram($route.query.id,100, (nowPage.value - 1)*100)
    if(newValue) {
      djList.push(...newValue)
      djList = await foundDownloadVoice(djList)
    }
    numberMemory.add(nowPage.value)
  }
  console.log(djList);
  djListShow.value = JSON.parse(JSON.stringify(djList.slice((nowPage.value-1)*100,(nowPage.value)*100))) 
  djListShowLength.value = djListShow.value.length
  loading.value = false
})

let searchKey = inject<Ref<string>>('searchKey') as Ref<string>
watch($route, () => {
    searchKey.value = ''
})

function searchKeyFn() {
    if (searchKey.value != '') {
      djListShowCopy.value = [];
      djList.forEach((element, index) => {
          let songName = element.name;
          if (songName.toLowerCase().includes(searchKey.value.toLowerCase())) {
            djListShowCopy.value.push(JSON.parse(JSON.stringify(element)))
            djListShowCopy.value[djListShowCopy.value.length - 1]['indexList'] = index + 1;
          }
      })
      console.log(djListShowCopy.value);
      let reg = new RegExp(`${searchKey.value}`, 'gi');
      djListShowCopy.value.forEach((currentValue: any, index: any, array: any) => {
          let songName = currentValue.name;
          let t = 0
          let Match;
          Match = array[index].name.match(reg)
          if (Match) array[index].name = songName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
      })

      djCopyListShowLength.value = djListShowCopy.value.length;
    }
}
watch(searchKey,throttle(searchKeyFn, 500))

const playDj = (id,index)=>{
  console.log('触发playDj');
  //全部
  if(globalVar.setting.playWay){
    Main.playingList = djList
    Main.playingPrivileges = djList.map((item)=>emptyDjObject(item.id))
    Main.playingindex = index
    Main.playStatus = 'play'
    Main.songType = 'DJ'
    Main.playing = id
    Main.beforePlayListId = +$route.query.id!
  }else{
    if(Main.playingindex == -1){
      Main.playingList = [djList[index - 1]]
      Main.playingPrivileges = [emptyDjObject(id)]
      Main.playingindex = 1
      Main.playStatus = 'play'
      Main.songType = 'DJ'
      Main.playing = id
    }else{
      const ifId = Main.playingList.map((item)=>item.mainSong?.id).findIndex((ido)=>ido == id)
      if(ifId == -1){
        Main.playingList.splice(Main.playingindex,0,djList[index - 1])
        Main.playingPrivileges.splice(Main.playingindex,0,emptyDjObject(id))
        Main.playingindex++
      }else{
        Main.playingindex = ifId + 1
      }
      Main.playStatus = 'play'
      Main.songType = 'DJ'
      Main.playing = id
    }
  }
}

const emptyDjObject = (id)=>{
  return {
    id,
    maxBrLevel: "DJ",
    playMaxBrLevel: "DJ",
    downloadMaxBrLevel: "DJ",
    plLevel: "DJ",
    dlLevel: "DJ",
    flLevel: "DJ",
  }
}




</script>

<style scoped lang="less">
.pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 20px;
    :deep(.el-pagination) {
        --el-pagination-hover-color: @font-color;

        li,
        .btn-prev,
        .btn-next {
            box-sizing: border-box;
            border-radius: 3px !important;
            background-color: rgba(0, 0, 0, 0);
            border: 1px solid @split-line-color;
            font-weight: normal;
            margin: 2px;
            width: 25px;
            height: 25px;
            color: @pagin-font;
        }

        .btn-prev,
        .btn-next {
            background-color: @pagin-bk-btn-color !important;
            font-weight: bold;

        }

        li:not(.is-disabled).is-active {
            background-color: @primary-color !important;
            color: rgb(255, 255, 255) !important;
        }

        li:hover,
        .btn-prev:not(:disabled):hover,
        .btn-next:not(:disabled):hover {
            background-color: @pagin-bk-hover-color !important;
        }

        button:disabled {
            cursor: default !important;
            color: @pagin-disable-font-color !important;
        }
    }
}
</style>