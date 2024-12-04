<template>
    <div class="line-music" @click="changColor" ref="line-music">
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
            <i class="iconfont icon-zanting" v-show="downloadingFlag && !val.ifcancel" @click="stop(false)"></i>
            <i class="iconfont icon-gf-play" v-show="!downloadingFlag || val.ifcancel" @click="stop(true)"></i>
            <i class="iconfont icon-lajixiang" @click="cancel"></i>
        </div>
    </div>
</template>

<script setup lang="ts">
import { toRef, watch,computed, getCurrentInstance, ComponentInternalInstance, ref, inject, ShallowRef } from 'vue'
import { useGlobalVar, useMain } from '@renderer/store';

const $el = getCurrentInstance() as ComponentInternalInstance;
const globalVar = useGlobalVar()
const Main = useMain()
const props = defineProps<{
    index: number
    val: {
        id: number;
        name: string;
        level?: string | undefined;
        br?: number | undefined;
        controller: AbortController
        ifcancel: boolean
    }
}>()
const loadingFillWidth = computed(() => {
  return ((globalVar.loadingValue.get(props.val.id)[0] / globalVar.loadingValue.get(props.val.id)[1])) * 100 + '%'
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
    const dom = $el.refs['line-music'] as HTMLElement
    if (dom) dom.style.backgroundColor = ''
})
const downloadingFlag = ref(true)
if (globalVar.initDownloadButton == false) {
    downloadingFlag.value = false
} else {
    downloadingFlag.value = true
}
const downloadQueue = inject('downloadQueue') 

const stop = (flag: boolean) => {
    downloadingFlag.value = flag
    if (flag == false) {  //暂停下载
        const download = globalVar.downloadList.find(item => item.id === props.val.id)
        download?.controller.abort()
    } else {  //继续下载
        const download = globalVar.downloadList.find(item => item.id === props.val.id)
        //@ts-ignore
        download.ifcancel = false
        //@ts-ignore
        download.controller = new AbortController()
        downloadQueue.value.add(() => getUrl(props.val.id, props.val.name), { signal: download!.controller.signal, priority: 1 })
    }
}

const cancel = () => {
    props.val.controller.abort()
    globalVar.downloadId = globalVar.downloadId.filter(item => item != props.val.id)
    globalVar.loadingValue.delete(props.val.id)
    globalVar.downloadList = globalVar.downloadList.filter(item => item.id != props.val.id)
    globalVar.musicPick.delete(props.val.id)
}
//下载请求
const br = (str: string) => {
    if (str == 'standard') return 128000
    else if (str == 'higher') return 192000
    else if (str == 'exhigh') return 320000
    else return 999000
}
const WaitdownloadList = toRef(globalVar, 'downloadList')
const getUrl = async (id, name) => {
    globalVar.initDownloadButton = true
    const downloadObj = globalVar.downloadList.find(item => item.id === id)
    const loadedBase = globalVar.loadingValue.get(id)?.[0] as number
    let totalBase = globalVar.loadingValue.get(id)?.[1] as number
    let url = ''
    let result;
    let chunks: Uint8Array[]
    console.log(downloadObj);
    if (globalVar.musicPick.get(id) == undefined) { //切片数据)
        globalVar.musicPick.set(id, [])
        //@ts-ignore
        chunks = globalVar.musicPick.get(id)
    } else {
        //@ts-ignore
        chunks = globalVar.musicPick.get(id)
    }
    try {
        if (downloadObj?.url) {
            url = downloadObj?.url
        } else {
            if (downloadObj?.level) {
                result = await Main.reqSongUrl(id, downloadObj?.level)
                url = result.data.data[0].url
            } else if (downloadObj?.br) {
                result = await Main.reqSongDlUrl(id, downloadObj?.br)
                url = result.data.data.url
            } else {
                result = await Main.reqSongDlUrl(id, br(globalVar.setting.downloadlevel))
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
                //@ts-ignore
                downloadObj.url = url
            }
        }
    } catch (error) {
        globalVar.musicPick.set(id, chunks)
        //@ts-ignore
        downloadObj.ifcancel = true
    }
    const Range = loadedBase == 0 && totalBase == 1 ? `bytes=${loadedBase}-` : `bytes=${loadedBase}-${totalBase}`
    //@ts-ignore
    return fetch(url, {
        headers: {
            Range: Range // 下载前 范围
        },
        signal: globalVar.downloadList.find(item => item.id === id)?.controller.signal
    }).then(response => {
        let loaded = loadedBase
        //@ts-ignore
        if (loadedBase == 0 && totalBase == 1) totalBase = +response.headers.get('content-length')
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
                        globalVar.loadingValue.set(id, [loaded, totalBase])
                        push()
                    }).catch(async (error) => {
                        console.log(error);
                        console.log(error.name);
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
            //@ts-ignore
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: name,id3 })
            globalVar.musicPick.delete(id)
            WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
            // window.electron.ipcRenderer.send('save-music-pick',{name})
        })
        .catch(() => {
            globalVar.musicPick.set(id, chunks)
            //@ts-ignore
            downloadObj.ifcancel = true
            // WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
        })
}
defineExpose({ downloadingFlag, val: props.val })

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