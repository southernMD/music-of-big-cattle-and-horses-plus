<template>
    <div class="MusicRadio" :class="{ 'MusicRadio-oneself': globalVar.oneself == 1 }">
        <div class="left" v-show="playingList.length">
            <transition name="imgpng">
                <div v-show="Main.detailStatus == 'close'">
                    <div class="image" @mouseover="musicDetail" @mouseout="musicDetailLeave" title="展开音乐详情页"
                        @click="showDetail">
                        <el-image draggable="false" :src="playingList[playingindex - 1]?.al?.picUrl" fit="cover">
                        </el-image>
                        <div class="mask">
                            <i class="iconfont icon-xialajiantou1" v-if="Main.songType !== 'FM'"></i>
                            <i class="iconfont icon-shangxiajiantou" v-else></i>
                        </div>
                    </div>
                    <div class="txt" :class="{ 'txt-oneself': globalVar.oneself }">
                        <div class="t">
                            <div class="name" @mouseover="rushName('nameTxt')" @click="showDetail">
                                <div class="name-txt" id="nameTxt">{{ playingList[playingindex - 1]?.name }}
                                    <span class="small" v-if="playingList[playingindex - 1]?.tns?.length">&nbsp;({{
                                        playingList[playingindex - 1]?.tns[0]
                                    }})</span>
                                    <span class="small" v-else-if="playingList[playingindex - 1]?.alia?.length">&nbsp;({{
                                        playingList[playingindex - 1]?.alia[0]
                                    }})</span>
                                </div>
                            </div>
                            <i v-if="likeFlag" class="iconfont icon-aixin" @click="likeOrDislike"></i>
                            <i v-else class="iconfont icon-aixin_fill" @click="likeOrDislike"></i>
                        </div>
                        <div class="singer" @mouseover="rushSinger('singerTxt')" @click="goHandSong">
                            <span id="singerTxt" >
                                <span v-for="({}, index) in playingList[playingindex - 1]?.ar"
                                    :key="playingList[playingindex - 1]?.ar[index]?.id">
                                    <span :data-id="playingList[playingindex - 1]?.ar[index]?.id">{{ playingList[playingindex - 1]?.ar[index].name }}</span>
                                    <span v-if="index != playingList[playingindex - 1]?.ar.length - 1" 
                                    style="transform: rotate(-10deg) translateY(-2px);
                                    display: inline-block;
                                    font-size: 10px;
                                    padding-right: 3px;
                                    ">/</span>
                                </span>
                            </span>
                        </div>
                    </div>
                </div>
            </transition>
            <transition name="option">
                <div v-show="Main.detailStatus == 'open'" class="showOption">
                    <div class="left" @click="showDetail">
                        <i class="iconfont icon-xiangxiajiantou"></i>
                    </div>
                    <div class="right" :class="{'right-contsee':Main.playing < 0}" >
                        <!-- :likeJust()?'icon-aixin_fill':'icon-aixin' -->
                        <div class="todo"  @click="likeOrDislike" :class="{ noDrag: !Main.dragMouse }">
                            <i v-if="likeFlag" class="iconfont icon-aixin"></i>
                            <i v-else class="iconfont icon-aixin_fill"></i>
                        </div>
                        <div class="todo" v-for="({}, index) in 3" @click="todoHandle(index)" :class="{ noDrag: !Main.dragMouse }">
                            <i class="iconfont" :class="[leftIcon[index + 1]]"></i>
                        </div>
                    </div>
                </div>
            </transition>

        </div>
        <div class="readioOption">
            <div class="top" ref="top">
                <div class="way">
                    <transition leave-active-class="animate__animated animate__fadeOut"
                        enter-active-class="animate__animated animate__fadeIn">
                        <SmallTips v-if="showPlayWay" @close="showPlayWay = false" :message="iconWayWrite[wayIndex]">
                        </SmallTips>
                    </transition>

                    <i class="iconfont" :class="[iconWay[wayIndex]]" :title="iconWayWrite[wayIndex]" @click="nextWay"
                        v-if="Main.songType !== 'FM'"></i>
                    <i class="iconfont icon-lajixiang" v-else title="垃圾桶" @click="rubish"></i>
                </div>
                <div class="before" @click="prevSongThor" title="上一首（Ctrl + Left）">
                    <i class="iconfont icon-shangyishou"></i>
                </div>
                <div class="start">
                    <div class="bk" :class="{ 'bk-oneself': globalVar.oneself == 1 }" @click="changPlayStatus"
                        :title="`${stopOrPlayFlag ? '继续' : '暂停'}（Ctrl + P）`">
                        <i class="iconfont icon-gf-play" v-if="stopOrPlayFlag"></i>
                        <i class="iconfont icon-zanting" v-else></i>
                    </div>
                </div>
                <div class="next" @click="nextSongThor" title="下一首（Ctrl + Right">
                    <i class="iconfont icon-xiayishou"></i>
                </div>
                <div class="ci" @click="openCi" ref="ci">
                    <i class="iconfont icon-geciweidianji"></i>
                    <i class="iconfont icon-openci-copy" v-if="showCi"></i>
                </div>
            </div>
            <div class="bottom" :class="{ 'bottom-oneself': globalVar.oneself == 1 }">
                <div class="number-before" v-show="playingList.length != 0">{{ nowTime }}</div>
                <div class="audio-line" ref="audio-line" :class="{ 'audio-line-oneself': globalVar.oneself == 1 }"
                    @click="clickAudioPlay">
                    <div class="line-loading" ref="line-loading" :class="{ 'line-loading-oneself': globalVar.oneself }"
                        v-show="playingList.length"></div>
                    <div class="line-play" ref="line-play" v-show="playingList.length"></div>
                    <div class="block" ref="block" v-show="playingList.length" @mousedown="audioPlay"></div>
                </div>
                <div class="number-end" v-show="playingList.length != 0">{{ endTime }}</div>
            </div>
        </div>
        <div class="right" :class="{ 'right-oneself': globalVar.oneself }" v-show="playingList.length">
            <div class="playLevel" id="playLevel" draggable="false" @click="showLevel">
                <SmallBlock v-if="showLevelFlag" :id="114514" :if-level="true"
                    :max-have="playingPrivileges[playingindex - 1].maxBrLevel"
                    :max-level="playingPrivileges[playingindex - 1].plLevel" :now-level="nowLevel" @show="changeSpanLevel"
                    @close="showLevelFlag = false"></SmallBlock>
                <div class="bk" :class="{ 'bk-oneself': globalVar.oneself }">
                    <span draggable="false">{{ levelName }}</span>
                </div>
            </div>
            <div class="playSpeed" id="playSpeed" draggable="false" @click="showSpeed">
                <SmallBlock v-if="showSpeedFlag" :id="114514" :width="110" :height="170" :speedPower="speedPower"
                    @close="showSpeedFlag = false" @show="changeSpanSpeed"></SmallBlock>
                <div class="bk" :class="{ 'bk-oneself': globalVar.oneself }">
                    <span draggable="false">{{ speedPower == '1x' ? '倍速' : speedPower }}</span>
                </div>
            </div>
            <div class="shengyin" @mouseenter="changeShenYing" @mouseleave="endShenYing">
                <i class="iconfont icon-shengyin" @click="Mute" v-if="MuteFlag"></i>
                <i class="iconfont icon-shengyinguanbi" @click="Mute" v-else></i>
                <div class="shengyin-line" v-show="changeShengYing">
                    <div class="hua" @click="immediateChamgeYingLiang">
                        <div class="liang">
                            <div class="point" @mousedown="beginMove"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="playList" id="playlistIcon" v-show="Main.songType != 'FM'">
                <i class="iconfont icon-24gf-playlist" @click="showPlayListPanel"></i>
                <div v-show="PlayListPanelFlag">
                    <PlayListPanel @startAll="startAll" @close="PlayListPanelFlag = false" @stopPlay="clearList"></PlayListPanel>
                </div>
            </div>
        </div>
        <audio :src="SongUrl"></audio>
        <canvas id="canvasLook"></canvas>
        <PlayingPointOut v-if="globalVar.closePointOut" @close="globalVar.closePointOut = false"
            :message="globalVar.closePointOutMessage"></PlayingPointOut>
    </div>
    <div v-if="offsetFlag">
        <Loading :loading="false" :message="lyricOffset + 's'" :showTime="1000" @close="offsetFlag = false" width="50">
        </Loading>
    </div>
    <transition name="songDetail">
        <SongDetail :currentTime="currentTime" :lyricOffset="lyricOffset" :simiSong="simiSong" :simiPlaylist="simiPlaylist"
            @goTotime="goTotime" @openCommentDialog="openCommentDialog"></SongDetail>
    </transition>
    <div class="MyDialog">
        <MyDialog :button="false" :flag="startDialogFlag" @closeDialog="closeDialog">
            <template #header>
                <div class="title">
                    收藏到歌单
                </div>
            </template>
            <template #midle>
                <div class="add" @click="create">
                    <div class="pic">
                        <i class="iconfont icon-jiahao_o"></i>
                    </div>
                    <div class="msg">新建歌单</div>
                </div>
                <el-scrollbar>
                    <div class="list">
                        <div class="item" @click="addIn(it.id,index)" v-for="it,index in Main.playList.slice(0, Main.createPlay + 1)">
                            <el-image :src="it.coverImgUrl"></el-image>
                            <div class="msg">{{ it.name }}</div>
                        </div>
                    </div>
                </el-scrollbar>
            </template>
        </MyDialog>
    </div>
    <MyDialog :flag="senddongtaiFlag" @closeDialog="closeShareDialog" @confirm="confirm" @cancel="cancel" confirmName="分享" cancelName="取消">
        <template #header>
            <div class="title">分享到动态</div>
        </template>
        <template #midle>
            <div class="default">
                <div class="writ">
                    <WriteCommit @getText="getZhuanfaText" ref="WriteCommitRef"></WriteCommit>
                </div>
                <div class="show">
                    <div class="img" ref="imgRef" v-show="globalVar.share.imgUrl.length != 0"></div>
                    <div class="name" v-if="globalVar.share.type == 'comment'">{{ globalVar.share.name}}</div>
                    <div class="message">{{globalVar.share.message }}</div>
                </div>
            </div>
        </template>
    </MyDialog>
    <MyDialog :flag="commentDioalogFlag" @closeDialog="closeCommentDialog" @confirm="confirmComment" @cancel="cancelComment" confirmName="评论" cancelName="取消">
        <template #header>
            <div class="title">歌曲：{{ playingList[playingindex - 1]?.name }}</div>
        </template>
        <template #midle>
            <WriteCommit :placeholder="replaypPaceholder" ref="WriteCommitRef2" @getText="getText"></WriteCommit>
        </template>
    </MyDialog>
