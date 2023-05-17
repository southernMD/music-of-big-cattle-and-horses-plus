<template>
    <div class="PersonalFM">
        <div class="top">
            <div class="main">
                <div class="left">
                    <div class="imgs" ref="imgs">
                        <div class="image imageL" ref="imgL" v-show="FMindex >= 2"></div>
                        <div class="image imageXL" ref="imgXL" v-show="FMindex != 0" @click="throPrev"
                            :class="{ noDrag: !Main.dragMouse }"></div>
                        <div class="image imageXXL" ref="imgXXL"></div>
                        <div class="image imageXXXL">
                            <div class="btn" :class="{ noDrag: !Main.dragMouse, active: FMplayFlag }" @click="play">
                                <i class="iconfont icon-gf-play" v-if="!FMplayFlag"></i>
                                <i class="iconfont icon-zanting" v-else></i>
                            </div>
                        </div>
                    </div>
                    <div class="option" :class="{ noDrag: !Main.dragMouse }">
                        <div title="喜欢">
                            <i class="iconfont icon-aixin"></i>
                        </div>
                        <div title="垃圾箱" @click="rubbish">
                            <i class="iconfont icon-lajixiang"></i>
                        </div>
                        <div @click="throPrev" title="上一首">
                            <i class="iconfont icon-shangyishoushangyige"></i>
                        </div>
                        <div @click="throNext" title="下一首">
                            <i class="iconfont icon-next"></i>
                        </div>
                        <div title="更多" 
                        data-right="1" 
                        data-type="FM" 
                        :data-id="Main.FMList[FMindex].id" 
                        :data-pic="Main.FMList[FMindex].al.picUrl"
                        :data-txt="dataTxt"
                        @click="right" ref="more">
                            <i class="iconfont icon-shenglvehao"></i>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <div class="message">
                        <div class="title">{{ Main.FMList[FMindex]?.name }}</div>
                        <div class="second-title" v-if="Main.FMList[FMindex]?.tns?.length"
                            v-html="`${Main.FMList[FMindex]?.tns[0]}`"></div>
                        <div class="second-title" v-else-if="Main.FMList[FMindex]?.alias?.length"
                            v-html="`${Main.FMList[FMindex]?.alias[0]}`"></div>
                        <div class="author">
                            <div class="al">
                                <span class="name">专辑：</span>
                                <span class="t" @click="goZhuanji(Main.FMList[FMindex]?.al?.id)" :class="{ noDrag: !Main.dragMouse }">
                                    {{ Main.FMList[FMindex]?.al?.name}}
                                </span>
                            </div>
                            <div class="ar">
                                <span class="name">歌手：</span>
                                <span class="t">
                                    <span v-if="Main.FMList[FMindex].ar[0]?.name" class="span-singer"
                                        v-for="(value, index) in Main.FMList[FMindex]?.ar" :data-singerId="value.id" :key="value.id">
                                        <span :class="{ noDrag: !Main.dragMouse }" class="name" @click="goSongHand(value.id)">{{ value.name }}</span>
                                        <span v-if="index !== Main.FMList[FMindex]?.ar.length - 1" class="gang">/</span>
                                    </span>
                                    <span v-else style="padding-left: 5px;">未知艺人</span>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div class="lrc">
                        <ScroolLrc :currentTime="currentTime" :lyricOffset="lyricOffset" @goTotime="goTotime" type="FM">
                        </ScroolLrc>
                    </div>
                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="main">
                <div class="title">评论</div>
                <div class="wr-commit">
                    <WriteCommit @getText="getText"></WriteCommit>
                    <div class="submit" :class="{ noDrag: !Main.dragMouse }" @click="subCommit">
                        <span>评论</span>
                    </div>
                </div>
                <CommentList :commentFlag="commentFlag" :nowPage="nowPage" :hotComments="hotComments" :moreHot="moreHot"
                    :total="total" :comments="comments" :totalPage="totalPage" :id="playingId" :type="0"></CommentList>

            </div>
        </div>
        <Teleport to="body" v-if="errorFlag">
            <Loading :type="typeError" :message="errorMassage" :width="loadingWidth" @close="errorFlag = false"
                :showTime="1500"></Loading>
        </Teleport>
    </div>
