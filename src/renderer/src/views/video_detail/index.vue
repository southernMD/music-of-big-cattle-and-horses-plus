<template>
  <div class="video_detail">
    <main>
      <div class="left">
        <video ref="video" :src="vide_url" controls loop autoplay></video>
        <div class="title">
          <h1>
            {{ activeVideo.title }}
          </h1>
        </div>
        <div class="describe">
          <span class="txt" ref="des_txt" >
            <span class="title_txt">创建时间：{{ activeVideo.time }}<br>更新时间：{{ activeVideo.updateTime }}<br></span>
            <span class="main_txt" :style="{ '-webkit-line-clamp': (open ? 'none' : '4') }">
{{ activeVideo.description }}
</span>
          </span>
          <div class="open-jiantou">
            <i class="open_btn" @click="changeDescribe">{{ open ? "收起" : "展开" }}</i>
          </div>
        </div>

      </div>
      <div class="right">
        <div class="folderName">{{ folderName }}</div>
        <el-scrollbar>
          <ul id="vedio_list">
            <li v-for="val, index in video_detail_view" @click="goVideo(val, index)">
              <div class="playing" :class="{ active: val.id === activeVideo.id }" >
                <i class="icon-youjiantou iconfont"></i>
              </div>
              <img :src="val.coverPath.length==0?blankImg:val.coverPath" :data-forceUpdate="val.id" onerror="this.src = blankImg"/>
              <div class="msg">
                <div class="title">
                  {{ val.title }}
                </div>
                <div class="ar">{{ val.otherName }}</div>
                <div class="play_msg">{{ val.updateTime }}</div>
              </div>
              <div class="more" @mousedown="onMouseDown" @mouseup="onMouseUp" @click.stop="rightClick" :data-id="val.id"
                :data-video-folderId="val.folderId" data-right="true" data-type="video_detail">
                <i class="iconfont icon-gengduo"></i>
              </div>
              <canvas :ref="el => getCanvaasRef(el, index)" width="0" height="0"></canvas>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </main>
  </div>
  <EddVideoForm ref="EddVideoFormRef" key="EddVideoForm1" v-model:editVideoFlag="editVideoFlag" v-model:options="options"
    @editVideo="editVideo" :id="globalVar.editVideo.videoId" :folderFormFlag="false"></EddVideoForm>
  <ChoicePage v-model:choicePageFlag="choicePageFlag" v-model:choiceIndex="choiceIndex" :pageSize="pageSize"></ChoicePage>

</template>

<script setup lang="ts">
import { Ref, ref, computed, watch, toRef, toRaw } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { db } from '@renderer/indexDB/db'
import { videos_table } from '@renderer/indexDB/dbType'
import { useGlobalVar, useVideo } from "@renderer/store/index"
import { EditVideoInfo, videoFolder } from '../video/indexType'
import { bufferToBase64 } from '@renderer/utils/arrayBufferToBase64'
const blankImg = ref(`data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=`)
const des_txt = ref()
const open = ref(false)
const video = ref() as Ref<HTMLVideoElement>
const $route = useRoute()
const $router = useRouter()
const id = ref(+($route.query.id ?? 0)) as unknown as Ref<number>
const floderId = ref(+($route.query.floderId ?? 0)) as unknown as Ref<number>
const folderName = ref(($route.query.floderName ?? " "))
const globalVar = useGlobalVar()

const videoPinia = useVideo()
const loadingVideoId = toRef(videoPinia, 'loadingVideoId')
const loadingVideoFolderId = toRef(videoPinia, 'loadingVideoFolderId')


