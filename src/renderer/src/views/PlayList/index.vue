<template>
    <div class="play-list">
        <div class="top">
            <el-image draggable="false" style="width: 185px; height: 185px" fit="cover"
                :src="playList[index]?.coverImgUrl ?? playList[index]?.picUrl"></el-image>
            <div class="main">
                <div class="title">
                    <div class="Btag">{{ $route.query.type }}</div>
                    <span>{{ playList[index]?.name }}</span>
                    <i class="iconfont icon-xiugaioryijian" v-if="isMy == 'true' && index!=0 && $route.query.type != '播客'" :class="{ noDrag: !Main.dragMouse }" @click="gotoUpdatePlayList()"></i>
                </div>
                <div class="author" v-if="route.query.type == '歌单' || route.query.type == '播客'">
                    <el-image @click="goPersonal" fit="cover" style="width: 25px; height: 25px" :src="playList[index]?.creator?.avatarUrl ?? playList[index]?.dj?.avatarUrl">
                    </el-image>
                    <span @click="goPersonal" class="author-name"
                        :class="{ noDrag: !Main.dragMouse, 'author-name-oneself': globalVar.oneself == 1 }">{{
                            playList[index]?.creator?.nickname ?? playList[index]?.dj?.nickname }}</span>
                    <span class="createtime" :class="{ 'createtime-oneself': globalVar.oneself == 1 }">{{
                        dayjsStamp(+playList[index]?.createTime) }}创建</span>
                </div>
                <div class="button">
                    <div class="playAll">
                        <div class="left" :class="{ noDrag: !Main.dragMouse }" @click="playAll">
                            <i class="iconfont icon-bofang"></i>
                            <span>播放全部</span>
                        </div>
                        <div class="right" :class="{ noDrag: !Main.dragMouse }" @click="addAll">
                            <i class="iconfont icon-jiahao_o"></i>
                        </div>
                    </div>
                    <div class="start" id="startSelf" v-if="!suoFlag" @click="start" :class="
                        {
                            h: !isStartStyle(),
                            'start-color-black-stop': isStartStyle() && (mainColor == 'NMblack' || globalVar.oneself),
                            'start-color-red-stop': isStartStyle() && mainColor != 'NMblack' ,
                            'start-color-black': !isStartStyle() && (mainColor == 'NMblack' || globalVar.oneself),
                            'start-color-red': !isStartStyle() && mainColor != 'NMblack',
                            'h-oneself': globalVar.oneself == 1 && !isStartStyle()
                        }">
                        <div class="icon" :class="{ 
                            noDrag: !Main.dragMouse && !isStartStyle() 
                            ,noClick:!Main.dragMouse && isStartStyle() }">
                            <i class="iconfont icon-wenjian">
                                <i class="iconfont icon-gou" v-if="(dynamic?.subed ?? dynamic?.subscribed ?? dynamic?.isSub)"></i>
                                <i class="iconfont icon-jiahao_o" v-else></i>
                            </i>
                        </div>
                        <div class="txt" :class="{
                            noDrag: !Main.dragMouse,
                            noClick: isStartStyle()
                        }">
                            <span v-if="(dynamic?.subed ?? dynamic?.subscribed ?? dynamic?.isSub )">已</span>
                            <span>收藏<span v-if="!(($route.query.type == '专辑' || $route.query.type == '播客') && ifNM)">({{ numberSimp(($route.query.type == '播客'?dynamic?.subCount:dynamic?.bookedCount ?? dynamic?.subCount)) }})</span></span>
                        </div>
                    </div>
                    <div @click="sharePlayList" class="fengxiang h" v-if="!suoFlag" :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
                        <i class="iconfont icon-fenxiang"></i>
                        <div class="txt">
                            <span>分享<span v-if="!(($route.query.type == '专辑' || $route.query.type == '播客') && ifNM)">({{ numberSimp(dynamic?.shareCount) }})</span></span>
                        </div>
                    </div>
                    <div class="download h" :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }"
                        @click="dowloadAll"
                        v-if="$route.query.type != '播客'"
                        >
                        <i class="iconfont icon-xiazai"></i>
                        <div class="txt">
                            <span>下载全部</span>
                        </div>
                    </div>
                    <div class="suo h" v-if="suoFlag" @click="HandlePrivacy"
                        :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
                        <i class="iconfont icon-suoding_o"></i>
                        <div class="txt">
                            <span>隐私</span>
                        </div>
                    </div>
                </div>
                <div class="small" v-if="route.query.type == '歌单'">
                    <div class="tags" v-show="!(index==0 && isMy == 'true' ) && !(tags.length === 0 && isMy != 'true')" >
                        <span class="title">标签&nbsp;:&nbsp;</span>
                        <span class="add" v-if="tags.length === 0 && isMy == 'true'"
                            :class="{ noDrag: !Main.dragMouse, 'add-oneself': globalVar.oneself == 1 }" @click="add">添加标签</span>
                        <span v-else v-for="(value, index) in tags" :key="value" class="add"
                            :class="{ noDrag: !Main.dragMouse }">
                            {{ value }}
                            <span v-if="index !== tags.length - 1">/</span>
                        </span>
                    </div>
                    <div class="number">
                        <span class="title">歌曲&nbsp;:&nbsp;</span>
                        <span class="num kong" :class="{ 'num-oneself': globalVar.oneself == 1 }">{{
                            playList[index]?.trackCount }}</span>
                        <span class="title">播放&nbsp;:&nbsp;</span>
                        <span class="num" :class="{ 'num-oneself': globalVar.oneself == 1 }">{{
                            numberSimp(dynamic?.playCount)
                        }}</span>
                    </div>
                    <div class="describe" v-show="!(index==0 && isMy == 'true')">
                        <span class="title">简介&nbsp;:&nbsp;</span>
                        <span class="add" v-if="!playList[index]?.description && isMy == 'true'"
                            :class="{ noDrag: !Main.dragMouse, 'add-oneself': globalVar.oneself == 1 }" @click="addDetail">添加简介</span>
                        <span class="txt" :class="{ 'txt-oneself': globalVar.oneself }" ref="description"
                            v-html="playList[index]?.description">
                        </span>
                        <div class="open-jiantou" v-if="openJiantou" :class="{ noDrag: !Main.dragMouse }">
                            <i class="iconfont icon-xiajiantou" v-if="openDescribeFlag" @click="openDescribe"></i>
                            <i class="iconfont icon-shangjiantou" v-else @click="openDescribe"></i>
                        </div>
                    </div>
                </div>
                <div class="small" v-else-if="route.query.type == '专辑'">
                    <div class="number">
                        <span class="title">歌手&nbsp;:&nbsp;</span>
                        <span v-for="(value, i) in playList[index]?.artists" @click="goSongHand(value.id)" :key="value" class="add"
                            :class="{ noDrag: !Main.dragMouse }">
                            {{ value.name }}
                            <span v-if="i !== playList[index]?.artists?.length - 1">/</span>
                        </span>
                    </div>
                    <div class="number">
                        <span class="title">时间&nbsp;:&nbsp;</span>
                        <span class="num" :class="{ 'num-oneself': globalVar.oneself == 1 }">{{
                            dayjsStamp(playList[index]?.publishTime)
                        }}</span>
                    </div>
                </div>
                <div class="small" v-else-if="route.query.type == '播客'">
                    <div class="describe">
                        <span class="border-title-bk">
                            <span class="border-title">{{playList[index]?.category}}</span>
                        </span>
                        <span class="txt txt-dj" :class="{ 'txt-oneself': globalVar.oneself }" ref="description"
                            v-html="playList[index]?.desc">
                        </span>
                        <div class="open-jiantou" v-if="openJiantou" :class="{ noDrag: !Main.dragMouse }">
                            <i class="iconfont icon-xiajiantou" v-if="openDescribeFlag" @click="openDescribe"></i>
                            <i class="iconfont icon-shangjiantou" v-else @click="openDescribe"></i>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="choice">
                <div class="tags-three">
                    <Tag class="tag-play" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }"
                        :message="$route.query.type !== '播客'?'歌曲列表':`声音(${numberSimp(playList[index]?.programCount)})`" :ifClick="flagList[0]" :big="true" @click="goRoute($route.name == 'songPlaylist'?'songPlaylist':'djPlaylist'); changeTag(0)">
                    </Tag>
                    <Tag class="tag-play" v-if="!($route.query.type == '专辑' && ifNM) && $route.query.type != '播客'" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }"
                        :message="`评论(${dynamic?.commentCount})`" :ifClick="flagList[1]" :big="true"
                        @click="goRoute('commentPlaylist'); changeTag(1)">
                    </Tag>
                    <Tag class="tag-play" v-if="$route.query.type == '歌单' || $route.query.type == '播客'" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }" message="收藏者"
                        :ifClick="flagList[2]" :big="true" @click="goRoute('whoStartPlaylist'); changeTag(2)"></Tag>
                    <Tag class="tag-play" v-if="$route.query.type == '专辑'" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }" message="专辑详情"
                    :ifClick="flagList[2]" :big="true" @click="goRoute('ZhuanJiDetail',playList[index].description); changeTag(2)"></Tag>
                </div>
                <div class="search" v-show="$route.name == 'songPlaylist' ||$route.name == 'djPlaylist'">
                    <input type="text" v-model="searchKey" :placeholder="`搜索${$route.query.type}内${$route.query.type !== '播客'?'音乐':'声音'}`" :class="{
                        noDragInput: !Main.dragMouse,
                        dragMouseStyleNo: Main.dragMouse
                    }" @keydown.stop>
                    <i class="iconfont icon-search" v-if="!searchKey"></i>
                    <i class="iconfont icon-guanbi_o" v-else @click="clearSearch" :class="{ noDrag: !Main.dragMouse }"></i>
                </div>
            </div>
        </div>
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
    <AddTipDialog v-if="$route.query.my == 'true'" ref="AddTipDialogRef" @confirm="confirm" :index="+index"></AddTipDialog>
    <MyDialog :flag="PrivacyFlag" @closeDialog="closePrivacy" @confirm="confirmPrivacy" @cancel="canclePrivacy" confirmName="公开">
        <template #header>
            <div class="title">公开歌单</div>
        </template>
        <template #midle>
            <div class="center">公开后将无法重新设为隐私歌单，你确定要将此歌单设为公开?</div>
        </template>
    </MyDialog>
