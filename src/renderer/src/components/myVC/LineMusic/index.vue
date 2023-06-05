<template>

    <div class="line-music" 
    :data-index="index" 
    :data-id="id" 
    :data-type="dataType ?? 'song'"
    data-right="1" 
    :data-pic="zhuanji?.picUrl ?? bufferpic"
    :data-txt="`单曲:${title} - ${singer?.map(it=>it.name).join('/')}`"
    :data-download="!(downloadId.includes(id)) && !(!ifDownload)"
    :data-path="myPath"
    :class="{
        dragMouseStyleCan: Main.dragMouse && dragId != id && Main.dragType == 'songMy',
        dragMouseStyleMyself: dragId == id && Main.dragMouse && Main.dragType == 'songMy' || playListid < 0 && Main.dragMouse || Main.dragType != 'songMy' && Main.dragMouse,
        topColor: topColorid == id && Main.dragType == 'songMy',
        bottomColor: Main.dragMouse && Main.dragType == 'songMy' && (length == index || length == indexSearch) && Main.mouseDragOnIndex == -1,
        'line-music-oneself': globalVar.oneself == 1 && oneselfColor != false
    }" @mousedown="pseudoDragBeginn" @click="changColor" ref="line-music" @mouseover="replaceLocation"
        @mouseout="replaceLocationed" @dblclick="gotoPlay">
        <div class="line">
            <div class="small-jiantou">
                <slot></slot>
            </div>
            <div class="caozuo" v-if="index && showIndex" :class="{ 'caozuo-oneself': globalVar.oneself && oneselfColor }">
                <span v-if="Main.playing == id && Main.playStatus == 'play' && Main.beforePlayListId == playListid"><i
                        class="iconfont icon-shengyin_shiti songStatus"></i> </span>
                <span v-else-if="Main.playing == id && Main.playStatus == 'stop' && Main.beforePlayListId == playListid"><i
                        class="iconfont icon-shengyin03-mianxing songStatus"></i></span>
                <span v-else-if="indexSearch">{{ indexSearch > 9 ? indexSearch : `0${indexSearch}` }}</span>
                <span v-else>{{ index > 9 ? index : `0${index}` }}</span>
                <i class="iconfont icon-aixin xin" :class="{ noDrag: !Main.dragMouse }" v-show="!ifLike() && !lately"
                    @click="likeOrDislike"></i>
                <i class="iconfont icon-aixin_fill xin" :class="{ noDrag: !Main.dragMouse }" v-show="ifLike() && !lately"
                    @click="likeOrDislike"></i>
                <i class="iconfont icon-xiazai1" :class="{ noDrag: !Main.dragMouse }" @click="download(id)"
                    v-if="!ifDownload && !downloadId.includes(id) && !local && !lately"></i>
                <canvas id="loadingCanvas" width="25" height="25" ref="loadingCanvas"
                    v-show="downloadId.includes(id) && !local  && !lately && loadingValue.get(id) && loadingValue.get(id)?.[0] > 0"></canvas>
                <i class="iconfont icon-zhengque" v-if="!(downloadId.includes(id)) && !(!ifDownload) && !local  && !lately"
                    :class="{ noDrag: !Main.dragMouse }"></i>
                <!-- <canvas id="loadingCanvas" width="18" height="18" ref="loadingCanvas"
                v-show="true"></canvas> -->
            </div>
            <div class="song-name" ref="line" :class="{ 'song-name-oneself': globalVar.oneself && oneselfColor }">
                <div class="limit" :class="{ 'limit-oneself': globalVar.oneself && oneselfColor != false }">
                    <span :class="{ red: Main.playing == id && (Main.beforePlayListId == playListid || type == 'radio') }"
                        v-html="title"></span>
                    <span class="small" v-if="tns?.length" v-html="`&nbsp;(${tns[0]})`"></span>
                    <span class="small" v-else-if="alia?.length" v-html="`&nbsp;(${alia[0]})`"></span>
                    <span class="tag" v-if="!(downloadId.includes(id)) && !(!ifDownload) && ( lately)">本地</span>
                </div>
            </div>
            <div class="song-hand"  v-if="!record && !onlyTime" :class="{ 'song-hand-oneself': globalVar.oneself && oneselfColor }">
                <div class="limit" :class="{ noDrag: !Main.dragMouse }">
                    <span  v-if="singer![0]?.name"  class="span-singer" v-for="({}, index) in singer"
                        :data-singerId="singer![index]?.id">
                        <Singer :id="singer![index]?.id"  :name="singer![index]?.name" :index="index" :singerLen="singer.length - 1"></Singer>
                    </span>
                    <span v-else style="padding-left: 5px;">未知艺人</span>
                </div>
            </div>
            <div class="zhuanji"  v-if="!record && zhuanji && !onlyTime" :class="{ 'zhuanji-oneself': globalVar.oneself && oneselfColor }" >
                <div class="limit"  :class="{ noDrag: !Main.dragMouse }">
                    <span @click="goZhuanji(zhuanji.id)" v-if="zhuanji.name" class="span-zhuanji" :data-singerId="zhuanji?.id">
                        <ZhuanJi :name="zhuanji.name" :tns="zhuanji.tns?.[0]" :Len="zhuanji?.tns?.length"></ZhuanJi>
                    </span>
                    <span v-else style="padding-left: 5px;">未知专辑</span>
                </div>
            </div>
            <div v-if="!local && !lately && !record" class="time" :class="{ 'time-oneself': globalVar.oneself && oneselfColor }"><span>{{
                dayjsMMSS(+time!) }}</span>
            </div>
            <div v-if="lately" class="time" :class="{ 'time-oneself': globalVar.oneself && oneselfColor }"><span>{{
                Timeago(+time!) }}</span>
            </div>
            <div class="hot" v-if="hot">
                <div class="bk">
                    <div class="fill" ref="fill"></div>
                </div>
            </div>
            <div class="count" v-if="record">
                <div>{{ count }}次</div>
            </div>
        </div>
        <div class="lrc">
            <slot name="lrc"></slot>
        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, getCurrentInstance, ComponentInternalInstance, inject, ref, Ref, nextTick, watch, toRef, watchEffect } from 'vue';