const activeVideo: Ref<video_detail_view> = ref({
  id: 0,
  src: "",
  title: "发生错误",
  otherName: "",
  time: "0000-00-00 00:00:00",
  updateTime: "0000-00-00 00:00:00",
  description: "发生错误"
})
const video_detail_view: Ref<videos_table[]> = ref([])
const init = async (id: number, floderId: number) => {
  const video_table_msg = await db.videos.where('id').equals(id).first()
  const video_list_table_msg = await db.videos.where('folderId').equals(floderId).toArray()
  video_list_table_msg.sort((a, b) => {
    return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
  })
  video_detail_view.value = video_list_table_msg

  const video_blob = await db.videos_data.where('id').equals(id).first()
  activeVideo.value = {
    id: video_table_msg!.id!,
    src: video_blob ? video_blob.data : video_table_msg!.videoPath,
    title: video_table_msg!.title,
    otherName: video_table_msg!.otherName,
    time: video_table_msg!.time,
    updateTime: video_table_msg!.updateTime,
    description: video_table_msg!.description,
  }
}
try {
  await init(id.value, floderId.value)
} catch (error) {
  activeVideo.value = {
    id: 0,
    src: "",
    title: "发生错误",
    otherName: "",
    time: "0000-00-00 00:00:00",
    updateTime: "0000-00-00 00:00:00",
    description: "发生错误"
  }
}

//computed
const vide_url = computed(() => {
  if (activeVideo.value.src instanceof Blob) {
    return URL.createObjectURL(activeVideo.value.src)
  } else {
    return activeVideo.value.src
  }
})

const changeDescribe = () => {
  open.value = !open.value
}


const onMouseDown = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  target.classList.add('pressed')
}

const onMouseUp = (event: MouseEvent) => {
  const target = event.currentTarget as HTMLElement
  target.classList.remove('pressed')
}

const goVideo = async (videMsg: videos_table, index: number) => {
  if (videMsg.id == loadingVideoId.value) {
    return
  }
  try {
    await init(videMsg.id!, videMsg.folderId)
  } catch (error) {
    activeVideo.value = {
      id: 0,
      src: "",
      title: "发生错误",
      otherName: "",
      time: "0000-00-00 00:00:00",
      updateTime: "0000-00-00 00:00:00",
      description: "发生错误"
    }
  }
}

const rightClick = (event: MouseEvent) => {
  event.preventDefault()
  event.target?.dispatchEvent(new MouseEvent('contextmenu', {
    bubbles: true,
    cancelable: true,
    view: window,
    clientX: event.clientX,
    clientY: event.clientY,
  }))
}
const updateAideoListAfterDelete = async (id) => {
  video_detail_view.value = video_detail_view.value.filter(val => val.id != id)
}

watch(() => globalVar.delVideo, async () => {
  console.log(globalVar.delVideo);
  if (globalVar.delVideo.flag && $route.name=="video_detail") {
    await db.videos.delete(globalVar.delVideo.videoId)
    await db.videos_data.delete(globalVar.delVideo.videoId)
    if (globalVar.delVideo.videoId == activeVideo.value.id) {
      $router.push({ name: 'video' })
    } else {
      updateAideoListAfterDelete(globalVar.delVideo.videoId)
    }
    if (globalVar.delVideo.videoId === loadingVideoId.value) {
      window.electron.ipcRenderer.send('dueTo-del-nedd-close-ffmpeg')
      drawLoading(100)
      loadingVideoId.value = 0
      loadingVideoFolderId.value = 0
    }
    globalVar.delVideo.flag = false
  }
}, { deep: true })

const options: Ref<videoFolder[] | undefined> = ref()
try {
  const video_folders = (await db.videos_folders.toArray())
  options.value = video_folders.map(item => {
    return {
      label: item.folderName,
      value: item.id!
    }
  })
} catch (error) {
  options.value = []
}
const editVideoFlag = ref(false)
watch(() => globalVar.editVideo.flag, () => {
  if (loadingVideoId.value !== 0 && $route.name=="video_detail") {
    editVideoFlag.value = false
    globalVar.editVideo.flag = false
    return
  }
  editVideoFlag.value = toRaw(globalVar.editVideo.flag)
}, { deep: true })