</template>

<script lang="ts" setup>
import { dayjsStamp } from '@renderer/utils/dayjs'  //时间修正
import { numberSimp } from '@renderer/utils/numberSimp' //数字修正
import {
    onActivated, onMounted, ref, shallowRef, provide, toRef, watch, Ref, nextTick,
    toRefs, reactive, getCurrentInstance, ComponentInternalInstance, inject, ShallowRef
} from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useMain, useBasicApi, useMainMenu, useGlobalVar,useNM } from '@renderer/store';
import PromiseQueue, { QueueAddOptions } from 'p-queue'
import { Queue, RunFunction } from 'p-queue/dist/queue';
import AddTipDialog from '@renderer/components/myVC/AddTipDialog.vue'
import MyDialog from '@renderer/components/myVC/MyDialog.vue';
const BasicApi = useBasicApi();
const Main = useMain()
const route = useRoute();
const router = useRouter();
const MainMenu = useMainMenu();
const globalVar = useGlobalVar();
const NM = useNM()
const $el = getCurrentInstance() as ComponentInternalInstance;
const ifNM = ref(false)
if(localStorage.getItem('NMcookie'))ifNM.value = true
const changeTag = (index: number) => {
    flagList.value.forEach((value, i) => {
        if (i == index) {
            flagList.value[i] = true
        } else {
            flagList.value[i] = false
        }
    })
    console.log(flagList.value);

}

