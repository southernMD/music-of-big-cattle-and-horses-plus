<template>
  <!-- <el-config-provider size="small" :z-index="3000" :locale="zhCn"> -->
  <!-- </el-config-provider> -->
  <div class="main" :class="{'main-oneself':globalVar.oneself == 1,'red-line':MainMenu.colorBlock == 'NMblack'}" >
    <el-scrollbar ref="scrollbarRefLeft" @scroll="barLeft" style="width: 200px;">
      <aside @mouseover="leftOver" :class="{'aside-right-color-oneself':globalVar.oneself == 1}">
        <div class="top">
          <LeftBlock message="发现音乐" :big="true" name="findMusic">
          </LeftBlock>
          <LeftBlock message="播客" :big="true" name="djPlay" v-if="false">
          </LeftBlock>
          <LeftBlock message="关注" :big="true" name="follow">
          </LeftBlock>
          <!-- <LeftBlock message="私人FM" :big="true" name="personalFM">
          </LeftBlock> -->
        </div>
        <div class="middle">
          <div class="title" :class="{'oneself-title':globalVar.oneself == 1}">
            <span>我的音乐</span>
          </div>
          <div class="list-my-music">
            <LeftBlock message="本地与下载" :big="false" name="downloaded">
              <template #default>
                <i class="iconfont icon-xiazai"></i>
              </template>
              <template #jump v-if="Main.beforePlayListId == 0 || Main.beforePlayListId == -2">
                  <i v-if="Main.playStatus == 'play'" class="iconfont icon-shengyin_shiti songStatus"></i>
                  <i v-else-if="Main.playStatus == 'stop'" class="iconfont icon-shengyin03-mianxing songStatus"></i>
                </template>
            </LeftBlock>
            <LeftBlock message="最近播放" :big="false" name="Latelyplay">
              <template #default>
                <i class="iconfont icon-shizhong"></i>
              </template>
            </LeftBlock>
            <LeftBlock v-if="false" message="我的音乐云盘" :big="false" name="cloud">
              <template #default>
                <i class="iconfont icon-yun_o"></i>
              </template>
            </LeftBlock>
            <!-- <LeftBlock  v-if="!isNM" message="我的播客" :big="false" name="mydj" >
              <template #default>
                <i class="iconfont icon-changpian"></i>
              </template>
            </LeftBlock> -->
            <LeftBlock v-if="BasicApi?.profile?.userId" message="我的收藏" :big="false" name="myStart">
              <template #default>
                <i class="iconfont icon-wodeshoucang"></i>
              </template>
            </LeftBlock>
          </div>
        </div>
        <div class="play-list">
          <div class="title" >
            <div class="option" @click="showPlay" :class="{noDrag:!Main.dragMouse}">
              <span :class="{'onself':globalVar.oneself == 1}">创建的歌单</span>
              <i class="iconfont icon-xiajiantou" :class="{'onself':globalVar.oneself == 1}" v-if="playlistFlag"></i>
              <i class="iconfont icon-youjiantou" :class="{'onself':globalVar.oneself == 1}" v-else></i>
            </div>
            <div class="more" @click="addPlay">
              <i class="iconfont icon-jiahao_o"></i>
            </div>
          </div>
          <div class="play-main-list" v-show="playlistFlag">
            <div class="Ilike">
              <LeftBlock data-right="1" data-type="playListLike" 
              :data-txt="`歌单：${Main.playList[0]?.name} by ${Main.playList[0]?.creator?.nickname}`" 
              :data-pic="Main.playList[0]?.coverImgUrl"
              :big="false" :privacy="+Main.playList[0]?.privacy" message="我喜欢的音乐" :id="Main.playList[0]?.id"
                :index="0">
                <template #default>
                  <i class="iconfont icon-aixin"></i>
                </template>
                <template #jump>
                  <div class="bk" v-show="false" :class="{'bk-oneself':globalVar.oneself == 1}" @click.stop="heartJump" title="开启鸡动模式">
                    <i class="iconfont icon-xindong"></i>
                  </div>
                </template>
              </LeftBlock>
            </div>
            <div class="other">
              <LeftBlock data-right="1" data-type="playListMy" 
                :data-txt="`歌单：${Main.playList[valueIndex]?.name} by ${Main.playList[valueIndex]?.creator?.nickname}`" 
                :data-pic="Main.playList[valueIndex]?.coverImgUrl"
                v-for="(valueIndex, index) in Main.createPlay" :privacy="+Main.playList[valueIndex]?.privacy"
                :message="Main.playList[valueIndex]?.name" :big="false" :id="Main.playList[valueIndex]?.id"
                :index="valueIndex" :key="Main.playList[valueIndex]?.id">
                <template #default v-if="+Main.playList[valueIndex]?.privacy == 10">
                  <i class="iconfont icon-suoding_o"></i>
                </template>
                <template #default v-else>
                  <i class="iconfont icon-icon--"></i>
                </template>
                <template #jump v-if="Main.beforePlayListId == Main.playList[valueIndex]?.id">
                  <i v-if="Main.playStatus == 'play'" class="iconfont icon-shengyin_shiti songStatus"></i>
                  <i v-else-if="Main.playStatus == 'stop'" class="iconfont icon-shengyin03-mianxing songStatus"></i>
                </template>
              </LeftBlock>
            </div>

          </div>
        </div>
        <div class="start-list" v-if="Main.startPlay">
          <div class="title">
            <div class="option" @click="showStart" :class="{noDrag:!Main.dragMouse}">
              <span :class="{'onself':globalVar.oneself == 1}">收藏的歌单</span>
              <i :class="{'onself':globalVar.oneself == 1}" class="iconfont icon-xiajiantou" v-if="startlistFlag"></i>
              <i :class="{'onself':globalVar.oneself == 1}" class="iconfont icon-youjiantou" v-else></i>
            </div>
          </div>
          <div class="start-main-list" v-show="startlistFlag">
            <div class="other">
              <LeftBlock data-right="1" data-type="playListStart" 
                :data-txt="`歌单：${Main.playList[valueIndex + Main.createPlay]?.name} by ${Main.playList[valueIndex + Main.createPlay]?.creator?.nickname}`" 
                :data-pic="Main.playList[valueIndex + Main.createPlay]?.coverImgUrl"
                v-for="(valueIndex, index) in Main.startPlay"
                :message="Main.playList[valueIndex + Main.createPlay]?.name"
                :privacy="+Main.playList[valueIndex + Main.createPlay]?.privacy"
                :id="Main.playList[valueIndex + Main.createPlay]?.id" :index="valueIndex + Main.createPlay" :big="false"
                :key="Main.playList[valueIndex + Main.createPlay]?.id">
                <template #default v-if="+Main.playList[valueIndex + Main.createPlay]?.privacy == 10">
                  <i class="iconfont icon-suoding_o"></i>
                </template>
                <template #default v-else>
                  <i class="iconfont icon-icon--"></i>
                </template>
              </LeftBlock>
            </div>
          </div>
        </div>
      </aside>
    </el-scrollbar>
    <main @mouseover="rightOver" id="mainWindow">
      <div class="stopS" v-if="route.path.includes('setting') || route.path.includes('findMusic') || route.path.includes('download')">
        <header>
          <Tag :class="{'tag-oneself':globalVar.oneself == 1}" v-for="(value,index) in messageList" :message="value" :big="true" :size="16" :ifClick="clickFlag[index]" :name="routeName[index]"
            @click="go(index)"></Tag>
            <div class="setting" v-if="route.path.includes('setting')">设置</div>
        </header>
      </div>
      <el-scrollbar ref="scrollbarRef" @scroll="barRight">
        <!-- <router-view></router-view> -->
        <router-view v-slot="{ Component }">
          <keep-alive>
              <component v-if="$route.meta.keepAlive && $route.name == 'PersonalCenter' " :is="Component" />
          </keep-alive>
        </router-view>
        <router-view v-slot="{ Component }">
          <keep-alive>
              <component v-if="$route.meta.keepAlive && $route.name == 'personalFM' " :is="Component" />
          </keep-alive>
        </router-view>
        <router-view v-slot="{ Component }">
          <keep-alive>
              <component v-if="$route.meta.keepAlive && $route.path.includes('myStart') " :is="Component" />
          </keep-alive>
        </router-view>
        <router-view v-if="!$route.meta.keepAlive" />
      </el-scrollbar>
      <LocationSong v-show="Number(route.query.id) == Main.beforePlayListId" @scroolToSong="scroolToSong">
      </LocationSong>
    </main>
  </div>
  <MyDialog :flag="addPlayFlag" @confirm="createPlayList" @cancel="addPlayFlag = false " @closeDialog="addPlayFlag = false">
    <template #header>
      <span class="title1">新建歌单</span>
    </template>
    <template #midle>
      <div class="create">
        <el-input ref="inputAddPlayListRef" @focus="inputFn" @blur="inputRemove" v-model="playListName" placeholder="请输入新歌单标题"></el-input>
        <el-checkbox v-model="yinsi" size="large" label="设置为隐私歌单"></el-checkbox>
      </div>
    </template>
  </MyDialog>