</template>

<script lang='ts' setup>
import { onActivated, ref, Ref, getCurrentInstance, ComponentInternalInstance, nextTick, watch, toRef } from 'vue'
import { useMain, useGlobalVar } from '@renderer/store'
import { throttle } from 'lodash'
import { useRouter } from 'vue-router'
const Main = useMain()
const $router = useRouter()
const globalVar = useGlobalVar()
const $el = getCurrentInstance() as ComponentInternalInstance
let FMplayFlag = ref(false)
let currentTime = toRef(globalVar, 'currentTime')
let lyricOffset = toRef(globalVar, 'lyricOffset')
let playingList = toRef(Main, 'playingList')
let playingId = toRef(Main, 'playing')
let FMindex = toRef(Main, 'FMindex')
let playingPrivileges = toRef(Main, 'playingPrivileges')
let playStatus = toRef(Main, 'playStatus')

watch(playStatus, () => {
    if (playStatus.value == 'play' && Main.songType == 'FM') {
        FMplayFlag.value = true
    } else if (playStatus.value == 'stop' && Main.songType == 'FM') {
        FMplayFlag.value = false
    }
})

const goTotime = (time: number) => {
    if(Main.songType == 'FM'){
        //子组件修改时间
        globalVar.timeValue = time
        globalVar.changeTimeFlag = true
    }else{
        globalVar.timeValue = time
        play()
    }

}

const changePlaying = () => {
    dataTxt.value = `单曲:${Main.FMList[FMindex.value]!.name} - ${Main.FMList[FMindex.value]!.ar.map(it=>it.name).join('/')}`
    Main.playingindex = FMindex.value + 1 as number
    playingId.value = Main.FMList[FMindex.value]?.id as number
    Main.beforePlayListId = 4
    Main.playStatus = 'play'
    let str = playingList.value[Main.playingindex - 1]?.name + ' - ';
    let singerArr = playingList.value[Main.playingindex - 1]?.ar as unknown as Array<any>
    singerArr?.forEach((element, index) => {
        str += element.name
        if (index != singerArr.length - 1) str += ' / '
    })
    window.electron.ipcRenderer.send('change-play-thum', str)
    window.electron.ipcRenderer.send('render-play')
}

const addPlay = () => {
    playingList.value.push(Main.FMList[FMindex.value])
    playingPrivileges.value.push(Main.FMListPrivileges[FMindex.value])
}

let one = ref(false)
onActivated(() => {
    globalVar.scrollToTop = true;
    Main.beforePlayListId = -4
    if (Main.playStatus == 'stop' && Main.songType != 'FM') {
        Main.songType = 'FM'
        playStatus.value = 'play'
        FMplayFlag.value = true
        playingList.value = []
        playingPrivileges.value = []
        nextTick(() => {
            let imgXXL = $el.refs.imgXXL as HTMLElement
            console.log(imgXXL);
            console.log(Main.FMList[FMindex.value].al.picUrl);
            imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value].al.picUrl + ')'
            addPlay()
            changePlaying()
        })
    } else if (Main.playStatus == 'play' && Main.songType != 'FM') {
        FMplayFlag.value = false;
        one.value = true;
        let imgXXL = $el.refs.imgXXL as HTMLElement
        let imgXL = $el.refs.imgXL as HTMLElement
        if (FMindex.value == 0) {
            imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value].al.picUrl + ')'
        } else {
            imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value].al.picUrl + ')'
            imgXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value - 1]?.al?.picUrl + ')'
        }
        dataTxt.value = `单曲:${Main.FMList[FMindex.value]!.name} - ${Main.FMList[FMindex.value]!.ar.map(it=>it.name).join('/')}`
    }
})

const prev = () => {
    if (FMindex.value > 0) {
        FMindex.value--;
        if(Main.songType !='FM'){
            play()
        }
    }
}
const next = () => {
    FMindex.value++;
    if(Main.songType !='FM'){
        play()
    }
}
const throPrev = throttle(prev, 1000, { leading: true })
const throNext = throttle(next, 1000, { leading: true })