</template>

<script lang="ts" setup>
import {
    ref, onMounted, getCurrentInstance, ComponentInternalInstance,
    Ref, nextTick, toRef, watch, shallowRef, provide
} from 'vue'
import { dayjsSMMSS } from '@renderer/utils/dayjs';
import { before, throttle } from 'lodash'
import { useMain, useGlobalVar, useMainMenu } from '@renderer/store';
import { rand } from '@renderer/utils/rand';
import { useRouter,useRoute } from 'vue-router';
import { useElectronToApp } from '@renderer/store/index'
import PlayListPanel from './playListPanel/index.vue';
import SongDetail from './songDetail/index.vue';
import MyDialog from '../myVC/MyDialog.vue';
const $el = getCurrentInstance() as ComponentInternalInstance;
const Main = useMain();
const globalVar = useGlobalVar();
const ElectronToApp = useElectronToApp()
const $router = useRouter();
const $route = useRoute();
let iconWay = ref(['icon-caozuo-xunhuan1', 'icon-danquxunhuan', 'icon-xunhuanbofang', 'icon-shunxubofang'])
const leftIcon = ['icon-aixin', 'icon-wodeshoucang', 'icon-xiazai1', 'icon-fenxiang']
let iconWayWrite = ref(['列表循环', '单曲循环', '随机播放', '顺序播放'])
const ciId = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci');
let animationId;

let playingList = toRef(Main, 'playingList')
let playingPrivileges = toRef(Main, 'playingPrivileges')
let playingId = toRef(Main, 'playing')
let playingindex = toRef(Main, 'playingindex')
let likes = toRef(Main, 'likes');
let randQueue: Array<number> = [];
let randIndex = ref(-1);

let stopOrPlayFlag: Ref<Boolean> = ref(true)
let wayIndex = toRef(Main, 'wayIndex');
let showCi = ref(false);
let MuteFlag = ref(true);
let audio: HTMLAudioElement
let loadingLine: HTMLElement
let playLine: HTMLElement;
let playBall: HTMLElement;
let line: HTMLElement
let audioPlayFlag = ref(false)
let lyric: Ref<Object> = shallowRef({});
let offsetFlag = ref(false)
let SongUrl = ref('')
let nowTime = ref(dayjsSMMSS(0))
let endTime = ref(dayjsSMMSS(0))
let playListId = toRef(Main, 'beforePlayListId')


//喜欢和取消喜欢
let likeFlag = ref(false)
//true 是爱心 false 是填充爱心
watch(likes, () => {
    if (likes.value.includes(playingId.value)) {
        likeFlag.value = false
    } else {
        likeFlag.value = true
    }
},{deep:true})

watch(playingId, () => {
    if (likes.value.includes(playingId.value)) {
        likeFlag.value = false
    } else {
        likeFlag.value = true
    }
})

const likeOrDislike = () => {
    if(Main.playing < 0) return
    let likeIndex = likes.value.indexOf(playingId.value)
    if (likeIndex != -1) {
        //取消喜欢
        Main.reqLike(Number(playingId.value), false)
        likes.value.splice(likeIndex, 1)
        globalVar.loadMessageDefault = '取消喜欢成功'
        globalVar.loadMessageDefaultFlag = true
        Main.likeChange = `${playingId.value},false`
    } else {
        Main.reqLike(Number(playingId.value), true)
        console.log(playingId.value);
        likes.value.unshift(playingId.value)
        globalVar.loadMessageDefault = '已添加到我喜欢的音乐'
        globalVar.loadMessageDefaultFlag = true
        Main.likeChange = `${playingId.value},true`
    }

}

//心动模式
watch(playListId, async () => {
    if (playListId.value == Main.playListId[0]) {
        console.log('展示心动模式图标');
        if (iconWay.value.length != 5) {
            iconWay.value.push('icon-xindong-copy')
            iconWayWrite.value.push('鸡动模式')
        }
        if (Main.wayIndex != 4) {
            originalList.value = playingList.value
            originalPrivileges.value = playingPrivileges.value
            originalsongIndex.value = playingindex.value
        } else {
            let result = (await Main.reqPlaylistTrackAll(playListId.value)).data;
            originalList.value = result.songs
            originalPrivileges.value = result.privileges
            originalsongIndex.value = playingindex.value
        }
    } else {
        Main.wayIndex = 0
        originalList.value = []
        originalPrivileges.value = []
        if (iconWay.value.length == 5) {
            iconWay.value.pop()
            iconWayWrite.value.pop()
        }
    }
})

let originalList = toRef(Main, 'originalList')
let originalPrivileges = toRef(Main, 'originalPrivileges')
let originalsongIndex = toRef(Main, 'originalsongIndex')
watch(wayIndex, async () => {
    if (wayIndex.value == 4) {
        console.log('获取心动模式列表');
        Main.heartJump = true
        let result: Array<any> = (await Main.reqPlaymodeIntelligenceList(playingId.value, Number(playListId.value), playingId.value)).data.data
        console.log(result);
        let idArr = [] as unknown as [number]
        result.forEach((element) => {
            idArr.push(element.id)
        })
        let songList = (await (Main.reqSongDetail(idArr))).data
        let needPlay = playingList.value[playingindex.value - 1]
        let needPlayPrivileges = playingPrivileges.value[playingindex.value - 1]
        playingList.value = songList.songs
        playingPrivileges.value = songList.privileges
        playingList.value.unshift(needPlay)
        playingPrivileges.value.unshift(needPlayPrivileges)
        originalsongIndex.value = playingindex.value
        playingindex.value = 1
    } else if (playListId.value == Main.playListId[0] && wayIndex.value != 4) {
        playingList.value = originalList.value as [any]
        playingPrivileges.value = originalPrivileges.value as [any]
        playingindex.value = originalsongIndex.value
        playingId.value = playingList.value[playingindex.value - 1].id
        Main.heartJump = false

    }
})

//子组件修改播放时间
const goTotime = (time: number) => {
    audio = document.querySelector('audio') as HTMLAudioElement
    console.log(audio, time);

    if (audio) {
        audio.currentTime = time / 1000;
        Main.playStatus = 'play'
    }
}

let changeTimeFlag = toRef(globalVar, 'changeTimeFlag')
watch(changeTimeFlag, () => {
    if (changeTimeFlag.value == true) {
        goTotime(globalVar.timeValue)
        changeTimeFlag.value = false
        globalVar.timeValue = 0
    }
})

//音乐详情ye
const musicDetail = () => {
    let mask = document.querySelector('.mask') as HTMLElement
    let elimg = mask.previousSibling as HTMLElement
    elimg.classList.add('el-image-hover')
    mask.classList.add('active-flex');
    mask.children[0].classList.add('active');
}

const musicDetailLeave = () => {
    let mask = document.querySelector('.mask') as HTMLElement
    let elimg = mask.previousSibling as HTMLElement
    elimg.classList.remove('el-image-hover')
    mask.classList.remove('active-flex');
    mask.children[0].classList.add('active');
}

const showDetail = () => {
    if (Main.songType == 'FM') {
        $router.push({
            path: '/app/personalFM',
            query: {
                name: 'personalFM'
            }
        })
    } else {
        if (Main.detailStatus == 'close') Main.detailStatus = 'open'
        else Main.detailStatus = 'close'
    }
}

