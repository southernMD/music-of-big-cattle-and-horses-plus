<template>
  <div class="songDetail" v-show="detailStatus == 'open'">
    <MyMainMenu :songMenu="true" :changefontColor="true" :scrollY="scrollY">
      <template #songLrc>
        <transition name="songLrc">
          <div v-show="detailStatus == 'open' && scrollY >= 300" class="song-lrc">
            <div class="title">{{ playingList[playingindex - 1]?.name}}</div>
            <div class="lrc" :class="{weight: isNMColor}">{{mainMenuPlayingLrc}}</div>
          </div>
        </transition>
      </template>
    </MyMainMenu>
    <el-scrollbar ref="scrollbarRef2" @scroll="scrollMain">
      <div class="title-main">
        <span class="detailSongName" @mouseover="rushTitle('detailSongName')">
          <span class="txt" id="detailSongName" @dragstart="prevenDrag">{{
          playingList[playingindex - 1]?.name
          }}</span>
        </span>
        <div class="subtitle">
          <div v-if="
            Boolean(
              playingList[playingindex - 1]?.tns?.length ||
                playingList[playingindex - 1]?.alia?.length
            )
          ">
            <span @dragstart="prevenDrag" v-if="
              playingList[playingindex - 1]?.tns?.length !== 0 &&
              playingList[playingindex - 1]?.tns?.length !== undefined
            ">
              {{ playingList[playingindex - 1].tns[0] }}</span>
            <span @dragstart="prevenDrag" v-if="
              playingList[playingindex - 1]?.alia?.length !== 0 &&
              playingList[playingindex - 1]?.alia?.length != undefined
            ">
              &nbsp;{{ playingList[playingindex - 1].alia[0] }}</span>
          </div>
          <div>
            <span @dragstart="prevenDrag" v-if="playingList[playingindex - 1]?.ar[0]?.name" class="span-singer"
              v-for="(value, index) in playingList[playingindex - 1]?.ar"
              :data-singerId="playingList[playingindex - 1]?.ar[index]?.id">
              <Singer :name="playingList[playingindex - 1]?.ar[index]?.name" :index="index"
                :singerLen="playingList[playingindex - 1]?.ar.length - 1">
              </Singer>
            </span>
            <span v-else style="padding-left: 5px">????????????</span>
            <span>-</span>
            <span v-if="playingList[playingindex - 1]?.al?.name" class="span-zhuanji"
              :data-singerId="playingList[playingindex - 1]?.al?.id">
              <ZhuanJi :name="playingList[playingindex - 1]?.al?.name" :tns="playingList[playingindex - 1]?.al?.tns[0]"
                :Len="playingList[playingindex - 1]?.al?.tns?.length">
              </ZhuanJi>
            </span>
            <span v-else style="padding-left: 5px">????????????</span>
          </div>
        </div>
      </div>
      <div class="music">
        <div class="left" ref="left">
          <div class="bk">
            <div class="ba ba-play" ref="ba"></div>
            <div class="img" ref="pian">
              <div class="pian"></div>
            </div>
          </div>
        </div>
        <div class="middle">
          <ScroolLrc :currentTime="currentTime" :lyricOffset="lyricOffset" @goTotime="gotoPlay" @scrollEvent="scrollEvent"></ScroolLrc>
        </div>
        <div class="right" v-show="ifShowRight">
          <el-scrollbar height="40%">
            <div class="main">
              <div class="haveSong" v-show="simiPlaylist?.length !== 0">
                <div class="title">
                  <span>????????????????????????</span>
                  <div class="block">
                    <DetailSmallBlock v-for="(value,index) in simiPlaylist" :name="value.name" :id="value.id"
                      :url="value.coverImgUrl" type="playList"></DetailSmallBlock>
                  </div>
                </div>
              </div>
              <div class="otherSong" v-show="simiSong?.length !== 0">
                <div class="title">
                  <span>???????????????????????????</span>
                  <div>
                    <DetailSmallBlock v-for="(value,index) in simiSong" :url="value.album?.blurPicUrl" :id="value.id"
                      :name="value.name" :privilege="value.privilege" :artists="value.artists" type="song">
                    </DetailSmallBlock>
                  </div>
                </div>
              </div>
            </div>
          </el-scrollbar>
        </div>
        <div class="smallchange" @click="showRight">
          <i v-if="ifShowRight" class="iconfont icon-youxiangshuangjiantou"></i>
          <i v-if="!ifShowRight" class="iconfont icon-zuoxiangshuangjiantou"></i>
        </div>
      </div>
      <CommentList :commentFlag="commentFlag" :nowPage="nowPage" :hotComments="hotComments" :moreHot="moreHot"
        :total="total" :comments="comments" :totalPage="totalPage" :id="playingId" :type="0"></CommentList>
      <transition-group name="showWrite">
        <FloatTag :key="1" v-show="showSroll" :align="'center'" :bottom="'80px'" :size="'12px'" :width="'150px'"
          :height="'30px'" :option="'write'" @write="write">
          <template #default>
            <div>
              <i class="iconfont icon-w_shuxie"></i> ????????????????????????
            </div>
          </template>
        </FloatTag>
        <FloatTag :key="2" v-show="!showSroll" :width="'90px'" :size="'12px'" :right="'15%'" :bottom="'80px'"
          :height="'30px'" :option="'write'" @write="write">
          <template #default>
            <div>
              <i class="iconfont icon-w_shuxie"></i>?????????
            </div>
          </template>
        </FloatTag>
        <FloatTag :key="3" v-show="showSroll" :height="'30px'" :width="'30px'" :size="'12px'" :right="'18%'"
          :bottom="'80px'" :option="'goToTop'" @goToTop="goToTop">
          <template #default>
            <div>
              <i class="iconfont icon-zhiding_o"></i>
            </div>
          </template>
        </FloatTag>
      </transition-group>
    </el-scrollbar>
  </div>