const play = () => {
    FMplayFlag.value = !FMplayFlag.value
    if (one.value) {
        one.value = false
        Main.songType = 'FM'
        playingList.value = []
        playingPrivileges.value = []
        for (let i = 0; i <= FMindex.value; i++) {
            playingList.value.push(Main.FMList[i])
            playingPrivileges.value.push(Main.FMListPrivileges[i])
        }
        changePlaying()
    } else {
        if (playStatus.value == 'play') playStatus.value = 'stop'
        else playStatus.value = 'play'
    }

}

//替换播放
const dataTxt = ref('')
watch(FMindex, async (newValue, oldValue) => {
    let imgs = $el.refs.imgs as HTMLElement
    let imgXXL = $el.refs.imgXXL as HTMLElement
    let imgXL = $el.refs.imgXL as HTMLElement
    let imgL = $el.refs.imgL as HTMLElement
    if (newValue > oldValue) {
        imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value]?.al?.picUrl + ')'
        imgXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value - 1]?.al?.picUrl + ')'
        imgL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value - 2]?.al?.picUrl + ')'
        imgs.classList.add('active')
        let t = setTimeout(() => {
            imgs.classList.remove('active')
            clearTimeout(t);
        }, 200)
        if (FMindex.value == Main.FMList.length - 2) {
            await Main.reqPersonal_fm()
            //    let Need = 
            // Main.FMList.push(...Need.songs)
            // Main.FMListPrivileges.push(...Need.privileges)
        }
        if (FMindex.value > playingList.value.length - 1) {
            addPlay()
        }
        changePlaying()
    } else {
        imgs.classList.add('active-r')
        let t = setTimeout(() => {
            clearTimeout(t);
            imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value].al.picUrl + ')'
            imgXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value - 1]?.al?.picUrl + ')'
            imgL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value - 2]?.al?.picUrl + ')'
            imgs.classList.remove('active-r')
        }, 200)
        changePlaying()
    }
})

//评论
let subCommitStr = ref('')
const getText = (str: string) => {
    console.log(str);
    subCommitStr.value = str
}

let errorFlag = ref(false)
let errorMassage = ref('')
let typeError = ref('')
let loadingWidth = ref('')
const subCommit = async () => {
    let result = (await Main.reqcomment({
        t: 1,
        type: 0,
        id: playingId.value,
        content: subCommitStr.value
    })).data
    console.log(result);
    if (result.code == 200) {
        typeError.value = ''
        errorFlag.value = true;
        errorMassage.value = '评论成功！'
        loadingWidth.value = '150'
        Main.clearText = true
    } else {
        typeError.value = 'error'
        errorFlag.value = true;
        errorMassage.value = '评论失败！'
        loadingWidth.value = '150'
    }
    let addComment = result.comment
    addComment['likedCount'] = 0;
    addComment['liked'] = false;
    addComment['timeStr'] = '刚刚'
    addComment['beReplied'] = []
    comments.value.unshift(addComment)
}

let commentFlag = ref(false)
let hotComments: Ref<any[]> = ref([]);
let comments: Ref<any[]> = ref([]);
let total = ref(0)
let totalPage = ref(0)
let nowPage = ref(1);
let moreHot = ref(false)
watch(playingId, async () => {
    if(playingId.value == -1)return 
    commentFlag.value = false
    let result = (await Main.reqCommentMusic(playingId.value, 20, 0)).data
    console.log(result, '******&&&&&&&&');
    hotComments.value = result.hotComments;
    comments.value = result.comments;
    total.value = result.total
    totalPage.value = Math.ceil((total.value) / 20)
    moreHot.value = result.moreHot
    commentFlag.value = true
    nowPage.value = 1;
})