</template>
<script setup lang="ts">
  import { ElScrollbar } from 'element-plus'
//   import zhCn from 'element-plus/lib/locale/lang/zh-cn'
import { toRef, ref, watch,nextTick, Ref, Suspense } from 'vue';
import { useMainMenu, useMain,useGlobalVar,useBasicApi,useNM } from '../store'
import { useRoute, useRouter } from 'vue-router';

import LeftBlock from './myVC/LeftBlock.vue';
import MyDialog from './myVC/MyDialog.vue';

const MainMenu = useMainMenu();
const Main = useMain();
const route = useRoute();
const globalVar = useGlobalVar()
const $router = useRouter();
const BasicApi = useBasicApi();
const NM = useNM()
const messageList:Ref<any[]> = ref([])
const routeName:Ref<any[]> = ref([])
// const findMusic = ['个性推荐', 'q2', 'q3']
const findMusic = ['个性推荐']
// const findMusicRouteName = ['personalRecommend', 'q1', 'q2']
const findMusicRouteName = ['personalRecommend']
const downloadMusic = ['下载管理', '本地音乐']
const downloadMusicRouteName = ['downloaded', 'local']
let clickFlag = ref([true, false, false])
const isNM = ref(false)
if(localStorage.getItem('NMcookie'))isNM.value = true
else isNM.value = false
watch(route,()=>{
  messageList.value.length = 0
  routeName.value.length = 0
  if(route.path.includes('findMusic')){
    messageList.value.push(...findMusic)
    routeName.value.push(...findMusicRouteName)
    clickFlag.value .fill(false)
  }else if(route.path.includes('download')){
    messageList.value.push(...downloadMusic)
    routeName.value.push(...downloadMusicRouteName)
    clickFlag.value .fill(false)
    if(route.path.includes('manage'))clickFlag.value[0] = true
  }
},{immediate:true})