import { dayjsMMSS,Timeago } from '@renderer/utils/dayjs'
import { useRouter,useRoute } from 'vue-router';
import { useMain, useBasicApi, useGlobalVar,useNM } from '@renderer/store';
import Singer from './Singer/index.vue'
import ZhuanJi from './ZhuanJi/index.vue'
// import {ElMessageBox} from 'element-plus'
const $el = getCurrentInstance() as ComponentInternalInstance;
const Main = useMain();
const BasicApi = useBasicApi();
const $router = useRouter();
const $route = useRoute();
const globalVar = useGlobalVar()
const NM = useNM()
const props = defineProps<{
    index?: number,
    title: string,
    singer: Array<any>,
    zhuanji?: any,
    time?: number | string,
    id: number,
    tns?: Array<string>,
    alia?: Array<string>,
    hot?: boolean,
    hotValue?: number
    showIndex: boolean,
    indexSearch?: number
    type?: string
    length?: number //歌单内歌曲总长度
    oneselfColor: boolean //是否启用oneself样式
    local?: boolean // 是否本地歌曲
    path?: string //本地歌曲路径
    privilegeAndListSearchOnly?: any//搜索专属音质传递
    lately?:boolean//是否最近播放
    record?:boolean //是否听歌排行
    count?:number
    onlyTime?:boolean//只要时间
    dataType?:string
    imageBuffer?:Uint8Array
}>()

const bufferpic = ref('')
const reader = new FileReader();
reader.readAsDataURL(new Blob([props.imageBuffer!], { type: 'image/jpeg' }));
new Promise<any>((resolve, reject) => {
    reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
    };
    reader.onerror = reject;
}).then((base64:any)=>{
    bufferpic.value = base64
})


//leftblock传过来的id，限自己的歌单的id
let playListid = inject<Ref<number>>('playListId') as Ref<number>
let downloadList = inject<Ref<string[]>>('downloadList') as Ref<string[]>
const ifDownload = ref(false)
let name = ''

props.singer.forEach((el, index) => {
name += el.name
    if (index != props.singer!.length - 1) name += ','
})
name = name + ' - ' + props.title