//垃圾桶
let rubishFlag = toRef(globalVar, 'rubishFlag')
watch(rubishFlag,()=>{
    if(rubishFlag.value == true){
        rubbish()
        rubishFlag.value = false
    }
})
const rubbish = async () => {
    let result = await Main.reqFm_trash(playingId.value)
    if (result.data.code == 200) {
        Main.FMList.splice(FMindex.value, 1)
        Main.FMListPrivileges.splice(FMindex.value, 1)
        playingList.value.splice(Main.playingindex - 1, 1)
        playingPrivileges.value.splice(Main.playingindex - 1, 1)
        playingId.value = Main.FMList[FMindex.value].id
        let imgs = $el.refs.imgs as HTMLElement
        let imgXXL = $el.refs.imgXXL as HTMLElement
        imgXXL.style.backgroundImage = 'url(' + Main.FMList[FMindex.value].al.picUrl + ')'
        imgs.classList.add('active')
        let t = setTimeout(() => {
            imgs.classList.remove('active')
            clearTimeout(t);
        }, 200)
        if (FMindex.value == Main.FMList.length - 2) {
            await Main.reqPersonal_fm()
            //    let Need = 
            // Main.FMList.push(...Need.songs)
            // Main.FMListPrivileges.push(...Need.privileges)
        }
        if (FMindex.value > playingList.value.length - 1) {
            addPlay()
        }
        changePlaying()
    }
}

const goZhuanji = (id)=>{
    $router.push({
        name:'songPlaylist',
        query:{
        id,type:"专辑",my:'false'
        }
    })
}

const goSongHand = (id)=>{
    if(id !=0 ){
        $router.push({
            name:'SongHand',
            query:{
                id
            }
        })
    }

}

const more = ref()
const right = (event)=>{
    if (event.button === 0) {
        setTimeout(()=>{
            const rightClickEvent = new MouseEvent('contextmenu', {
                button: 2,
                clientX: event.clientX,
                clientY: event.clientY,
                bubbles: true,
                cancelable: true,
                view: window
            });
            console.log(event.targrt);
            more.value.dispatchEvent(rightClickEvent);
        })
    }
}

</script>

<style lang='less' scoped>
.noDrag {
    cursor: pointer;

    >div {
        cursor: pointer;
    }
}