let simiSong = ref<any>()
let simiPlaylist = ref<any>()
const loaclPlayWay = async()=>{
    audio = document.querySelector('audio') as HTMLAudioElement
    audio.currentTime = 0
    audio.pause()
    console.log(playingId.value);
    lyric.value = {}
    simiSong.value = []
    simiPlaylist.value = []
    if(playingId.value > 0){
        const [lyricData, simiSongData, simiPlaylistData] = await Promise.all([
        Main.reqLyric(playingId.value),
        Main.reqSimiSong(playingId.value),
        Main.reqSimiPlaylist(playingId.value)
    ]);
        console.log(lyricData.data);
        lyric.value = lyricData.data;
        simiSong.value = simiSongData.data.songs;
        simiPlaylist.value = simiPlaylistData.data.playlists;
    }
    window.electron.ipcRenderer.invoke('get-local-music', { path: Main.playingList[Main.playingindex - 1].localPath }).then(({ base64,error }) => {
        if(error){
            nextSong()
            return
        }
        SongUrl.value = `data:audio/mp3;base64,${base64}`
        AC = new AudioContext()
        gainNode = AC.createGain()
        analyser = AC.createAnalyser();
        loadingCanSeeUrl = true
        const arrayBuffer = base64ToArrayBuffer(base64)
        AC.decodeAudioData(arrayBuffer).then((AudioBuffer) => {
            // console.log(AudioBuffer.getChannelData(1));
            // console.log(AudioBuffer.getChannelData(0));
            musicBuffer = AudioBuffer
            bufferSource = AC.createBufferSource();
            analyser.fftSize = 256;
            bufferSource.connect(analyser);
            analyser.connect(AC.destination);
            bufferSource.buffer = AudioBuffer;
            bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            bufferSource.connect(gainNode)
            gainNode.connect(AC.destination);
            gainNode.gain.setValueAtTime(-1, AC.currentTime)
            // var color = canvasCTX.createLinearGradient(oW / 2, oH, oW / 2, oH / 2 - 150);
            // color.addColorStop(0, 'rgba(102, 204, 255,1)');
            drawIndex.value++
            cancelAnimationFrame(animationId)
            draw()
            const t = setTimeout(() => {
                bufferSource.start(0, 0)
                loadingCanSeeUrl = false
                clearTimeout(t)
            }, 0)
        })
        stopOrPlayFlag.value = false
        nextTick(() => {
            audio.playbackRate = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            if (bufferSource) bufferSource.playbackRate.value = audio.playbackRate
            audio.play()
            nowLevel.value = 'local'
            levelName.value = '本地'
            playStatus.value = 'play'
            let str = playingList.value[playingindex.value - 1].name + ' - ';
            let singerArr = playingList.value[playingindex.value - 1].ar as unknown as Array<any>
            singerArr.forEach((element, index) => {
                str += element.name
                if (index != singerArr.length - 1) str += ' / '
            })
            window.electron.ipcRenderer.send('change-play-thum', str)
            window.electron.ipcRenderer.send('render-play')
            // stopPlayAudip()
        })
    })
}
const normalPlayWay = async()=>{
    if (playingId.value != -1) {
        audio = document.querySelector('audio') as HTMLAudioElement
        audio.currentTime = 0
        audio.pause()
        let result: any = await Main.reqSongUrl(playingId.value)
        lyric.value = (await Main.reqLyric(playingId.value)).data
        await musicCanSee(result.data.data[0].url, 0, 0)
        SongUrl.value = result.data.data[0].url
        nextTick(() => {
            stopOrPlayFlag.value = false
            audio.playbackRate = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            bufferSource.playbackRate.value = audio.playbackRate
            audio.play()
        })
        nowLevel.value = 'standard'
        levelName.value = '标准'
        //喜欢这首歌的人也听与包含这首歌的歌单
        simiSong.value = (await Main.reqSimiSong(playingId.value)).data.songs;
        simiPlaylist.value = (await Main.reqSimiPlaylist(playingId.value)).data.playlists;
        console.log(simiSong, simiPlaylist);
    }
}
//获取播放url

// const song = {
//             name:item.title,
//             id:getSongid(index,item?.userDefinedText?.[0],item?.comment?.text),
//             ar:getSinger(index,item.artist, item?.userDefinedText?.[2],item?.comment?.text),
//             al:getZhuanji(index,item.album, item?.userDefinedText?.[1],item?.comment?.text),
//             localPath:item.path,
//             dt:getTime(item)
//         }
//         console.log(item);
//         playingList.push(song)
//         playingList[playingList.length - 1].al['picUrl'] = await bufferToBase64(item.image?.imageBuffer)
//         const privilege = {
//             id:getSongid(index,item?.userDefinedText?.[0],item?.comment?.text),
//             maxBrLevel: "local",
//             playMaxBrLevel: "local",
//             downloadMaxBrLevel: "local",
//             plLevel: "local",
//             dlLevel: "local",
//             flLevel: "local",
//         }




watch(playingId, async () => {
    nextTick(()=>{
        const playList = document.querySelector("#play-list-Panel-bottom")!.children
        if(Main.playingList[Main.playingindex - 1].localPath){
            loaclPlayWay()
        }else if(eval(playList[Main.playingindex - 1].getAttribute('data-download')!)){
            setTimeout(()=>{
                console.log(playList[Main.playingindex - 1].getAttribute('data-download')!);
                console.log(playList[Main.playingindex - 1].getAttribute('data-path'));
                let path = playList[Main.playingindex - 1].getAttribute('data-path')
                if(!path?.endsWith('.mp3'))path+='.mp3'
                Main.playingList[Main.playingindex - 1]['localPath'] = path
                console.log(Main.playingList[Main.playingindex - 1]);
                Main.playingPrivileges[Main.playingindex - 1] = {
                    id:playingId.value,
                    maxBrLevel: "local",
                    playMaxBrLevel: "local",
                    downloadMaxBrLevel: "local",
                    plLevel: "local",
                    dlLevel: "local",
                    flLevel: "local",
                }
                loaclPlayWay()
            })
        }else{
            if ((Main.beforePlayListId == 0 || Main.beforePlayListId == -2) && Main.songType != 'FM') {
                loaclPlayWay()
            } else if(Main.beforePlayListId == -3){
                nextTick(()=>{
                    if(Main.playingList[Main.playingindex - 1].localPath){
                        loaclPlayWay()
                    }else{
                        normalPlayWay()
                    }
                })

            }else{
                normalPlayWay()
            }
        }
    })
})
function base64ToArrayBuffer(base64) {
    const binaryStr = atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
        bytes[i] = binaryStr.charCodeAt(i);
    }
    return bytes.buffer;
}
// let t = setTimeout(async ()=>{
//             const CiId = await electronIpc.ipcSendSync('getWindowId','Ci');
//             clearTimeout(t);
//             electronIpc.ipcSendTo(CiId, 'to-Ci', lyric);
//         },1000)
watch(lyric, async () => {
    let str = playingList.value[playingindex.value - 1].name + ' - ';
    let singerArr = playingList.value[playingindex.value - 1].ar as unknown as Array<any>
    singerArr.forEach((element, index) => {
        str += element.name
        if (index != singerArr.length - 1) str += ' / '
    })
    window.electron.ipcRenderer.sendTo(ciId, 'to-title', str);
    window.electron.ipcRenderer.sendTo(ciId, 'to-Ci', lyric.value);
    ElectronToApp.lrcArry = lyric.value

})


//audio初始化
let currentTime = ref<number>(0)
watch(currentTime, () => {
    globalVar.currentTime = currentTime.value
})
watch(playingId, () => {
    globalVar.lyricOffset = 0
    window.electron.ipcRenderer.sendTo(ciId, 'lyric-offset-ci', 0)
})

onMounted(async () => {
    audio = document.querySelector('audio') as HTMLAudioElement
    loadingLine = $el.refs['line-loading'] as HTMLElement
    playLine = $el.refs['line-play'] as HTMLElement
    playBall = $el.refs['block'] as HTMLElement
    line = $el.refs['audio-line'] as HTMLElement
    let timeValueFlag = true
    audio.addEventListener('timeupdate', () => {
        if (audio.currentTime >= 1 && timeValueFlag) {
            timeValueFlag = false
            if(globalVar.timeValue!=0){
                audio.currentTime = globalVar.timeValue / 1000
                const currentTime = AC.currentTime;
                AC = new AudioContext()
                gainNode = AC.createGain()
                analyser = AC.createAnalyser();
                bufferSource.stop(currentTime);
                bufferSource.disconnect()
                bufferSource = AC.createBufferSource()
                bufferSource.buffer = musicBuffer
                bufferSource.connect(AC.destination)
                bufferSource.connect(analyser);
                bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
                bufferSource.start(0,globalVar.timeValue / 1000);
                bufferSource.connect(gainNode)
                gainNode.connect(AC.destination);
                gainNode.gain.setValueAtTime(-1, AC.currentTime)
                drawIndex.value++
                cancelAnimationFrame(animationId)
                draw()
                globalVar.timeValue = 0
            }
            timeValueFlag = true
        }
    });
    //canplay
    // audio.addEventListener('canplay', () => {
    //     console.log('canplaycanplaycanplaycanplaycanplaycanplaycanplaycanplay',globalVar.timeValue);

    // })
    //加载进度
    audio.addEventListener('progress', () => {
        console.log(audio.duration);
        if (!isNaN(audio.duration)) {
            let timeRanges = audio.buffered;
            // 获取以缓存的时间
            let timeBuffered = timeRanges.end(timeRanges.length - 1);
            // 获取缓存进度，值为0到1
            let bufferPercent = timeBuffered / audio.duration;
            loadingLine.style.width = bufferPercent * 100 + '%'
        }
    })
    //末时间
    audio.addEventListener('canplaythrough', () => {
        endTime.value = dayjsSMMSS(Math.floor(audio.duration))
    })
    //播放进度
    audio.addEventListener('timeupdate', () => {
        if (!audioPlayFlag.value) {
            window.electron.ipcRenderer.sendTo(ciId, 'to-currentTime', audio.currentTime);
            currentTime.value = audio.currentTime
            let bar = (audio.currentTime / audio.duration) * 100
            playLine.style.width = bar + '%'
            playBall.style.left = (audio.currentTime / audio.duration) * line.offsetWidth - 4.5 + 'px'
            // console.log((audio.currentTime / audio.duration) * line.offsetWidth - 4.5);
            nowTime.value = dayjsSMMSS(audio.currentTime)
        }
    })
    //播放完毕
    audio.addEventListener('ended', async () => {
        console.log('播放完毕');
        stopOrPlayFlag.value = true;
        bufferSource.stop()
        cancelAnimationFrame(animationId)
        if ((wayIndex.value == 0 && Main.playingList.length != 1)|| wayIndex.value == 4 || Main.songType == 'FM') {
            nextSongThor()
        } else if (wayIndex.value == 1 ||( wayIndex.value == 0 && Main.playingList.length == 1)) {
            AC = new AudioContext()
            gainNode = AC.createGain()
            analyser = AC.createAnalyser();
            const currentTime = AC.currentTime;
            bufferSource.stop(currentTime);
            bufferSource.disconnect()
            bufferSource = AC.createBufferSource()
            bufferSource.buffer = musicBuffer
            bufferSource.connect(AC.destination)
            bufferSource.connect(analyser);
            bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            bufferSource.start();
            dataArray = new Uint8Array(analyser.frequencyBinCount);
            bufferSource.connect(gainNode)
            gainNode.connect(AC.destination);
            gainNode.gain.setValueAtTime(-1, AC.currentTime)
            drawIndex.value++
            cancelAnimationFrame(animationId)
            draw()
            audio.play()
            stopOrPlayFlag.value = false
        } else if (wayIndex.value == 2) {
            playingindex.value = rand(1, playingList.value.length, playingindex.value)
            playingId.value = playingList.value[playingindex.value - 1].id
            randQueue.push(playingindex.value)
            randIndex.value++;
        } else if (wayIndex.value == 3) {
            if (playingindex.value == playingList.value.length) {
                audio.pause();
                stopOrPlayFlag.value = false
                changPlayStatus()
            } else {
                playingindex.value++;
                playingId.value = playingList.value[playingindex.value - 1].id
            }
        }
    })
})

