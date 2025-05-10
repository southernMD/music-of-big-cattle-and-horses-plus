<template>
  <div class="songDetail" v-show="detailStatus == 'open'" id="songDetail" ref="songDetail">
    <div class="bk" ref="bk">
      <MyMainMenu :songMenu="true" :changefontColor="true" :scrollY="scrollY" ref="MyMainMenuRef">
        <template #songLrc>
          <transition name="songLrc">
            <div v-show="detailStatus == 'open' && scrollY >= 300" class="song-lrc">
              <div class="title">{{ playingList[playingindex - 1]?.name }}</div>
              <div class="lrc" :class="{ weight: isNMColor }">{{ mainMenuPlayingLrc }}</div>
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
          <div class="subtitle" v-if="Main.playingPrivileges[playingindex - 1]?.maxBrLevel != 'DJ'">
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
                {{ playingList[playingindex - 1].tns?.[0] }}</span>
              <span @dragstart="prevenDrag" v-if="
                playingList[playingindex - 1]?.alia?.length !== 0 &&
                playingList[playingindex - 1]?.alia?.length != undefined
              ">
                &nbsp;{{ playingList[playingindex - 1].alia?.[0] }}</span>
            </div>
            <div>
              <span @dragstart="prevenDrag" v-if="playingList[playingindex - 1]?.ar?.[0]?.name" class="span-singer"
                v-for="(value, index) in playingList[playingindex - 1]?.ar"
                :data-singerId="playingList[playingindex - 1]?.ar[index]?.id">
                <Singer :id="playingList[playingindex - 1]?.ar[index]?.id" :name="playingList[playingindex - 1]?.ar[index]?.name" :index="index"
                  :singerLen="playingList[playingindex - 1]?.ar.length - 1">
                </Singer>
              </span>
              <span v-else style="padding-left: 5px">未知艺人</span>
              <span>-</span>
              <span v-if="playingList[playingindex - 1]?.al?.name" class="span-zhuanji"
                :data-singerId="playingList[playingindex - 1]?.al?.id"
                >
                <ZhuanJi  @click="goZhuanji(playingList[playingindex - 1]?.al!.id)" :name="playingList[playingindex - 1]?.al?.name" :tns="playingList[playingindex - 1]?.al?.tns?.[0]"
                  :Len="playingList[playingindex - 1]?.al?.tns?.length">
                </ZhuanJi>
              </span>
              <span v-else style="padding-left: 5px">未知专辑</span>
            </div>
          </div>
          <div v-else class="subtitle">
            <div class="master">
              <span>
                <span>主播：</span><span class="url" @click.self="go(Main.playingList[playingindex - 1].dj.userId)" >南山有壶酒</span>
              </span>
              <span>
                <i class="iconfont icon-shizhong"></i>
                <span>{{dayjsStamp(Main.playingList[playingindex - 1].createTime!)}}</span>
              </span>
              <span>
                <i class="iconfont icon-gf-play"></i>
                <span>{{numberSimp(Main.playingList[playingindex - 1].listenerCount!)}}次</span>
              </span>
            </div>
          </div>
        </div>
        <div class="music" v-show="Main.playingPrivileges[playingindex - 1]?.maxBrLevel != 'DJ'">
          <div class="left" ref="left">
            <div class="bk">
              <div class="ba ba-play" ref="ba"></div>
              <div class="img" ref="pian">
                <div class="pian"></div>
              </div>
            </div>
          </div>
          <div class="middle">
            <ScroolLrc :currentTime="currentTime" :lyricOffset="lyricOffset" @goTotime="gotoPlay"
              @scrollEvent="scrollEvent" type="song"></ScroolLrc>
          </div>
          <div class="right" v-show="ifShowRight">
            <el-scrollbar height="40%">
              <div class="main">
                <div class="haveSong" v-show="simiPlaylist?.length !== 0 && NMcookie">
                  <div class="title">
                    <span>包含这首歌的歌单</span>
                    <div class="block">
                      <DetailSmallBlock v-for="(value, index) in simiPlaylist" :name="value.name" :id="value.id"
                        :url="value.coverImgUrl" type="playList"></DetailSmallBlock>
                    </div>
                  </div>
                </div>
                <div class="otherSong" v-show="simiSong?.length !== 0">
                  <div class="title">
                    <span>喜欢这首歌的人也听</span>
                    <div>
                      <DetailSmallBlock v-for="(value, index) in simiSong" :url="value.album?.blurPicUrl" :id="value.id"
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
        <div class="music music-DJ" v-if="Main.playingPrivileges[playingindex - 1]?.maxBrLevel == 'DJ'">
          <div class="left-DJ">
            <el-image :src="playingList[playingindex - 1]?.coverUrl" style="width: 270px; height: 270px;">
              <template #placeholder>
                <el-image src="/src/assets/image/cloudmusic_5e9Ef54bbN.png" style="width: 270px; height: 270px;"></el-image>
              </template>
              <template #error>
                <el-image src="/src/assets/image/cloudmusic_5e9Ef54bbN.png" style="width: 270px; height: 270px;"></el-image>
              </template>
            </el-image>
          </div>
          <div class="right-DJ">
            <div class="contain">
              <div class="DJname">{{ playingList[playingindex - 1]?.dj.brand }}</div>
              <div class="startNumber">{{ playingList[playingindex - 1]?.radio.subCount }}人收藏</div>
              <el-scrollbar style="width: 100%;">
                <div class="desc" v-html="playingList[playingindex - 1]?.description.replace(/\n/g, '<br>')">
                </div>
              </el-scrollbar>
            </div>
          </div>
        </div>
        <CommentList :commentFlag="commentFlag" :nowPage="nowPage" :hotComments="hotComments" :moreHot="moreHot"
          :total="total" :comments="comments" :totalPage="totalPage" :id="playingId" 
          :type="Main.playingPrivileges[playingindex - 1]?.maxBrLevel == 'DJ'?4:0"
          :djprogramid="Main.playingPrivileges[playingindex - 1]?.maxBrLevel == 'DJ'?Main.playingList[playingindex - 1].id:undefined"
          ></CommentList>
        <transition-group name="showWrite">
          <FloatTag @click="openCommentDialog" :key="1" v-show="showSroll" :align="'center'" :bottom="'80px'" :size="'12px'" :width="'150px'"
            :height="'30px'" :option="'write'" @write="write">
            <template #default>
              <div>
                <i class="iconfont icon-w_shuxie"></i> 发表我的音乐评论
              </div>
            </template>
          </FloatTag>
          <FloatTag @click="openCommentDialog"  :key="2" v-show="!showSroll" :width="'90px'" :size="'12px'" :right="'15%'" :bottom="'80px'"
            :height="'30px'" :option="'write'" @write="write">
            <template #default>
              <div>
                <i class="iconfont icon-w_shuxie"></i>写评论
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
  </div>