const cleanFileName = name.replace(/<\/?span[^>]*>/g, "").replace(/[\\/:\*\?"<>\|]/g, "");
const myPath = ref('')
watch(()=>props.path,()=>{
    myPath.value = props.path + ''
},{immediate:true})
watchEffect(async()=>{
    if(!(globalVar.downloadId.includes(props.id)) && !(!ifDownload.value)){
        const replyMessage = await window.electron.ipcRenderer.invoke('get-song-path',cleanFileName)
        myPath.value = replyMessage
    }
})
watch(downloadList, () => {
    if (downloadList.value.includes(cleanFileName)) {
        ifDownload.value = true
    } else {
        ifDownload.value = false
    }
}, { immediate: true })

window.electron.ipcRenderer.on('save-music-finished', ({ }, {which,id}) => {
    if (cleanFileName == which) {
        console.log(cleanFileName, which);
        downloadList.value.push(cleanFileName)
        ifDownload.value = true
        downloadId.value = downloadId.value.filter(el => el != props.id)
        loadingValue.value.delete(props.id)
    }
})

//喜欢和取消喜欢
let likeMessage = ref('')
const likeOrDislike = async () => {
    let likeIndex = Main.likes.indexOf(props.id)
    if (likeIndex != -1) {
        //取消喜欢
        let code
        if(localStorage.getItem('NMcookie')){
            const res = (await NM.reqLike(Number(props.id), false)).data
            code = res.code
            if(code == 200) Main.playList[0].coverImgUrl = res.url
        }else{
            code = (await Main.reqLike(Number(props.id), false)).data.code
        }
        if (code == 405) {
            likeMessage.value = '操作繁忙，请稍后再试'
            globalVar.loadMessageDefault = likeMessage.value
            globalVar.loadMessageDefaultFlag = true
        } else {
            likeMessage.value = '取消喜欢成功'
            globalVar.loadMessageDefault = likeMessage.value
            globalVar.loadMessageDefaultFlag = true
            Main.likes.splice(likeIndex, 1)
            Main.likeChange = `${props.id},false`
            Main.playList[0].trackCount--
        }

    } else {
        let code
        if(localStorage.getItem('NMcookie')){
            const res = (await NM.reqLike(Number(props.id), true)).data
            code = res.code
            if(code == 200) Main.playList[0].coverImgUrl = res.url
        }else{
            code = (await Main.reqLike(Number(props.id), true)).data.code
        }
        if (code == 405) {
            likeMessage.value = '操作繁忙，请稍后再试'
            globalVar.loadMessageDefault = likeMessage.value
            globalVar.loadMessageDefaultFlag = true
        } else {
            likeMessage.value = '已添加到我喜欢的音乐'
            globalVar.loadMessageDefault = likeMessage.value
            globalVar.loadMessageDefaultFlag = true
            Main.likes.unshift(props.id)
            Main.likeChange = `${props.id},true`
            Main.playList[0].trackCount++
        }

    }
}

//交换歌曲位置
let topColorid = ref(-1)
const replaceLocation = () => {
    if (Main.dragMouse && Main.dragType == 'songMy' && props.id != dragId.value) {
        topColorid.value = props.id as number
        Main.mouseDragOnIndex = props.index as number
        if (props.indexSearch) Main.mouseDragOnIndex = props.indexSearch as number
    }
}

const replaceLocationed = () => {
    topColorid.value = -1
    if (props.index == props.length) {
        Main.mouseDragOnIndex = -1
    }
    if (props.indexSearch) {
        if (props.indexSearch == props.length) {
            Main.mouseDragOnIndex = -1
        }
    }
}

const $emit = defineEmits(['warpPlace', 'localPlay','recordPlay','shorPlayList'])
const fnMouseDrag = async (e: any) => {
    window.removeEventListener('mouseup', fnMouseDrag)
    window.removeEventListener('mousemove', fnMouseDragMoving)
    for (let i = 0; i < e.path.length; i++) {
        if (e.path[i].classList != undefined && e.path[i].classList.contains('dragMouseStyleAdd')) {
            let dom = e.path[i] as HTMLElement
            if (String(playListid.value) != String(dom.getAttribute('data-id')) && Number(dom.getAttribute('data-index')) <= Main.createPlay) {
                if(Number(dom.getAttribute('data-index')) == 0){
                    Main.dragMouse = false
                    let code
                    if(localStorage.getItem('NMcookie')){
                        const res = (await NM.reqLike(Number(props.id), true)).data
                        code = res.code
                        if(code == 200) Main.playList[0].coverImgUrl = res.url
                    }else{
                        code = (await Main.reqLike(Number(props.id), true)).data.code
                    }
                    if (code == 405) {
                        likeMessage.value = '操作繁忙，请稍后再试'
                        globalVar.loadMessageDefault = likeMessage.value
                        globalVar.loadMessageDefaultFlag = true
                    } else {
                        likeMessage.value = '已添加到我喜欢的音乐'
                        globalVar.loadMessageDefault = likeMessage.value
                        globalVar.loadMessageDefaultFlag = true
                        Main.likes.unshift(props.id)
                        Main.likeChange = `${props.id},true`
                        Main.playList[0].trackCount++
                    }
                }else{
                    Main.dragMouse = false
                    globalVar.loadDefault = true
                    let result 
                    if(localStorage.getItem('NMcookie')){
                        result = (await NM.reqPlaylistTracks('add', Number(dom.getAttribute('data-id')), [Number(props.id)])).data
                    }else{
                        result = (await Main.reqPlaylistTracks('add', Number(dom.getAttribute('data-id')), [Number(props.id)])).data
                    }
                    if(result.url){
                        Main.playList[Number(dom.getAttribute('data-index'))].coverImgUrl = result.url
                    }
                    globalVar.loadDefault = false
                    if (result.body.code == 200 || (result.data.code == 200 && localStorage.getItem('NMcookie'))) {
                        globalVar.loadMessageDefault = '已收藏到歌单'
                        globalVar.loadMessageDefaultFlag = true 
                        let index = Number(dom.getAttribute('data-index'))
                        Main.playList[index].trackCount += 1
                    }
                }
            }
            break;
        }
    }
    let domTop = document.querySelector('.topColor') as HTMLElement | null
    let domBottom = document.querySelector('.bottomColor') as HTMLElement | null
    console.log(domTop,domBottom);
    if (domTop && playListid.value != -1) {
        let addIndex = Number(domTop.getAttribute('data-index'))
        console.log(Main.dragIndex - 1, addIndex - 1);
        if (Main.dragIndex - 1 > addIndex - 1) {      //上拖拽
            let delId = Main.openPlayListId.splice(Main.dragIndex - 1, 1)
            Main.openPlayListId.splice(addIndex - 1, 0, delId[0])
            if(localStorage.getItem('NMcookie')){
                NM.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
            }else{
                Main.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
            }
            $emit('warpPlace', { from: Main.dragIndex - 1, to: addIndex - 1 })
            
        } else {
            let delId = Main.openPlayListId.splice(Main.dragIndex - 1, 1)
            Main.openPlayListId.splice(addIndex - 1 - 1, 0, delId[0])
            if(localStorage.getItem('NMcookie')){
                NM.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
            }else{
                Main.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
            }
            $emit('warpPlace', { from: Main.dragIndex - 1, to: addIndex - 1 - 1 })
        }
        Main.dragMouse = false
    }
    if (domBottom) {
        let delId = Main.openPlayListId.splice(Main.dragIndex - 1, 1)
        Main.openPlayListId.push(delId[0] as never)
        if(localStorage.getItem('NMcookie')){
            NM.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
        }else{
            Main.reqSongOrderUpdate(playListid.value, Main.openPlayListId as [number])
        }
        $emit('warpPlace', { from: Main.dragIndex - 1, to: -1 })
        Main.dragMouse = false
    }
    Main.dragMouse = false
    topColorid.value = -1
    dragId.value = -1

}

let dragId = ref(-1)
const fnMouseDragMoving = (e: MouseEvent) => {
    if (Main.isMyCreate == true) {
        Main.dragMouse = true
        Main.dragType = 'songMy'
        Main.dragIndex = Number(props.index)
        Main.pageY = e.pageY
        Main.dragMessage = props.title as string
        dragId.value = props.id as number
    } else if (Main.isMyCreate == false) {
        Main.dragMouse = true
        Main.dragMessage = props.title as string
        Main.dragType = 'song'
    }
}
const pseudoDragBeginn = (event:MouseEvent) => {
    if(event.button !== 0)return
    window.addEventListener('mousemove', fnMouseDragMoving)
    window.addEventListener("mouseup", fnMouseDrag)

    console.log('拖动元素');
}

function searchFather(d: HTMLElement | undefined): HTMLElement | undefined{
    if(d == undefined) return undefined
    if (d?.classList.contains('line-music')) {
        return d;
    } else {
        d = d?.parentNode as HTMLElement
        return searchFather(d);
    }
}
const ifLike = () => {
    return Main.likes.includes(props.id)
}
onMounted(()=>{
    changColor()
})
const changColor = () => {
    let arr = document.querySelectorAll('.line-music') as unknown as Array<HTMLElement>
    for (let i = 0; i < arr.length; i++) {
        if ((i + 1) % 2 == 0) {
            if (!globalVar.oneself) arr[i].style.backgroundColor = 'var(--lineColorEven)'
            else arr[i].style.backgroundColor = 'rgba(43,43,43,.6)'
        } else {
            if (!globalVar.oneself) arr[i].style.backgroundColor = 'var(--lineColorOdd)'
            else arr[i].style.backgroundColor = 'rgba(46,46,46,.4)'
        }
    }
    const domFather = searchFather($el.refs['line-music'] as HTMLElement ?? undefined)
    if(domFather){
        if (!globalVar.oneself) domFather.style.backgroundColor = 'var(--lineColorClick)'
        else domFather.style.backgroundColor = 'rgba(65, 65, 65,.9)'
    }
}
const oneself = toRef(globalVar, 'oneself')
watch(oneself, () => {
    const dom = $el.refs['line-music'] as HTMLElement
    if (dom) dom.style.backgroundColor = ''
})
onMounted(() => {
    if (props.hot) {
        let dom = $el.refs.line as HTMLElement
        dom.style.width = 'calc((100% - 110px) * (0.42 - 0.124) )'
        let dom2 = $el.refs.fill as HTMLElement
        dom2.style.width = props.hotValue + '%'
    }
})


//播放音乐
let originalList = toRef(Main, 'originalList')
let originalPrivileges = toRef(Main, 'originalPrivileges')
let playingList = toRef(Main, 'playingList')
let playingPrivileges = toRef(Main, 'playingPrivileges')

const heartJust = async () => {
    if (Main.beforePlayListId == Main.playListId[0] && Main.heartJump == true) {
        let result: Array<any> = (await Main.reqPlaymodeIntelligenceList(Main.playing, Number(Main.beforePlayListId), Main.playing)).data.data
        console.log(result);
        let idArr = [] as unknown as [number]
        result.forEach((element) => {
            idArr.push(element.id)
        })
        let songList = (await (Main.reqSongDetail(idArr))).data
        let needPlay = playingList.value[Main.playingindex - 1]
        let needPlayPrivileges = playingPrivileges.value[Main.playingindex - 1]
        playingList.value = songList.songs
        playingPrivileges.value = songList.privileges
        playingList.value.unshift(needPlay)
        playingPrivileges.value.unshift(needPlayPrivileges)
        Main.originalsongIndex = props.index as number
        Main.playingindex = 1
    }
    if (Main.beforePlayListId != Main.playListId[0]) {
        Main.heartJump = false
    }
}


const gotoPlay = (e: MouseEvent) => {
    if(e.button !== 0)return 
    if (!props.local) {
        let _this = $el.refs['line-music'] as HTMLElement
        if (!_this) return
        let father = _this?.parentNode as HTMLElement
        if (originalList.value.length != 0 && father.getAttribute('id') != 'play-list-Panel-bottom') {
            playingList.value = originalList.value as [any]
            playingPrivileges.value = originalPrivileges.value as [any]
        }
        nextTick(async () => {
            if (father.getAttribute('id') === 'song-sheet') {
                console.log('添加到播放列表',$route.query.type);
                if($route.query.type == '歌单'){
                    if (Main.beforePlayListId == playListid.value) {
                        Main.playing = props.id as number
                        Main.playingindex = props.index as number
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                        heartJust()
                        return;
                    }
                    if(globalVar.setting.playWay){
                        let result
                        if(localStorage.getItem('NMcookie')){
                            result = (await NM.reqPlaylistTrackAll(playListid.value)).data;
                        }else{
                            result = (await Main.reqPlaylistTrackAll(playListid.value)).data;
                        }
                        Main.playingList = result.songs
                        Main.playingPrivileges = result.privileges
                        Main.playingindex = props.index as number
                        Main.playing = props.id as number
                        Main.beforePlayListId = playListid.value
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }else{
                        let result = (await Main.reqSongDetail([props.id])).data
                        if(Main.playingindex == -1){
                            Main.playingList = result.songs
                            Main.playingPrivileges = result.privileges
                            Main.playingindex = 1
                            Main.playing = props.id
                            Main.playStatus = 'play'
                            Main.songType = 'song'
                        }else{
                            Main.playingList.splice(Main.playingindex,0,...result.songs)
                            Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                            Main.playingindex++
                            Main.playing = props.id
                            Main.playStatus = 'play'
                            Main.songType = 'song'
                        }
                    }
                    console.log(Main.beforePlayListId, Main.playListId[0]);
                    heartJust()
                }else if($route.query.type == '专辑'){
                    if(globalVar.setting.playWay){
                        let result = (await Main.reqAlbumTrackAll(playListid.value)).data;
                        Main.playingList = result.songs
                        Main.playingPrivileges = result.songs.map(item=>item.privilege)
                        Main.playingindex = props.index as number
                        Main.playing = props.id as number
                        Main.beforePlayListId = playListid.value
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }else{
                        let result = (await Main.reqSongDetail([props.id])).data
                        if(Main.playingindex == -1){
                            Main.playingList = result.songs
                            Main.playingPrivileges = result.privileges
                            Main.playingindex = 1
                            Main.playing = props.id
                            Main.playStatus = 'play'
                            Main.songType = 'song'
                        }else{
                            Main.playingList.splice(Main.playingindex,0,...result.songs)
                            Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                            Main.playingindex++
                            Main.playing = props.id
                            Main.playStatus = 'play'
                            Main.songType = 'song'
                        }
                    }
                }
            } else if (father.getAttribute('id') == 'play-list-Panel-bottom') {
                Main.playing = props.id as number
                Main.playingindex = props.index as number + 1
                Main.playStatus = 'play'
            } else if (father.getAttribute('id') === 'every-day') {
                if(globalVar.setting.playWay){
                    Main.playingList = BasicApi.everyDaySong
                    let playingPrivileges: Array<any> = []
                    BasicApi.everyDaySong.forEach((val) => {
                        playingPrivileges.push(val.privilege)
                    })
                    Main.playingPrivileges = playingPrivileges
                    Main.playingindex = Number(props.index)
                    Main.playing = BasicApi.everyDaySong[Number(props.index) - 1].id
                    Main.playStatus = 'play'
                    Main.songType = 'song'
                }else{
                    let result = (await Main.reqSongDetail([props.id])).data
                    if(Main.playingindex == -1){
                        Main.playingList = result.songs
                        Main.playingPrivileges = result.privileges
                        Main.playingindex = 1
                        Main.playing = props.id
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }else{
                        Main.playingList.splice(Main.playingindex,0,...result.songs)
                        Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                        Main.playingindex++
                        Main.playing = props.id
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }
                }
            } else if (father.getAttribute('id') === 'search-line-list') {
                // if(Main.playStatus = 'play'){
                let index = 0
                if (Main.playingindex == -1) index = 0
                else index = Main.playingindex
                Main.playingList.splice(index, 0, props.privilegeAndListSearchOnly)
                Main.playingPrivileges.splice(index, 0, props.privilegeAndListSearchOnly.privilege)
                Main.playingindex = index + 1
                Main.playing = props.id
                Main.playStatus = 'play'
                Main.songType = 'song'
                // }else{

                // }
            }else if(father.getAttribute('id') === 'lately'){
                if(globalVar.setting.playWay){
                    Main.playingList = Main.latelyPlay
                    Main.playingPrivileges = Main.latelyPlay.map((it)=>{
                        return it.privilege
                    })
                    Main.beforePlayListId = -3
                    Main.playingindex = props.index as number
                    Main.playing =  props.id
                    Main.playStatus = 'play'
                    Main.songType = 'song'
                }else{
                    if(Main.playingindex == -1){
                        Main.playingList = Main.latelyPlay.slice(props.index!-1,props.index)
                        Main.playingPrivileges = [Main.latelyPlay.slice(props.index!-1,props.index)[0].privilege]
                        Main.playingindex = 1
                        Main.playing =  props.id
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }else{
                        Main.playingList.splice(Main.playingindex,0,...Main.latelyPlay.slice(props.index!-1,props.index)) 
                        Main.playingPrivileges.splice(Main.playingindex,0,...[Main.latelyPlay.slice(props.index!-1,props.index)[0].privilege])
                        Main.playingindex++
                        Main.playing = props.id
                        Main.playStatus = 'play'
                        Main.songType = 'song'
                    }
                }
            }else if(father.getAttribute('id') === 'record-list'){
                $emit('recordPlay',{index:props.index,id:props.id})
            }else if(father.getAttribute('id') === 'short-play-list'){
                $emit('shorPlayList',{index:props.index,id:props.id})
            }
            //通知主进程修改播放图片以及文字
            // $el.props.title
        })
        let str = props.title + ' - ';
        let singerArr = props.singer as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
        globalVar.closePointOutMessage = '已开始播放'
        globalVar.closePointOut = true
    } else {
        $emit('localPlay', { index: props.index, id: props.id })
    }
}

//下载音乐

const downloadFlag = toRef(globalVar, 'downloadFlag')
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
        downloadFlag.value = true
        globalVar.downloadLevel = {
            play: pl,
            download: dl,
            songName,
            id
        }
    }

}
const downloadId = toRef(globalVar, 'downloadId')
const loadingValue = toRef(globalVar, 'loadingValue')
// let loadingCanvas:HTMLCanvasElement
//canvas进度条
onMounted(() => {
    nextTick(() => {
        const canvas = $el.refs.loadingCanvas as HTMLCanvasElement
        const context = canvas.getContext('2d') as CanvasRenderingContext2D
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 6; // 进度条的半径
        const lineWidth = 2; // 进度条的线宽
        function drawProgress(percent) {
            // 清除画布
            context.clearRect(0, 0, canvas.width, canvas.height);

            // 绘制背景圆环
            context.beginPath();
            context.arc(centerX, centerY, radius, 0, 2 * Math.PI);
            context.strokeStyle = '#eee';
            context.lineWidth = lineWidth;
            context.stroke();

            // 绘制进度圆环
            context.beginPath();
            context.arc(centerX, centerY, radius, -0.5 * Math.PI, (percent / 100 * 2 - 0.5) * Math.PI);
            context.strokeStyle = document.documentElement.style.getPropertyValue('--primaryColor')
            context.lineWidth = lineWidth;
            context.stroke();
        }
        // 模拟进度条的变化
        watch(loadingValue, () => {
            //@ts-ignore
            if (loadingValue.value.get(props.id)) drawProgress(loadingValue.value.get(props.id)[0] / loadingValue.value.get(props.id)[1] * 100)
        }, { deep: true })
    })
})

