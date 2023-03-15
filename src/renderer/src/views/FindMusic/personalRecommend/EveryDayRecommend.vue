<template>
    <div class="every-day-recommend">
        <div class="title" @click="go" >
            <span :class="{noDrag:!Main.dragMouse}">每日推荐</span>
            <i class="iconfont icon-arrow-right-bold" :class="{noDrag:!Main.dragMouse}"></i>
        </div>
        <div class="main">
            <div class="imgae" ref="imageS" @click.self="playThis" :class="{noDrag:!Main.dragMouse}" @mouseover="showPlayButton" @mouseout="hidePlayButton">
                <div class="play animate__animated" @click.self="playThis"
                :class="{
                    animate__fadeIn:playButtonFlag,
                    animate__fadeOut:!playButtonFlag
                }">
                    <i class="iconfont icon-gf-play" @click.self="playThis"></i>
                </div>
            </div>
            <div class="txt">
                <div class="song-name">
                    <span>{{everyDaySong[index]?.name}}</span>
                </div>
                <div class="song-al" >
                    <span :class="{noDrag:!Main.dragMouse}">{{everyDaySong[index]?.al.name}}</span>
                </div>
                <div class="song-at">
                    <span :class="{noDrag:!Main.dragMouse}" v-for="({},i) in everyDaySong[index]?.ar">
                    {{everyDaySong[index]?.ar[i].name}}
                    <span v-if="i < everyDaySong[index].ar.length-1" style="
                        transform: rotate(-10deg) translateY(-2px);
                        display: inline-block;
                        font-size: 10px;
                        margin-right: 2px;
                    ">/</span>
                    </span>
                </div>
                <div class="song-first-comment">
                    <div class="gou-shang">“</div>
                    <div class="message">{{hotMessage}}</div>
                    <div class="gou-xia">”</div>
                </div>
                <div class="option">
                    <div :class="{noDrag:!Main.dragMouse}" @click="playThis">
                        <span>播放当前</span>
                    </div>
                    <div :class="{noDrag:!Main.dragMouse}" @click="playAll">
                        <span>播发全部</span>
                    </div>
                    <div :class="{noDrag:!Main.dragMouse}" @click="prev">
                        <span>上一首</span>
                    </div>
                    <div :class="{noDrag:!Main.dragMouse}" @click="next">
                        <span>下一首</span>
                    </div>
                </div>
            </div>
        </div>

    </div>
</template>

<script lang='ts' setup>
import {ref,toRef,onMounted, nextTick, getCurrentInstance,ComponentInternalInstance,watch } from 'vue'
import {useMain,useBasicApi} from '@renderer/store'
import { useRouter } from 'vue-router';

const $router = useRouter()
const Main = useMain()
const baseApi = useBasicApi()
const $el = getCurrentInstance() as ComponentInternalInstance 

let everyDaySong = toRef(baseApi,'everyDaySong')

const playButtonFlag = ref(false)

const showPlayButton = ()=>{
    playButtonFlag.value = true
}

const hidePlayButton = ()=>{
    playButtonFlag.value = false
}

let index = ref(0)
let hotMessage = ref('')
onMounted(() => {
    nextTick(async()=>{
        let image = $el.refs.imageS as HTMLElement
        image.style.backgroundImage = 'url(' + everyDaySong.value[index.value].al.picUrl + ')'
        let hot = (await Main.reqCommentHot(everyDaySong.value[index.value].id,0,1)).data.hotComments
        console.log(hot);
        if(hot.length == 0)hotMessage.value = '暂无热评'
        else{
            hotMessage.value = hot[0].content
        }
    })
})

const prev = ()=>{
    index.value--
    if(index.value < 0)index.value = everyDaySong.value.length - 1
}

const next = ()=>{
    index.value++
    if(index.value > everyDaySong.value.length - 1)index.value = 0
}

const playAll = ()=>{
    Main.playingList = everyDaySong.value
    let playingPrivileges:Array<any> = []
    everyDaySong.value.forEach((val)=>{
        playingPrivileges.push(val.privilege)
    })
    Main.playingPrivileges = playingPrivileges
    Main.playingindex = index.value + 1
    Main.playing = everyDaySong.value[index.value].id
    Main.playStatus = 'play'
}