let flagList = ref([false, false, false])
let Rn = toRef(route, 'name')
watch(Rn, () => {
    if (route.name == 'songPlaylist' || route.name == 'djPlaylist') {
        changeTag(0)
    } else if (route.name == 'commentPlaylist') {
        changeTag(1)
    } else if (route.name == 'whoStartPlaylist' || route.name == 'ZhuanJiDetail') {
        changeTag(2)
    }
}, { immediate: true })



const goRoute = (name: string,message?:string) => {
    console.log(route.query);
    if(name == 'whoStartPlaylist'){
        router.addRoute('playlist',{
            name,
            path:'whoStart',
            component:()=>import('@renderer/views/PlayList/WhoStart/index.vue'),
        })
        if(router.hasRoute('ZhuanJiDetail')){
            router.removeRoute('ZhuanJiDetail')
        }
    }else if(name == 'ZhuanJiDetail'){
        router.addRoute('playlist',{
            name,
            path:'ZhuanJiDetail',
            component:()=>import('@renderer/views/PlayList/ZhuanJiDetail/index.vue'),
            meta:{
                detail:message
            }
        })
        if(router.hasRoute('whoStartPlaylist')){
            router.removeRoute('whoStartPlaylist')
        }
    }
    if(name == 'djPlaylist'){
        console.log(Object.assign(route.query,{count:playList.value[index.value].programCount}))
        router.replace({
            name, query: Object.assign(route.query,{count:playList.value[index.value].programCount})
        })
    }else{
        router.replace({
            name, query: route.query
        })
    }
}

//播放全部按钮
const playAll = async () => {
    let result 
    console.log('playAll');
    if(route.query.type == '歌单'){
        if(localStorage.getItem('NMcookie')){
            result = (await NM.reqPlaylistTrackAll(id.value)).data;
        }else{
            result = (await Main.reqPlaylistTrackAll(id.value)).data;
        }
        Main.playingList = result.songs
        Main.playingPrivileges = result.privileges
        Main.playingindex = 1
        Main.playing = result.songs[0].id as number
        Main.beforePlayListId = id.value
    }else if(route.query.type == '专辑'){
        result = (await Main.reqAlbumTrackAll(id.value)).data;
        Main.playingList = result.songs
        Main.playingPrivileges = result.songs.map(item=>item.privilege)
        Main.playingindex = 1
        Main.playing = result.songs[0].id
        Main.beforePlayListId = id.value
    }else if(route.query.type == '播客'){
        result = (await Main.reqdjProgram(route.query.id,10000000,0));
        Main.playingList = result
        Main.playingPrivileges = result.map((item=>emptyDjObject(item.id)))
        Main.playingindex = 1
        Main.playing = result[0].mainSong.id
        Main.songType = 'DJ'
    }
    Main.playStatus = 'play'
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}
const emptyDjObject = (id)=>{
  return {
    id,
    maxBrLevel: "DJ",
    playMaxBrLevel: "DJ",
    downloadMaxBrLevel: "DJ",
    plLevel: "DJ",
    dlLevel: "DJ",
    flLevel: "DJ",
  }
}

//添加所有的音乐
const addAll = async () => {
    if (Main.playingList.length == 0) {
        playAll()
    } else {
        let result
        if(route.query.type == '歌单'){
            if(localStorage.getItem('NMcookie')){
                result = (await NM.reqPlaylistTrackAll(id.value)).data;
            }else{
                result = (await Main.reqPlaylistTrackAll(id.value)).data;
            }
        }else if(route.query.type == '专辑'){
            result = (await Main.reqAlbumTrackAll(id.value)).data;
        }
        if(route.query.type != '播客'){
            result.songs.forEach((element: any, index: number) => {
                if (Main.playingList.every((base) => base.id != element.id)) {
                    Main.playingList.push(element)
                    Main.playingPrivileges.push(result.privileges[index])
                }
            });
        }else{
            result = (await Main.reqdjProgram(route.query.id,10000000,0))
            console.log(result);
            result.forEach((element: any) => {
                if (Main.playingList.every((base) => base.mainSong.id != element.mainSong?.id)) {
                    Main.playingList.push(element)
                    Main.playingPrivileges.push(emptyDjObject(element.id))
                }
            });
        }
        globalVar.closePointOutMessage = '已添加到播放列表'
        globalVar.closePointOut = true
    }
}