//点击拖动修改播放位置
let clickX: number;
let baseWidth: number;
const audioPlay = (e: MouseEvent) => {
    if (loadingCanSeeUrl) return
    audioPlayFlag.value = true;
    clickX = e.pageX;
    window.addEventListener('mousemove', audioPlayMoving)
    window.addEventListener('mouseup', audioPlayEnd)
    playLine = $el.refs['line-play'] as HTMLElement
    baseWidth = playLine.offsetWidth
}

const audioPlayMoving = (e: MouseEvent) => {
    if (audioPlayFlag.value) {
        let x = e.pageX
        playLine = $el.refs['line-play'] as HTMLElement
        playBall = $el.refs['block'] as HTMLElement
        line = $el.refs['audio-line'] as HTMLElement
        let t;
        if (x > clickX) {
            //右移
            let space = x - clickX;
            t = (baseWidth + space) / line.offsetWidth * 100
            if (t < 0) t = 0;
            else if (t > 100) t = 100;
            playLine.style.width = t + '%'
            t = baseWidth + space - 4.5
            if (t < 0) t = 0;
            else if (t > line.offsetWidth) t = line.offsetWidth;
            playBall.style.left = t + 'px'
        } else {
            //左移
            let space = clickX - x;
            t = (baseWidth - space) / line.offsetWidth * 100
            if (t < 0) t = 0;
            else if (t > 100) t = 100;
            playLine.style.width = t + '%'
            t = baseWidth - space - 4.5
            if (t < 0) t = 0;
            else if (t > line.offsetWidth) t = line.offsetWidth;
            playBall.style.left = t + 'px'
        }
    }

}

let suo = ref(true)
const audioPlayEnd = () => {
    audio = document.querySelector('audio') as HTMLAudioElement
    playLine = $el.refs['line-play'] as HTMLElement
    let wh = playLine.style.width
    audio.currentTime = Number(wh.substring(0, wh.length - 1)) * audio.duration * 0.01
    const currentTime = AC.currentTime;
    AC = new AudioContext()
    gainNode = AC.createGain()
    analyser = AC.createAnalyser();
    bufferSource.stop(currentTime);
    bufferSource.disconnect()
    bufferSource = AC.createBufferSource()
    bufferSource.buffer = musicBuffer
    bufferSource.connect(AC.destination)
    bufferSource.connect(analyser);
    bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
    bufferSource.start(0, Number(wh.substring(0, wh.length - 1)) * audio.duration * 0.01);
    dataArray = new Uint8Array(analyser.frequencyBinCount);
    bufferSource.connect(gainNode)
    gainNode.connect(AC.destination);
    gainNode.gain.setValueAtTime(-1, AC.currentTime)
    drawIndex.value++
    cancelAnimationFrame(animationId)
    draw()
    audioPlayFlag.value = false;
    suo.value = false
    window.removeEventListener('mousemove', audioPlayMoving)
    window.removeEventListener('mouseup', audioPlayEnd)
}

const loginQuit = toRef(globalVar, 'loginQuit')
watch(loginQuit, () => {
    if (loginQuit.value == true) {
        loginQuit.value = false
        bufferSource.stop(AC.currentTime)
        audio.pause()
    }
})




//点击修改播放
const clickAudioPlay = (e: MouseEvent) => {
    if (loadingCanSeeUrl) return
    if (playingList.value.length) {
        if (suo.value) {
            audio = document.querySelector('audio') as HTMLAudioElement
            playLine = $el.refs['line-play'] as HTMLElement
            playBall = $el.refs['block'] as HTMLElement
            line = $el.refs['audio-line'] as HTMLElement
            let wh = e.offsetX
            playBall.style.left = wh - 4.5 + 'px'
            playLine.style.width = wh / line.offsetWidth * 100 + '%'
            nowTime.value = dayjsSMMSS(audio.duration * (wh / line.offsetWidth))
            suoFlag.value = true;
            audio.currentTime = wh / line.offsetWidth * audio.duration
            const currentTime = AC.currentTime;
            AC = new AudioContext()
            gainNode = AC.createGain()
            analyser = AC.createAnalyser();
            bufferSource.stop(currentTime);
            bufferSource.disconnect()
            bufferSource = AC.createBufferSource()
            bufferSource.buffer = musicBuffer
            bufferSource.connect(AC.destination)
            bufferSource.connect(analyser);
            bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            bufferSource.start(0, wh / line.offsetWidth * audio.duration);
            bufferSource.connect(gainNode)
            gainNode.connect(AC.destination);
            gainNode.gain.setValueAtTime(-1, AC.currentTime)
            drawIndex.value++
            cancelAnimationFrame(animationId)
            draw()
            // musicCanSee(SongUrl.value,currentTime,0)
        } else {
            suo.value = true;
        }
    }

}


//点击播放按钮
let wayIndex3Flag = false
const stopOrPlay = () => {
    if (playingList.value.length !== 0) {
        stopOrPlayFlag.value = !stopOrPlayFlag.value
        if (audio.paused) {
            if (wayIndex.value == 3 && playingindex.value == playingList.value.length) {
                if(!wayIndex3Flag){
                    wayIndex3Flag = true
                    return
                }
                playingindex.value = 1
                playingId.value = playingList.value[playingindex.value - 1].id
                wayIndex3Flag = false
            } else {
                audio.play();
                Main.playStatus = 'play'
                if (AC && AC.state === "suspended") AC.resume();
                window.electron.ipcRenderer.send('render-play')
            }
        } else if(!audio.paused){
            audio.pause();
            Main.playStatus = 'stop'
            if (AC && AC.state === "running") AC.suspend();
            window.electron.ipcRenderer.send('render-play-fail')
        }
    }
}

const changPlayStatus = () => {
    if (playStatus.value == 'play') playStatus.value = 'stop'
    else playStatus.value = 'play'
}


//下一种播放模式
let showPlayWay = ref(false)
const nextWay = () => {
    wayIndex.value++;
    showPlayWay.value = true
    if (wayIndex.value == iconWay.value.length) {
        wayIndex.value = 0
    }
    if (wayIndex.value !== 2) {
        randQueue = [];
        randIndex.value = -1;
    }
}

//打开歌词
const openCi = async () => {
    if (playingList.value.length) {
        showCi.value = !showCi.value
        let dom = $el.refs.ci as HTMLElement
        if (dom.classList.contains('open-ci')) {
            dom.classList.remove('open-ci')
        } else {
            dom.classList.add('open-ci')
        }
        window.electron.ipcRenderer.send('open-lyric', showCi.value)
    }
}
//关闭歌词
window.electron.ipcRenderer.on('to-close-ci', ({ }, flag: [boolean]) => {
    showCi.value = flag[0]
    let dom = $el.refs.ci as HTMLElement
    dom.classList.remove('open-ci')
})
//监视播放给另一个进程
let playStatus = toRef(Main, 'playStatus')
watch(playStatus, async () => {
    window.electron.ipcRenderer.sendTo(ciId, 'play-status', playStatus.value)
    stopOrPlay()
}, { immediate: true })
//另一进程play or stop
window.electron.ipcRenderer.on('play-or-stop', () => {
    changPlayStatus();
})
//另一进程上一首
window.electron.ipcRenderer.on('prev-song', () => {
    prevSongThor();
})
//另一进程下一首
window.electron.ipcRenderer.on('next-song', () => {
    nextSongThor();
})
//另一进程歌词偏离
let lyricOffset = toRef(globalVar, 'lyricOffset')
window.electron.ipcRenderer.on('lyric-offset', ({ }, num: [number]) => {
    offsetFlag.value = true
    lyricOffset.value = num[0]
})

//上一首
const prevSong = () => {
    if (Main.songType == 'FM') {
        if (Main.FMindex > 0) {
            Main.FMindex--
        }
    } else {
        originalsongIndex.value++
        if (wayIndex.value == 2) {
            randIndex.value--;
            if (randIndex.value == -1) {
                playingindex.value = rand(1, playingList.value.length, playingindex.value)
                playingId.value = playingList.value[playingindex.value - 1].id
                randQueue.unshift(playingindex.value)
                randIndex.value++;
            }
            playingindex.value = randQueue[randIndex.value]
        } else {
            playingindex.value--
            if (playingindex.value == 0) {
                playingindex.value = playingList.value.length
            }
        }
        playingId.value = playingList.value[playingindex.value - 1].id
        playStatus.value = 'play'
        let str = playingList.value[playingindex.value - 1].name + ' - ';
        let singerArr = playingList.value[playingindex.value - 1].ar as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
    }
}
//下一首
const nextSong = () => {
    if (Main.songType == 'FM') {
        Main.FMindex++
    } else {
        originalsongIndex.value++
        if (wayIndex.value == 2) {
            randIndex.value++;
            if (randIndex.value == randQueue.length) {
                let randNum = rand(1, playingList.value.length, playingindex.value)
                playingindex.value = randNum
                playingId.value = playingList.value[playingindex.value - 1].id
                randQueue.push(playingindex.value)
            }
            playingindex.value = randQueue[randIndex.value]
        } else {
            playingindex.value++
            if (playingindex.value == playingList.value.length + 1) {
                playingindex.value = 1
            }
        }
        playingId.value = playingList.value[playingindex.value - 1].id
        playStatus.value = 'play'
        let str = playingList.value[playingindex.value - 1].name + ' - ';
        let singerArr = playingList.value[playingindex.value - 1].ar as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
    }

}

