<template>
    <div class="main" style="height: 80%" @mouseover="showLine" @mouseout="hideLine">
        <div class="line" ref="line" :class="{opacity:!showLineFlag}" @click="gotoPlay">
            <div class="time">{{dayjsMMSS(scroolTime)}}</div>
            <i class="iconfont icon-gf-play"></i>
        </div>
        <el-scrollbar height="80%" ref="scrollbarRef" @scroll="barScroll">
            <div class="lrc">
                <div :class="{
                    playingColor: isPlaying(
                    lrc[index]?.time,
                    lrc[index + 1]?.time
                    ),
                    hover:isHover(index,value.time),
                    weight: isNMColor,
                }" class="lrc-block lrc-block-weight" v-for="(value, index) in lrc" :data-time="value.time"
                    :data-index="String(index)">
                    <div class="lrc-main lrcRush">
                        {{ value.lyric }}
                    </div>
                    <div v-if="
                    yinOryi[1] == true &&
                    romalrc != undefined &&
                    Number(romalrc?.length) != 0
                    " class="lrc-roma">
                        {{ $roma(index) }}
                    </div>
                    <div v-else-if="
                    yinOryi[0] == true && tlyric != undefined && Number(tlyric?.length) != 0
                    " class="lrc-tly">
                        {{ $tly(index) }}
                    </div>
                </div>
            </div>
        </el-scrollbar>
        <div class="option" v-show="showLineFlag">
            <div class="top">
                <div class="shang" @click="jian">
                    <i class="iconfont icon-xialajiantou1"></i>
                </div>
                <div class="xia" @click="jia">
                    <i class="iconfont icon-xiangxiajiantou"></i>
                </div>
            </div>
            <div class="bottom">
                <div class="yin" :class="{optionColor:yinOryi[1]}" @click="isClick(1)"
                    v-show="romalrc?.length !== 1 && romalrc?.length !== 0">
                    <span>音</span>
                </div>
                <div class="yi" :class="{optionColor:yinOryi[0]}" @click="isClick(0)"
                    v-show="tlyric?.length !== 1 && tlyric?.length !== 0">
                    <span>译</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { ref, toRef, Ref, getCurrentInstance, ComponentInternalInstance, watch, nextTick, toRaw } from 'vue'
import { useMain, useMainMenu, useElectronToApp,useGlobalVar } from "@renderer/store";
import { dayjsMMSS } from '@renderer/utils/dayjs'
import { ElScrollbar } from "element-plus";
import { useRoute } from 'vue-router';
const $route = useRoute()
const Main = useMain();
let ciId = toRef(Main,'ciId') as Ref<number>;
let mainId = toRef(Main,'mainId') as Ref<number>;
// let t3 =setInterval(()=>{
//     ciId = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci')
//     if(ciId != undefined){
//         clearInterval(t3)
//     }
// },5000)
// let t2 =setInterval(()=>{
//   mainId = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci')
//     if(mainId != undefined){
//         clearInterval(t2)
//     }
// },5000)
// const ciId = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci');
// const mainId = window.electron.ipcRenderer.sendSync('getWindowId', 'Main');
const MainMenu = useMainMenu()
const $el = getCurrentInstance() as ComponentInternalInstance;
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>();
const globalVar = useGlobalVar()

const props = defineProps<{
  currentTime: number;
  lyricOffset?: number;
  type:'FM' | 'song'
}>();

let showLineFlag = ref(false)
let time: any;
let flag = ref(true)
let scroolTime = ref(0)
let scrollLrc = ref(0);

let playingTime = toRef(props, "currentTime") as Ref<number>;
let eqi = toRef(props, "lyricOffset") as Ref<number>;

let detailStatus = toRef(Main, "detailStatus");
let mainColor = toRef(MainMenu, "colorBlock");

const $emit = defineEmits(['goTotime','scrollEvent'])
//点击跳转播放
const gotoPlay = () => {
  $emit('goTotime', scroolTime.value)
}

type lrcType = [
    {
        lyric: string;
        time: number;
    }
];

let lrc = ref<lrcType>([{ lyric: "", time: 0 }]);
let romalrc = ref<lrcType>([{ lyric: "", time: 0 }]);
let tlyric = ref<lrcType>([{ lyric: "", time: 0 }]);
//歌词
window.electron.ipcRenderer.on("resolved-lrc", ({}, objArr: any) => {
    if(props.type == Main.songType){
      const lrcObj = JSON.parse(objArr)
      lrc.value = lrcObj.lrc;
      romalrc.value = lrcObj.romalrc;
      tlyric.value = lrcObj.tlyric;
      if(romalrc.value != undefined &&Number(romalrc.value?.length) != 0 && (tlyric.value == undefined || Number(tlyric.value?.length) == 0) ){
        yinOryi.value[1] = true
        if(yinOryi.value[0] == true) yinOryi.value[0] = false
      }
      else if(tlyric.value != undefined &&Number(tlyric.value?.length) != 0 && (romalrc.value == undefined || Number(romalrc.value?.length) == 0) ){
        yinOryi.value[0] = true
        if(yinOryi.value[1] == true) yinOryi.value[1] = false
      }
    }
});