let openDescribeFlag = ref(true);
let openJiantou = ref(true);
let searchKey = ref('')
let playList = ref()
let isMy = toRef(Main, 'isMy')
//是搜索还是我的(搜索就是不是我的)
watch(isMy, () => {
    if(route.query.type == '播客'){
        if (isMy.value == 'true') {
            playList.value = BasicApi.createDjArr
        }else{
            playList.value = BasicApi.startDjArr
        }
    }else{
        if (isMy.value == 'true') {
            playList.value = Main.playList
        } else {
            playList.value = Main.searchList
        }
    }

}, { immediate: true })

let mainColor = toRef(MainMenu, 'colorBlock')

let index: Ref<any> = ref('')
let id: Ref<any> = ref('')
let suoFlag = ref(false)

// 注入
let songNumber = ref(0)
provide('songNumber', songNumber)
provide('playListId', id)
provide('searchKey', searchKey)
//调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数



let tags: Ref<Array<string>> = ref([''])
let dynamic = ref({
    commentCount: 0,
    shareCount: 0,
    playCount: 0,
    bookedCount: 0,
    subscribed: false,
    remarkName: null,
    gradeStatus: 0,
    remixVideo: null,
    code: 0,
    onSale: false,
    albumGameInfo: null,
    likedCount: 0,
    isSub: false,
    subTime: 0,
    subCount: 729,
    subed:false
})
watch(route,()=>{
    dynamic.value = {
        commentCount: 0,
        shareCount: 0,
        playCount: 0,
        bookedCount: 0,
        subscribed: false,
        remarkName: null,
        gradeStatus: 0,
        remixVideo: null,
        code: 0,
        onSale: false,
        albumGameInfo: null,
        likedCount: 0,
        isSub: false,
        subTime: 0,
        subCount: 729,
        subed:false
    }
})

const isStartStyle = () => {
    if(route.query.type == '歌单')return playList.value[index.value]?.creator.userId == BasicApi.profile?.userId
    else if (route.query.type == '播客') return playList.value[index.value]?.dj.userId == BasicApi.profile?.userId
    else return false
}

// const startStyle = () => {
//     //自己的歌单不能收藏
//     nextTick(() => {
//         if (playList.value[index.value].creator.userId == BasicApi.account?.id) {
//             let dom = document.querySelector('#startSelf') as HTMLElement
//             console.log(dom);
//             if (dom) {
//                 dom.setAttribute('class', 'start')
//                 if (mainColor.value == 'NMblack') {
//                     dom.classList.add('start-color-black-stop')
//                 } else {
//                     dom.classList.add('start-color-red-stop')
//                 }
//             }
//         } else {
//             let dom = document.querySelector('#startSelf') as HTMLElement
//             if (dom) {
//                 dom.setAttribute('class', 'start h')
//                 if (mainColor.value == 'NMblack') {
//                     dom.classList.add('start-color-black')
//                 } else {
//                     dom.classList.add('start-color-red')
//                 }
//             }
//         }
//     })

// }

let routeQuery = toRef(route, 'query')
const alsongs = ref([])
const description = ref()
watch(routeQuery, async () => {
    let Rn = route.name as string
    isMy.value = route.query.my as string || 'true'
    console.log(isMy.value);
    if(route.name == 'djPlaylist' && route.query.type == '播客'){
        const djMessage = await Main.reqDjDetail(route.query.id)
        dynamic.value.playCount = djMessage.playCount
        dynamic.value.commentCount = djMessage.commentCount
        dynamic.value.shareCount = djMessage.shareCount
        dynamic.value.subCount = djMessage.subCount
        dynamic.value.subed = djMessage.subed
        songNumber.value = djMessage.programCount
        if(isMy.value as string == 'true'){
            //创建的播客
            if(+route.query.index! > BasicApi.createDjArr.length - 1){
                playList.value = BasicApi.startDjArr
                index.value = +route.query.index! - BasicApi.createDjArr.length
            }else{
                playList.value = BasicApi.createDjArr
                index.value = route.query.index
            }
        }else{
            playList.value = [djMessage]
            index.value = 0
        }
    }else{
        if (Rn.endsWith('Playlist') && isMy.value as string == 'true') {
            nextTick(() => {
                //样式修改
                description.value.style.whiteSpace = 'nowrap'
                openDescribeFlag.value = true
                openJiantou.value = false
                let widthBox = description.value?.offsetWidth
                let widthscrool = description.value?.scrollWidth
                if (widthscrool > widthBox) {
                    openJiantou.value = true
                } else {
                    openJiantou.value = false
                }
            })

            index.value = route.query.index
            id.value = route.query.id
            console.log(route.query.id,route.query.index);
            //注入
            songNumber.value = playList.value[index.value].trackCount
            tags.value = playList.value[index.value].tags
            if(localStorage.getItem('NMcookie')){
                dynamic.value = await NM.reqPlaylistDetailDynamic(id.value) as any;
            }else{
                dynamic.value = await Main.reqPlaylistDetailDynamic(id.value) as any;
            }
            //隐私判断
            if (playList.value[index.value].privacy == 10) {
                suoFlag.value = true
            } else {
                suoFlag.value = false
            }
            Main.isMyCreate = true
        } else if (route.name == 'songPlaylist' && route.query.my as string != 'true') {
            if(route.query.type == '歌单'){
                if(localStorage.getItem('NMcookie')){
                    dynamic.value = await NM.reqPlaylistDetailDynamic(route.query.id) as any;
                    Main.searchList = [(await NM.reqPlaylistDetail(route.query.id as unknown as number)).data?.playlist]
                }else{
                    dynamic.value = await Main.reqPlaylistDetailDynamic(route.query.id as unknown as number) as any;
                    Main.searchList = [(await Main.reqPlaylistDetail(route.query.id as unknown as number)).data?.playlist]
                }
                console.log(Main.searchList);
                index.value = 0
                playList.value = Main.searchList
                songNumber.value = playList.value[index.value].trackCount
                tags.value = playList.value[index.value].tags
                id.value = route.query.id
                Main.isMyCreate = false
            }else if(route.query.type == '专辑'){
                dynamic.value = (await Main.reqAlbumDetailDynamic(route.query.id as unknown as number)).data
                console.log(dynamic.value );
                let result = (await Main.reqAlbum(route.query.id as unknown as number)).data
                Main.searchList = [result?.album]
                alsongs.value = result?.songs
                index.value = 0
                playList.value = Main.searchList
                songNumber.value = playList.value[index.value]?.size
                tags.value = []
                id.value = route.query.id
                Main.isMyCreate = false
                suoFlag.value = false
            }
        }
    }
}, { immediate: true })
provide('alsongs', alsongs)