.PersonalFM {
    .top {
        height: 540px;
        width: 100%;

        .main {
            height: 100%;
            width: 640px;
            // background-color: red;
            margin: 0 auto;
            display: flex;

            .left {
                height: 100%;
                width: 50%;
                padding-left: 20px;
                // background-color: gold;
                position: relative;

                .image {
                    width: 300px;
                    height: 300px;
                    background-size: cover;
                    background-position: center;
                    position: absolute;
                    right: 0;
                    top: 70px;
                    border-radius: 0.5em;

                    .btn {
                        width: 50px;
                        height: 50px;
                        position: absolute;
                        left: 0;
                        right: 0;
                        top: 0;
                        bottom: 0;
                        margin: auto auto;
                        background-color: rgba(255, 255, 255, 0.9);
                        border-radius: 50%;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        transition: all 0.2s ease-in-out;

                        i {
                            color: @primary-color;
                            font-size: 25px;
                        }
                    }

                    .active {
                        transform: translate(115px, 115px);
                    }
                }

                .imageL {
                    z-index: 1;
                    opacity: 0;
                    transform: scale(0.6, 0.6) translateX(-60px - 120px);
                }

                .imageXL {
                    z-index: 2;
                    transform: scale(0.8, 0.8) translateX(-20px - 60px);
                }

                .imageXXL {
                    z-index: 3;
                }

                .imageXXXL {
                    z-index: 4;
                }

                .active {
                    >.imageL {
                        animation: L 0.2s ease-in-out;
                    }

                    >.imageXL {
                        animation: XL 0.2s ease-in-out;
                    }

                    >.imageXXL {
                        animation: XXL 0.2s ease-in-out;
                    }
                }

                .active-r {
                    >.imageL {
                        animation: L_r 0.2s ease-in-out;
                    }

                    >.imageXL {
                        animation: XL_r 0.2s ease-in-out;
                    }

                    >.imageXXL {
                        animation: XXL_r 0.2s ease-in-out;
                    }
                }

                @keyframes L {
                    0% {
                        transform: scale(0.8, 0.8) translateX(-20px - 60px);
                        opacity: 1;
                    }

                    100% {
                        transform: scale(0.6, 0.6) translateX(-60px - 120px);
                        opacity: 0;
                    }
                }

                @keyframes L_r {
                    0% {
                        transform: scale(0.6, 0.6) translateX(-60px - 120px);
                        opacity: 0;
                    }

                    100% {
                        transform: scale(0.8, 0.8) translateX(-20px - 60px);
                        opacity: 1;
                    }
                }

                @keyframes XL {
                    0% {
                        transform: scale(1, 1) translateX(0);
                    }

                    100% {
                        transform: scale(0.8, 0.8) translateX(-20px - 60px);
                    }
                }

                @keyframes XL_r {
                    0% {
                        transform: scale(0.8, 0.8) translateX(-20px - 60px);
                    }

                    100% {
                        transform: scale(1, 1) translateX(0);
                    }
                }

                @keyframes XXL {
                    0% {
                        transform: translateX(100px);
                        opacity: 0;
                    }

                    100% {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }

                @keyframes XXL_r {
                    0% {
                        transform: translateX(0);
                        opacity: 1;
                    }

                    100% {
                        transform: translateX(100px);
                        opacity: 0;
                    }
                }

                .option {
                    display: flex;
                    width: 100%;
                    position: absolute;
                    bottom: 80px;

                    >div {
                        margin: 0 2%;
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        background-color: @pagin-bk-btn-color;
                        border: 1px soild @split-line-color;
                        display: flex;
                        justify-content: center;
                        align-items: center;

                        i {
                            font-size: 20px;
                        }

                        &:hover {
                            background-color: @span-color-hover;
                        }
                    }
                }
            }

            .right {
                height: 100%;
                width: 50%;
                padding-right: 50px;
                // background-color: green;
                padding-left: 20px;
                position: relative;

                .message {
                    margin-top: 30px;

                    .title {
                        font-size: 20px;
                        color: @font-color;
                        font-weight: bolder;
                        line-height: 32px;
                        max-height: 70px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .second-title {
                        margin-top: 10px;
                        margin-bottom: 10px;
                        font-weight: bolder;
                        font-size: 14px;
                        max-height: 30px;
                        line-height: 25px;
                        overflow: hidden;
                        text-overflow: ellipsis;
                    }

                    .author {
                        display: flex;
                        user-select: none;
                        margin-top: 10px;

                        .al {
                            flex: 0 0 50%;
                            font-size: 13px;

                            .name {
                                color: @font-color;
                            }

                            .t {
                                color: @small-font-color;
                                max-width: 95px;
                                white-space: nowrap;
                                display: inline-block;
                                overflow: hidden;
                                text-overflow: ellipsis;
                            }
                        }

                        .ar {
                            flex: 0 0 50%;
                            font-size: 13px;

                            .name {
                                color: @font-color;
                            }

                            .t {
                                max-width: 95px;
                                white-space: nowrap;
                                display: inline-block;
                                white-space: nowrap;
                                display: inline-block;
                                overflow: hidden;
                                text-overflow: ellipsis;

                                .name {
                                    color: @FM-ar;

                                    &:hover {
                                        color: @FM-ar-hover;
                                    }
                                }

                                .gang {
                                    margin-right: 3px;
                                    margin-left: 3px;
                                    //     font-size: 10px;
                                    //     transform: rotate(-8deg) translateY(-2px);
                                    display: inline-block;
                                    //     cursor: default;
                                    //     color: @small-can-click ;
                                }
                            }
                        }
                    }
                }

                .lrc {
                    width: 120%;
                    margin-top: 10px;
                    height: 475px;
                    position: relative;

                    :deep(.main) {
                        width: 100%;

                        >.line {
                            width: 83%;
                        }

                        .el-scrollbar {
                            width: 100%;
                        }
                    }
                }

            }
        }
    }

    .bottom {
        min-height: 400px;
        width: 100%;
        display: flex;

        .main {
            min-height: 400px;
            height: 100%;
            width: 100%;
            max-width: 850px;
            // background-color: yellow;
            margin: 0 auto;

            .title {
                margin-left: 30px;
                margin-bottom: 20px;
                font-weight: bolder;

            }

            .wr-commit {
                position: relative;

                .submit {
                    height: 30px;
                    width: 55px;
                    border-radius: 2em;
                    border: 1px solid @split-line-color;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    position: absolute;
                    right: 30px;
                    bottom: -5px;

                    >span {
                        user-select: none;
                        font-size: 14px;
                    }

                    &:hover {
                        background-color: @span-color-hover
                    }
                }
            }

            :deep(.comment) {
                width: 100%;

                .commentList {
                    width: 80%;
                    max-width: 1024px;
                }
            }

        }
    }
}
</style>