const nextSongThor = throttle(nextSong, 1000, { leading: true })
const prevSongThor = throttle(prevSong, 1000, { leading: true })

//audio修改音量
const audioVolume = () => {
    audio = document.querySelector('audio') as HTMLAudioElement
    let value = Number(localStorage.getItem('baseLine')) / 100.0
    console.log(value);
    audio.volume = value;
}


//静音
let stopValue = '0%'
const Mute = () => {
    MuteFlag.value = !MuteFlag.value;
    let t = document.querySelector('.liang') as HTMLElement;
    if (t.style.height != '0%') {
        stopValue = t.style.height
        t.style.height = '0%'
        localStorage.setItem('baseLine', '0')
    } else {
        t.style.height = stopValue
        localStorage.setItem('baseLine', stopValue.substring(0, stopValue.length - 1))
        stopValue = '0%'
    }
    audioVolume();
}

//音量控制
let clickY: number;
let _that: HTMLElement;
let which: HTMLElement;
let bk: HTMLElement
let baseLine: number;
let changeShengYing = ref(false)
const changeShenYing = () => {
    changeShengYing.value = true
}

let movingFlag = ref(false);
const endShenYing = () => {
    if (!movingFlag.value) {
        changeShengYing.value = false
    }
}


const move = (e: MouseEvent) => {
    movingFlag.value = true
    let y = e.pageY;
    baseLine = Number(localStorage.getItem('baseLine'))
    let step;
    if (y < clickY) step = (((clickY - y) / bk.offsetHeight) * 100 + baseLine);
    else step = (baseLine - ((y - clickY) / bk.offsetHeight) * 100)
    // step = ((Math.abs(y - clickY - baseLine)  / bk.offsetHeight) * 100;
    if (step > 100) step = 100
    else if (step < 0) step = 0
    if (step == 0) MuteFlag.value = false;
    else MuteFlag.value = true;
    which.style.height = step + '%'
    audio = document.querySelector('audio') as HTMLAudioElement
    audio.volume = step / 100.0
}


const beginMove = (e: MouseEvent) => {
    if (changeShengYing.value) {
        clickY = e.pageY
        movingFlag.value = true
        _that = e.target as HTMLElement //点击的按钮
        which = _that?.parentNode as HTMLElement     //修改的对象
        bk = which?.parentNode as HTMLElement
        which.style.height = Number(localStorage.getItem('baseLine')) + '%'
        audioVolume();
        window.addEventListener('mousemove', move)
        window.addEventListener('mouseup', movingEnd)
    }
}

const movingEnd = () => {
    movingFlag.value = false
    let str = which.style.height
    localStorage.setItem('baseLine', str.substring(0, str.length - 1))
    audioVolume();
    window.removeEventListener('mouseup', movingEnd)
    window.removeEventListener('mousemove', move)
}
let suoFlag = toRef(globalVar, 'lrcScrollSuo')
//直接修改
const immediateChamgeYingLiang = (e: MouseEvent) => {
    // baseLine = Number(localStorage.getItem('baseLine'))
    // let bar = (e.offsetY / 60) * 100
    // localStorage.setItem('baseLine',bar.toString())
    let dom = e.target as HTMLElement
    if (dom.classList.contains('hua')) {
        //点击灰色部分
        let topSpace = e.offsetY;   //px
        which = dom.children[0] as HTMLElement
        let bottomPer = Number(localStorage.getItem('baseLine')) * 0.8    //%转为px
        let changeWay = 80 - topSpace - bottomPer                   //位移px
        bottomPer = (changeWay + bottomPer) / 80 * 100
        which.style.height = bottomPer + '%'
        localStorage.setItem('baseLine', bottomPer.toString())
    } else if (dom.classList.contains('liang')) {
        //点击彩色部分
        let topSpace = e.offsetY
        let bottomPer = Number(localStorage.getItem('baseLine')) * 0.8
        bottomPer = (bottomPer - topSpace) / 80 * 100
        dom.style.height = bottomPer + '%'
        localStorage.setItem('baseLine', bottomPer.toString())
    }
    audioVolume();
}

//音量控制 初始化
onMounted(() => {
    let dom = document.querySelector('.liang') as HTMLElement
    dom.style.height = Number(localStorage.getItem('baseLine')) + '%'
    if (Number(localStorage.getItem('baseLine')) == 0) {
        MuteFlag.value = false
    } else {
        MuteFlag.value = true
    }
    audioVolume();
})

//禁用播放器
const stopPlayAudip = () => {
    if (playingList.value.length == 0) {
        stopOrPlayFlag.value = true
        nextTick(() => {
            let dom = $el.refs.top as HTMLElement
            if (globalVar.oneself == 1) {
                dom.classList.add('stop-oneself')
            } else {
                dom.classList.add('stop')
            }
            dom.classList.remove('can')
            dom.classList.remove('can-onself')
            let [...arr] = dom.children as unknown as Array<HTMLElement>
            arr.forEach((element: HTMLElement) => {
                element.classList.remove('active')
            })
        })

    } else {
        stopOrPlayFlag.value = false
        nextTick(() => {
            let dom = $el.refs.top as HTMLElement
            if (globalVar.oneself == 1) {
                dom.classList.add('can-oneself')
            } else {
                dom.classList.add('can')
            }
            dom.classList.remove('stop')
            dom.classList.remove('stop-oneself')
            let [...arr] = dom.children as unknown as Array<HTMLElement>
            arr.forEach((element: HTMLElement) => {
                element.classList.add('active')
            })
        })

    }
}
const oneself = toRef(globalVar, 'oneself')
watch(oneself, () => {
    let dom = $el.refs.top as HTMLElement
    if (oneself.value == 0) {
        if (dom.classList.contains('can-oneself')) {
            dom.classList.remove('can-oneself')
            dom.classList.add('can')
        } else if (dom.classList.contains('remove-oneself')) {
            dom.classList.remove('remove-oneself')
            dom.classList.add('remover')
        }
    } else {
        if (dom.classList.contains('can')) {
            dom.classList.add('can-oneself')
            dom.classList.remove('can')
        } else if (dom.classList.contains('remove')) {
            dom.classList.remove('remove')
            dom.classList.add('remove-oneself')
        }
    }
})
watch(playingList, () => {
    stopPlayAudip();
    if (playingList.value.length == 0) {
        window.removeEventListener('keydown', keyDownWatch)
    } else {
        window.addEventListener('keydown', keyDownWatch)
    }
}, { deep: true })

onMounted(() => {
    stopPlayAudip();
})

//左部名字滚动
let moveNameFlag = ref(true)
let moveSingerFlag = ref(true)
const rushName = (str: string) => {
    let dom = document.querySelector(`#${str}`) as HTMLElement;
    if (moveNameFlag.value && dom.offsetWidth > 150) {
        dom.style.transition = 'transform 10s linear'
        moveNameFlag.value = false
        let father = dom.parentNode;
        father?.appendChild(dom.cloneNode(true))
        let [...arr] = father?.children as unknown as Array<HTMLElement>
        arr.forEach((element: HTMLElement) => {
            let len = element.offsetWidth + 10
            element.style.transform = 'translateX(-' + len + 'px)'
        })
        let time = setTimeout(() => {
            // father?.removeChild(arr[0])
            dom.removeAttribute('style')
            arr[0].removeAttribute('style')
            father?.removeChild(arr[1])
            moveNameFlag.value = true
            clearTimeout(time)
        }, 10000)
    }
}

const rushSinger = (str: string) => {
    let dom = document.querySelector(`#${str}`) as HTMLElement;
    if (moveSingerFlag.value && dom.offsetWidth > 150) {
        dom.style.transition = 'transform 10.5s linear'
        moveSingerFlag.value = false
        let father = dom.parentNode;
        father?.appendChild(dom.cloneNode(true))
        let [...arr] = father?.children as unknown as Array<HTMLElement>
        arr.forEach((element: HTMLElement) => {
            let len = element.offsetWidth + 10
            element.style.transform = 'translateX(-' + len + 'px)'
        })
        let time = setTimeout(() => {
            dom.removeAttribute('style')
            arr[0].removeAttribute('style')
            father?.removeChild(arr[1])
            moveSingerFlag.value = true
            clearTimeout(time)
        }, 10000)
    }
}
//右部音质选择
let showLevelFlag = ref(false)
const showLevel = () => {
    showLevelFlag.value = !showLevelFlag.value
}
//修改音质span
let levelName = ref('标准')
let nowLevel = ref('standard')
const changeSpanLevel = async (level: string, level2: string) => {
    levelName.value = level
    nowLevel.value = level2
    audio = document.querySelector('audio') as HTMLAudioElement
    changPlayStatus();
    let t = audio.currentTime
    let result: any = await Main.reqSongUrl(playingId.value, nowLevel.value)
    nextTick(async () => {
        await musicCanSee(result.data.data[0].url, t, 100)
        SongUrl.value = result.data.data[0].url
        audio = document.querySelector('audio') as HTMLAudioElement
        console.log(Number(speedPower.value.substring(0, speedPower.value.length - 1)), 'DAJSIDHAYUCGAWJHUYADGA');
        bufferSource.playbackRate.value = audio.playbackRate
        setTimeout(() => {
            audio.currentTime = t
            audio.playbackRate = Number(speedPower.value.substring(0, speedPower.value.length - 1))
            changPlayStatus();
        }, 100)
    })
}

