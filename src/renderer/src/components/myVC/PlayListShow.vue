<template>
    <div class="imgae" ref="imageS" :class="{
        noDrag:!Main.dragMouse,
        start:i+1 > num
    }" @mouseover="showPlayButton" @mouseout="hidePlayButton" 
    @click.self="go"
    >
        <div class="play animate__animated" 
            :class="{
                animate__fadeIn:playButtonFlag,
                animate__fadeOut:!playButtonFlag
            }"
            @click.self="playAll"
        >
            <i class="iconfont icon-gf-play" @click.self="playAll"></i>
        </div>
        <slot></slot>
    </div>
</template>

<script lang='ts' setup>
import { getCurrentInstance, ref, toRef, watch, ComponentInternalInstance, nextTick, onMounted,Ref } from 'vue'
import { useRouter } from 'vue-router';
import { useMain,useGlobalVar } from '@renderer/store'
const Main = useMain()
const $el = getCurrentInstance() as ComponentInternalInstance
const $router = useRouter()
const globalVar = useGlobalVar()

let playButtonFlag = ref(false)

defineProps<{
    url: string
    i: number
    num: number
    idr:number
}>()
let url = toRef($el.props, 'url')
let id = toRef($el.props, 'idr') as Ref<number>

watch(url, () => {
    nextTick(() => {
        let image = $el.refs.imageS as HTMLElement
        image.style.backgroundImage = 'url(' + url.value + ')'
    })

})

onMounted(() => {
    nextTick(() => {
        let image = $el.refs.imageS as HTMLElement
        image.style.backgroundImage = 'url(' + url.value + ')'
    })
})

const showPlayButton = () => {
    playButtonFlag.value = true
}

const hidePlayButton = () => {
    playButtonFlag.value = false
}

const go = ()=>{
    $router.push({
        name:'songPlaylist',
        query:{
            id:id.value,my:'false'
        }
    })
}

const playAll = async()=>{
    let result = (await Main.reqPlaylistTrackAll(id.value)).data;
    Main.playingList = result.songs
    Main.playingPrivileges = result.privileges
    Main.playingindex = 1
    Main.playing = result.songs[0].id as number
    Main.beforePlayListId = id.value
    Main.playStatus = 'play'
    let str = result.songs[0].name +' - ';
    let singerArr = result.songs[0].ar as unknown as Array<any>
    singerArr.forEach((element,index)=>{
        str+=element.name
        if(index != singerArr.length - 1)str+=' / '
    })
    window.electron.ipcRenderer.send('change-play-thum',str)
    window.electron.ipcRenderer.send('render-play')
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}
</script>

<style lang='less' scoped>
.start {
    align-self: start;
}

.imgae {
    flex: 0 0 16%;
    height: 0;
    width: 16%;
    padding-bottom: 16%;
    background-size: cover;
    border-radius: 0.5em;
    position: relative;
    background-image: url('https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg');
    margin-right: 2%;
    margin-left: 2%;
    margin-bottom: 60px;

    .play {
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

        i {
            color: @primary-color;
        }
    }

    :slotted(.message) {
        position: absolute;
        width: 100%;
        height: 30%;
        font-size: 13px;
        bottom: calc(-15px + -27%);
        -webkit-line-clamp: 3;
        overflow: hidden;
        line-height: 18px;
    }
}
</style>