</template>

<script lang="ts" setup>
import { useMain, useMainMenu, useElectronToApp } from "@renderer/store";
import {
  toRef,
  watch,
  computed,
  nextTick,
  onMounted,
  Ref,
  getCurrentInstance,
  ComponentInternalInstance,
  ref,
} from "vue";
import { ElScrollbar } from "element-plus";
import { useRouter } from 'vue-router'
const Main = useMain();
const MainMenu = useMainMenu();
const $el = getCurrentInstance() as ComponentInternalInstance;
const $router = useRouter()
let windowMidlle = toRef(MainMenu, "model");
let playStatus = toRef(Main, "playStatus");
let playingindex = toRef(Main, "playingindex");
let playingList = toRef(Main, "playingList");
let detailStatus = toRef(Main, "detailStatus");
let playingId = toRef(Main, "playing");

defineProps<{
  currentTime: number;
  lyricOffset: number;
  simiPlaylist: any;
  simiSong: any;
}>();


let mainMenuPlayingLrc = ref('')
window.electron.ipcRenderer.on('Main-Menu-song-lrc', ({}, str: string) => {
  console.log(str);
  console.log(playingList.value[playingindex.value - 1]?.name);
  
  mainMenuPlayingLrc.value = str;
})
//????????????
const goToTop = () => {
  scrollbarRef2.value!.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}

watch(playingId, () => {
  scrollbarRef2.value!.scrollTo({
    top: 0
  });
})
const scrollEvent = (num: number) => {
  scrollbarRef2.value!.setScrollTop(num)
}
const write = () => {
  console.log('?????????');
}

//????????????
let showSroll = ref(false);
//??????????????????????????????
let scrollY = ref(0)
type scrollObj = {
  scrollTop: number;
  scrollLeft: number;
}
const scrollMain = (scrollObj: scrollObj) => {
  let { scrollTop } = scrollObj
  scrollY.value = scrollTop
  if (scrollTop == 0) showSroll.value = false;
  else showSroll.value = true;
}

let commentFlag = ref(false)

let hotComments: Ref<any[]> = ref([]);
let comments: Ref<any[]> = ref([]);
let total = ref(0)
let totalPage = ref(0)
let nowPage = ref(1);
let moreHot = ref(false)
watch(playingId, async () => {
  if (playingId.value != -1) {
    let result = (await Main.reqCommentMusic(playingId.value, 20, 0)).data
    hotComments.value = result.hotComments;
    comments.value = result.comments;
    total.value = result.total

    totalPage.value = Math.ceil((total.value) / 20)

    moreHot.value = result.moreHot
    commentFlag.value = true
    nowPage.value = 1;
  }

})



let ifShowRight = ref(true)

const showRight = () => {
  ifShowRight.value = !ifShowRight.value
}