// watch(mainColor, () => {
//     startStyle();
// })


//展开描述
const openDescribe = () => {
    if (openDescribeFlag.value) {
        description.value.style.whiteSpace = 'pre-line'
        description.value.style.display = 'inline'
    } else {
        description.value.style.whiteSpace = 'nowrap'
        description.value.style.display = 'inline'
    }
    openDescribeFlag.value = !openDescribeFlag.value
    // let widthBox = zi.offsetWidth
    // let widthscrool = zi.scrollWidth
    // console.log(widthBox);
    // console.log(widthscrool);

}

//清除搜索内容
const clearSearch = () => {
    searchKey.value = ''
}

//搜索开始
// const goSearch = (e: Event) => {
//     console.log('好时代要来了');
// }


router.afterEach((to) => {
    if(route.query.type == '播客'){
        if (to.query.my == 'true') {
            playList.value = BasicApi.createDjArr
            isMy.value = 'true'
        }else{
            isMy.value = 'false'
            playList.value = BasicApi.startDjArr
        }
    }else{
        if (to.query.my == 'true') {
            isMy.value = 'true'
            playList.value = Main.playList
        } else {
            isMy.value = 'false'
            playList.value = Main.searchList
        }
    }
})


const downloadQueue = inject('downloadQueue') as ShallowRef<PromiseQueue<Queue<RunFunction, QueueAddOptions>, QueueAddOptions>>
let oldlength = 0
const promises: Promise<any>[] = []
const dowloadAll = async () => {
    if (Main.openPlayListId.length != 0) {
        // globalVar.downloadId.push(...Main.openPlayListId.filter((num) => !globalVar.downloadId.includes(num)));
        // const promises = globalVar.downloadId.map(id => downloadOne(id))
        // await Promise.all(promises);
        oldlength = WaitdownloadList.value.length
        globalVar.downLoadAll++
        console.log(globalVar.downloadList);
        await nextTick()
        // console.log(globalVar.downloadId);
        // console.log(oldlength,WaitdownloadList.value.length);
        const newList = WaitdownloadList.value.slice(oldlength, WaitdownloadList.value.length)
        // console.log(oldlength,WaitdownloadList.value.length);
        // console.log(newList);
        for (const item of newList) {
            const id = item!.id
            const name = item!.name
            globalVar.loadingValue.set(id, [0, 1])
            const signal = item.controller.signal
            const pq = downloadQueue.value.add(() => getUrl(id, name), { signal })
            promises.push(pq)
        }
        // await Promise.allSettled(promises)
    }
}

const WaitdownloadList = toRef(globalVar, 'downloadList')
const br = (str: string) => {
    if (str == 'standard') return 128000
    else if (str == 'higher') return 192000
    else if (str == 'exhigh') return 320000
    else return 999000
}

//下载请求
const getUrl = async (id, name) => {
    globalVar.initDownloadButton = true
    const downloadObj = globalVar.downloadList.find(item => item.id === id)
    //判断请求是否被取消
    let url = ''
    let result
    let chunks: Uint8Array[]
    if (globalVar.musicPick.get(id) == undefined) { //切片数据)
        //@ts-ignore
        chunks = []
    } else {
        //@ts-ignore
        chunks = globalVar.musicPick.get(id)
    }
    try {
        result = await Main.reqSongDlUrl(id, br(globalVar.setting.downloadlevel))
        //@ts-ignore
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
    } catch (error) {
        globalVar.musicPick.set(id, chunks)
        //@ts-ignore
        downloadObj.ifcancel = true
    }
    if (url == null) {
        globalVar.loadingValue.delete(id)
    }
    //@ts-ignore
    downloadObj.url = url
    if (downloadObj?.controller.signal.aborted) return
    return fetch(url, {
        signal: downloadObj?.controller.signal
    }).then(response => {
        const total = response.headers.get('content-length') as string//响应体大小
        let loaded = 0
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
                        globalVar.loadingValue.set(id, [loaded, (+total)])
                        push()
                    }).catch(error => {
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
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: name,id3 })
            globalVar.musicPick.delete(id)
            WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
            // window.electron.ipcRenderer.send('save-music-pick',{name})
        }).catch(() => {
            globalVar.musicPick.set(id, chunks)
            //@ts-ignore
            downloadObj.ifcancel = true
        })
    // .catch((error) =>{
    //     console.error(error)
    //     // WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
    // })
}