const go = (index: number) => {
  clickFlag.value.forEach((element, i) => {
    clickFlag.value[i] = false
  })
  clickFlag.value[index] = true
  $router.push({
    name:routeName.value[index] ,
  })
}

watch(route,()=>{
  // if(routeName.value.includes(String(route.name)) && route.name!='downloading'){
  //   clickFlag.value = [false, false, false]
  // }
})

// let ifLogin = toRef(BasicApi, 'account')
let playlistFlag = ref(true);
let startlistFlag = ref(true);

let whereMouse = ref('none')
const leftOver = () => {
  whereMouse.value = 'left'
}

const rightOver = () => {
  whereMouse.value = 'right'
}

//滚动到顶部
const scrollbarRef = ref<InstanceType<typeof ElScrollbar>>()
const scrollbarRefLeft = ref<InstanceType<typeof ElScrollbar>>()
watch(route, () => {
  console.log(route.name);
  scrollbarRef.value!.setScrollTop(0)
})

let scrollToTop = toRef(globalVar,'scrollToTop')
watch(scrollToTop,()=>{
  if(scrollToTop.value == true){
    nextTick(()=>{
      scrollbarRef.value!.setScrollTop(0)
      scrollToTop.value = false
    })
  }
})
//滚动到当前播放歌曲
const scroolToSong = () => {
  let step = 130 + 35 * Main.playingindex
  console.log('拖动滚动事件');
  scrollbarRef.value!.setScrollTop(step)
}

