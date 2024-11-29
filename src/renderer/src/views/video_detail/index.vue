<template>
  <div class="video_detail">
    <main>
      <div class="left">
        <video ref="video" src="https://mc.kurogames.com/static4.0/assets/end-zh-e987f9e8.mp4" controls loop></video>
        <div class="title">
          <h1>
            庆祝中华人民共和国成立75周年 天安门广场举行国庆升国旗仪式 | CCTV
          </h1>
        </div>
        <div class="describe">
          <span class="txt" ref="des_txt" :style="{ '-webkit-line-clamp':( open ? 'inherit' : '4') }">
            <span class="title_txt">19万次观看 1个月前 #CCTV #国庆节<br></span>
            <pre class="main_txt">
【欢迎订阅CCTV中国中央电视台频道】：https://bit.ly/3tjXkBJ

#CCTV #国庆节

■□其他CCTV精彩内容■□
《焦点访谈》播放列表：https://bit.ly/3EXVQBF
《面对面》播放列表：https://bit.ly/3kzg2S6
《等着我》播放列表：https://bit.ly/2We5Epy
《山水间的家》播放列表：https://bit.ly/3AOJZWl
《正大综艺》播放列表：https://bit.ly/398xHg1
《典籍里的中国》播放列表：https://bit.ly/3kEYHHv
《经典咏流传》播放列表：https://bit.ly/3kIXCOZ
《国家宝藏 第四季》官方高清播放列表：https://t.ly/IrhUA
《诗画中国 江河万古流》播放列表：https://bit.ly/3TSRXaX

■□更多精彩视频，请关注我们■□
CCTV中文： / @cctvch
CCTV春晚：https://bit.ly/CCTVGala
CCTV科教：https://bit.ly/CCTVScienceAndEducation
CCTV百家讲坛官方频道：https://bit.ly/Chinahistorytalks
CCTV电视剧：https://bit.ly/CCTVDRAMA
CCTV热播剧场：https://bit.ly/CCTVHitdrama
CCTV今日说法官方频道：https://bit.ly/CCTVLegalreport

■□关注CCTV系列帐号 Like us on Facebook■□
Facebook（中文）: / cctv.ch
Facebook（英文）: / cctvcom

■□更多精彩内容欢迎关注CCTV Global：https://global.cctv.com/
</pre>
          </span>
          <div class="open-jiantou">
            <i class="open_btn" @click="changeDescribe">{{ open ? "收起" : "展开" }}</i>
          </div>
        </div>

      </div>
      <div class="right">
        <ul id="vedio_list">
          <li>
            <div class="playing">
              <i class="icon-youjiantou iconfont"></i>
            </div>
            <img src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" alt="" />
            <div class="msg">
              <div class="title">
                独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯
              </div>
              <div class="ar">独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯独学画伯</div>
              <div class="play_msg">1141-14-21</div>
            </div>
            <div class="more">
              <i class="iconfont icon-gengduo"></i>
            </div>
          </li>
          <li>
            <div class="playing">
              <i class="icon-youjiantou iconfont"></i>
            </div>
            <img src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" alt="" />
            <div class="msg">
              <div class="title">
                独学画伯
              </div>
              <div class="ar">123</div>
              <div class="play_msg">321</div>
            </div>
            <div class="more" @mousedown.stop="onMouseDown($event)" @mouseup.stop="onMouseUp($event)">
              <i class="iconfont icon-gengduo"></i>
            </div>
          </li>
        </ul>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { Ref, ref } from 'vue'
const des_txt = ref()
const open = ref(false)
const video = ref() as Ref<HTMLVideoElement>

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
</script>

<style scoped lang="less">
main {
  width: 90vw;
  margin: 0 auto;
  display: flex;
  margin-bottom: 20px;

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
    min-height: 1000px;

    ul {
      li {
        cursor: pointer;
        height: 90px;
        width: 100%;
        margin-bottom: 20px;
        display: flex;
        align-items: center;

        .playing {
          color: @primary-color;
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
        background-color:@left-click-color;
      }

      .active {
        background-color: @left-click-color;
      }
    }
  }

}
</style>