const barScroll = (obj: any) => {
    console.log(obj.scrollTop);
    scrollLrc.value = obj.scrollTop
}

//滚动样式
let lrcOffset = ref<any>([])

const scrollWay = ()=>{
  nextTick(() => {
      lrcOffset.value.length = 0;
      let [...arr] = document.querySelectorAll('.lrcRush') as any;
      arr.forEach((dom: HTMLElement) => {
          lrcOffset.value.push(Number(dom.offsetTop))
      })
      //需要触发父事件
      $emit('scrollEvent',0)
  })
}

watch(detailStatus, () => {
    if (detailStatus.value === 'open') {
      scrollWay()
    }
})

let playingId = toRef(Main,'playing')
watch(lrc,()=>{
  if(Main.songType === 'FM'){
    console.log(lrc.value);
    console.log('激活');
    scrollWay()
  }
},{deep:true})

const isHover = (index: number, time: number) => {
    let line = $el.refs.line as HTMLElement;
    let flag: boolean;
    if (line) {
        flag = (scrollLrc.value + line.offsetTop >= lrcOffset.value[index]
            &&
            scrollLrc.value + line.offsetTop < lrcOffset.value[index + 1])
            ||
            (scrollLrc.value + line.offsetTop >= lrcOffset.value[index]
                &&
                lrcOffset.value[index + 1] == undefined)
        if (flag) scroolTime.value = time;
        return flag
    }
    return
}

const wheel = (e: WheelEvent) => {
    clearTimeout(time)
    flag.value = false;
    time = setTimeout(() => {
        flag.value = true;
    }, 2000)
}
const showLine = () => {
    showLineFlag.value = true
    window.addEventListener('wheel', wheel)
}

const hideLine = () => {
    showLineFlag.value = false
    window.removeEventListener('wheel', wheel)
}

const isPlaying = (time: number, time2: number) => {
  if(props.type == Main.songType){
    return (
        ((playingTime.value + eqi.value) * 1000 >= time && (playingTime.value + eqi.value) * 1000 < time2) ||
        ((playingTime.value + eqi.value) * 1000 >= time && time2 == undefined)
    );
  }else{
    return false
  }
};

const isNMColor = () => {
    if (mainColor.value === "NMblack") {
        return true;
    } else {
        return false;
    }
};

const $roma = (index: number) => {
    if (lrc.value && romalrc.value) {
        for (let i = 0; i < romalrc.value?.length; i++) {
            if (
                romalrc.value[i]?.time >= lrc.value[index]?.time &&
                romalrc.value[i]?.time < lrc.value[index + 1]?.time
            ) {
                return romalrc.value[i].lyric;
            }
        }
    }
    return
};

const $tly = (index: number) => {
    if (lrc.value && tlyric.value) {
        try {
            for (let i = 0; i < tlyric.value?.length; i++) {
                if (
                    tlyric.value[i]?.time >= lrc.value[index]?.time &&
                    tlyric.value[i]?.time < lrc.value[index + 1]?.time
                ) {
                    return tlyric.value[i].lyric;
                }
            }
        } catch (error) {
            console.log(error);
        }
    }
    return
};
let suoFlag = toRef(globalVar,'lrcScrollSuo');

const  smallFlag = ref(true)
watch(playingTime, () => {
  if(props.type == Main.songType){
    if(playingTime.value == 0 && suoFlag.value){
      scrollbarRef.value!.scrollTo({
        top: 0,
      });
      suoFlag.value = false
    }else{
      
      let t = playingTime.value + eqi.value
      if (t >= 0 && t <= 1) {
        scrollbarRef.value!.scrollTo({
          top: 0,
          behavior: "smooth"
        });
      }
      nextTick(()=>{
        let dom = document.querySelector(".playingColor") as HTMLElement;
        let line = $el.refs.line as HTMLElement;
        if (dom && line) {
          let newOffset = dom.offsetTop - line.offsetTop + dom.offsetHeight / 2;
          if((suoFlag.value && flag.value) || smallFlag.value){
            scrollbarRef.value!.scrollTo({
              top: newOffset
            });
            suoFlag.value = false
          }else if(flag.value){
            scrollbarRef.value!.scrollTo({
              top: newOffset,
              behavior: "smooth"
            });
          }
        }
      })
    }
  }
});

watch(playingId,()=>{
  scrollbarRef.value!.scrollTo({
    top:0
  })
  suoFlag.value = true
  playingTime.value = 0
})
//音译切换
let yinOryi = toRef(globalVar.setting,'yinOryi')
const isClick = (index:number) => {
    if(index == 0){ 
      yinOryi.value[0] = !yinOryi.value[0] 
      if(yinOryi.value[1] && yinOryi.value[0])yinOryi.value[1] = false
    }else{
      yinOryi.value[1] = !yinOryi.value[1]
      if( yinOryi.value[0] && yinOryi.value[1])yinOryi.value[0] = false
    }
}
//加0.5
const jia = () => {
    eqi.value += 0.5
    window.electron.ipcRenderer.sendTo(ciId.value, 'lyric-offset-ci', eqi.value)
    window.electron.ipcRenderer.sendTo(mainId.value, 'lyric-offset', eqi.value)
}

