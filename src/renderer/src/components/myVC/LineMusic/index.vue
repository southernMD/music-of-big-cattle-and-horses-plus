<template>
    <div class="line-music" :data-index="index" :data-id="id"  :class="{
        dragMouseStyleCan:Main.dragMouse && dragId != id && Main.dragType == 'songMy',
        dragMouseStyleMyself:dragId == id && Main.dragMouse && Main.dragType == 'songMy',
        topColor: topColorid == id && Main.dragType == 'songMy',
        bottomColor: Main.dragMouse && Main.dragType == 'songMy' && (length == index || length == indexSearch) && Main.mouseDragOnIndex == -1,
        'line-music-oneself': globalVar.oneself == 1
    }" @mousedown="pseudoDragBeginn" @click="changColor" @mouseover="replaceLocation" @mouseout="replaceLocationed" @dblclick="gotoPlay" ref="line-music">
        <div class="small-jiantou">
            <slot></slot>
        </div>
        <div class="caozuo" v-if="index && showIndex" :class="{'caozuo-oneself':globalVar.oneself}">
            <span v-if="Main.playing == id && Main.playStatus == 'play' && Main.beforePlayListId == playListid "><i class="iconfont icon-shengyin_shiti songStatus"></i> </span>
            <span v-else-if="Main.playing == id && Main.playStatus == 'stop' && Main.beforePlayListId == playListid"><i class="iconfont icon-shengyin03-mianxing songStatus"></i></span>
            <span v-else-if="indexSearch">{{ indexSearch > 9 ? indexSearch : `0${indexSearch}` }}</span>
            <span v-else>{{ index > 9 ? index : `0${index}` }}</span>
            <i class="iconfont icon-aixin xin" :class="{noDrag:!Main.dragMouse}" v-show="!ifLike()" @click="likeOrDislike"></i>
            <i class="iconfont icon-aixin_fill xin" :class="{noDrag:!Main.dragMouse}" v-show="ifLike()" @click="likeOrDislike"></i>
            <i class="iconfont icon-xiazai1" :class="{noDrag:!Main.dragMouse}"></i>
        </div>
        <div class="song-name" ref="line" :class="{'song-name-oneself':globalVar.oneself}">
            <div class="limit" :class="{'limit-oneself':globalVar.oneself}" >
                <span :class="{red:Main.playing == id && (Main.beforePlayListId == playListid || type == 'radio')}" v-html="title"></span>
                <span class="small" v-if="tns?.length" v-html="`&nbsp;(${tns[0]})`"></span>
                <span class="small" v-else-if="alia?.length" v-html="`&nbsp;(${alia[0]})`"></span>
            </div>
        </div>
        <div class="song-hand" :class="{'song-hand-oneself':globalVar.oneself}">
            <div class="limit" :class="{noDrag:!Main.dragMouse}">
                <span v-if="singer[0]?.name" class="span-singer" v-for="(value, index) in singer"
                    :data-singerId="singer[index]?.id" >
                    <Singer :name="singer[index]?.name" :index="index" :singerLen="singer.length - 1"></Singer>
                </span>
                <span v-else style="padding-left: 5px;">????????????</span>
            </div>
        </div>
        <div class="zhuanji" :class="{'zhuanji-oneself':globalVar.oneself}" v-if="zhuanji">
            <div class="limit" :class="{noDrag:!Main.dragMouse}">
                <span v-if="zhuanji.name" class="span-zhuanji" :data-singerId="zhuanji?.id">
                    <ZhuanJi :name="zhuanji.name" :tns="zhuanji.tns[0]" :Len="zhuanji?.tns?.length"></ZhuanJi>
                </span>
                <span v-else style="padding-left: 5px;">????????????</span>
            </div>
        </div>
        <div class="time" :class="{'time-oneself':globalVar.oneself}"><span>{{ dayjsMMSS(time) }}</span></div>
        <div class="hot" v-if="hot">
            <div class="bk">
                <div class="fill" ref="fill"></div>
            </div>
        </div>
        <Loading :loading="true" v-if="addLoading" width="50" tra="10"></Loading>
        <Loading :loading="false" v-if="addLoadingMessage" size="16" width="140" @close="addLoadingMessage = false" :showTime="1500" :message="'??????????????????'"></Loading>
        <Teleport to="body">
            <Loading :loading="false" v-if="loadingFlag" @close="loadingFlag = false" :showTime="1500" :message="likeMessage"></Loading>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, getCurrentInstance, ComponentInternalInstance, inject,ref, Ref, nextTick, watch ,toRef} from 'vue';
