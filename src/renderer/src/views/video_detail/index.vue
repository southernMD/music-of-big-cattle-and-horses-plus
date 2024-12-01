<template>
  <div class="video_detail">
    <main>
      <div class="left">
        <video ref="video" :src="vide_url" controls loop ></video>
        <div class="title">
          <h1>
            {{ activeVideo.title }}
          </h1>
        </div>
        <div class="describe">
          <span class="txt" ref="des_txt" :style="{ '-webkit-line-clamp': (open ? 'inherit' : '4') }">
            <span class="title_txt">创建时间：{{ activeVideo.time }}<br>更新时间：{{ activeVideo.updateTime }}</span>
            <pre class="main_txt">
{{ activeVideo.description }}
</pre>
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
            <li v-for="val in video_detail_view" @click="goVideo(val)">
              <div class="playing" :class="{ active: val.id === activeVideo.id }">
                <i class="icon-youjiantou iconfont"></i>
              </div>
              <img :src="val.coverPath" alt="" />
              <div class="msg">
                <div class="title">
                  {{ val.title }}
                </div>
                <div class="ar">{{ val.otherName }}</div>
                <div class="play_msg">{{ val.updateTime }}</div>
              </div>
              <div class="more" @mousedown="onMouseDown" @mouseup="onMouseUp" @click.stop>
                <i class="iconfont icon-gengduo"></i>
              </div>
            </li>
          </ul>
        </el-scrollbar>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { db } from '@renderer/indexDB/db'
import { videos_table } from '@renderer/indexDB/dbType'
const des_txt = ref()
const open = ref(false)
const video = ref() as Ref<HTMLVideoElement>
const $route = useRoute()
const id = ref(+($route.query.id ?? 0)) as unknown as Ref<number>
const floderId = ref(+($route.query.floderId ?? 0)) as unknown as Ref<number>
const folderName = ref(($route.query.floderName ?? " "))

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

const goVideo = (videMsg: videos_table) => {
  try {
    init(videMsg.id!, videMsg.folderId)
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
        overflow: hidden;
        text-overflow: ellipsis;
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

      .active {
        background-color: @left-click-color;
      }
    }
  }

}
</style>