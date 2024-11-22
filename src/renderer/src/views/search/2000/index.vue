<template>
  <div class="list" :class="{ 'list-oneself': globalVar.oneself }">
      <HBlock  type="searchDjprogram"
          :id="val.baseInfo.mainSong?.id" :Name="val.baseInfo.name" :playCount="val.baseInfo.listenerCount" :url="val.baseInfo.coverUrl" :songTime="val.baseInfo.duration" 
          :creator="val.baseInfo.dj" v-for="val,index in list.get(nowPage)" @click="playDj(val.baseInfo.mainSong.id,val.baseInfo)"
          dataType="DJprograme"
          :djName="val.baseInfo.dj.nickname"
          :djprogramid="val.baseInfo.id"
          ></HBlock>
          
  </div>

  <div class="pagination">
      <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
          :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, Ref, watch, toRef } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useGlobalVar, useMain, useBasicApi, useNM } from '@renderer/store'
import HBlock from '@renderer/components/myVC/HBlock.vue'
const list: Ref<Map<number, any[]>> = ref(new Map())
const $route = useRoute()
const $router = useRouter()
const Main = useMain()
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
list.value.set(1, await Main.reqSearch($route.query.key as string, '2000', 20, 0))
watch(() => $route.query.key, async () => {
  if ($route.name === '2000') {
      list.value.clear()
      list.value.set(1, await Main.reqSearch($route.query.key as string, '2000', 20, 0))
      nowPage.value = 1
  }
})
const total = toRef(Main, 'searchNumber')
const totalPage = ref(Math.ceil(total.value / 20))
const nowPage = ref(1)
watch(total, () => {
  totalPage.value = Math.ceil(total.value / 20)
})
watch(nowPage, async () => {
  if (!list.value.has(nowPage.value)) {
      list.value.set(nowPage.value, await Main.reqSearch($route.query.key as string, '2000', 20, (nowPage.value - 1) * 20))
  } else {
      globalVar.scrollToTop = true
  }
})

const playDj = (id,baseInfo)=>{
  console.log('触发playDj');
  if(Main.playingindex == -1){
      Main.playingList = [baseInfo]
      Main.playingPrivileges = [emptyDjObject(id)]
      Main.playingindex = 1
      Main.playStatus = 'play'
      Main.songType = 'DJ'
      Main.playing = id
    }else{
      const ifId = Main.playingList.map((item)=>item.mainSong?.id).findIndex((ido)=>ido == id)
      if(ifId == -1){
        Main.playingList.splice(Main.playingindex,0,baseInfo)
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
.list {

  >.Hblock:nth-child(odd) {
      background-color: @line-color-odd;
  }

  >.Hblock:nth-child(even) {
      background-color: @line-color-even;
  }
}

.list-oneself {

  >.Hblock:nth-child(odd) {
      background-color: rgba(43, 43, 43, .6);
  }

  >.Hblock:nth-child(even) {
      background-color: rgba(46, 46, 46, .4);
  }
}


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