import { dayjsMMSS } from '@renderer/utils/dayjs'
import { useMain,useBasicApi,useGlobalVar } from '@renderer/store';
import Singer from './Singer/index.vue'
import ZhuanJi from './ZhuanJi/index.vue'
const $el = getCurrentInstance() as ComponentInternalInstance;
const Main = useMain();
const BasicApi = useBasicApi();
const globalVar = useGlobalVar()

//leftblock????????????id????????????????????????id
let playListid = inject<Ref<number>>('playListId') as Ref<number>


defineProps<{
    index?: number,
    title: string,
    singer: Array<any>,
    zhuanji?: any,
    time: number,
    id: number,
    tns?: Array<string>,
    alia?: Array<string>,
    hot?: boolean,
    hotValue?: number
    showIndex: boolean,
    indexSearch?:number
    type?:string
    length?:number //????????????????????????
}>()


//?????????????????????
let likeMessage = ref('')
let loadingFlag = ref(false)
const likeOrDislike = async()=>{
    let likeIndex = Main.likes.indexOf($el.props.id)
    if(likeIndex != -1){
        //????????????
        let code = (await Main.reqLike(Number($el.props.id),false)).data.code
        if(code == 405){
            likeMessage.value = '??????????????????????????????'
            loadingFlag.value = true
        }else{
            likeMessage.value = '??????????????????'
            loadingFlag.value = true
            Main.likes.splice(likeIndex,1)
            Main.likeChange = `${$el.props.id},false`
        }

    }else{
        let code = (await Main.reqLike(Number($el.props.id),true)).data.code
        if(code == 405){
            likeMessage.value = '??????????????????????????????'
            loadingFlag.value = true
        }else{
            likeMessage.value = '??????????????????????????????'
            loadingFlag.value = true
            Main.likes.unshift($el.props.id)
            Main.likeChange = `${$el.props.id},true`
        }

    }
}

//??????????????????
let topColorid = ref(-1)
const replaceLocation = ()=>{
    if(Main.dragMouse && Main.dragType == 'songMy' && $el.props.id !=dragId.value){
        topColorid.value = $el.props.id as number
        Main.mouseDragOnIndex = $el.props.index as number
        if($el.props.indexSearch) Main.mouseDragOnIndex = $el.props.indexSearch as number
    }
}

const replaceLocationed = ()=>{
    topColorid.value = -1
    if($el.props.index == $el.props.length){
        Main.mouseDragOnIndex = -1
    }
    if($el.props.indexSearch){
        if($el.props.indexSearch == $el.props.length){
            Main.mouseDragOnIndex = -1
        }
    }
}

let addLoading = ref(false)
let addLoadingMessage = ref(false)
const $emit = defineEmits(['warpPlace'])
const fnMouseDrag = async(e:any)=>{
    for(let i=0;i<e.path.length;i++){
        if(e.path[i].classList!=undefined && e.path[i].classList.contains('dragMouseStyleAdd')){
            let dom = e.path[i] as HTMLElement
            if(String(playListid.value) != String(dom.getAttribute('data-id')) && Number(dom.getAttribute('data-index'))<=Main.createPlay){
                addLoading.value = true
                Main.dragMouse = false
                let result = (await Main.reqPlaylistTracks('add',Number(dom.getAttribute('data-id')),Number($el.props.id))).data
                addLoading.value = false
                if(result.body.code == 200){
                    addLoadingMessage.value = true
                    let index = Number(dom.getAttribute('data-index'))
                    Main.playList[index].trackCount+=1
                }
            }
            break;
        }
    }
    let domTop = document.querySelector('.topColor') as HTMLElement | null
    let domBottom = document.querySelector('.bottomColor') as HTMLElement | null
    if(domTop){
        let addIndex = Number(domTop.getAttribute('data-index'))
        console.log(Main.dragIndex - 1,addIndex - 1);
        if(Main.dragIndex - 1 > addIndex - 1){      //?????????
            let delId =  Main.openPlayListId.splice(Main.dragIndex - 1,1)
            Main.openPlayListId.splice(addIndex - 1,0,delId[0])
            Main.reqSongOrderUpdate(playListid.value,Main.openPlayListId as [number])
            $emit('warpPlace',{from:Main.dragIndex - 1 ,to:addIndex-1})
        }else{
            let delId =  Main.openPlayListId.splice(Main.dragIndex - 1,1)
            Main.openPlayListId.splice(addIndex - 1 - 1,0,delId[0])
            Main.reqSongOrderUpdate(playListid.value,Main.openPlayListId as [number])
            $emit('warpPlace',{from:Main.dragIndex - 1 ,to:addIndex-1 - 1})
        }
       
    }
    if(domBottom){
        let delId =  Main.openPlayListId.splice(Main.dragIndex - 1,1)
        Main.openPlayListId.push(delId[0] as never)
        Main.reqSongOrderUpdate(playListid.value,Main.openPlayListId as [number])
        $emit('warpPlace',{from:Main.dragIndex - 1,to:-1})

    }
    
    Main.dragMouse = false
    topColorid.value = -1
    dragId.value = -1
    window.removeEventListener('mouseup',fnMouseDrag)
    window.removeEventListener('mousemove',fnMouseDragMoving)
}

