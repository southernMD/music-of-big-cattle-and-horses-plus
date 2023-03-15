<template>
    <div class="play-list">
        <div class="top">
            <el-image draggable="false" style="width: 185px; height: 185px" fit="cover"
                :src="playList[index]?.coverImgUrl"></el-image>
            <div class="main">
                <div class="title">
                    <div class="Btag">歌单</div>
                    <span>{{ playList[index]?.name }}</span>
                    <i class="iconfont icon-xiugaioryijian" :class="{ noDrag: !Main.dragMouse }"></i>
                </div>
                <div class="author">
                    <el-image fit="cover" style="width: 25px; height: 25px" :src="playList[index]?.creator.avatarUrl">
                    </el-image>
                    <span class="author-name"
                        :class="{ noDrag: !Main.dragMouse, 'author-name-oneself': globalVar.oneself == 1 }">{{
                            playList[index]?.creator.nickname }}</span>
                    <span class="createtime" :class="{ 'createtime-oneself': globalVar.oneself == 1 }">{{
                        dayjsStamp(playList[index]?.createTime) }}创建</span>
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
                    <div class="start" id="startSelf" v-if="!suoFlag" :class="
                        {
                            h: !isStartStyle(),
                            'start-color-black-stop': isStartStyle() && mainColor == 'NMblack',
                            'start-color-red-stop': isStartStyle() && mainColor != 'NMblack',
                            'start-color-black': !isStartStyle() && mainColor == 'NMblack',
                            'start-color-red': !isStartStyle() && mainColor != 'NMblack',
                            'h-oneself': globalVar.oneself == 1 && !isStartStyle()
                        }">
                        <div class="icon" :class="{ noDrag: !Main.dragMouse }">
                            <i class="iconfont icon-wenjian">
                                <i class="iconfont icon-gou" v-if="dynamic?.subscribed"></i>
                                <i class="iconfont icon-jiahao_o" v-else></i>
                            </i>
                        </div>
                        <div class="txt" :class="{
                            noDrag: !Main.dragMouse,
                            noClick: isStartStyle()
                        }">
                            <span v-if="dynamic?.subscribed">已</span>
                            <span>收藏({{ numberSimp(dynamic?.bookedCount) }})</span>
                        </div>
                    </div>
                    <div class="fengxiang h" :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
                        <i class="iconfont icon-fenxiang"></i>
                        <div class="txt">
                            <span>分享({{ numberSimp(dynamic?.shareCount) }})</span>
                        </div>
                    </div>
                    <div class="download h" :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }"
                        @click="dowloadAll">
                        <i class="iconfont icon-xiazai"></i>
                        <div class="txt">
                            <span>下载全部</span>
                        </div>
                    </div>
                    <div class="suo h" v-if="suoFlag"
                        :class="{ noDrag: !Main.dragMouse, 'h-oneself': globalVar.oneself == 1 }">
                        <i class="iconfont icon-suoding_o"></i>
                        <div class="txt">
                            <span>隐私</span>
                        </div>
                    </div>
                </div>
                <div class="small">
                    <div class="tags">
                        <span class="title">标签&nbsp;:&nbsp;</span>
                        <span class="add" v-if="tags.length === 0 && isMy == 'true'"
                            :class="{ noDrag: !Main.dragMouse, 'add-oneself': globalVar.oneself == 1 }">添加标签</span>
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
                    <div class="describe">
                        <span class="title">简介&nbsp;:&nbsp;</span>
                        <span class="add" v-if="!playList[index]?.description && isMy == 'true'"
                            :class="{ noDrag: !Main.dragMouse, 'add-oneself': globalVar.oneself == 1 }">添加简介</span>
                        <span class="txt" :class="{ 'txt-oneself': globalVar.oneself }" id="description"
                            v-html="playList[index]?.description">
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
                        message="歌曲列表" :ifClick="flagList[0]" :big="true" @click="goRoute('songPlaylist'); changeTag(0)">
                    </Tag>
                    <Tag class="tag-play" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }"
                        :message="`评论(${dynamic?.commentCount})`" :ifClick="flagList[1]" :big="true"
                        @click="goRoute('commentPlaylist'); changeTag(1)">
                    </Tag>
                    <Tag class="tag-play" :oneself="1" :class="{ 'tag-play-oneself': globalVar.oneself == 1 }" message="收藏者"
                        :ifClick="flagList[2]" :big="true" @click="goRoute('whoStartPlaylist'); changeTag(2)"></Tag>
                </div>
                <div class="search">
                    <input type="text" v-model="searchKey" placeholder="搜索歌单内音乐" :class="{
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
</template>