</template>

<script lang="ts" setup>

import { useMain, useMainMenu, useElectronToApp, useGlobalVar, useNM } from "@renderer/store";
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
  inject,
} from "vue";
import Vibrant from 'node-vibrant';
import { ElScrollbar } from "element-plus";
import { useRouter } from 'vue-router'
import {dayjsStamp} from '@renderer/utils/dayjs'
import { numberSimp } from "@renderer/utils/numberSimp";
import MyMainMenu from '@renderer/components/MyMainMenu/index.vue'
import ZhuanJi from '@renderer/components/myVC/LineMusic/ZhuanJi/index.vue'
import Singer from '@renderer/components/myVC/LineMusic/Singer/index.vue'
const Main = useMain();
const NM = useNM()
const MainMenu = useMainMenu();
const $el = getCurrentInstance() as ComponentInternalInstance;
const $router = useRouter()
let windowMidlle = toRef(MainMenu, "model");
let playStatus = toRef(Main, "playStatus");
let playingindex = toRef(Main, "playingindex");
let playingList = toRef(Main, "playingList");
let detailStatus = toRef(Main, "detailStatus");
let playingId = toRef(Main, "playing");
const NMcookie = ref(true)
watch(detailStatus,()=>{
  if(localStorage.getItem('NMcookie'))NMcookie.value = false
})

defineProps<{
  currentTime: number;
  lyricOffset: number;
  simiPlaylist: any;
  simiSong: any;
}>();


let mainMenuPlayingLrc = ref('')
window.electron.ipcRenderer.on('Main-Menu-song-lrc', ({ },{data}) => {
  mainMenuPlayingLrc.value = data;
})
//回到顶部
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
  console.log('写评论');
}