const EddVideoFormRef = ref()
let bilibiliErrorFlag = false
const editVideo = ({ id, form, nowTime, reloadFlag, base_video }: { id: number, form: EditVideoInfo, nowTime: string, reloadFlag: boolean, base_video: videos_table }) => {
  const index = video_detail_view.value?.findIndex(item => item.id === form.id)!;
  video_detail_view.value![index].updateTime = nowTime
  video_detail_view.value?.sort((a, b) => {
    return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
  })
  video_detail_view.value![0].coverPath = form.coverPath;
  video_detail_view.value![0].title = form.title;
  video_detail_view.value![0].description = form.description;
  video_detail_view.value![0].updateTime = nowTime;
  video_detail_view.value![0].folderId = form.folderId
  video_detail_view.value![0].otherName = form.otherName.join(" ");
  video_detail_view.value![0].type = form.type
  video_detail_view.value![0].videoPath = form.videoPath;
  if (form.save && reloadFlag && form.videoPath != base_video.videoPath) {
    loadingVideoId.value = id
    loadingVideoFolderId.value = floderId.value
    if (form.type === 1 || form.type === 2) {
      window.electron.ipcRenderer.send('saveVideo', { videoPath: form.videoPath, coverPath: form.coverPath })
      window.electron.ipcRenderer.once('save-video-finish', async (_, { arrayBuffer, coverArrayBuffer }) => {
        console.log("save-video-finish");
        //创建链接
        //arrayBuffer转blob
        let arrayBufferBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
        let t = await db.videos_data.get(id)
        if (t) {
          db.videos_data.update(id, {
            data: arrayBufferBlob
          })
        } else {
          db.videos_data.add({
            id,
            data: arrayBufferBlob
          })
        }
        if (activeVideo.value.id == id) {
          activeVideo.value.src = arrayBufferBlob
        }
        if (form.updatePic) {
          //coverArrayBuffer转base64
          const imageBase64 = await bufferToBase64(coverArrayBuffer)
          db.videos.update(id, {
            coverPath: `${imageBase64}`
          })
          video_detail_view.value![0].coverPath = `${imageBase64}`
        }
        loadingVideoId.value = 0
        loadingVideoFolderId.value = 0
        console.log("updateBaseVideo");
        EddVideoFormRef.value?.updateBaseVideo(id)
      })
      window.electron.ipcRenderer.once('save-video-error', (_, { error }) => {
        loadingVideoId.value = 0
        loadingVideoFolderId.value = 0
        // @ts-ignore id only undefined in table create
        video_detail_view.value![0] = base_video
        db.videos.update(id, base_video)
        EddVideoFormRef.value.rollBackForm()
        alert("\n视频缓存修改失败，已自动回滚")
      })
    } else {
      bilibiliErrorFlag = true
      window.electron.ipcRenderer.send("download-bilibili", { videoPath: form.videoPath,sessdata:globalVar.setting.sessdata ,transcoed: globalVar.setting.transcoed})
      window.electron.ipcRenderer.once('download-bilibili-finish', async (_, { video, cover }) => {
        const imageBase64 = await bufferToBase64(cover)
        if (form.updatePic) {
          video_detail_view.value![0].coverPath = `${imageBase64}`
          db.videos.update(id, {
            coverPath: imageBase64 as string
          })
        }
        const videoBlob = new Blob([video], { type: 'video/mp4' });
        let t = await db.videos_data.get(id)
        console.log(t,"目标位");
        if (t) {
          db.videos_data.update(id, {
            data: videoBlob
          })
        } else {
          db.videos_data.add({
            id,
            data: videoBlob
          })
        }
        if (activeVideo.value.id == id) {
          activeVideo.value.src = videoBlob
        }
        loadingVideoId.value = 0
        loadingVideoFolderId.value = 0
        EddVideoFormRef.value?.updateBaseVideo(id)
      })
      //download-bilibili-error on
      window.electron.ipcRenderer.once('download-bilibili-error', (_, { error }) => {
        if (bilibiliErrorFlag) {
          bilibiliErrorFlag = false
          video_detail_view.value![0] = base_video
          db.videos.update(id, base_video)
          EddVideoFormRef.value.rollBackForm()
          loadingVideoId.value = 0
          loadingVideoFolderId.value = 0
        }
        alert(error)
      })
    }
  } else if (!form.save) {
    db.videos_data.delete(id)
    console.log("updateBaseVideo");
    EddVideoFormRef.value?.updateBaseVideo(id)
  } else {
    console.log("updateBaseVideo");
    EddVideoFormRef.value?.updateBaseVideo(id)
  }
  if (activeVideo.value.id == id) {
    activeVideo.value = {
      id: form!.id!,
      src: activeVideo.value.src,
      title: form.title,
      otherName: form.otherName.join(" "),
      time: activeVideo.value.time,
      updateTime: form.updateTime,
      description: form.description,
    }
  }
}
const getCanvaasList = ref<HTMLCanvasElement[]>([]);
const getCanvaasRef = (el, index) => {
  if (el) {
    getCanvaasList.value[index] = el;
  }
};