const downLoadAll = toRef(globalVar, 'downLoadAll')
watch(downLoadAll, async () => {
    if (downloadId.value.includes(props.id)) return
    if (ifDownload.value == true) {
        // downloadId.value = downloadId.value.filter((el)=>{
        //     return el!=props.id
        // })
    } else {
        globalVar.downloadId.push(props.id)
        globalVar.downloadList.push({ id: props.id, name: cleanFileName, controller: new AbortController(), ifcancel: false, url: '' })
    }
})

// const downloadOne = async(id:number)=>{

//     fetch(url).then(response => {
//         const total = response.headers.get('content-length')  as string//响应体大小
//         let loaded = 0
//         const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
//         return new ReadableStream({
//             start(controller) {
//                 function push() {
//                     reader.read().then(({ done, value }) => {
//                         if (done) {
//                             controller.close()
//                             return
//                         }

//                         loaded += value.byteLength
//                         controller.enqueue(value)
//                         // 计算进度
//                         const progress = loaded / (+total)
//                         globalVar.loadingValue.set(id,progress)
//                         console.log(`下载进度: ${progress}`)
//                         push()
//                     })
//                 }
//                 push()
//             }
//         })
//     })
//         .then(stream => new Response(stream))
//         .then(response => response.arrayBuffer())
//         .then((arrayBuffer) =>{
//             //@ts-ignore
//             window.electron.ipcRenderer.send('save-music',{arrayBuffer,name:})
//         })
//         .catch(error => console.error(error))
// }