//修改速度
let showSpeedFlag = ref(false)
let speedPower = ref('1x')
const showSpeed = () => {
    showSpeedFlag.value = !showSpeedFlag.value
}

const changeSpanSpeed = (speedPowerName: string) => {
    speedPower.value = speedPowerName
    audio = document.querySelector('audio') as HTMLAudioElement
    let rate = Number(speedPower.value.substring(0, speedPower.value.length - 1))
    audio.playbackRate = rate
    bufferSource.playbackRate.value = rate
    console.log(audio.playbackRate);
}

//打开播放列表
let PlayListPanelFlag = ref(false)
const showPlayListPanel = () => {
    PlayListPanelFlag.value = !PlayListPanelFlag.value
}

//清空播放列表
const clearList = () => {
    audio = document.querySelector('audio') as HTMLAudioElement
    audio.pause()
    stopOrPlayFlag.value = true
    audioPlayFlag.value = false
    endTime.value = dayjsSMMSS(0)
    AC = new AudioContext()
    gainNode = AC.createGain()
    analyser = AC.createAnalyser();
    canvas.getContext('2d')!.clearRect(0, 0, canvas.width, canvas.height);
}

//按键监视
const keyDownWatch = (e: KeyboardEvent) => {
    const activeEl = document.activeElement;
    if (!activeEl || activeEl.tagName.toLowerCase() === 'input') return
    if (e.ctrlKey) {
        if (e.code == 'ArrowRight') {
            nextSongThor();
        } else if (e.code == 'ArrowLeft') {
            prevSong();
        } else if (e.code == 'KeyP') {
            changPlayStatus();
        }
    }
    if (e.code == 'Space') {
        changPlayStatus();
    }
}

//主进程播放
onMounted(() => {
    window.electron.ipcRenderer.on('main-prev', () => {
        if (playingList.value.length != 0) {
            console.log('上一首');
            prevSongThor();
        }
    })
    window.electron.ipcRenderer.on('main-next', () => {
        if (playingList.value.length != 0) {
            console.log('下一首');
            nextSongThor();
        }
    })
    window.electron.ipcRenderer.on('main-play', () => {
        if (playingList.value.length != 0) {
            console.log('播放');
            changPlayStatus();
        } else {
            window.electron.ipcRenderer.send('render-play-fail')
        }
    })
    // window.electron.ipcRenderer.on('main-stop', () => {
    //     if (playingList.value.length != 0) {
    //         console.log('暂停');
    //         changPlayStatus();
    //     }
    // })
})

//垃圾桶
let rubishFlag = toRef(globalVar, 'rubishFlag')
const rubish = () => {
    rubishFlag.value = true
}

//音频可视化
let canvas: HTMLCanvasElement
let canvasCTX: CanvasRenderingContext2D
onMounted(() => {
    canvas = document.querySelector('#canvasLook') as HTMLCanvasElement
    canvas.height = 70
    canvasCTX = canvas.getContext("2d") as CanvasRenderingContext2D
    canvasCTX.fillStyle = 'red';
})
const MainMenu = useMainMenu()
const Width = toRef(MainMenu, 'width')
watch(Width, () => {
    nextTick(() => {
        canvas.width = Width.value
    })
}, { immediate: true })
let AC: AudioContext;
let bufferSource: AudioBufferSourceNode;
let gainNode: GainNode;
let analyser: AnalyserNode;
let musicBuffer: AudioBuffer
let dataArray: Uint8Array
let loadingCanSeeUrl: boolean = false
const musicCanSee = (url: string, offset: number, timer: number) => {
    if (bufferSource) bufferSource.stop()
    AC = new AudioContext()
    gainNode = AC.createGain()
    analyser = AC.createAnalyser();
    loadingCanSeeUrl = true
    return new Promise<any>((resolve) => {
        fetch(url, { mode: 'cors' }).then((response) => {
            return response.arrayBuffer()
        }).then((buffer) => {
            // console.log('拉取音频流解码成AudioBuffer',buffer);
            //拉取音频流解码成AudioBuffer
            //音频可视化
            console.log(buffer);
            AC.decodeAudioData(buffer).then((AudioBuffer) => {
                // console.log(AudioBuffer);
                musicBuffer = AudioBuffer
                bufferSource = AC.createBufferSource();
                analyser.fftSize = 256;
                bufferSource.connect(analyser);
                analyser.connect(AC.destination);
                bufferSource.buffer = AudioBuffer;
                bufferSource.playbackRate.value = Number(speedPower.value.substring(0, speedPower.value.length - 1))
                dataArray = new Uint8Array(analyser.frequencyBinCount);
                bufferSource.connect(gainNode)
                gainNode.connect(AC.destination);
                gainNode.gain.setValueAtTime(-1, AC.currentTime)
                // var color = canvasCTX.createLinearGradient(oW / 2, oH, oW / 2, oH / 2 - 150);
                // color.addColorStop(0, 'rgba(102, 204, 255,1)');
                drawIndex.value++
                cancelAnimationFrame(animationId)
                draw()
                resolve('ok')
                const t = setTimeout(() => {
                    bufferSource.start(0, offset)
                    loadingCanSeeUrl = false
                    clearTimeout(t)
                }, timer)
            })
        })
    })
}
const drawIndex = ref(0)
function draw() {
    console.log(drawIndex.value);
    let oW = canvas.width;
    let oH = canvas.height;
    animationId = requestAnimationFrame(draw)
    canvasCTX.clearRect(0, 0, oW, oH);
    let barHeight;
    canvasCTX.clearRect(0, 0, oW, oH);
    for (let i = 0; i < dataArray.length; i++) {
        barHeight = dataArray[i]
        analyser.getByteFrequencyData(dataArray)
        // 绘制向上的线条
        canvasCTX.fillStyle = document.documentElement.style.getPropertyValue('--primaryColor')
        canvasCTX.fillRect(oW / 2 + (i * 8), oH, 2, -barHeight / 4 + 30);
        canvasCTX.fillRect(oW / 2 - (i * 8), oH, 2, -barHeight / 4 + 30);
    }
}
watch(playStatus,()=>{
    if(playStatus.value == 'stop'){
        cancelAnimationFrame(animationId)
    }else{
        console.log(AC,gainNode,analyser);
        if(AC && gainNode && analyser)draw()
    }
})

//历史播放
watch(SongUrl,()=>{
    if(Main.latelyPlay.length > 100)Main.latelyPlay.length = 100
    const t = playingList.value[playingindex.value - 1]
    t['privilege'] = Main.playingPrivileges[playingindex.value - 1]
    if(!t['privilege'])t['privilege'] = playingList.value[playingindex.value - 1].privilege
    console.log(t);
    t['lately'] = new Date().getTime()
    Main.latelyPlay = Main.latelyPlay.filter((item)=>{
        return item.id != t.id
    })
    Main.latelyPlay.unshift(t)
})
const goHandSong = (e:MouseEvent)=>{
    const dom = e.target as HTMLElement
    console.log(dom.getAttribute('data-id'));
    const id = dom.getAttribute('data-id')
    if(id){
        $router.push({
            name:'SongHand',
            query:{
                id
            }
        })
    }
}

//操作
const startDialogFlag = ref(false)
const imgRef = ref<InstanceType<typeof HTMLElement>>()
const todoHandle = (index)=>{
    if(index == 0){
        startDialogFlag.value = true
        willStartListId.value = [Main.playing]
    }else if(index == 1){
        download(Main.playing)
    }else if(index == 2){
        const ar = Main.playingList[Main.playingindex - 1].ar.map(it=>it.name).join('/')
        globalVar.share.message = `单曲：${Main.playingList[Main.playingindex - 1].name}-${ar}`
        globalVar.share.imgUrl = Main.playingList[Main.playingindex - 1].al.picUrl
        globalVar.share.id = Main.playing
        globalVar.share.type = 'song'
        senddongtaiFlag.value = true
    }
}

watch(()=>globalVar.share.imgUrl,()=>{
    nextTick(()=>{
        imgRef.value!.style.backgroundImage = `url(${globalVar.share.imgUrl})`
    })
})

const closeDialog = (done: () => void)=>{
    done()
    startDialogFlag.value = false
}

const closeShareDialog = (done :()=>void)=>{
    done()
    senddongtaiFlag.value = false
    WriteCommitRef.value.textarea = ''
    globalVar.share = {
        name:'',
        imgUrl:'',
        message:'',
        type:'noresource',
        id:-1,
        txt:''
    }
}

const addIn = async(id,index)=>{
    if(index == 0 && willStartListId.value.length == 1){
        Main.reqLike(Number(playingId.value), true)
        console.log(playingId.value);
        likes.value.unshift(playingId.value)
        globalVar.loadMessageDefault = '已添加到我喜欢的音乐'
        globalVar.loadMessageDefaultFlag = true
        Main.likeChange = `${playingId.value},true`
    }else{
        globalVar.loadDefault = true
        let result = (await Main.reqPlaylistTracks('add',id,willStartListId.value)).data
        globalVar.loadDefault = false
        if (result.body.code == 200) {
            globalVar.loadMessageDefault = '已收藏到歌单'
            globalVar.loadMessageDefaultFlag = true 
            Main.playList[index].trackCount += willStartListId.value.length
            if($route.name == 'songPlaylist' && $route.query.id == id){
                Main.likeChange = `${id},true`
            }
        }
    }
    startDialogFlag.value = false
}