//编辑歌单信息
const gotoUpdatePlayList = () => {
    router.push({
        name: 'editPlayList',
        query: {
            index: index.value
        }
    })
}
const AddTipDialogRef = ref<InstanceType<typeof AddTipDialog>>()
const add = ()=>{
    AddTipDialogRef.value!.clearFormTags = false
    AddTipDialogRef.value!.confirmFlag = false
    AddTipDialogRef.value!.addTagsFlag = true
    AddTipDialogRef.value!.choiceNumber = Main.playList[index.value].tags.length
}
const confirm = async(tag)=>{
    console.log(tag);
    try {
        if(localStorage.getItem('NMcookie')){
            await NM.reqUpdatePlayListTags(+index.value,id.value,tag.join(';'))
        }else{
            await Main.reqUpdatePlayListTags(+index.value,id.value,tag.join(';'))
        }
        tags.value = Main.playList[index.value].tags
        globalVar.loadMessageDefault = '保存成功!'
        globalVar.loadMessageDefaultFlag = true
    } catch (error) {
        globalVar.loadMessageDefault = '保存失败!'
        globalVar.loadMessageDefaultFlag = true
    }
}

const addDetail = ()=>{
    gotoUpdatePlayList()
}
const goSongHand = (id)=>{
    if(id != 0){
        router.push({
            name:'SongHand',
            query:{
                id
            }
        })
    }

}

const goPersonal = ()=>{
    router.push({
        name:'PersonalCenter',
        query:{
            id:playList.value[index.value]?.creator?.userId ?? playList.value[index.value]?.dj?.userId 
        }
    })
}

const sharePlayList = ()=>{
    if(!localStorage.getItem('NMcookie') && !localStorage.getItem('cookieUser')){
        globalVar.flagLogin = true
        return
    }
    globalVar.shareDialogFlag = true
    globalVar.share.id = id.value
    globalVar.share.type = route.query.type=='歌单'? 'playlist':'album'
    if(route.query.type == '歌单')globalVar.share.message = `${route.query.type}：${playList.value[index.value].name} by ${playList.value[index.value].creator.nickname}`
    else if(route.query.type == '专辑'){
        const ar = playList.value[index.value]?.artists.map(item=>item.name).join('/')
        globalVar.share.message = `${route.query.type}：${playList.value[index.value].name} - ${ar}`
    }else if(route.query.type == '播客'){
        globalVar.share.message = `${route.query.type}：${playList.value[index.value].name} - ${playList.value[index.value].dj.nickname}`
    }
    globalVar.share.imgUrl = playList.value[index.value]?.coverImgUrl ?? playList.value[index.value]?.picUrl
}

const start = async()=>{
    console.log(dynamic);
    if(!localStorage.getItem('NMcookie') && !localStorage.getItem('cookieUser')){
        globalVar.flagLogin = true
        return
    }
    if(isStartStyle())return
    else{
        if(dynamic.value?.subscribed ?? dynamic.value?.isSub){
            //取消收藏
            console.log(dynamic.value?.subscribed); //歌单
            console.log(dynamic.value?.isSub); //专辑
            try {
                globalVar.loadDefault = true
                let flag = false
                if(dynamic.value?.subscribed != undefined){
                    if(localStorage.getItem('NMcookie')){
                        flag =  await NM.reqPlaylistSubscribe(2,id.value)
                    }else{
                        flag =  await Main.reqPlaylistSubscribe(2,id.value)
                    }
                }
                else {
                    if(localStorage.getItem('NMcookie')){
                        flag = await NM.reqAlbumSub(2,id.value)
                    }else{
                        flag = await Main.reqAlbumSub(2,id.value)
                    }
                }
                console.log(flag);
                globalVar.loadDefault = false
                if(flag){
                    globalVar.loadMessageDefault = '取消收藏成功'
                    globalVar.loadMessageDefaultFlag = true
                    if(dynamic.value?.subscribed != undefined){
                        dynamic.value.bookedCount--
                        Main.startPlay--
                        dynamic.value!.subscribed = false
                        if(localStorage.getItem('NMcookie')){
                            NM.reqUserPlaylist(BasicApi.profile!.userId)
                        }else{
                            Main.reqUserPlaylist(BasicApi.profile!.userId)
                        }
                    }else{
                        dynamic.value.subCount--
                        dynamic.value!.isSub = false
                        BasicApi.startalbum = BasicApi.startalbum.filter((it)=>{
                            return it.id != id.value
                        })
                    }
                }else{
                    globalVar.loadMessageDefault = '取消收藏失败'
                    globalVar.loadMessageDefaultType = 'error'
                    globalVar.loadMessageDefaultFlag = true
                } 
            } catch (error) {
                globalVar.loadDefault = false
                globalVar.loadMessageDefault = '取消收藏失败'
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true
            }
        }else{
            //收藏
            console.log(dynamic.value?.subscribed); //歌单
            console.log(dynamic.value?.isSub); //专辑
            try {
                globalVar.loadDefault = true
                let flag = false
                if(dynamic.value?.subscribed != undefined){
                    if(localStorage.getItem('NMcookie')){
                        flag =  await NM.reqPlaylistSubscribe(1,id.value)
                    }else{
                        flag =  await Main.reqPlaylistSubscribe(1,id.value)
                    }
                }
                else {
                    if(localStorage.getItem('NMcookie')){
                        flag =  await NM.reqAlbumSub(1,id.value)
                    }else{
                        flag = await Main.reqAlbumSub(1,id.value)
                    }
                }
                console.log(flag);
                globalVar.loadDefault = false
                if(flag){
                    globalVar.loadMessageDefault = '收藏成功'
                    globalVar.loadMessageDefaultFlag = true
                    if(dynamic.value?.subscribed != undefined){
                        dynamic.value.bookedCount++
                        Main.startPlay++
                        dynamic.value!.subscribed = true
                        if(localStorage.getItem('NMcookie')){
                            NM.reqUserPlaylist(BasicApi.profile!.userId)
                        }else{
                            Main.reqUserPlaylist(BasicApi.profile!.userId)
                        }
                    }else{
                        dynamic.value.subCount++
                        dynamic.value!.isSub = true
                        if(localStorage.getItem('NMcookie')){
                            await NM.reqalbumSublist(1)
                        }else{
                            await BasicApi.reqalbumSublist(1)
                        }
                        
                    }
                }else{
                    globalVar.loadMessageDefault = '收藏失败'
                    globalVar.loadMessageDefaultType = 'error'
                    globalVar.loadMessageDefaultFlag = true
                } 
            } catch (error) {
                globalVar.loadDefault = false
                globalVar.loadMessageDefault = '收藏失败'
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true
            }
        }
    }
}
const HandlePrivacy = ()=>{
    PrivacyFlag.value = true
}