let dragId = ref(-1)
const fnMouseDragMoving = (e:MouseEvent)=>{
    if(Main.isMyCreate == true){
        Main.dragMouse = true
        Main.dragType = 'songMy'
        Main.dragIndex = Number($el.props.index)
        Main.pageY = e.pageY
        Main.dragMessage = $el.props.title as string
        dragId.value = $el.props.id as number
    }else if(Main.isMyCreate == false){
        Main.dragMouse = true
        Main.dragMessage = $el.props.title as string
        Main.dragType = 'song'
    }
}
const pseudoDragBeginn = ()=>{
    window.addEventListener('mousemove',fnMouseDragMoving)
    window.addEventListener("mouseup",fnMouseDrag)

    console.log('????????????');
}

let domFather: HTMLElement

function searchFather(d: HTMLElement): HTMLElement {
    if (d.classList.contains('line-music')) {
        return d;
    } else {
        d = d?.parentNode as HTMLElement
        return searchFather(d);
    }
}
const ifLike = () => {
    return Main.likes.includes($el.props.id)
}

const changColor = (e: MouseEvent) => {
    let dom = e.target as HTMLElement;
    if(dom){
        domFather = searchFather(dom);
    let arr = document.querySelectorAll('.line-music') as unknown as Array<HTMLElement>
    for (let i = 0; i < arr.length; i++) {
        if ((i + 1) % 2 == 0) {
           if(!globalVar.oneself) arr[i].style.backgroundColor = 'var(--lineColorEven)'
           else arr[i].style.backgroundColor = 'rgba(43,43,43,.6)'
        } else {
            if(!globalVar.oneself) arr[i].style.backgroundColor = 'var(--lineColorOdd)'
            else arr[i].style.backgroundColor = 'rgba(46,46,46,.4)'
        }
    }
    if(!globalVar.oneself)domFather.style.backgroundColor = 'var(--lineColorClick)'
    else domFather.style.backgroundColor = 'rgba(65, 65, 65,.9)'
    }
}
onMounted(() => {
    if ($el.props.hot) {
        let dom = $el.refs.line as HTMLElement
        dom.style.width = 'calc((100% - 110px) * (0.42 - 0.124) )'
        let dom2 = $el.refs.fill as HTMLElement
        dom2.style.width = $el.props.hotValue + '%'
    }
})


//????????????
let originalList = toRef(Main,'originalList')
let originalPrivileges = toRef(Main,'originalPrivileges')
let playingList = toRef(Main,'playingList')
let playingPrivileges = toRef(Main,'playingPrivileges')

const heartJust = async()=>{
    if(Main.beforePlayListId == Main.playListId[0] && Main.heartJump == true){
        let result:Array<any> = (await Main.reqPlaymodeIntelligenceList(Main.playing,Number(Main.beforePlayListId),Main.playing)).data.data
        console.log(result);
        let idArr= [] as unknown as [number]
        result.forEach((element)=>{
            idArr.push(element.id)
        })
        let songList = (await (Main.reqSongDetail(idArr))).data
        let needPlay = playingList.value[Main.playingindex -1]
        let needPlayPrivileges = playingPrivileges.value[Main.playingindex -1]
        playingList.value = songList.songs
        playingPrivileges.value = songList.privileges
        playingList.value.unshift(needPlay)
        playingPrivileges.value.unshift(needPlayPrivileges)
        Main.originalsongIndex = $el.props.index as number
        Main.playingindex = 1
    }
    if(Main.beforePlayListId != Main.playListId[0]){
        Main.heartJump = false
    }
}