const create = ()=>{
    globalVar.addPlayFlag = true
    globalVar.addPlayId = willStartListId.value
}

watch(()=>globalVar.addPlayId,()=>{
    if(globalVar.addPlayId.length == 0){
        startDialogFlag.value = false
    }
})

const download = async (id: number) => {
    globalVar.loadDefault = true
    const result = await Main.reqSongDetail([id])
    globalVar.loadDefault = false
    let songName = ''
    const arList = result.data.songs[0].ar as any[]
    arList.forEach((el, index) => {
        songName = songName + el.name
        if (index != arList.length - 1) songName = songName + ','
    })
    songName = songName + ' - ' + result.data.songs[0].name
    const dl = result.data.privileges[0].dlLevel
    const pl = result.data.privileges[0].plLevel
    if (dl == 'none' && pl == 'none') {
        ElMessage({
            type: 'error',
            message: '无可下载资源',
            duration: 1000
        })
    } else {
        globalVar.downloadFlag = true
        globalVar.downloadLevel = {
            play: pl,
            download: dl,
            songName,
            id
        }
    }
}


const getZhuanfaText = (message:string)=>{
    globalVar.share.txt = message
}
const senddongtaiFlag = toRef(globalVar,'shareDialogFlag')
const confirm = async()=>{
    try {
        senddongtaiFlag.value = false
        globalVar.loadDefault  = true
        let result = await Main.reqShareResource(globalVar.share.type,globalVar.share.id,globalVar.share.txt)
        // let result = await Main.reqShareResource(globalVar.share.type,Main.playing,zhuanfaMessage.value)
        globalVar.loadDefault  = false
        if(result.code == 200){
            globalVar.loadMessageDefault = '分享成功'
            globalVar.loadMessageDefaultFlag = true
            globalVar.share = {
                imgUrl:'',
                message:'',
                type:'noresource',
                id:-1,
                txt:'',
                name:''
            }
        }else{
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefault = '分享失败'
            globalVar.loadMessageDefaultFlag = true
        }
        globalVar.share.txt = ''
    } catch (error) {
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefault = '分享失败'
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadDefault  = false
        globalVar.share.txt = ''
    }

}
const WriteCommitRef = ref()
const cancel = ()=>{
    senddongtaiFlag.value = false
    WriteCommitRef.value.textarea = ''
    globalVar.share = {
        name:'',
        imgUrl:'',
        message:'',
        type:'noresource',
        id:-1,
        txt:''
    }
}

const commentDioalogFlag = ref(false)
const closeCommentDialog = (done : ()=>void)=>{
    WriteCommitRef2.value.textarea = ''
    done()
    postByreplay.value = false 
    replaypPaceholder.value = ''
    commentDioalogFlag.value = false
}

const addc = ref(null)
const replayFlag = ref(false)
const replayName = ref('')
const replayId = ref(0)
const replayContent = ref('')
const replaypPaceholder = ref('')
const postByreplay = ref(false)
provide('addc',addc)
provide('replayFlag',replayFlag)
provide('replayName',replayName)
provide('replayId',replayId)
provide('replayContent',replayContent)
const confirmComment = async()=>{
    if(postByreplay.value){
        if(commitMessage.value == ''){
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefaultFlag = true;
            globalVar.loadMessageDefault = '写点东西吧，内容不能为空哦！'
        }else{
            let result = (await Main.reqcomment({
                t:2,
                type:0,
                id:Main.playing,
                content:commitMessage.value,
                commentId:replayId.value
            })).data
            if(result.code == 200){
                globalVar.loadMessageDefaultFlag = true;
                globalVar.loadMessageDefault = '回复成功！'
                WriteCommitRef2.value!.textarea = ''
                commentDioalogFlag.value = false
                let addComment = result.comment
                addComment['likedCount'] = 0;
                addComment['liked'] = false;
                addComment['timeStr'] = '刚刚'
                addComment['beReplied'] = [{
                    user:{
                        userId:replayId.value,
                        nickname:replayName.value
                    },
                    content:replayContent.value
                }]
                addc.value = addComment
            }else{
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true;
                globalVar.loadMessageDefault = '回复失败！'
            }
        }
    }else{
        if(commitMessage.value == ''){
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefaultFlag = true;
            globalVar.loadMessageDefault = '写点东西吧，内容不能为空哦！'
        }else{
            let result = (await Main.reqcomment({
                t:1,
                type:0,
                id:Main.playing,
                content:commitMessage.value,
            })).data
            if(result.code == 200){
                globalVar.loadMessageDefaultFlag = true;
                globalVar.loadMessageDefault = '评论成功！'
                WriteCommitRef2.value!.textarea = ''
                commentDioalogFlag.value = false
                let addComment = result.comment
                addComment['likedCount'] = 0;
                addComment['liked'] = false;
                addComment['timeStr'] = '刚刚'
                addComment['beReplied'] = []
                addc.value = addComment
            }else{
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true;
                globalVar.loadMessageDefault = '评论失败！'
            }
        }
    }


}

watch(replayFlag,()=>{
    if(replayFlag.value == true){
        postByreplay.value = true
        commentDioalogFlag.value = true
        replaypPaceholder.value = `回复${replayName.value}:`
        replayFlag.value = false
    }
})

const cancelComment = ()=>{
    WriteCommitRef2.value.textarea = ''
    postByreplay.value = false 
    replaypPaceholder.value = ''
    commentDioalogFlag.value = false
}

const openCommentDialog = ()=>{
  commentDioalogFlag.value = true
  WriteCommitRef2.value.getFocus()
}

const WriteCommitRef2 = ref()
let commitMessage = ref('')
const getText = (message:string)=>{
    commitMessage.value = message
}

const willStartListId = ref()
const startAll = ()=>{
    startDialogFlag.value = true
    willStartListId.value = Main.playingList.map(it=>it.id)
}
</script>

<style lang="less" scoped>
.noDrag {
    cursor: pointer;
}