//滚动出现
let showSroll = ref(false);
//因显示歌词而隐藏搜索
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
  if (playingId.value > 0) {
    let result
    if(Main.playingPrivileges[Main.playingindex - 1]?.maxBrLevel != 'DJ'){
      if(localStorage.getItem('NMcookie')){
        result = (await NM.reqCommentMusic(playingId.value, 20, 0)).data
      }else{
        try {
          result = (await Main.reqCommentMusic(playingId.value, 20, 0)).data
        } catch (error) {
          result = {
            hotComments:[],
            comments:[],
            total:0,
            moreHot:false
          }
        }
      }
    }else{
      result = (await Main.reqCommentDj(Main.playingList[Main.playingindex - 1].id, 20, 0)).data
    }
    hotComments.value = result.hotComments;
    comments.value = result.comments;
    total.value = result.total

    totalPage.value = Math.ceil((total.value) / 20)

    moreHot.value = result.moreHot
    commentFlag.value = true
    nowPage.value = 1;
  }else{
     hotComments.value = []
     comments.value = []
     total.value = 0
     totalPage.value = 0
     nowPage.value = 1
     moreHot.value = false
  }

})

const addc:Ref<any> = inject('addc')!
watch(addc,()=>{
    if(addc.value != null){
      comments.value.unshift(addc.value)
      addc.value == null
    }
})

let ifShowRight = ref(true)

const showRight = () => {
  ifShowRight.value = !ifShowRight.value
}