let pageY = toRef(Main, 'pageY')
watch(pageY, () => {
  // console.log(document.documentElement.clientHeight - pageY.value);
  // console.log(pageY.value);
  if (Main.dragMouse) {
    if (document.documentElement.clientHeight - pageY.value < 80) {
      if (whereMouse.value == 'right') {
        
        scrollbarRef.value!.scrollTo({
          top: rightScroll.value + 40,
        })
      } else {
        scrollbarRefLeft.value!.scrollTo({
          top: leftScroll.value + 40,
        })
      }
    } else if (pageY.value < 40) {
      if (whereMouse.value == 'right') {
        scrollbarRef.value!.scrollTo({
          top: rightScroll.value - 20,
        })
      } else {
        scrollbarRefLeft.value!.scrollTo({
          top: leftScroll.value - 20,
        })
      }
    }
  }

})

type scrollObj = {
  scrollLeft: number,
  scrollTop: number
}

let leftScroll = ref(0)
const barLeft = (scrollObj: scrollObj) => {
  leftScroll.value = scrollObj.scrollTop

}

let rightScroll = ref(0)
const barRight = (scrollObj: scrollObj) => {
  rightScroll.value = scrollObj.scrollTop
  globalVar.mainScroll = scrollObj.scrollTop
}

//右键菜单
window.addEventListener('contextmenu', (e) => {
  e.preventDefault()
  e.stopPropagation()
  if (e.pageY > MainMenu.Height) {
    window.electron.ipcRenderer.send('show-context-menu')
  }
})

const showPlay = () => {
  console.log('展开歌单');
  playlistFlag.value = !playlistFlag.value
}

const addPlayFlag = toRef(globalVar,'addPlayFlag')
watch(addPlayFlag,()=>{
  if(addPlayFlag.value == true && BasicApi.profile == null){
    globalVar.flagLogin = true
    addPlayFlag.value = false
  }
})
const yinsi = ref(false)
const playListName = ref('')
const addPlay = () => {
  addPlayFlag.value = true
  console.log('增加歌单');
}
const createPlayList = async()=>{
  if(playListName.value.length == 0)return
  globalVar.loadDefault = true
  addPlayFlag.value = false
  let result 
  if(!localStorage.getItem('NMcookie')){
    result = await Main.reqPlayListCreate(playListName.value,yinsi.value?10:undefined)
  }else{
    result = await NM.reqPlayListCreate(playListName.value,yinsi.value?10:undefined)
  }
  if(result.id){
    if(globalVar.addPlayId.length == 0){
      globalVar.loadDefault = false
      globalVar.loadMessageDefault = '创建歌单成功'
      globalVar.loadMessageDefaultFlag = true
      if(route.name == 'songPlaylist'){
        $router.replace({
          name:'songPlaylist',
          query:{
            my:'true',
            id:Main.playList[+route.query.index! + 1].id,
            index:+route.query.index! + 1,
            type:'歌单'
          }
        })
      }
    }
    Main.playListId.splice(1,0,result.id)
    Main.playList.splice(1,0,result)
    Main.createPlay++
    if(globalVar.addPlayId.length != 0){
      let result2
      if(localStorage.getItem('NMcookie')){
        result2 = (await NM.reqPlaylistTracks('add',result.id,globalVar.addPlayId)).data
      }else{
        result2 = (await Main.reqPlaylistTracks('add',result.id,globalVar.addPlayId)).data
      }
      if(result2.url){
        Main.playList[1].coverImgUrl = result.url
      }
        globalVar.loadDefault = false
        if (result2.body.code == 200 || (result2.code == 200 && localStorage.getItem('NMcookie'))) {
          globalVar.loadMessageDefault = '已收藏到歌单'
          globalVar.loadMessageDefaultFlag = true 
          Main.playList[1].trackCount += globalVar.addPlayId.length
        }
      globalVar.addPlayId = []
    }
  }else{
    globalVar.loadDefault = false
    globalVar.loadMessageDefaultFlag = true
  }

  console.log(result);
}