let lastIndex = 0;

const drawLoading = (progress) => {
  // console.log(loadingVideoId.value,"video_detail");
  let index1 = video_detail_view.value.findIndex(item => item.id === loadingVideoId.value)
  // console.log("在video_detail的index1",index1);
  
  if(!getCanvaasList.value[index1])return
  if (index1 < 0) {
    if (lastIndex >= 0) {
      const canvas = getCanvaasList.value[lastIndex]
      canvas.width = canvas.clientWidth
      canvas.height = canvas.clientHeight
      const ctx = canvas.getContext('2d')!;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    }
    lastIndex = index1
    return
  }
  const canvas: HTMLCanvasElement = getCanvaasList.value[0] as HTMLCanvasElement
  //画进度条具体实现,线形的
  canvas.width = canvas.clientWidth
  canvas.height = canvas.clientHeight
  const ctx = canvas.getContext('2d')!;


  if (lastIndex > 0) {
    const canvasLast = getCanvaasList.value[lastIndex]
    canvasLast.width = canvas.clientWidth
    canvasLast.height = canvas.clientHeight
    const ctxLast = canvas.getContext('2d')!;
    ctxLast.clearRect(0, 0, canvas.width, canvas.height);
  }


  // 设置背景条样式
  ctx.fillStyle = '#e0e0e0'; // 背景条颜色
  ctx.fillRect(0, 0, canvas.width, canvas.height); // 绘制背景条

  // 计算进度条宽度
  const progressWidth = (progress / 100) * canvas.width;

  // 设置进度条样式
  ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor'); // 进度条颜色
  ctx.fillRect(0, 0, progressWidth, canvas.height);
  if (progress == 100) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0
    canvas.height = 0
  }
}

window.electron.ipcRenderer.on('save-video-progress', (_, { progress }) => {
  if($route.name != 'video_detail')return
    drawLoading(progress)
})

//哔站下载解析

//download-bilibili-downloading on
window.electron.ipcRenderer.on('download-bilibili-downloading', (_, { progress }) => {
  if($route.name != 'video_detail')return
    drawLoading(progress)
})
const choicePageFlag = ref(true)
const choiceIndex = ref(1)
const pageSize = ref(0)
//download-bilibili-choice on 
//download-bilibili-choice-result send
window.electron.ipcRenderer.on('download-bilibili-choice', (_, { number }) => {
    if($route.name != 'video_detail')return
    pageSize.value = number
    choicePageFlag.value = true
})

watch(()=>choicePageFlag.value,()=>{
    if(choicePageFlag.value == false && pageSize.value > 1){
        window.electron.ipcRenderer.send('download-bilibili-choice-result', { index: choiceIndex.value })
      if($route.name != 'video_detail')return
        choiceIndex.value = 1
        pageSize.value = 0
    }
})
const broadcast = new BroadcastChannel('cover')
broadcast.addEventListener("message",(event)=>{
  video_detail_view.value![0].coverPath = event.data.cover
})
</script>

