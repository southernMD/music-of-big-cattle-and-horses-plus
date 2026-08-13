<template>
    <div class="line-music" @click="changColor" ref="lineMusic">
        <div class="number" :class="{ 'number-oneself': globalVar.oneself }">
            <span>{{ index + 1 > 9 ? index + 1 : `0${index + 1}` }}</span>
        </div>
        <div class="name">
            <div class="limit" :class="{ 'limit-oneself': globalVar.oneself }">
                {{ val.name }}
            </div>
        </div>
        <div class="loading">
            <div class="bk" v-show="!val.ifcancel">
                <div class="fill" :key="val.id"
                    :style="{ 'width':  loadingFillWidth}">
                </div>
            </div>
            <div class="txt" :class="{ 'txt-oneself': globalVar.oneself }" v-show="val.ifcancel">
                下载出错
            </div>
        </div>
        <div class="option">
            <i class="iconfont icon-zanting" v-show="val.downloadingFlag && !val.ifcancel" @click="stop(false)"></i>
            <i class="iconfont icon-gf-play" v-show="!val.downloadingFlag || val.ifcancel" @click="stop(true)"></i>
            <i class="iconfont icon-lajixiang" @click="cancel"></i>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef, watch,computed, ref, inject, ShallowRef } from 'vue'
import PromiseQueue from 'p-queue';
import { useGlobalVar, useMain } from '@renderer/store';
import { downloadMusic } from '@renderer/utils/downloadMusic';

const globalVar = useGlobalVar()
const Main = useMain()
const lineMusic = ref<HTMLElement>()
const props = defineProps<{
    index: number
    val: {
        id: number;
        name: string;
        level?: string | undefined;
        br?: number | undefined;
        controller: AbortController
        ifcancel: boolean
        downloadingFlag: boolean
    }
}>()
const loadingFillWidth = computed(() => {
    const [now,total] = globalVar.loadingValue.get(props.val.id) ?? [0,1] as [number,number]
    return (now / total) * 100 + '%'
})
function searchFather(d: HTMLElement): HTMLElement {
    if (d.classList.contains('line-music')) {
        return d;
    } else {
        d = d?.parentNode as HTMLElement
        return searchFather(d);
    }
}
let domFather: HTMLElement
const changColor = (e: MouseEvent) => {
    let dom = e.target as HTMLElement;
    if (dom) {
        domFather = searchFather(dom);
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
        if (!globalVar.oneself) domFather.style.backgroundColor = 'var(--lineColorClick)'
        else domFather.style.backgroundColor = 'rgba(65, 65, 65,.9)'
    }
}
const oneself = toRef(globalVar, 'oneself')
watch(oneself, () => {
    const dom = lineMusic.value
    if (dom) dom.style.backgroundColor = ''
})

const downloadQueue = inject<ShallowRef<PromiseQueue>>('downloadQueue') as ShallowRef<PromiseQueue>

const stop = (flag: boolean) => {
    props.val.downloadingFlag = flag
    if (flag == false) {  //暂停下载
        props.val.controller.abort()
    } else {  //继续下载
        props.val.ifcancel = false
        props.val.controller = new AbortController()
        downloadQueue.value.add(() => downloadMusic(props.val.id, props.val.name), { signal: props.val.controller.signal, priority: 1 })
    }
}

const cancel = () => {
    props.val.controller.abort()
    globalVar.downloadId = globalVar.downloadId.filter(item => item != props.val.id)
    globalVar.loadingValue.delete(props.val.id)
    globalVar.downloadList = globalVar.downloadList.filter(item => item.id != props.val.id)
    globalVar.musicPick.delete(props.val.id)
}

defineExpose({ val: props.val })

</script>

<style scoped lang="less">
.line-music {
    width: 100%;
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

    .number {
        width: 8%;
        display: flex;
        justify-content: center;
    }

    .number-oneself {
        span {
            color: rgb(150, 150, 150);
        }
    }

    .name {
        width: 30%;
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
        }

        .limit-oneself {
            color: rgb(150, 150, 150);
        }
    }

    .loading {
        width: 60%;
        display: flex;
        align-items: center;

        .bk {
            width: 98%;
            height: 8px;
            background-color: @small-font-color;
            border-radius: 2em;
            position: relative;

            .fill {
                position: absolute;
                left: 0px;
                width: 0%;
                height: 8px;
                background-color: @primary-color;
                border-radius: 2em;
            }
        }

        .txt {
            width: 98%;
            color: @font-color;
        }

        .txt-oneself {
            color: #fff;
        }
    }

    .option {
        >i {
            margin: 5px 5px;
            cursor: pointer;
        }
    }
}</style>