const goZhuanji = (id)=>{
    if(id>0){
        $router.push({
            name:'songPlaylist',
            query:{
                id,type:"专辑",my:'false'
            }
        })
    }
    console.log(id);
}
</script>

<style lang="less" scoped>
.dragMouseStyleCan {
    cursor: url('@renderer/assets/point.png'), auto;

    div,
    span {
        cursor: url('@renderer/assets/point.png'), auto;
    }
}

.dragMouseStyleMyself {
    cursor: url('@renderer/assets/stop.png'), auto;

    div,
    span {
        cursor: url('@renderer/assets/stop.png'), auto;
    }
}

.noDrag {
    cursor: pointer;
}

.line-music {
    width: calc(100% - 8px);
    min-height: 34px;
    overflow: hidden;
    display: flex;
    color: @small-font-color;
    font-size: 14px;
    flex-direction: column;
    .line {
        width: 100%;
        height:inherit;
        display: flex;
        &>div {
            display: flex;
            align-items: center;
            box-sizing: border-box;

            &>span {
                padding-left: 5px;
            }
        }

        .caozuo {
            width: 110px;
            height: inherit;
            position: relative;
            box-sizing: border-box;
            user-select: none;

            .songStatus {
                color: @small-font-red;

                &:hover {
                    color: @small-font-red !important;
                }
            }

            span {
                padding-left: 20px;
                font-size: 13px;
                max-width: 10px
            }

            .xin {
                padding-left: 25px;
            }

            .icon-xiazai1 {
                color: @small-font-color;
                padding-left: 10px;
            }

            .icon-zhengque {
                padding-left: 10px;
                color: @primary-color;

                &:hover {
                    cursor: default;
                    color: @primary-color !important;
                }
            }

            #loadingCanvas {
                padding-left: 8px;
            }

            .icon-aixin_fill {
                color: @small-font-red !important;
            }

            i:not(.icon-aixin_fill):hover {
                color: @small-font-color-hover ;
            }
        }

        .caozuo-oneself {
            .icon-xiazai1 {
                color: rgb(150, 150, 150);
            }

            i:not(.icon-aixin_fill):hover {
                color: rgb(212, 212, 212);
            }

            .xin {
                color: rgb(150, 150, 150);
            }

            span {
                color: rgb(150, 150, 150);
            }
        }

        .song-name {
            width: calc((100% - 110px) * 0.42);
            height: inherit;
            color: @font-color ;
            user-select: none;
            font-size: 13px;
            overflow: hidden;

            .limit {
                width: calc(100% * 0.8);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-left: 5px;

                &>:first-child {
                    display: inline;
                    height: inherit;
                    line-height: 34px;
                }

                .red {
                    color: @small-font-red;
                }

                .small {
                    color: @small-font-color;
                }
            }

            .limit-oneself {
                .small {
                    color: rgb(105, 105, 105);
                }
            }
            .tag {
                font-size: 10px;
                color: @primary-color;
                border: 1px solid @primary-color;
                padding:0 2px 0 2px;
                margin-left: 5px;
                border-radius: .2em;
            }
        }

        .song-name-oneself {
            color: rgba(255, 255, 255, .7);
        }

        :deep(.song-hand) {
            width: calc((100% - 110px) * 0.2);
            height: inherit;
            overflow: hidden;

            .limit {
                width: calc(100% * 0.8);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                user-select: none;
                color: @small-can-click;

                .span-singer {
                    font-size: 13px;
                    user-select: none;
                    color: @small-can-click;
                    padding-left: 7px;

                    &:hover {
                        color: @small-font-color-hover
                    }

                    >.gang {
                        margin-right: -3px;
                        font-size: 10px;
                        transform: rotate(-8deg) translateY(-2px);
                        display: inline-block;
                        cursor: default;
                        color: @small-can-click ;
                    }
                }
            }
        }

        :deep(.song-hand-oneself) {
            .limit {
                .span-singer {
                    color: rgb(138, 138, 138);

                    &:hover {
                        color: rgb(212, 212, 212);
                    }

                    >.gang {
                        color: rgb(138, 138, 138);
                    }
                }
            }
        }

        :deep(.zhuanji) {
            width: calc((100% - 110px) * 0.272);
            height: inherit;

            .limit {
                width: calc(100% * 0.8);
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                padding-left: 5px;
                user-select: none;
                color: @small-can-click;
                font-size: 13px;

                .span-zhuanji {
                    padding-left: 5px;

                    >span {
                        color: @small-font-color
                    }
                }

                &:hover {
                    color: @small-font-color-hover
                }
            }
        }

        :deep(.zhuanji-oneself) {
            .limit {
                .span-zhuanji {
                    color: rgb(138, 138, 138);

                    &:hover {
                        color: rgb(212, 212, 212);
                    }
                }
            }
        }

        .time {
            width: calc((100% - 110px) * 0.108);
            height: inherit;
            font-size: 13px;
            font-weight: 500;
            user-select: none;
            padding-left: 5px;
        }

        .time-oneself {
            color: rgb(138, 138, 138);
        }

        .hot {
            width: calc((100% - 110px) * 0.124);
            height: inherit;

            .bk {
                width: 80px;
                height: 7px;
                box-sizing: border-box;
                background-color: @hot-bk;
                border-radius: 2em;
                position: relative;
                z-index: 3;

                .fill {
                    height: 7px;
                    border-radius: 2em;
                    position: absolute;
                    left: 0px;
                    top: 0px;
                    background-color: @hot-fill;
                    z-index: 4;
                }
            }
        }
        .count{
            div{
                font-size: 13px;
            }
        }

    }
    .lrc{
        width: calc(100vw - 250px - 8px);
        height: auto;
        display: flex;
        justify-content: center;
    }

    &:hover {
        background-color: @line-color-hover !important;
    }
}

.line-music-oneself {
    &:hover {
        background-color: rgba(55, 55, 55, .8) !important;
    }
}
</style>