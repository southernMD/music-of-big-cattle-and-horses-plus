<template>
  <!-- <div class="">1{{ $route.query.key }}</div> -->
  <div class="search-play-list" :class="{ 'search-play-list-oneself': globalVar.oneself == 1 }">
      <div class="song-name">
          <span>音乐标题</span>
      </div>
      <div class="song-hand">
          <span>歌手</span>
      </div>
      <div class="zhuanji">
          <span>专辑</span>
      </div>
      <div class="time">
          <span>时长</span>
      </div>
      <div class="hot">
          <span>热度</span>
      </div>
  </div>
  <div class="search-line-list" id="search-line-list">
      <LineMusic :id="val.id" :title="val.name" :zhuanji="val.al" :singer="val.ar" :show-index="true" :oneselfColor="true"
        :time="val.dt" :hot="true" :hot-value="val.pop" :index="index + 1 + 20*(nowPage-1)" :privilegeAndListSearchOnly="val"
        v-for="val, index in list.get(nowPage)">
          <template #lrc>
            <div class="lrc-list" :class="{'lrc-list-show':showLrcFlag[index]}">
              <div v-for="it in val?.lyrics" v-html="it" class="b-color"></div>
            </div>
            <div class="bts">
              <div @click="showLrc(index)" @dblclick.stop>
                <span>展开歌词</span>
              </div>
              <div @click="copy(val.lyrics.slice(1))" @dblclick.stop>
                <span>复制歌词</span>
              </div>
            </div>
          </template>
        </LineMusic>
  </div>
  <div class="pagination">
      <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
          :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, Ref, toRef } from 'vue'
import { useRoute } from 'vue-router';
import { useGlobalVar, useMain } from '@renderer/store'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'
import Loading from '@renderer/ImperativeComponents/Loading/Loading';
const globalVar = useGlobalVar()
const $route = useRoute()
const Main = useMain()
const list: Ref<Map<number,any[]>> = ref(new Map())
list.value.set(1,await Main.reqSearch($route.query.key as string, '1006', 20, 0))
watch(() => $route.query.key, async () => {
  if ($route.name === '1006') {
      list.value.clear()
      list.value.set(1,await Main.reqSearch($route.query.key as string, '1006', 20, 0))
      nowPage.value = 1
  }
})
const total = toRef(Main, 'searchNumber')
const totalPage = ref(Math.ceil(total.value / 20))
const nowPage = ref(1)
watch(total,()=>{
    totalPage.value = Math.ceil(total.value / 20)
})
watch(nowPage,async()=>{
  showLrcFlag.value = Array(list.value.get(nowPage.value)?.length).fill(false)
  if(!list.value.has(nowPage.value)){
      list.value.set(nowPage.value,await Main.reqSearch($route.query.key as string, '1006', 20, (nowPage.value - 1)*20)) 
  }else{
      globalVar.scrollToTop = true
  }
})
const showLrcFlag = ref(Array(list.value.get(nowPage.value)?.length).fill(false)) as Ref<boolean[]>
const showLrc = (index)=>{
  showLrcFlag.value[index] = !showLrcFlag.value[index]
}
const copy = async(lrcList:string[])=>{
  Loading({
      message:'已复制到剪切板',
      showTime:1000
  })
  await navigator.clipboard.writeText(lrcList.join('\n'))
}
</script>

<style scoped lang="less">

.search-play-list {
    height: 35px;
    width: calc(100% - 8px);
    color: @small-font-color;
    display: flex;
    user-select: none;
    font-size: 14px;
    overflow: auto;
    align-items: center;
    // &:not(:first-child)>div {
    //     align-items: center;
    //     display: flex;
    //     position: relative;
    //     box-sizing: border-box;

    //     &>span {
    //         margin-left: 5px;
    //     }
    // }
    span {
        padding-left: 10px;
    }

    &>.song-name {
        margin-left: 105px;
        width: calc((100% - 110px) * 0.3);
        height: inherit;
    }

    &>.song-hand {
        width: calc((100% - 130px) * 0.2);
        height: inherit;
    }

    &>.zhuanji {
        width: calc((100% - 80px) * 0.265);
        height: inherit;

        >span {
            padding-left: 15px;
        }
    }

    &>.time {
        width: calc((100% - 100px) * 0.11);
        height: inherit;

        >span {
            padding-left: 12px;
        }
    }

    &>.hot {
        // width: calc((100% - 100px) * 0.2);
        width: 50px;
        height: inherit;

        >span {
            padding: 0;
        }
    }

}

.search-play-list-oneself {
    background-color: rgba(65, 65, 65, .7);
    color: rgb(150, 150, 150);

    &:not(:first-child)>div {
        &:not(:first-child):hover {
            background-color: rgb(55, 55, 55) !important;
        }
    }
    >div{
      display: flex;
      align-items: center;
    }
}

.search-line-list {
    .line-music {
        &>:deep(.song-name) {
            margin-left: 10px;
            width: calc((100% - 110px) * 0.4) !important;
            max-width: calc((100% - 110px) * 0.4) !important;
            height: inherit;
        }

        &>:deep(.song-hand) {
            width: calc((100% - 110px) * 0.15) !important;
            height: inherit;
        }

        &>:deep(.zhuanji) {
            width: calc((100% - 110px) * 0.2) !important;
            height: inherit;
        }

        &>:deep(.time) {
            width: calc((100% - 110px) * 0.1) !important;
            height: inherit;
        }

        &>:deep(.hot) {
            width: calc((100% - 100px) * 0.2) !important;
            height: inherit;
        }
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
.lrc-list{
  width: 100%;
  margin-left: 115px;
  margin-right: 115px;
  max-height: calc(110px - 34px);
  >div{
    user-select: none;
    margin: 5px 0;
  }
  :deep(.b-color){
    b{
      color:@url-color !important;
    }
  }
}
.lrc-list-show{
  max-height: none;
}
.bts{
  display: flex;
  width: 300px;
  >div{
    border:1px solid @split-line-color;
    width: 120%;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 22px;
    user-select: none;
    border-radius: 2em;
    margin: 0 5px;
    >span{
      color: @font-color;
      font-size: 12px;
    }
    &:hover{
      cursor: pointer;
      background-color: @pagin-bk-hover-color;
    }
  }
}

</style>