const PrivacyFlag = ref(false)
const closePrivacy = (done : ()=>void)=>{
    PrivacyFlag.value = false
    done()
}
const confirmPrivacy = async()=>{
    globalVar.loadDefault = true
    let flag
    if(localStorage.getItem('NMcookie')){
        flag = await NM.reqPlaylistPrivacy(id.value)
    }else{
        flag = await Main.reqPlaylistPrivacy(id.value)
    }
    globalVar.loadDefault = false
    if(flag){
        globalVar.loadMessageDefault = '歌单已公开'
        globalVar.loadMessageDefaultFlag = true
        suoFlag.value = false
        playList.value[index.value].privacy = 1
    }
    PrivacyFlag.value = false
}

const canclePrivacy = ()=>{
    PrivacyFlag.value = false
}
</script>

<style lang="less" scoped>
.dragMouseStyleNo {
    cursor: url('@/assets/stop.png'), auto;
}

.noDrag {
    cursor: pointer;
}

.noDragInput {
    cursor: text;
}

.noClick {
    cursor: default;
}

.play-list {
    width: inherit;

    .top {
        height: auto;
        width: calc((100% - 60px));
        margin: 30px 30px;
        display: flex;
        position: relative;

        :deep(.el-image) {
            border-radius: 0.3em;
            margin-right: 20px;
            user-select: none;
        }

        .main {
            min-width: 0px;
            margin-left: 5px;
            width: 72%;

            .title {
                display: flex;
                align-items: center;
                margin-top: 5px;

                span {
                    font-size: 22px;
                    width: 80%;
                    font-weight: bolder;
                    display: inline-block;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                }

                .Btag {
                    color: @small-font-red;
                    font-size: 14px;
                    border: 1px solid @small-font-red;
                    padding: 2px 3px 3px 3px;
                    border-radius: 0.2em;
                    margin-right: 10px;
                    user-select: none;
                }

                i {
                    color: @small-font-color;
                    font-size: 20px;
                    margin-left: 5px;
                }
            }

            .author {
                display: flex;
                align-items: center;
                font-size: 13px;
                user-select: none;
                margin-top: 15px;
                margin-bottom: 5px;
                font-weight: 500;

                :deep(.el-image) {
                    border-radius: 50%;
                    margin-right: 10px;
                    cursor: pointer;
                }

                .author-name {
                    color: @url-color;
                    margin-right: 10px;

                    &:hover {
                        color: @url-color-hover;
                    }
                }

                .author-name-oneself {
                    color: rgb(133, 185, 230);

                    &:hover {
                        color: rgb(179, 206, 229);
                    }
                }

                .createtime {
                    color: @small-font-color;
                }

                .createtime-oneself {
                    color: rgb(200, 200, 200);
                }
            }

            .button {
                user-select: none;
                display: flex;
                margin-top: 10px;

                .h:hover {
                    background-color: @span-color-hover !important;
                }

                .h-oneself:hover {
                    background-color: rgb(66, 66, 66) !important;
                }

                .playAll {
                    display: flex;
                    height: 32px;
                    width: 150px;
                    align-items: center;
                    color: white;

                    .left {
                        width: 110px;
                        height: inherit;
                        display: flex;
                        align-items: center;
                        border-top-left-radius: 2em;
                        border-bottom-left-radius: 2em;
                        background-color: @small-font-red;
                        font-size: 14px;
                        border-right: 1px solid #ee5454;

                        i {
                            font-size: 14px;
                            margin-right: 5px;
                            padding-left: 18px;
                        }

                        &:hover {
                            background-color: @play-all-button-hover;
                        }
                    }

                    .right {
                        width: 40px;
                        height: inherit;
                        background-color: @small-font-red;
                        display: flex;
                        align-items: center;
                        border-top-right-radius: 2em;
                        border-bottom-right-radius: 2em;

                        &:hover {
                            background-color: @play-all-button-hover;
                        }

                        i {
                            margin-left: 8px;
                            font-size: 20px;
                        }
                    }
                }

                .start-color-red {
                    background-color: rgb(255, 255, 255);
                    color: @font-color !important;
                }

                .start-color-red-stop {
                    background-color: @none-button !important;
                    color: @none-font !important;
                    cursor: default;
                }

                .start-color-black {
                    background-color: rgb(43, 43, 43);
                    color: @font-color !important;
                }

                .start-color-black-stop {
                    background-color: @none-button !important;
                    color: @none-font !important;
                    cursor: default;
                }

                .start {
                    margin-left: 10px;
                    width: auto;
                    height: 32px;
                    border-radius: 2em;
                    border: @split-line-color 1px solid;
                    display: flex;
                    align-items: center;

                    .icon {
                        color: inherit;
                        padding-left: 15px;
                        padding-right: 2px;

                        .icon-wenjian {
                            position: relative;
                            font-size: 18px;

                            &>.icon-jiahao_o {
                                font-size: 13px;
                                position: absolute;
                                left: 3px;
                                top: 3px;
                            }

                            &>.icon-gou {
                                font-size: 16px;
                                position: absolute;
                                left: 2px;
                                top: 1px;
                            }
                        }
                    }

                    .txt {
                        font-size: 14px;
                        padding-right: 10px;
                        padding-left: 5px;
                        display: flex;
                        max-width: 150px;

                        >span:nth-child(2) {
                            display: block;
                            word-wrap: normal;
                        }
                    }
                }

                .fengxiang {
                    margin-left: 10px;
                    min-width: 75px;
                    width: auto;
                    height: 32px;
                    border-radius: 2em;
                    border: @split-line-color 1px solid;
                    display: flex;
                    align-items: center;
                    flex-wrap: nowrap;
                    background-color:@stop-btn-bk  ;
                    i {
                        color: #666666;
                        padding-left: 10px;
                        padding-right: 5px;
                    }

                    .txt {
                        font-size: 14px;

                        >span {
                            display: block;
                            padding-right: 10px;
                        }
                    }
                }

                .download {
                    margin-left: 10px;
                    min-width: 100px;
                    width: auto;
                    height: 32px;
                    border-radius: 2em;
                    border: @split-line-color 1px solid;
                    display: flex;
                    align-items: center;

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

                .suo {
                    margin-left: 10px;
                    min-width: 100px;
                    width: auto;
                    height: 32px;
                    border-radius: 2em;
                    border: @split-line-color 1px solid;
                    display: flex;
                    align-items: center;

                    i {
                        color: #666666;
                        padding-left: 15px;
                        padding-right: 5px;
                    }

                    .txt {
                        font-size: 14px;
                        padding-right: 20px;
                    }
                }
            }

            .small {
                font-size: 13px;
                align-items: center;

                // height: 71px;
                // overflow: hidden;
                // text-overflow: ellipsis;
                &>div {
                    display: flex;
                    margin-top: 5px;
                }

                .add {
                    margin-top: 5px;
                    color: @url-color;
                    user-select: none;

                    >span {
                        color: @font-color;
                        padding-right: 4px;
                        font-size: 10px;
                        transform: rotate(-8deg) translateY(-2px);
                        display: inline-block;
                    }

                    &:hover {
                        color: @url-color-hover;
                    }
                }

                .add-oneself {
                    color: rgb(133, 185, 230);

                    &:hover {
                        color: rgb(179, 206, 229);
                    }
                }

                .title {
                    margin-top: 5px;
                    user-select: none;
                }

                .num {
                    margin-top: 5px;
                    user-select: none;
                    color: @small-font-color;
                }

                .num-oneself {
                    color: rgb(200, 200, 200);
                }

                .kong {
                    margin-right: 15px;
                }

                .describe {
                    align-items: flex-start;

                    &>span {
                        display: inline-block;
                    }

                    &>.title {
                        width: 40px;
                        height: 20px;
                        margin-right: 0px;
                    }
                    &>.border-title-bk{
                        display: flex;
                        align-items: center;
                        height: 25px;
                        margin-right: 10px;
                        width: auto;
                        white-space: nowrap;
                        &>.border-title{
                            color: @small-font-red;
                            font-size: 14px;
                            border: 1px solid @small-font-red;
                            padding: 2px 3px 3px 3px;
                            border-radius: 0.2em;
                            user-select: none;
                            height:14px
                        }
                    }


                    >.txt {
                        margin-top: 5px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        height: auto;
                        max-width: 500px;
                        color: @small-font-color;
                        line-height: 25px;
                        margin-top: -1px;
                        // transform: translateY(-5px);
                    }
                    >.txt-dj{
                        color: @font-color;
                    }

                    >.txt-oneself {
                        color: rgb(200, 200, 200);
                    }

                    i {
                        transform: translateX(20px);
                        font-size: 14px;
                    }

                    .open-jiantou {
                        position: absolute;
                        right: 0px;
                        top: 170px;
                    }
                }
            }
        }
    }

    .bottom {
        margin: 20px 20px;
        width: calc((100% - 60px));

        .choice {
            display: flex;
            justify-content: space-between;

            .tags-three {
                display: flex;

                .tag-play-oneself {
                    color: rgba(255, 255, 255, 0.7);
                }

                &>.tag {
                    margin: 0 10px;
                }
            }

            .search {
                width: 200px;
                height: 30px;
                background-color: rgba(0, 0, 0, .05);
                border-radius: 2em;

                input {
                    background-color: rgba(0, 0, 0, .0);
                    color: @small-font-color;
                    height: 30px;
                    width: 160px;
                    margin-left: 10px;
                }
            }
        }
    }

}
.center{
    width: 100%;
    text-align: center;
    color: @font-color;
}
</style>