const gotoPlay = (e: MouseEvent) => {
    let _this = $el.refs['line-music'] as HTMLElement
    let father = _this.parentNode as HTMLElement
    if(originalList.value.length != 0 && father.getAttribute('id') != 'play-list-Panel-bottom'){
        playingList.value = originalList.value as [any]
        playingPrivileges.value = originalPrivileges.value as [any]
    }
    nextTick(async () => {
        if (father.getAttribute('id') === 'song-sheet') {
            console.log('?????????????????????');
            if (Main.beforePlayListId == playListid.value) {
                Main.playing = $el.props.id as number
                Main.playingindex = $el.props.index as number
                Main.playStatus = 'play'
                Main.songType = 'song'
                heartJust()
                return;
            }
            let result = (await Main.reqPlaylistTrackAll(playListid.value)).data;
            Main.playingList = result.songs
            Main.playingPrivileges = result.privileges
            Main.playingindex = $el.props.index as number
            Main.playing = $el.props.id as number
            Main.beforePlayListId = playListid.value
            Main.playStatus = 'play'
            Main.songType = 'song'
            console.log(Main.beforePlayListId,Main.playListId[0] );
            heartJust()
        } else if(father.getAttribute('id') == 'play-list-Panel-bottom'){
            Main.playing = $el.props.id as number
            Main.playingindex = $el.props.index as number + 1
            Main.playStatus = 'play'
        }else if(father.getAttribute('id') === 'every-day'){
            Main.playingList = BasicApi.everyDaySong
            let playingPrivileges:Array<any> = []
            BasicApi.everyDaySong.forEach((val)=>{
                playingPrivileges.push(val.privilege)
            })
            Main.playingPrivileges = playingPrivileges
            Main.playingindex = Number($el.props.index)
            Main.playing = BasicApi.everyDaySong[Number($el.props.index) - 1].id
            Main.playStatus = 'play'
            Main.songType = 'song'
        }
        //?????????????????????????????????????????????
        // $el.props.title
    })
    let str = $el.props.title +' - ';
    let singerArr = $el.props.singer as unknown as Array<any>
    singerArr.forEach((element,index)=>{
        str+=element.name
        if(index != singerArr.length - 1)str+=' / '
    })
    window.electron.ipcRenderer.send('change-play-thum',str)
    window.electron.ipcRenderer.send('render-play')
    globalVar.closePointOutMessage = '???????????????'
    globalVar.closePointOut = true
}
</script>

<style lang="less" scoped>
.dragMouseStyleCan{
        cursor: url('@/assets/point.png'),auto;
    div,span{
        cursor: url('@/assets/point.png'),auto;
    }
}
.dragMouseStyleMyself{
    cursor: url('@/assets/stop.png'),auto;
    div,span{
        cursor: url('@/assets/stop.png'),auto;
    }
}
.noDrag{
    cursor: pointer;
}
.line-music {
    width: calc(100% - 8px);
    height: 34px;
    display: flex;
    color: @small-font-color;
    font-size: 14px;
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
        .songStatus{
            color: @small-font-red;
            &:hover{
                color: @small-font-red !important;
            }
        }
        span {
            padding-left: 20px;
            font-size: 13px;
        }

        .xin {
            padding-left: 25px;
        }

        .icon-xiazai1 {
            color: @small-font-color;
            padding-left: 10px;
        }

        .icon-aixin_fill {
            color: @small-font-red !important;
        }

        i:not(.icon-aixin_fill):hover {
            color: @small-font-color-hover ;
        }
    }
    .caozuo-oneself{
        .icon-xiazai1 {
            color: rgb(150, 150, 150);
        }
        i:not(.icon-aixin_fill):hover {
            color:rgb(212, 212, 212);
        }
        .xin{
            color: rgb(150,150,150);
        }
        span{
            color: rgb(150, 150, 150);
        }
    }

    .song-name {
        width: calc((100% - 110px) * 0.42);
        height: inherit;
        color: @font-color ;
        user-select: none;
        font-size: 13px;

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
            .red{
                color: @small-font-red;
            }

            .small {
                color: @small-font-color;
            }
        }
        .limit-oneself{
            .small{
                color: rgb(105, 105, 105);
            }
        }
    }
    .song-name-oneself{
        color:rgba(255,255,255,.7);
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
    :deep(.song-hand-oneself){
        .limit{
            .span-singer{
                color:rgb(138,138,138);
                &:hover{
                    color: rgb(212,212,212);
                }
                >.gang{
                    color: rgb(138,138,138);
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
    :deep(.zhuanji-oneself){
        .limit{
            .span-zhuanji{
                color:rgb(138,138,138);
                &:hover{
                    color: rgb(212,212,212);
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
    .time-oneself{
        color:rgb(138,138,138);
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

    &:hover {
        background-color: @line-color-hover  !important;
    }
}
.line-music-oneself{
    &:hover{
        background-color: rgba(55, 55, 55,.8) !important;
    }
}
</style>