.MusicRadio {
    user-select: none;
    width: 100vw;
    height: 70px;
    box-sizing: border-box;
    border-top: 1px solid;
    border-top-color: @split-line-color;
    background-color: @radio-bk-color;
    position: fixed;
    bottom: 0px;
    left: 0px;
    z-index: 12;
    display: flex;
    justify-content: space-between;

    >.left {
        width: 350px;
        height: 100%;
        overflow: hidden;
        position: relative;
        z-index: 13;

        &>div {
            height: 100%;
            display: flex;
            align-items: center;

            .image {
                padding: 0px 10px;
                width: 50px;
                height: 50px;
                position: relative;

                :deep(.el-image-hover) {
                    filter: blur(1px) contrast(90%) grayscale(10%);
                    cursor: pointer;
                }

                :deep(.el-image) {
                    padding: 0px 10px;
                    width: 51px;
                    height: 51px;
                    position: absolute;
                    left: -1px;
                    top: -1px;
                    cursor: pointer;

                    img {
                        border-radius: 0.2em;
                    }

                    .el-image__placeholder {
                        width: 49px;
                        height: 50px;
                        background-image: url('/src/assets/image/cloudmusic_5e9Ef54bbN.png');
                        background-repeat: no-repeat;
                        margin-left: 5px;
                        transform: translate(5px, 1px);
                    }

                    .el-image__error {
                        background-color: rgba(0, 0, 0, 0);
                    }
                }

                .active {
                    display: block !important;
                }

                .active-flex {
                    display: flex !important;
                }

                .mask {
                    width: 52px;
                    height: 52px;
                    position: absolute;
                    left: -1px;
                    margin-left: 10px;
                    top: -1px;
                    background-color: rgba(0, 0, 0, .4);
                    border-radius: 0.2em;
                    display: none;
                    cursor: pointer;
                    justify-content: center;
                    align-items: center;

                    i {
                        color: white;
                        display: none;
                    }

                    .icon-shangxiajiantou {
                        font-size: 30px;
                    }
                }
            }

            .txt {
                .name {
                    height: 18px;
                    max-width: 150px;
                    color: @font-color;
                    margin-bottom: 5px;
                    overflow: hidden;
                    display: flex;
                    font-size: 15px;

                    .name-txt {
                        user-select: none;
                        cursor: pointer;
                        width: auto;
                        height: 100%;
                        display: inline-block;
                        white-space: nowrap;
                        margin-right: 10px;

                        >.small {
                            color: @small-font-color;
                        }
                    }
                }

                .t {
                    position: relative;

                    .iconfont {
                        position: absolute;
                        right: -20px;
                        top: 0px;
                        cursor: pointer;

                    }

                    .icon-aixin {
                        color: @small-font-color;

                        &:hover {
                            color: @small-font-color-hover !important;
                        }
                    }

                    .icon-aixin_fill {
                        color: @small-font-red;
                    }
                }

                .singer {
                    max-width: 150px;
                    margin-top: 5px;
                    color: @font-color;
                    font-size: 13px;
                    cursor: pointer;
                    user-select: none;
                    white-space: nowrap;
                    overflow: hidden;

                    >span {
                        display: inline-block;
                        padding-right: 15px;
                    }
                }
            }

            .txt-oneself {
                .t {
                    .name {
                        color: rgba(255, 255, 255, .7) !important;

                        span {
                            color: rgb(105, 105, 105) !important;
                        }
                    }

                    .icon-aixin {
                        color: rgb(150, 150, 150) !important;
                    }
                }

                .singer {
                    color: rgba(255, 255, 255, .7);
                }
            }
        }

        .showOption {
            display: flex;
            align-items: center;
            justify-content: space-around;

            >.left {
                height: 40px;
                width: 40px;
                display: flex;
                justify-content: center;
                align-items: center;

                i {
                    color: @font-color;
                    cursor: pointer;
                }
            }

            >.right {
                display: flex;
                margin-right: 15px;

                >.todo {
                    height: 40px;
                    width: 40px;
                    margin: 0px 5px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 50%;
                    border: 1px solid @audio-border-color;

                    &:hover {
                        background-color: @span-color-hover !important;
                    }
                }

                .icon-aixin_fill {
                    color: #ec4141;
                }

                i {
                    color: @font-color;
                    font-size: 20px;
                }
            }
            >.right-contsee{
                opacity: 0;
                cursor: default;
                .todo{
                    cursor: default !important;
                }
            }
        }

        .imgpng-leave-from,
        .imgpng-enter-to {
            transform: translateY(0px);
        }

        //开始过度了
        .imgpng-leave-active,
        .imgpng-enter-active {
            transition: all 0.5s ease-in-out;
        }

        //过度完成
        .imgpng-leave-to,
        .imgpng-enter-from {
            transform: translateY(120px);
        }

        .option-enter-from,
        .option-leave-to {
            transform: translateY(-150px);
        }

        //开始过度了
        .option-enter-active,
        .option-leave-active {
            transition: all 0.5s ease-in-out;
        }

        //过度完成
        .option-enter-to,
        .option-leave-from {
            transform: translateY(-70px);
        }

    }

    .readioOption {
        width: 480px;
        height: 100%;
        margin: 0 auto;
        position: relative;
        z-index: 13;

        // background-color: yellow;
        .top {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 65%;
            height: 60%;
            // background-color: green;
            margin: 7px auto;

            >div {
                margin: 15px 15px;
            }

            .start {
                .bk {
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    background-color: @stop-btn-bk;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }

                .bk-oneself {
                    background-color: rgb(43, 43, 46);
                }
            }

            .before,
            .next {
                transform: scale(1.5, 1.3);
            }

            .ci {
                // font-weight: bolder;
                position: relative;

                .icon-openci-copy {
                    position: absolute;
                    right: -5px;
                    bottom: -5px;
                }
            }

            .open-ci {
                color: @primary-color;
            }

            .active {
                &:hover {
                    color: @primary-color;
                    cursor: pointer;
                }
            }
        }

        .bottom {
            width: 100%;
            height: 10px;
            margin: -7px auto;
            display: flex;
            align-items: center;
            justify-content: center;
            color: @small-font-color;
            font-size: 10px;
            user-select: none;

            .audio-line {
                width: 85%;
                height: 3px;
                background-color: @play-line-bk;
                border-radius: 1em;
                position: relative;
                z-index: 2;
                margin: 2px auto;

                &:hover {
                    height: 5px;
                }

                &:hover .line-loading,
                .line-play {
                    height: 5px;
                }

                &:hover .line-play {
                    height: 5px;
                }

                &:hover .block {
                    display: block;
                }

                // 加载线
                .line-loading {
                    background-color: @play-line-loading;
                    border-radius: 1em;
                    width: 0%;
                    height: 3px;
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 3;
                }

                .line-loading-oneself {
                    background-color: rgb(77, 77, 79);
                }

                //播放线
                .line-play {
                    background-color: @primary-color;
                    border-radius: 1em;
                    width: 0%;
                    height: 3px;
                    position: absolute;
                    left: 0;
                    top: 0;
                    z-index: 4;
                }

                .block {
                    position: absolute;
                    left: 0;
                    top: -2px;
                    z-index: 4;
                    height: 9px;
                    width: 9px;
                    border-radius: 50%;
                    background-color: @primary-color;
                    display: none;

                    &:hover {
                        box-shadow: 0px 0px 5px white;
                    }
                }
            }

            .audio-line-oneself {
                background-color: rgb(57, 57, 59);
            }
        }

        .bottom-oneself {
            color: rgb(105, 105, 105);
        }

        .stop {
            color: @stop-color-display !important;
        }

        .stop-oneself {
            color: rgb(110, 110, 112) !important;
        }

        .can {
            color: @font-color;
        }

        .can-oneself {
            color: rgba(255, 255, 255, .7);
        }
    }

    >.right {
        width: 350px;
        height: 70px;
        // background-color: red;
        display: flex;
        align-items: center;
        justify-content: end;
        position: relative;
        z-index: 13;

        >div {
            margin: 0px 15px;
            color: @font-color;
        }

        >:last-child {
            margin-right: 20px;
        }

        .playLevel,
        .playSpeed {
            user-select: none;
            font-size: 12px;
            cursor: pointer;

            .bk {
                min-width: 20px;
                width: auto;
                height: 15px;
                text-align: center;
                line-height: 15px;
                border: 1px solid @font-color;
                border-radius: 0.2em;
                padding-left: 2px;
                padding-right: 2px;
            }

            .bk-oneself {
                border: 1px solid rgba(255, 255, 255, .7);
            }
        }

        .playList {
            cursor: pointer;
        }

        .shengyin {
            position: relative;
            z-index: 10;

            i {
                cursor: pointer;
            }

            .shengyin-line {
                position: absolute;
                left: -7px;
                top: -110px;
                height: 100px;
                width: 30px;
                background-color: @shengyin;
                border: 1px solid @split-line-color;
                box-shadow: @shadow;
                border-radius: 0.2em;
                display: flex;
                justify-content: center;
                align-items: center;

                &::after {
                    content: '';
                    display: block;
                    height: 0px;
                    width: 0px;
                    margin: 0 auto;
                    position: absolute;
                    bottom: -10px;
                    left: 0px;
                    right: 0px;
                    border-left: 8px rgba(0, 0, 0, 0) solid;
                    border-right: 8px rgba(0, 0, 0, 0) solid;
                    border-top: 6px @shengyin solid;
                    border-bottom: 6px rgba(0, 0, 0, 0) solid;
                }

                .hua {
                    height: 80%;
                    width: 4px;
                    background-color: @play-line-loading;
                    border-radius: 0.2em;
                    position: relative;

                    .liang {
                        width: 4px;
                        border-radius: 0.2em;
                        height: 0%;
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        background-color: @primary-color;

                        &>.point {
                            width: 10px;
                            height: 10px;
                            position: absolute;
                            top: -5px;
                            left: -3px;
                            border-radius: 50%;
                            background-color: @primary-color;
                            // background-color: rgba(0, 0, 0, .5);

                        }
                    }


                }
            }
        }
    }

    >.right-oneself {
        >div {
            color: rgba(255, 255, 255, .7);
        }
    }

    #canvasLook {
        position: absolute;
        left: 0;
        z-index: 11;
    }
}

.MusicRadio-oneself {
    background-color: rgba(33, 33, 36, .8);
    border-top-color: @oneselfsplitLineColor;
}

.songDetail-enter-from,
.songDetail-leave-to {
    transform: translateY(100vh);
}

//开始过度了
.songDetail-enter-active,
.songDetail-leave-active {
    transition: all 0.2s linear;
}

//过度完成
.songDetail-enter-to,
.songDetail-leave-from {
    transform: translateY(0);
}
.add{
    width: 100%;
    height: 80px;
    display: flex;
    align-items: center;
    .pic{
        width: 60px;
        height: 60px;
        background-color: @other-bk-color;
        margin: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        i{
            font-size: 40px;
            color: @primary-color;
        }
    }
    .msg{
        width: calc(100% - 80px - 30px);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        user-select: none;
        color: @font-color;
        user-select: none;
    }
}

.el-scrollbar{
    width: 100%;
    padding-right:0 ;    
    .el-scrollbar__wrap {
        width: 100%;
        padding-left: 0;
        .el-scrollbar__view{
            width: 100%;
            padding-left: 0;
            .list{
                height:calc(80px * 4) ;
                width: 100%;
                padding-left: 0;
                margin-left: 0;
                .item{
                    width: 100%;
                    height: 80px;
                    padding-left: 0;
                    display: flex;
                    align-items: center;
                    &:hover{
                        background-color: @span-color-hover;
                    }
                    .el-image{
                        width: 60px;
                        height: 60px;
                        margin: 10px;
                        border-radius: .2em;
                        img{
                            width: 60px;
                            height: 60px;
                            border-radius: .2em;
                        }
                    }
                    .msg{
                        width: calc(100% - 80px - 30px);
                        overflow: hidden;
                        text-overflow: ellipsis;
                        white-space: nowrap;
                        user-select: none;
                        color: @font-color;
                    }
                }
            }
        }
    }

}

.default{
    margin-top: -20px;
    .writ{
    border: 1px solid @small-font-color;
    border-radius: .2em;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-sizing: border-box;
    :deep(.writeCommit){
        .input-bk{
            margin-left: 0;
            margin-right: 2px;
        }
    }
    :deep(.option){
        margin-left: 10px;
        margin-top: 0px;
    }
    }
    .show{
        height: 50px;
        widows: 90%;
        border: 1px solid @small-font-color;
        border-top: none;
        &:hover{
            background-color: @flow-hover-color;
        }
        display: flex;
        align-items: center;
        .img{
            background-size: cover;
            height: 30px;
            width: 30px;
            margin-left: 10px;
            margin-right: 10px;
            display: flex;
            justify-content: center;
            align-items: center;
            border-radius: .2em;
            i{
                color: white;
            }
        }
        .message{
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space:nowrap;
            user-select: none;
            color: @font-color;
        }
        >i{
            color: @font-color;
            margin-left: 5px;
            &:hover{
                color: @font-color-hover;
            }
        }
        .name{
            color: @url-color;
            padding-left: 10px;
            max-width: 100px;
            width: auto;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }
    }
}

</style>