<style scoped lang="less">
main {
  width: 90vw;
  margin: 10px auto;
  display: flex;
  margin-bottom: 0;

  .left {
    width: 78vw;
    min-height: 500px;
    margin-right: 20px;

    video {
      border-radius: 1em;
      border: none;
      outline: none;
      aspect-ratio: 3 / 1.75;
      width: 100%;
      object-fit: fill;
      z-index: 99;
    }

    canvas {
      aspect-ratio: 3 / 1.75;
      width: 100%;
    }

    .title {
      font-size: 1.5em;
      line-height: 2.8rem;
      font-weight: 700;
      overflow: hidden;
      display: block;
      max-height: 5.6rem;
      -webkit-line-clamp: 2;
      display: box;
      display: -webkit-box;
      -webkit-box-orient: vertical;
      text-overflow: ellipsis;
      white-space: normal;
      margin-bottom: 10px;
    }

    .describe {
      max-width: 60vw;
      align-items: flex-start;
      margin-top: 10px;
      border-radius: 1em;
      position: relative;
      background-color: @mainban-bk-color;
      border: 1px solid @split-line-color;
      box-sizing: border-box;
      padding: 0.5em 1em;

      &>span {
        display: block;
        width: 80%;
        overflow: hidden;
        text-overflow: ellipsis;
        display: -webkit-box;
        -webkit-line-clamp: 4;
        line-clamp: 4;
        -webkit-box-orient: vertical;
        font-size: 0.8em;
      }

      &>.txt {
        margin-top: 5px;
        height: auto;
        line-height: 1.2em;
        margin: 0;

        .title_txt {
          font-size: 0.82em;
          font-weight: bold;

        }

        .main_txt {
          font-size: 0.8em;
          font-family: inherit;
          margin: 0;
          margin-bottom: 5px;
          overflow: hidden;
          text-overflow: ellipsis;
          display: -webkit-box;
          -webkit-box-orient: vertical;
        }
      }

      i {
        transform: translateX(20px);
        font-size: 14px;
        font-style: normal;
        user-select: none;
        cursor: pointer;
      }

      .open-jiantou {
        position: absolute;
        right: 20%;
        bottom: 5px;
      }
    }
  }

  .right {
    width: calc(27vw - 20px);
    min-width: 300px;

    .folderName {
      font-size: 25px;
      margin-bottom: .5em;
    }

    ul {
      max-height: calc(100vh - 60px - 50px - 280px);

      li {
        cursor: pointer;
        height: 90px;
        width: 100%;
        margin-bottom: 20px;
        display: flex;
        align-items: center;
        position: relative;

        .playing {
          color: @primary-color;
          margin-right: 5px;
          opacity: 0;
        }

        .active {
          opacity: 1;
        }


        img {
          height: 80%;
          aspect-ratio: 3 / 2;
          border-radius: .8em;
          margin-right: 10px;
          cursor: pointer;
        }

        .msg {
          width: calc(100% - 45.5% - 10px);
          display: flex;
          flex-direction: column;

          &>div {
            margin-bottom: 5px;
          }

          .title {
            -webkit-line-clamp: 2;
            line-clamp: 2;
            -webkit-box-orient: vertical;
            text-overflow: ellipsis;
            width: 100%;
            overflow: hidden;
            display: -webkit-box;
            font-size: .8em;
            font-weight: bolder;
            line-height: 1.5em;
          }

          .ar,
          .play_msg {
            font-size: .5em;
            color: @font-color;
            line-height: 1em;
            -webkit-line-clamp: 2;
            line-clamp: 2;
            display: -webkit-box;
            -webkit-box-orient: vertical;
            overflow: hidden;
            text-overflow: ellipsis;
          }
        }

        .more {
          border-radius: 2em;
          margin-left: 2%;
          margin-right: 2%;
          padding: .5em;
          box-sizing: border-box;
        }

        canvas {
          width: 90%;
          height: 5px;
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          border-radius: 2em;
          margin: 0 auto;
        }

        .pressed {
          background-color: @span-color-hover;
          animation: pressAnimation 0.3s forwards;
        }

        @keyframes pressAnimation {
          0% {
            background-color: transparent;
          }

          100% {
            background-color: @span-color-hover;
          }
        }
      }

      li:hover {
        background-color: @left-click-color;
      }

      // .active {
      //   background-color: @left-click-color;
      // }
    }
  }

}
</style>