<script lang="ts" setup>
import { dayjsStamp } from '@renderer/utils/dayjs'  //时间修正
import { numberSimp } from '@renderer/utils/numberSimp' //数字修正
import {
    onActivated, onMounted, ref, shallowRef, provide, toRef, watch, Ref, nextTick,
    toRefs, reactive, getCurrentInstance, ComponentInternalInstance, inject, ShallowRef
} from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useMain, useBasicApi, useMainMenu, useGlobalVar } from '@renderer/store';
import PromiseQueue, { QueueAddOptions } from 'p-queue'
import { Queue, RunFunction } from 'p-queue/dist/queue';
const BasicApi = useBasicApi();
const Main = useMain()
const route = useRoute();
const router = useRouter();
const MainMenu = useMainMenu();
const globalVar = useGlobalVar();
const $el = getCurrentInstance() as ComponentInternalInstance;

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
    if (route.name == 'songPlaylist') {
        changeTag(0)
    } else if (route.name == 'commentPlaylist') {
        changeTag(1)
    } else if (route.name == 'whoStartPlaylist') {
        changeTag(2)
    }
}, { immediate: true })



const goRoute = (name: string) => {
    console.log(route.query);

    router.replace({
        name, query: route.query
    })
}


//播放全部按钮
const playAll = async () => {
    let result = (await Main.reqPlaylistTrackAll(id.value)).data;
    Main.playingList = result.songs
    Main.playingPrivileges = result.privileges
    Main.playingindex = 1
    Main.playing = result.songs[0].id as number
    Main.beforePlayListId = id.value
    Main.playStatus = 'play'
    let str = result.songs[0].name + ' - ';
    let singerArr = result.songs[0].ar as unknown as Array<any>
    singerArr.forEach((element, index) => {
        str += element.name
        if (index != singerArr.length - 1) str += ' / '
    })
    window.electron.ipcRenderer.send('change-play-thum', str)
    window.electron.ipcRenderer.send('render-play')
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}

//添加所有的音乐
const addAll = async () => {
    if (Main.playingList.length == 0) {
        playAll()
    } else {
        let result = (await Main.reqPlaylistTrackAll(id.value)).data;
        result.songs.forEach((element: any, index: number) => {
            if (Main.playingList.every((base) => base.id != element.id)) {
                Main.playingList.push(element)
                Main.playingPrivileges.push(result.privileges[index])
            }
        });
    }
    globalVar.closePointOutMessage = '已添加到播放列表'
    globalVar.closePointOut = true

}