//减0.5
const jian = () => {
    eqi.value -= 0.5
    window.electron.ipcRenderer.sendTo(ciId.value, 'lyric-offset-ci', eqi.value)
    window.electron.ipcRenderer.sendTo(mainId.value, 'lyric-offset', eqi.value)
}

//歌词状态
// ciId
watch(yinOryi,()=>{
  console.log(toRaw(yinOryi.value));
  if(ciId.value)window.electron.ipcRenderer.sendTo(ciId.value,'yin-or-yi',toRaw(yinOryi.value))
},{immediate:true,deep:true})

//隐藏时切换模式
//smallFlag.value = true为直接跳转
document.addEventListener('visibilitychange',()=>{
  console.log($route.name,);
    if(document.hidden || Main.detailStatus != 'open' && !document.hidden  && $route.name != 'personalFM')smallFlag.value = true
    else smallFlag.value = false
})
watch(()=>Main.detailStatus,()=>{
  setTimeout(()=>{
    if(Main.detailStatus == 'open'){
      smallFlag.value = false
    }else{
      smallFlag.value = true
    }
  },250)
})
watch(()=>Main.songType,()=>{
  console.log(Main.songType);
  if(Main.songType == 'FM'){
    smallFlag.value = false
  }else if(Main.songType != 'FM' && Main.detailStatus != 'open'){
    smallFlag.value = true
  }else{
    smallFlag.value = false
  }
})
watch(()=>$route.name,()=>{
  console.log($route.name);
  if($route.name == 'personalFM'){
    setTimeout(()=>{
      smallFlag.value = false
    },250)
  }else if($route.name != 'personalFM' && Main.songType == 'FM'){
    smallFlag.value = true
  }
})
</script>

<style lang="less" scoped>
    .weight {
        font-weight: bolder !important;

        >div {
            font-weight: bolder !important;
        }
    }

      .main {
        position: relative;
        margin-top: 100px;

        :deep(.el-scrollbar) {
          margin-top: 30px;
        }

        .opacity {
          opacity: 0;
        }

        .line {
          width: 70%;
          height: 1px;
          background-image: linear-gradient(to right,
              var(--lrcChoiceLine) 10%,
              rgba(0, 0, 0, 0) 20%),
            linear-gradient(to left,
              var(--lrcChoiceLine) 10%,
              rgba(0, 0, 0, 0) 20%);
          position: absolute;
          top: 40%;
          left: 0;
          right: 0;
          margin: 0 auto;
          z-index: 9;

          i {
            position: absolute;
            right: -17px;
            top: -7px;
            bottom: 0;
            color: @font-color;
            cursor: pointer;
          }

          .time {
            position: absolute;
            left: -35px;
            top: -7px;
            bottom: 0;
            font-size: 13px;
            color: @lrc-detail-playing;
          }
        }

        .option {
          position: absolute;
          height: 80%;
          right: 20px;
          top: 0;

          >div {
            >div {
              height: 15px;
              width: 15px;
              background-color: @lrc-option-bk;
            }
          }

          .top {

            .shang,
            .xia {
              margin: 5px 0;
              display: flex;
              justify-content: center;
              align-items: center;

              >i {
                font-size: 8px;
                position: relative;
                left: -0.5px;
                color: @font-color
              }
            }
          }

          .bottom {
            position: absolute;
            bottom: 0px;
            left: auto;

            .yin,
            .yi {
              font-size: 12px;
              user-select: none;
              cursor: pointer;
              margin: 5px 0;

              >span {
                display: inline-block;
                position: relative;
                left: 1px;
                top: 1px;
                color: @small-font-color;

                &:hover {
                  color: @small-font-color-hover
                }
              }
            }

            .optionColor {
              >span {
                color: @font-color;
              }
            }
          }

        }
        .lrc {
          justify-content: center;
          align-items: center;
          display: flex;
          flex-direction: column;
          width: 80%;
          margin: 0 auto;
          margin-top: 20%;
          margin-bottom: 30%;

          .hover {
            >div {
              color: @lrc-detail-hover !important;
              // color: red !important;
            }
          }

          .playingColor {
            >div {
              color: @lrc-detail-playing !important;
            }

            .lrc-main {
              font-size: 16px !important;
            }

            .lrc-roma,
            .lrc-tly {
              font-size: 13px !important;
            }
          }

          .lrc-block {
            align-items: center;
            display: flex;
            flex-direction: column;
            text-align: center;
            margin: 15px 0;

            >div {
              display: inline-flex;
              line-height: 25px;
            }

            .lrc-main {
              color: @lrc-detail;
              font-size: 14px;
              cursor: default;

              &::selection {
                background-color: @select-color;
              }
            }

            .lrc-roma,
            .lrc-tly {
              color: @lrc-detail;
              font-size: 12px;
              cursor: default;
              // margin-top: 10px;

              &::selection {
                background-color: @select-color;
              }
            }
          }
        }
      }
</style>