// const heartJump = async () => {
//   console.log('开启心动');
//   console.log('获取心动模式列表');
//   if (!Main.heartJump) {
//     Main.wayIndex = 4
//     Main.heartJump = true
//     let result: Array<any> = (await Main.reqPlaymodeIntelligenceList(Main.likes[0], Number(Main.playList[0].id))).data.data
//     console.log(result);
//     let idArr = [] as unknown as [number]
//     result.forEach((element) => {
//       idArr.push(element.id)
//     })
//     let songList = (await (Main.reqSongDetail(idArr))).data
//     Main.playingList = songList.songs
//     Main.playingPrivileges = songList.privileges
//     Main.beforePlayListId = Main.playList[0].id
//     Main.playingindex = 1
//     Main.playing = Main.playingList[0].id
//     let str = Main.playingList[0].name +' - ';
//     let singerArr = Main.playingList[0].ar as Array<any>
//     singerArr.forEach((element,index)=>{
//         str+=element.name
//         if(index != singerArr.length - 1)str+=' / '
//     })
//     electronIpc.ipcSend('change-play-thum',str)
//     electronIpc.ipcSend('render-play')
//   } else {
//     Main.detailStatus = 'open'
//   }

// }

const showStart = () => {
  console.log('展开收藏歌单');
  startlistFlag.value = !startlistFlag.value
}

//右键菜单
// window.addEventListener('contextmenu', (e) => {
//   e.preventDefault()
//   e.stopPropagation()
//   if (e.pageY > MainMenu.Height) {
//     window.electron.ipcRenderer.send('show-context-menu')
//   }
// })

watch(()=>globalVar.changeMainScroll,()=>{
  if(globalVar.changeMainScroll!=0){
    scrollbarRef.value!.setScrollTop(rightScroll.value + globalVar.changeMainScroll)
    globalVar.changeMainScroll = 0;
  }
})

import {modInput} from '../utils/modInput'
const inputAddPlayListRef = ref()

const onKeyDown = (event: KeyboardEvent) => {
  playListName.value = modInput(event, inputAddPlayListRef.value.ref, playListName.value);
}

const inputFn = ()=>{
  window.addEventListener('keydown',onKeyDown)
}

const inputRemove = ()=>{
  window.removeEventListener('keydown',onKeyDown)
}
</script>

<style lang="less" scoped>
.red-line{
  border-top: 2px solid #b72525 !important;
}
.noDrag {
  cursor: pointer;
}
.onself{
  color: @oneselfFontColor !important;
}

