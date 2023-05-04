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
import { useMain } from '@renderer/store'
const Main = useMain()
const $el = getCurrentInstance() as ComponentInternalInstance

let playButtonFlag = ref(false)

const props = defineProps<{
    url: string
    i: number
    num: number
    idr:number
    myIndex?:number
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

const $emit = defineEmits(['go','playAll'])
const go = ()=>{
    $emit('go',{id:id.value,index:props.myIndex})

}

const playAll = async()=>{
    $emit('playAll',id.value)
}
</script>

<style lang='less' scoped>
.noDrag{
    cursor: pointer;
}
.start {
    align-self: start;
}

.imgae {
    flex: 0 0 16%;
    height: 0;
    padding-bottom: 16%;
    background-size: cover;
    border-radius: 0.5em;
    position: relative;
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