watch(index,async()=>{
    if(index.value >= 0 && index.value <=  everyDaySong.value.length - 1){
        let image = $el.refs.imageS as HTMLElement
        image.style.backgroundImage = 'url(' + everyDaySong.value[index.value].al.picUrl + ')'
        let hot = (await Main.reqCommentHot(everyDaySong.value[index.value].id,0,1)).data.hotComments
        console.log(hot);
        if(hot.length == 0)hotMessage.value = '暂无热评'
        else{
            hotMessage.value = hot[0].content
        }
    }
})

//播放当前
const playThis = async()=>{
    if(Main.playing == everyDaySong.value[index.value].id){
        Main.detailStatus = 'open'
    }else{
        if(Main.playingList.length == 0){
            Main.playingList = [everyDaySong.value[index.value]]
            Main.playingPrivileges = [everyDaySong.value[index.value].privilege]
            Main.playingindex = 1 as number
            Main.playing = everyDaySong.value[index.value].id as number
            Main.playStatus = 'play'
        }else{
            let I = 0;
            let flag = true;
            for(let i = 0;i< Main.playingList.length;i++){
                if(everyDaySong.value[index.value].id ==  Main.playingList[i].id){
                    flag = false
                    I = i
                }
            }
            if(flag){
                Main.playingList.splice(Main.playingindex - 1,0,everyDaySong.value[index.value])
                Main.playingPrivileges.splice(Main.playingindex - 1,0,everyDaySong.value[index.value].privilege)
                Main.playing = everyDaySong.value[index.value].id as number
                Main.playStatus = 'play'
            }else{
                Main.playingindex = I + 1
                Main.playing = everyDaySong.value[index.value].id as number
                Main.playStatus = 'play'
            }

        }
    }

   
}

const go = ()=>{
    $router.addRoute('app',{
        path:'everyDayR',
        name:'everyDayR',
        component: () => import(`@renderer/views/everyDayR.vue`)
    })
    $router.push({
        name:'everyDayR'
    })
}
</script>

<style lang='less' scoped>
    .every-day-recommend{
        width: 100%;
        height: 32vh;
        border-radius: 0.5em;
        // -webkit-backdrop-filter: blur(10px);
        // backdrop-filter: blur(10px);
        .title{
            font-size: 20px;
            color:@font-color;
            user-select: none;
            margin-top: 5px;
            margin-bottom: 15px;
            font-weight: bolder;
            margin-left: 10px;
        }
        .main{
            display: flex;
            margin-left: 10px;
            .imgae{
                width: 15%;
                padding-bottom: 15%;
                height: 0px;
                background-size:cover;
                border-radius: 0.5em;
                position: relative;
                .play{
                    position: absolute;
                    right: 10px;
                    bottom: 10px;
                    background-color: white;
                    width: 30px;
                    height: 30px;
                    border-radius: 50%;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    i{
                        color:@primary-color;
                    }
                }
            }
            .txt{
                min-width:0;
                display: flex;
                flex-direction: column;
                margin-left: 20px;
                width: 80%;
                position: relative;
                >div{
                    margin-bottom: 10px;
                    width: 100%;
                    font-size: 14px;
                    user-select: none;
                }
                .song-name{
                    width: 30%;
                    >span{
                        display: inline-block;
                        width: 100%;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow:ellipsis;
                        font-size: 18px;
                        user-select: text;
                    }
                }
                .song-al{
                    >span{
                        color:@small-font-color;
                    }
                }
                .song-at{
                    >span{
                        color:@small-font-color;
                    }
                }
                .song-first-comment{
                    user-select: auto;
                    height:60%;
                    width: 100%;
                    min-height: 60px;
                    background-color: @left-click-color;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    position: relative;
                    >.message{
                        font-size: 18px;
                        max-width:80% ;
                        display: inline-block;
                        white-space: nowrap;
                        overflow: hidden;
                        text-overflow:ellipsis;
                    }
                    .gou-shang{
                        user-select: none;
                        font-size: 30px;
                        position: absolute;
                        left: 0;
                        top: 0;
                    }
                    .gou-xia{
                        user-select: none;
                        font-size: 30px;
                        position: absolute;
                        right: 0;
                        bottom: 0;
                    }
                }
                .option{
                    position: absolute;
                    display: flex;
                    top: 0;
                    right: 0;
                    width: auto;
                    >div{
                        margin: 0 10px;
                        min-width: 60px;
                        height: 30px;
                        border:1px solid  @split-line-color;;
                        border-radius: 2em;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        >span{
                            padding-left: 15px;
                            padding-right: 15px;
                        }
                        &:hover{
                            background-color: @span-color-hover
                        }
                    }
                }
            }
        }

    }
</style>