const $emit = defineEmits(['goTotime','openCommentDialog'])
//点击跳转播放
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
const globalVar = useGlobalVar()
const MyMainMenuRef = ref<InstanceType<typeof MyMainMenu>>()
watch(playingindex, async () => {
  if (playingindex.value != -1) {
    let pian = $el.refs.pian as HTMLElement;
    let imgUrl = playingList.value[playingindex.value - 1]?.al?.picUrl
    if(!imgUrl){
      const songAlId = playingList.value[playingindex.value - 1]?.al?.id!
      imgUrl = (await Main.reqAlbum(songAlId)).data.album.picUrl
      playingList.value[playingindex.value - 1]["al"]["picUrl"] = imgUrl
  }
    pian.style.backgroundImage = "url(" + imgUrl + ")";
    if (!globalVar.oneself && MainMenu.colorBlock != 'NMblack') {
      const image = new Image();
      image.crossOrigin = 'Anonymous'
      image.src = playingList.value[playingindex.value - 1]?.al?.picUrl;
      const vibrant = new Vibrant(image);
      let maxPopulation = 0
      let hc: [number, number, number] = [0, 0, 0]
      vibrant.getPalette().then((palette) => {
        console.log(palette);
        for (let key of Object.keys(palette)) {
          if (palette[key]!.population > maxPopulation) {
            maxPopulation = palette[key]!.population
            hc[0] = palette[key]!.hsl[0] * 360
            hc[1] = palette[key]!.hsl[1] * 100
            hc[2] = palette[key]!.hsl[2] * 100
          }
        }
        console.log(maxPopulation);
        if (hc[0] !== 0) {
          hc[1] = 30;
          hc[2] = 85;
        }
        const bk: any = $el.refs.bk as HTMLElement
        bk.style.backgroundColor = 'transparent';
        bk.style.backgroundImage = 'linear-gradient(hsl(' + hc[0] + ',' + hc[1] + "%," + hc[2] + '%),#fff)'
        //@ts-ignore
        MyMainMenuRef.value.$refs.header.style.backgroundColor = 'transparent';
        //@ts-ignore
        MyMainMenuRef.value.$refs.header.style.backgroundImage = `hsl(${hc[0]},${hc[1]},${hc[2]})`
      })
    }

    //清除歌词滚动
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

watch(() => MainMenu.colorBlock, () => {
  if (!globalVar.oneself && MainMenu.colorBlock != 'NMblack') {
    const image = new Image();
    image.crossOrigin = 'Anonymous'
    image.src = playingList.value[playingindex.value - 1]?.al?.picUrl;
    const vibrant = new Vibrant(image);
    let maxPopulation = 0
    let hc: [number, number, number] = [0, 0, 0]
    vibrant.getPalette().then((palette) => {
      console.log(palette);
      for (let key of Object.keys(palette)) {
        if (palette[key]!.population > maxPopulation) {
          maxPopulation = palette[key]!.population
          hc[0] = palette[key]!.hsl[0] * 360
          hc[1] = palette[key]!.hsl[1] * 100
          hc[2] = palette[key]!.hsl[2] * 100
        }
      }
      console.log(maxPopulation);
      if (hc[0] !== 0) {
        hc[1] = 30;
        hc[2] = 85;
      }
      const bk: any = $el.refs.bk as HTMLElement
      bk.style.backgroundColor = 'transparent';
      bk.style.backgroundImage = 'linear-gradient(hsl(' + hc[0] + ',' + hc[1] + "%," + hc[2] + '%),#fff)'
      //@ts-ignore
      MyMainMenuRef.value.$refs.header.style.backgroundColor = 'transparent';
      //@ts-ignore
      MyMainMenuRef.value.$refs.header.style.backgroundImage = `hsl(${hc[0]},${hc[1]},${hc[2]})`
    })
  } else {
    const bk: any = $el.refs.bk as HTMLElement
    bk.style.backgroundColor = '';
    bk.style.backgroundImage = ""
    //@ts-ignore
    MyMainMenuRef.value.$refs.header.style.backgroundImage = ''
    //@ts-ignore
    MyMainMenuRef.value.$refs.header.style.backgroundColor = '';
  }
})

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

//lrc面板呼叫songDetail
window.electron.ipcRenderer.on('lrc-open-playDetail', () => {
  if (Main.songType == 'FM') {
    $router.push({
      path: '/app/personalFM',
      query: {
        name: 'personalFM'
      }
    })
  } else {
    detailStatus.value = 'open'
  }
})

const prevenDrag = (e: MouseEvent) => {
  e.preventDefault();
};

let BKbase64 = inject<Ref<string>>('BKbase64') as Ref<string>
watch(BKbase64, () => {
  const h: any = $el.refs.songDetail as HTMLElement
  if (h) h.style.backgroundImage = 'url(' + BKbase64.value + ')'
})
window.electron.ipcRenderer.on('file-ready', ({ }, { liu, extname }) => {
  console.log(liu, extname);
  const file = new File([liu], `background.${extname}`, { type: `image/${extname}` });
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = function () {
    const newUrl = this.result;
    const h: any = $el.refs.songDetail as HTMLElement
    h.style.backgroundImage = 'url(' + newUrl + ')'
  };
})

const goZhuanji = (id)=>{
  detailStatus.value = 'close'
  $router.push({
        name:'songPlaylist',
        query:{
          id,type:"专辑",my:'false'
        }
    })
}

const openCommentDialog = ()=>{
  $emit('openCommentDialog')
}

const go = (id)=>{
    Main.detailStatus = 'close'
    $router.push({
        name:'PersonalCenter',
        query:{
            id
        }
    })
}

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
  height: 100vh;
  position: fixed;
  bottom: 0px;
  left: 0px;
  background-color: @other-bk-color;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  z-index: 11;

  >.bk {
    width: 100vw;
    height: 100vh;
    background-color: @other-bk-color-op;
  }
  >.bk{
    :deep(header) {
      background-color: @other-bk-color;
    }
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
        z-index: 1;
        position: relative;
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
        .span-singer{
          cursor: pointer;
          user-select: none;
          &:hover{
            color: @small-font-color-hover;
          }
        }
        .span-zhuanji{
          cursor: pointer;
          user-select: none;
          &:hover{
            color: @small-font-color-hover;
          }
        }
      }
      .master{
        user-select: none;
        &>span{
          margin:0 5px;
          display: inline-block;
        }
        .url{
          color: @url-color;
          cursor: pointer;
          user-select: none;
        }
        i{
          font-size: 12px;
          margin-right: 2px;
        }
      }
    }
    .subtitleDj{
      display: flex;
      flex-direction: row;
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

    .left-DJ{
      height: 80%;
      width: 350px;
      display: flex;
      justify-content: center;
      align-items: center;
      >.el-image{
        border-radius: .5em;
      }
    }
    .right-DJ{
      height: 80%;
      width: 40%;
      min-width:300px;
      display: flex;
      justify-content: center;
      align-items: center;
      .contain{
        height: 270px;
        min-width:300px;
        width: 90%;
        display: flex;
        flex-direction: column;
        align-items: self-start;
        .DJname{
          font-size: 20px;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
          width: 100%;
          color: @font-color;
          height: 30px;
        }
        .startNumber{
          font-size: 13px;
          color: @font-color;
          margin-bottom: 20px;
        }
        .desc{
          height: calc(100% - 30px);
          color: @small-font-color;
          font-size: 14px;
          line-height: 20PX;
        }
      }
    }
  }
  .music-DJ{
    margin-top: 50px;
    height: 50vh;
    justify-content: center;
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

  // color: #d19550;
  // color: rgb(32, 171, 223);
  // color: hsl(28, 50%, 88%);
  // color: hsl(27, 36%, 85%);
  // color: hsl(23, 27%, 85%);
  // color: hsl(0, 2%, 82%);
  // color: hsl(198, 36%, 86%);
  // color: hsl(16, 18%, 88%);
  // color: hsl(4, 14%, 79%);
  // color: hsl(209, 34%, 88%);
  // color: hsl(42, 30%, 80%);
}
</style>
