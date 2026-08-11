<template>
  <div class="Downloading">
    <div class="btns">
      <div class="download h" @click="downloadALL"
        :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
        <i class="iconfont icon-xiazai"></i>
        <div class="txt">
          <span>下载全部</span>
        </div>
      </div>
      <div class="download h" @click="stopALL" :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
        <i class="iconfont icon-zanting"></i>
        <div class="txt">
          <span>全部暂停</span>
        </div>
      </div>
      <div class="download h" @click="deleteALL"
        :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
        <i class="iconfont icon-lajixiang"></i>
        <div class="txt">
          <span>清空全部</span>
        </div>
      </div>
    </div>
    <div class="list">
      <div class="title" :class="{ 'play-list-title-oneself': globalVar.oneself == 1 }">
        <div class="one"><span>音乐标题</span></div>
        <div class="two"><span>进度</span></div>
      </div>
      <div class="music-list" :class="{ 'music-list-oneself': globalVar.oneself == 1 }">
        <LoadingLineMusic
          v-show="index >=(nowPage-1)*20 && index < nowPage*20"
          v-for="(val, index) in globalVar.downloadList" :index="index" :val="val" :key="val.id"
          >
        </LoadingLineMusic>
      </div>
      <div class="pagination">
        <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
            :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useMain, useGlobalVar } from '@renderer/store';
import { downloadMusic } from '@renderer/utils/downloadMusic';
import { inject, ShallowRef, toRef, getCurrentInstance, ComponentInternalInstance, ref, nextTick, watch, ComponentPublicInstance } from 'vue';
import PromiseQueue from 'p-queue';
import LoadingLineMusic from './LoadingLineMusic/index.vue'
const Main = useMain()
const globalVar = useGlobalVar()
const downloadQueue = inject<ShallowRef<PromiseQueue>>('downloadQueue') as ShallowRef<PromiseQueue>
const downloadALL = () => {
  globalVar.downloadList.forEach((item) => {
    if (item.ifcancel || item.controller.signal.aborted) {
      item.controller = new AbortController()
      item.ifcancel = false
      item.downloadingFlag = true
      downloadQueue.value.add(() => downloadMusic(item.id, item.name), { signal: item!.controller.signal, priority: 1 })
    }
  })
}

const stopALL = () => {
  globalVar.downloadList.forEach((item) => {
    item.downloadingFlag = false
    item.controller.abort()
  })
}

const deleteALL = () => {
  globalVar.downloadList.forEach((item) => {
    item.controller.abort()
  })
  globalVar.downloadId = []
  globalVar.downloadList = []
  globalVar.loadingValue.clear()
  globalVar.musicPick.clear()
}


const total = ref(globalVar.downloadList.length)
const totalPage = ref(Math.ceil(total.value / 20))
const nowPage = ref(1)
watch(total,()=>{
    totalPage.value = Math.ceil(total.value / 20)
})

watch(globalVar.downloadList,()=>{
  total.value = globalVar.downloadList.length
})

</script>

<style scoped lang="less">
.play-list-title-oneself {
  background-color: rgba(65, 65, 65, 0.7);
  color: #969696;
}

.btns {
  user-select: none;
  display: flex;

  .download {
    margin-left: 10px;
    min-width: 100px;
    width: auto;
    height: 32px;
    border-radius: 2em;
    border: @split-line-color 1px solid;
    display: flex;
    align-items: center;
    cursor: pointer;

    i {
      color: #666666;
      padding-left: 15px;
      padding-right: 5px;
    }

    .txt {
      font-size: 14px;
      margin-right: 5px;

      >span {
        display: block;
        width: 70px;
      }
    }
  }

  .h:hover {
    background-color: @span-color-hover !important;
  }

  .h-oneself:hover {
    background-color: rgb(66, 66, 66) !important;
  }
}

.list {
  width: calc(100% - 8px);
  display: flex;
  color: @small-font-color;
  font-size: 14px;
  margin-top: 10px;
  user-select: none;
  flex-direction: column;

  .title {
    display: flex;
    width: 100%;
    height: 34px;

    .one {
      margin-left: 8%;
      width: 30%;
      height: 100%;
      display: flex;
      align-items: center;
    }

    .two {
      width: 62%;
      height: 100%;
      display: flex;
      align-items: center;
    }
  }
  .pagination {
      display: flex;
      justify-content: center;
      margin-bottom: 110px;
      padding-bottom: 20px;
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
}

.music-list {
  width: 100%;
  padding-bottom: 20px;
  overflow: auto;

  >:nth-child(odd) {
    background-color: @line-color-odd;
  }

  >:nth-child(even) {
    background-color: @line-color-even;
  }

}

.music-list-oneself {
  >:nth-child(odd) {
    background-color: rgba(46, 46, 46, .4);
  }

  >:nth-child(even) {
    background-color: rgba(43, 43, 43, .6);
  }
}</style>