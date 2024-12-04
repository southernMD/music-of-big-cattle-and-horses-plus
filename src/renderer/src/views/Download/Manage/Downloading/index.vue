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
          :ref="ref => { return loadingLineMusicRefs[index] = ref as InstanceType<typeof LoadingLineMusic> }"
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
import { inject, ShallowRef, toRef, getCurrentInstance, ComponentInternalInstance, ref, nextTick, watch, ComponentPublicInstance } from 'vue';
import LoadingLineMusic from './LoadingLineMusic/index.vue'
const Main = useMain()
const globalVar = useGlobalVar()
const downloadQueue = inject('downloadQueue')
const downloadALL = () => {
  const refs = loadingLineMusicRefs.value.slice(); // 复制数组
  globalVar.downloadList.forEach(async(item,index) => {
    if (item.ifcancel || item.controller.signal.aborted) {
      item.controller = new AbortController()
      item.ifcancel = false
      loadingLineMusicRefs.value[index].downloadingFlag = true
      downloadQueue.value.add(() => getUrl(item.id, item.name), { signal: item!.controller.signal, priority: 1 })
    }
    await nextTick();
    refs[index] = refs[index] || ref(null);
    // loadingLineMusicRefs.value[index] = loadingLineMusicRefs.value[index] || ref(null)
  })
  nextTick(() => {
    loadingLineMusicRefs.value = refs;
  });
}

const loadingLineMusicRefs = ref<(InstanceType<typeof LoadingLineMusic>[])>([]);

// 监听 globalVar.downloadList 的变化
watch(
  () => globalVar.downloadList,
  (newVal, { }) => {
    // 更新 loadingLineMusicRefs 数组
    const refs = loadingLineMusicRefs.value.slice(); // 复制数组
    refs.length = newVal.length;
    nextTick(() => {
      // 在下一次 DOM 更新后更新数组元素的值
      for (let i = 0; i < newVal.length; i++) {
        refs[i] = refs[i] || null;
      }
      loadingLineMusicRefs.value = refs;
    });
  }
);

const stopALL = async () => {
  // globalVar.downloadList.forEach((item) => {
  //   item.controller.abort()
  // })
  const refs = loadingLineMusicRefs.value.slice(); // 复制数组
  console.log(loadingLineMusicRefs.value);
  loadingLineMusicRefs.value.forEach(async(rf,index) => {
    if (rf) {
      rf.downloadingFlag = false
      rf.val.controller.abort()
    }
    await nextTick();
    refs[index] = refs[index] || null;
  })
  nextTick(() => {
    loadingLineMusicRefs.value = refs;
  });
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

const WaitdownloadList = toRef(globalVar, 'downloadList')
const br = (str: string) => {
    if (str == 'standard') return 128000
    else if (str == 'higher') return 192000
    else if (str == 'exhigh') return 320000
    else return 999000
}

const getUrl = async (id, name) => {
  globalVar.initDownloadButton = true
  const downloadObj = globalVar.downloadList.find(item => item.id === id)
  const loadedBase = globalVar.loadingValue.get(id)?.[0] as number
  let totalBase = globalVar.loadingValue.get(id)?.[1] as number
  let url = ''
  let result;
  let chunks: Uint8Array[]
  console.log(downloadObj);
  if (globalVar.musicPick.get(id) == undefined) { //切片数据)
    globalVar.musicPick.set(id, [])
    //@ts-ignore
    chunks = globalVar.musicPick.get(id)
  } else {
    //@ts-ignore
    chunks = globalVar.musicPick.get(id)
  }
  try {
    if (downloadObj?.url) {
      url = downloadObj?.url
    } else {
      if (downloadObj?.level) {
        result = await Main.reqSongUrl(id, downloadObj?.level)
        url = result.data.data[0].url
      } else if (downloadObj?.br) {
        result = await Main.reqSongDlUrl(id, downloadObj?.br)
        url = result.data.data.url
      } else {
        result = await Main.reqSongDlUrl(id, br(globalVar.setting.downloadlevel))
        url = result.data.data.url
        if (url == null) {
          result = await Main.reqSongUrl(id, globalVar.setting.downloadlevel)
          //@ts-ignore
          url = result.data.data[0].url
          //@ts-ignore
          downloadObj.level = globalVar.setting.downloadlevel
        } else {
          //@ts-ignore
          downloadObj.br = br(globalVar.setting.downloadlevel)
        }
        //@ts-ignore
        downloadObj.url = url
      }
    }
  } catch (error) {
    globalVar.musicPick.set(id, chunks)
    //@ts-ignore
    downloadObj.ifcancel = true
  }
  const Range = loadedBase == 0 && totalBase == 1 ? `bytes=${loadedBase}-` : `bytes=${loadedBase}-${totalBase}`
  //@ts-ignore
  return fetch(url, {
    headers: {
      Range: Range // 下载前 范围
    },
    signal: globalVar.downloadList.find(item => item.id === id)?.controller.signal
  }).then(response => {
    let loaded = loadedBase
    //@ts-ignore
    if (loadedBase == 0 && totalBase == 1) totalBase = +response.headers.get('content-length')
    const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
    return new ReadableStream({
      start(controller) {
        function push() {
          reader.read().then(({ done, value }) => {
            if (done) {
              controller.close()
              return
            }

            loaded += value.byteLength
            controller.enqueue(value)
            chunks.push(value)
            // 计算进度
            globalVar.loadingValue.set(id, [loaded, totalBase])
            push()
          }).catch(async (error) => {
            console.log(error);
            console.log(error.name);
            if (error.name === 'AbortError') {
              globalVar.musicPick.set(id, chunks)
              return null
            } else {
              globalVar.musicPick.set(id, chunks)
              //@ts-ignore
              downloadObj.ifcancel = true
              return null
            }
          })
        }
        push()
      }
    })
  })
    .then(stream => new Response(stream))
    .then(response => response.arrayBuffer())
    .then(async () => {
      const detail = (await Main.reqSongDetail([id])).data.songs[0]
      console.log(detail);
      const title = `${detail.name}`
      const artistId:any[] = []
      const artist = (detail.ar.map((item)=>{
          artistId.push(item.id)
          return `${item.name}`
      })).join('/')
      const image = detail.al.picUrl
      const album = `${detail.al.name}`
      const id3 = {
          title,artist,image,album,ids:[detail.id,detail.al.id,...artistId],time:detail.dt
      }
      const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        mergedChunks.set(chunk, offset);
        offset += chunk.byteLength;
      }
      const arrayBuffer = mergedChunks.buffer;
      //@ts-ignore
      window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: name ,id3})
      globalVar.musicPick.delete(id)
      WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
      // window.electron.ipcRenderer.send('save-music-pick',{name})
    })
    .catch(() => {
      globalVar.musicPick.set(id, chunks)
      //@ts-ignore
      downloadObj.ifcancel = true
      // WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
    })
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