const $emit = defineEmits(['goTotime'])
//??????????????????
const gotoPlay = (val: number) => {
  $emit('goTotime', val)
}


const scrollbarRef2 = ref<InstanceType<typeof ElScrollbar>>();

let mainColor = toRef(MainMenu, "colorBlock");
const isNMColor = () => {
  if (mainColor.value === "NMblack") {
    return true;
  } else {
    return false;
  }
};

watch(windowMidlle, () => {
  let l = $el.refs.left as HTMLElement;
  if (windowMidlle.value) {
    l.classList.add("left-active");
  } else {
    l.classList.remove("left-active");
  }
});

watch(playStatus, () => {
  let ba = $el.refs.ba as HTMLElement;
  let pian = $el.refs.pian as HTMLElement;
  if (playStatus.value == "play") {
    ba.classList.add("ba-play");
    pian.style.animationPlayState = "running";
  } else {
    ba.classList.remove("ba-play");
    pian.style.animationPlayState = "paused";
  }
});

watch(playingindex, () => {
  if (playingindex.value != -1) {
    let pian = $el.refs.pian as HTMLElement;
    pian.style.backgroundImage =
      "url(" + playingList.value[playingindex.value - 1].al.picUrl + ")";
    //??????????????????
    let dom = document.querySelector(`#detailSongName`) as HTMLElement;
    dom.removeAttribute("style");
    dom.style.transition = "transform 0s linear";
    moveSingerFlag.value = true;
    clearTimeout(time1);
    clearTimeout(time2);
    setTimeout(() => {
      dom.removeAttribute("style");
    }, 0);
  }
});

let moveSingerFlag = ref(true);
let time1: any, time2: any;
const rushTitle = (str: string) => {
  let dom = document.querySelector(`#${str}`) as HTMLElement;
  console.log(dom.offsetWidth, dom.scrollWidth);
  console.log(moveSingerFlag.value);

  if (moveSingerFlag.value && dom.offsetWidth < dom.scrollWidth) {
    moveSingerFlag.value = false;
    dom.style.transform =
      "translateX(-" + (dom.scrollWidth - dom.offsetWidth) + "px)";
    dom.style.transition = "transform 4s linear";
    time1 = setTimeout(() => {
      dom.style.transform = "";
      clearTimeout(time1);
      time2 = setTimeout(() => {
        dom.removeAttribute("style");
        moveSingerFlag.value = true;
        clearTimeout(time2);
      }, 5000);
    }, 5000);
  }
};

//lrc????????????songDetail
window.electron.ipcRenderer.on('lrc-open-playDetail', () => {
  if(Main.songType == 'FM'){
    $router.push({
      path:'/app/personalFM',
      query:{
          name:'personalFM'
      }
    })
  }else{
    detailStatus.value = 'open'
  }
})

const prevenDrag = (e: MouseEvent) => {
  e.preventDefault();
};
</script>

<style lang="less" scoped>
  .weight {
      font-weight: bolder !important;

      >div {
          font-weight: bolder !important;
      }
  }
.song-lrc {
  width: calc(43vw * 0.8);
  height: 60px;
  position: absolute;
  left: 0px;
  right: 0px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;

  >div {
    margin: 5px 0px;
  }

  >.title {
    color: @font-color;
    font-size: 15px;
    white-space: nowrap;
  }

  >.lrc {
    color: @lrc-detail;
    font-size: 14px;
    height: 14px;
    white-space: nowrap;
  }
}