.main {
  background-color: @other-bk-color;
  width: 100vw;
  height: calc(100vh - 60px - 70px);
  position: fixed;
  top: 60px;
  left: 0px;
  display: flex;
  color: @font-color;
  border-top: 2px solid transparent;
  aside {
    width: 200px;
    min-height: calc(100vh - 60px - 70px);
    box-sizing: border-box;
    border-right: 1px solid;
    border-right-color: @split-line-color;

    .top {
      padding-left: 10px;
      padding-top: 15px;
    }

    .middle {
      .title {
        width: 180px;
        height: 40px;
        display: flex;
        font-size: 15px;
        align-items: center;
        color: @small-font-color;
        user-select: none;
        padding-left: 5px;
        margin: 0 auto;
        &>span {
          padding-left: 5px;
          padding-top: 2px;
          font-size: 14px;
        }
      }
      .oneself-title{
        color: @oneselfFontColor;
      }

      .list-my-music {
        padding-left: 5px;
        width: 180px;
        margin: 0 auto;

        i {
          padding-left: 5px;
          font-size: 15px !important;
          font-weight: normal !important;
        }
        .songStatus {
            color: @small-font-red !important;
          }
      }
    }

    .play-list {
      user-select: none;

      .title {
        width: 180px;
        height: 40px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .option {
            color: @small-font-color;
          span {
            padding-left: 5px;
            padding-top: 2px;
            font-size: 13px;
          }


          i {
            font-size: 8px;
            display: inline-block;
            transform: translate(4px, -2px);
          }
        }
        .option-onself{
          span,i{
            color: @oneselfFontColor !important;
          }
        }

        .more {
          cursor: pointer;
        }
      }

      .play-main-list {
        .Ilike {
          &:first-child {
            padding-left: 10px;

            i {
              padding-left: 5px;
            }
          }

          .bk {
            width: 60px;
            height: 25px;
            background-color: @other-bk-color;
            border-radius: 2em;
            border: 1px solid;
            border-color: @split-line-color;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-left: 5px;
            margin-right: 5px;

            &:hover {
              background-color: @line-color-click;
            }

            >i {
              padding: 0 0;
            }
          }
          .bk-oneself{
            background-color: rgb(43,43,43);
            border-color: rgb(61,61,64);
            &:hover{
              background-color: rgb(65, 65, 65);
            }
          }
        }

        .other {
          &>div {
            margin-left: 10px;

            i {
              padding-left: 5px;
              height: 100%;
              line-height: 40px;
            }
          }

          .songStatus {
            color: @small-font-red !important;
          }
        }

      }
    }

    .start-list {
      user-select: none;

      .title {
        font-size: 15px;
        width: 180px;
        height: 40px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .option {

          span {
            padding-left: 5px;
            padding-top: 2px;
            font-size: 13px;
            color: @small-font-color;
          }

          i {
            font-size: 8px;
            display: inline-block;
            transform: translate(4px, -2px);
            color: @small-font-color;
          }
        }
      }

      .other {
        &>div {
          margin-left: 10px;

          i {
            padding-left: 5px;
            height: 100%;
            line-height: 40px;
          }
        }
      }
    }
  }
  .aside-right-color-oneself{
    border-right-color:@oneselfsplitLineColor;
  }

  main {
    width: calc(100vw - 200px);
    min-height: calc(100vh - 60px - 70px - 40px);

    .stopS {
      margin-top: -10px;
      header {
        width: 100%;
        height: 40px;
        display: flex;
        align-items: center;
        margin: 20px 25px;
        margin-bottom: 5px;

        :deep(.tag) {
          margin: 0 5px;
        }
        .tag-oneself{
          color: @oneselfFontColor ;
        }
        .follow{
          font-size: 20px;
          font-weight: bolder;
        }
        .setting{
          user-select: none;
          font-weight: bolder;
          font-size: 20px;
        }
      }
    }
  }


}
.main-oneself{
  background-color: @onselfColor;
  color:@oneselfFontColor;
}

.title1 {
    color: @font-color;
    font-weight: bolder;
}

.create{
  display: flex;
  flex-direction: column;
  :deep(label){
    height: 25px;

    .el-checkbox__label {
      font-size: 13px;
      color: @font-color;
    }
    --el-checkbox-bg-color:@other-bk-color;
    --el-checkbox-input-border-color-hover:@primary-color;
    --el-checkbox-input-border:1px solid @border-color;
  }
  :deep(.is-checked) {
    :deep(.el-el-checkbox__input) {
      border-color: @primary-color;
      background-color: @primary-color;
    }
    --el-checkbox-checked-bg-color:@primary-color;
    --el-checkbox-checked-input-border-color:@primary-color;
    .el-checkbox__label {
        color: @primary-color;
    }
  }
  :deep(.el-input){
    margin-bottom: 10px;
    --el-input-focus-border-color:@border-color;
    --el-input-bg-color: @left-click-color;
    --el-input-border-color:@border-color;
    --el-input-hover-border-color:@border-color;
    input{
      color: @font-color !important;
    }
    input::placeholder{
      color: @small-font-color !important;
    }
  }
}

</style>