let openDescribeFlag = ref(true);
let openJiantou = ref(true);
let searchKey = ref('')
let playList = ref()
let isMy = toRef(Main, 'isMy')
//是搜索还是我的(搜索就是不是我的)
watch(isMy, () => {
    if (isMy.value == 'true') {
        playList.value = Main.playList
    } else {
        playList.value = Main.searchList
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
    followed: 0,
    gradeStatus: 0,
    remixVideo: null,
    code: 0
})

const isStartStyle = () => {
    return playList.value[index.value]?.creator.userId == BasicApi.account?.id
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

watch(routeQuery, async () => {
    let Rn = route.name as string
    isMy.value = route.query.my as string || 'true'
    if (Rn.endsWith('Playlist') && isMy.value as string == 'true') {
        nextTick(() => {
            //样式修改
            let description = document.querySelector('#description') as HTMLElement
            description.style.whiteSpace = 'nowrap'
            openDescribeFlag.value = true
            openJiantou.value = false
            let widthBox = description?.offsetWidth
            let widthscrool = description?.scrollWidth
            if (widthscrool > widthBox) {
                openJiantou.value = true
            } else {
                openJiantou.value = false
            }
        })

        index.value = route.query.index
        id.value = route.query.id
        //注入
        songNumber.value = playList.value[index.value].trackCount
        tags.value = playList.value[index.value].tags
        dynamic.value = await Main.reqPlaylistDetailDynamic(id.value) as any;
        // console.log(dynamic);
        // console.log(await Main.reqPlaylistTrackAll(id.value));
        // startStyle();
        //隐私判断
        if (playList.value[index.value].privacy == 10) {
            suoFlag.value = true
        } else {
            suoFlag.value = false
        }
        // let arr: Array<HTMLElement> = document.querySelectorAll('.tag-play') as any;
        // for (let i = 0; i < arr.length; i++) {
        //     let child = arr[i].firstChild as HTMLElement
        //     let line = arr[i].lastChild as HTMLElement
        //     if (i == 0) {
        //         child.style.fontSize = '20px'
        //         child.style.fontWeight = 'bolder'
        //         line.style.backgroundColor = 'var(--primaryColor)'
        //     } else {
        //         child.style.fontSize = '14px'
        //         child.style.fontWeight = 'normal'
        //         line.style.backgroundColor = 'rgba(0,0,0,0)'
        //     }
        // }

    } else if (route.name == 'songPlaylist' && route.query.my as string != 'true') {
        dynamic.value = await Main.reqPlaylistDetailDynamic(route.query.id as unknown as number) as any;
        Main.searchList = [(await Main.reqPlaylistDetail(route.query.id as unknown as number)).data?.playlist]
        index.value = 0
        playList.value = Main.searchList
        songNumber.value = playList.value[index.value].trackCount
        tags.value = playList.value[index.value].tags
        id.value = route.query.id
    }

}, { immediate: true })

// watch(mainColor, () => {
//     startStyle();
// })


//展开描述
const openDescribe = () => {
    let description = document.querySelector('#description') as HTMLElement
    if (openDescribeFlag.value) {
        description.style.whiteSpace = 'pre-line'
        description.style.display = 'inline'
    } else {
        description.style.whiteSpace = 'nowrap'
        description.style.display = 'inline'
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
    if (to.query.my == 'true') {
        isMy.value = 'true'
        playList.value = Main.playList
    } else {
        isMy.value = 'false'
        playList.value = Main.searchList
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
        result = await Main.reqSongDlUrl(id, 999000)
        //@ts-ignore
        url = result.data.data.url
        if (url == null) {
            result = await Main.reqSongUrl(id, 'standard')
            //@ts-ignore
            url = result.data.data[0].url
            //@ts-ignore
            downloadObj.level = 'standard'
        } else {
            //@ts-ignore
            downloadObj.br = 999000
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
            // @ts-ignore
            const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                mergedChunks.set(chunk, offset);
                offset += chunk.byteLength;
            }
            const arrayBuffer = mergedChunks.buffer;
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: name })
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
                margin-bottom: 15px;
                font-weight: 500;

                :deep(.el-image) {
                    border-radius: 50%;
                    margin-right: 10px;
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
                }

                .start-color-black {
                    background-color: rgb(43, 43, 43);
                    color: @font-color !important;
                }

                .start-color-black-stop {
                    background-color: @none-button !important;
                    color: @none-font !important;
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
                    min-width: 100px;
                    width: auto;
                    height: 32px;
                    border-radius: 2em;
                    border: @split-line-color 1px solid;
                    display: flex;
                    align-items: center;
                    flex-wrap: nowrap;

                    i {
                        color: #666666;
                        padding-left: 10px;
                        padding-right: 5px;
                    }

                    .txt {
                        font-size: 14px;

                        >span {
                            display: block;
                            width: 75px;
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
</style>