.songDetail {
  width: 100vw;
  height: calc(100vh - 70px);
  position: fixed;
  bottom: 70px;
  left: 0px;
  background-color: @other-bk-color;
  z-index: 11;

  :deep(header) {
    background-color: @other-bk-color;

  }

  :deep(.title-main) {
    // margin-top: 5vh;
    // background-color: yellowgreen;
    width: 80%;
    height: 50px;
    margin: 0 auto;
    // position: absolute;
    // z-index: 5;
    // top: 0px;
    margin-top: 10px;

    .detailSongName {
      display: inline-block;
      width: 100%;
      white-space: nowrap;
      overflow: hidden;

      .txt {
        display: inline-block;
        text-align: center;
        width: 100%;
        height: 50px;
        font-size: 35px;
        color: @font-color;

        &::selection {
          background-color: @select-color;
        }
      }
    }

    .subtitle {
      height: 10%;
      color: @small-font-color;

      &>div {
        width: 300px;
        // background-color: gainsboro;
        margin: 0 auto;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        text-align: center;
        color: @small-font-color;
        margin-top: 5px;

        &>span {
          display: inline;
          max-width: 300px;
          color: rgb(127, 127, 127);
          font-size: 13px;

          > :deep(span) {
            &::selection {
              background-color: @select-color;
            }
          }

          > :deep(div) {
            &::selection {
              background-color: @select-color;
            }
          }

          &::selection {
            background-color: @select-color;
          }
        }
      }
    }
  }

  .music {
    min-height: 450px;
    height: 60vh;
    width: 100vw;
    // background-color: red;
    display: flex;
    justify-content: space-around;
    position: relative;

    .left {
      width: 225px;
      height: 100%;
      // background-color: yellow;
      display: flex;
      justify-content: start;
      align-items: center;
      margin-left: 0;

      .bk {
        width: 80%;
        height: 80%;
        // background-color: green;
        position: relative;
        top: -45px;

        .ba {
          width: 150px;
          height: 100px;
          background-image: url(./images/G.png);
          background-repeat: no-repeat;
          background-position: -2px -10px;
          position: absolute;
          left: calc(80% - 10px);
          top: 5%;
          z-index: 3;
          transition: transform 0.2s ease-in;
          transform-origin: 10px 10px;
        }

        .ba-play {
          transform: rotateZ(32deg);
        }

        .img {
          width: 200px;
          height: 200px;
          background-repeat: no-repeat;
          background-size: cover;
          background-position: center center;
          position: absolute;
          transform: scale(0.8, 0.8);
          left: 20%;
          top: 110px;
          border-radius: 50%;
          z-index: 2;

          .pian {
            width: 300px;
            height: 300px;
            background-image: url(./images/cover.png);
            background-repeat: no-repeat;
            border: 10px solid @audio-border-color;
            border-radius: 50%;
            position: absolute;
            left: -30%;
            top: -30%;
          }

          animation: rotateInfinite 30s linear infinite;
        }

        @keyframes rotateInfinite {
          from {
            transform: rotateZ(0deg) scale(0.8, 0.8);
          }

          to {
            transform: rotateZ(360deg) scale(0.8, 0.8);
          }
        }
      }
    }


    &>:deep(.el-scrollbar) {
      width: 82%;
      margin: 10% auto;
    }

    .middle {
      width: 43vw;
      // background-color: tan;
      position: relative;
      
    }

    .left-active {
      transform: translateX(50px);
    }

    .right {
      width: 230px;
      height: 100%;
      margin-left: -3%;
      margin-right: 2%;

      // background-color: saddlebrown;
      :deep(.el-scrollbar) {
        margin: 40% auto;

        .main {
          width: 230px;
          display: flex;
          flex-direction: column;
          align-items: center;

          &>div {
            margin: 10px 0;
            width: 100%;

            >.title {
              >span {
                width: 95%;
                font-size: 14px;
                font-weight: bold;
                color: @font-color;
                user-select: none;
              }
            }
          }
        }
      }
    }

    .smallchange {
      height: 35px;
      width: 20px;
      background-color: rgba(0, 0, 0, .05);
      ;
      display: flex;
      justify-content: center;
      align-items: center;
      border-radius: 1em;
      position: absolute;
      right: 20px;
      top: 0;
      bottom: 0;
      margin: auto 0;
      cursor: pointer;

      &:hover {
        background-color: @span-color-hover !important;
      }

      i {
        color: @small-font-color;
      }
    }
  }



  .showWrite-enter-from,
  .showWrite-leave-to {
    transform: translateY(50px);
    opacity: 0;
  }

  .showWrite-enter-active,
  .showWrite-leave-active {
    transition: all 0.2s ease-in;
  }

  .showWrite-enter-to,
  .showWrite-leave-from {
    transform: translateY(0px);
    opacity: 1;
  }



  .songLrc-enter-from,
  .songLrc-leave-to {
    opacity: 0;
    transform: translateY(20px);
  }

  .songLrc-enter-active,
  .songLrc-leave-active {
    transition: all 0.2s ease-in;
  }

  .songLrc-enter-to,
  .songLrc-leave-from {
    opacity: 1;
    transform: translateY(0px);
  }

}
</style>
