<template>
    <div class="video">
        <div class="search-group">
            <MyInput v-model="searchInput" @search="searchInputFn" :placeholder="searchType"></MyInput>
            <div class="options">
                <el-radio-group v-model="searchTypeid" class="ml-4">
                    <el-radio label="folder" size="large">文件夹</el-radio>
                    <el-radio label="title" size="large">标题</el-radio>
                    <el-radio label="otherName" size="large">别名</el-radio>
                </el-radio-group>
                <div class="btns">
                    <div class="btn btn1" :class="{ 'btn-oneself': globalVar.oneself == 1 }"
                        @click="addVideoFlag = true">
                        <i class="iconfont icon-xiazai1"></i>
                        <div class="txt">
                            <span>上传</span>
                        </div>
                    </div>
                    <div class="btn" :class="{ 'btn-oneself': globalVar.oneself == 1 }">
                        <i class="iconfont icon-xiazai1"></i>
                        <div class="txt">
                            <span>导入bilibili收藏夹</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="title">
            <div class="title-txt">视频列表</div>
        </div>
        <div class="video-group">
            <el-collapse v-model="activeNames" v-if="!ifSearch || searchTypeid === 'folder'">
                <el-collapse-item :title="folder_val.folderName" :name="folder_val.id"
                    v-for="folder_val, folder_index in viewVidoListWithPinyin">
                    <div class="folder-video-item" v-for="video_val, video_index in folder_val.list">
                        <div class="view" @click="goVideo(video_val, folder_val.folderName, folder_index, video_index)"
                            :style="{ 'background-image': `url(${video_val.coverPath})` }">
                            <canvas :ref="el => getCanvaasRef(el as HTMLCanvasElement, folder_index, video_index)"
                                width="0" height="0"></canvas>
                        </div>
                        <div class="msg">
                            <div class="txt"
                                @click="goVideo(video_val, folder_val.folderName, folder_index, video_index)">{{
                                    video_val.title }}
                            </div>
                            <div class="othername-and-time">
                                <span class="oN">{{ video_val.otherName }}</span>
                                <span class="t">{{ video_val.time }}</span>
                            </div>
                        </div>
                        <div class="op" data-right="true" data-type="video" :data-id="video_val.id"
                            :data-video-folderId="folder_val.id" :data-video-folder="folder_val.folderName"
                            @mousedown.stop="onMouseDown($event)" @mouseup.stop="onMouseUp($event)" @click="rightClick">
                            <i class="iconfont icon-gengduo"></i>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
            <div class="other-folder" v-else>
                <div class="folder-video-item" v-for="video_val, video_index in viewVidoListWithPinyinOther">
                    <div class="view" @click="goVideo(video_val, video_val.folderName, 0, video_index)"
                        :style="{ 'background-image': `url(${video_val.coverPath})` }">
                        <canvas :ref="el => getCanvaasRef(el as HTMLCanvasElement, 0, video_index)" width="0"
                            height="0"></canvas>
                    </div>
                    <div class="msg">
                        <div class="txt" @click="goVideo(video_val, video_val.folderName, 0, video_index)">{{
                            video_val.title }}
                        </div>
                        <div class="othername-and-time">
                            <span class="oN">{{ video_val.otherName }}</span>
                            <span class="t">{{ video_val.time }}</span>
                        </div>
                    </div>
                    <div class="op" data-right="true" data-type="video" :data-id="video_val.id"
                        :data-video-folderId="video_val.id" :data-video-folder="video_val.folderName"
                        @mousedown.stop="onMouseDown($event)" @mouseup.stop="onMouseUp($event)" @click="rightClick">
                        <i class="iconfont icon-gengduo"></i>
                    </div>
                </div>
            </div>

        </div>
    </div>
    <AddVideoForm key="AddVideoForm" v-model:addVideoFlag="addVideoFlag" v-model:options="options"
        @updateFolder="updateFolder" @addVideo="addVideo"></AddVideoForm>
    <EddVideoForm ref="EddVideoFormRef" key="EddVideoForm" v-model:editVideoFlag="editVideoFlag"
        v-model:options="options" @updateFolder="updateFolder" @editVideo="editVideo" :id="globalVar.editVideo.videoId">
    </EddVideoForm>
</template>

<script setup lang="ts">
import { useGlobalVar } from '@renderer/store';
import { onMounted, Ref, ref, toRaw, watch } from 'vue'
import type { videoFolderList, VideoInfo, AddVideoInfo, videoFolder, EditVideoInfo, videoSearchInfo } from './indexType.d.ts';

import pinyin from "pinyin";
import * as wanakana from 'wanakana';
import Fuse from 'fuse.js';

import { useRouter } from 'vue-router';
import MyInput from '@renderer/components/myVC/MyInput.vue';
// import MyInputSelect from '@renderer/components/myVC/MyInputSelect.vue';
import AddVideoForm from '@renderer/components/video/AddVideoForm.vue'
import { db } from '@renderer/indexDB/db'
// import saveVideoWorker from '@renderer/workers/saveVideoWorker?worker'
import { bufferToBase64 } from '@renderer/utils/arrayBufferToBase64';
import { videos_folders_table, videos_table } from '@renderer/indexDB/dbType';

const getCanvaasList = ref<HTMLCanvasElement[][]>([]);
const getCanvaasRef = (el: HTMLCanvasElement, folder_index: string | number, video_index: string | number) => {
    if (el) {
        if (!getCanvaasList.value[folder_index]) {
            getCanvaasList.value[folder_index] = [];
        }
        getCanvaasList.value[folder_index][video_index] = el;
    }
};
watch(() => getCanvaasList.value, (newVal) => {
    console.log(newVal, "(*&^%$^#%$^&*()(*&^%$%^&*()())))))))))))))))))))))))))))))))");
}, { deep: true })

const $router = useRouter()
const searchInput = ref('')
const searchType = ref("查询视频标题")
const searchTypeid = ref("folder")
watch(() => searchTypeid.value, (newVal) => {
    switch (newVal) {
        case "folder":
            searchType.value = "查询文件夹"
            break;
        case "title":
            searchType.value = "查询视频地址"
            break;
        case "otherName":
            searchType.value = "查询别名"
            break;
    }
        searchInputFn()
})

const videoList: Ref<videoFolderList[] | undefined> = ref()
const options: Ref<videoFolder[] | undefined> = ref()
const activeNames = ref()

const initFolder = async () => {
    const video_folders = (await db.videos_folders.toArray())
    options.value = video_folders.map(item => {
        return {
            label: item.folderName,
            value: item.id!
        }
    })
    const videoTableList = (await db.videos.toArray()).sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
    console.log(videoTableList);

    const arr: videos_folders_table[] = video_folders.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
    const newArr = arr.map(videos_folder => {
        return { ...videos_folder, list: videoTableList.filter(video => video.folderId === videos_folder.id) };
    });
    console.log(newArr);
    //@ts-ignore
    videoList.value = newArr
    activeNames.value = toRaw(videoList.value?.map(item => item.id) ?? [])
};
try {
    initFolder()
} catch (error) {
    options.value = []
    videoList.value = []
}

const globalVar = useGlobalVar();

console.log(videoList.value);

let videoListWithPinyin: videoSearchInfo[]
let viewVidoListWithPinyin: Ref<videoSearchInfo[]> = ref([])
let viewVidoListWithPinyinOther: Ref<(videoSearchInfo["list"])> = ref([])

watch(() => videoList.value, (newVal) => {
    videoListWithPinyin = videoList.value!.map(folder => ({
        ...folder,
        folderSearchName: pinyin(folder.folderName, { style: 0 }).flat().join(''),
        folderSearchNameFl: pinyin(folder.folderName, { style: 4 }).flat().join(''),
        romoji: wanakana.isJapanese(folder.folderName) ? wanakana.toRomaji(folder.folderName) : '',
        list: folder.list.map(video => ({
            ...video,
            titleSearchName: pinyin(video.title, { style: 0 }).flat().join(''),
            titleSearchNameFl: pinyin(video.title, { style: 4 }).flat().join(''),
            otherNameSearchName: video.otherName.split(" ").map(item => pinyin(item, { style: 0 }).flat().join('')),
            otherNameSearchNameFl: video.otherName.split(" ").map(item => pinyin(item, { style: 4 }).flat().join('')),
            romojiTitle: wanakana.isJapanese(video.title) ? wanakana.toRomaji(video.title) : '',
            romojiOtherName: video.otherName.split(" ").map(item => wanakana.isJapanese(item) ? wanakana.toRomaji(item) : ''),
        }))
    }));
    if (viewVidoListWithPinyin.value.length === 0) {
        viewVidoListWithPinyin.value = videoListWithPinyin
    }
    console.log(videoListWithPinyin, "查询列表");
}, { deep: true })
const ifSearch = ref(false)
const searchInputFn = async () => {
    // first_letter
    console.log(searchInput.value);
    if (searchInput.value.trim() === "") {
        viewVidoListWithPinyin.value = videoListWithPinyin
        ifSearch.value = false
        return
    } else {
        ifSearch.value = true
    }
    const searchKey = pinyin(searchInput.value, { style: 0 }).flat().join('')
    const allVideo = videoListWithPinyin.flatMap(folder =>
        folder.list.map(video => ({
            ...video,
            folderName: folder.folderName
        }))
    );
    switch (searchTypeid.value) {
        case "folder":
            const fuse = new Fuse(videoListWithPinyin, {
                threshold: 0.1,
                keys: [
                    'folderSearchName', 'folderSearchNameFl', 'romoji'
                ]
            })
            viewVidoListWithPinyin.value = fuse.search(searchKey).map(i => i.item)
            console.log(viewVidoListWithPinyin.value, searchKey);
            break;
        case "title":
            const fuse2 = new Fuse(allVideo, {
                threshold: 0.1,
                keys: [
                    "titleSearchName", "titleSearchNameFl", "romojiTitle"
                ]
            })
            viewVidoListWithPinyinOther.value = fuse2.search(searchKey).map(i => i.item)
            break;
        case "otherName":
            const fuse3 = new Fuse(allVideo, {
                threshold: 0.1,
                keys: [
                    "otherNameSearchName", "otherNameSearchNameFl", "romojiOtherName"
                ]
            })
            viewVidoListWithPinyinOther.value = fuse3.search(searchKey).map(i => i.item)
            break;
    }
}

const goVideo = (videMsg: VideoInfo, folderName: string, folder_index: number, video_index: number) => {
    console.log(getCanvaasList.value[folder_index][video_index].width);
    if (getCanvaasList.value[folder_index][video_index].width !== 0) {
        return
    }
    $router.push({
        name: 'video_detail',
        query: {
            id: videMsg.id,
            floderId: videMsg.folderId,
            floderName: folderName
        }
    })
}

const onMouseDown = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    target.classList.add('pressed')
}

const onMouseUp = (event: MouseEvent) => {
    const target = event.currentTarget as HTMLElement
    target.classList.remove('pressed')
}

const rightClick = (event: MouseEvent) => {
    globalVar.rightClick = true
    event.preventDefault()
    event.target?.dispatchEvent(new MouseEvent('contextmenu', {
        bubbles: true,
        cancelable: true,
        view: window,
        clientX: event.clientX,
        clientY: event.clientY,
    }))
}

const addVideoFlag = ref(false)

const updateAideoListAfterDelete = () => {
    for (let i = 0; i < videoList.value!.length; i++) {
        for (let j = 0; j < videoList.value![i].list.length; j++) {
            if (videoList.value![i].list[j].id == globalVar.delVideo.videoId) {
                videoList.value![i].list.splice(j, 1)
                return
            }
        }
    }
}

watch(() => globalVar.delVideo, async () => {
    console.log(globalVar.delVideo);
    if (globalVar.delVideo.flag) {
        await db.videos.delete(globalVar.delVideo.videoId)
        await db.videos_data.delete(globalVar.delVideo.videoId)
        updateAideoListAfterDelete()
        globalVar.delVideo.flag = false
    }
}, { deep: true })

//editForm
const editVideoFlag = ref(false)
watch(() => globalVar.editVideo.flag, () => {
    editVideoFlag.value = globalVar.editVideo.flag
}, { deep: true })
const updateFolder = ({ id, folderName }) => {
    videoList.value?.unshift({
        id: id,
        folderName: folderName,
        list: [],
        updateTime: new Date().toLocaleString()
    })
    activeNames.value.unshift(id)
}

const addVideo = ({ id, form, nowTime }: { id: number, form: AddVideoInfo, nowTime: string }) => {
    // 查找id与form.value.folderId相同的项
    const index = videoList.value?.findIndex(item => item.id === form.folderId)!;
    videoList.value![index].updateTime = nowTime
    videoList.value?.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
    //把form.value.folderId对应的放到videoList.value 的第一个
    videoList.value?.unshift(videoList.value?.find(item => item.id === form.folderId)!)
    videoList.value?.splice(videoList.value?.findIndex(item => item.id === form.folderId)!, 1)
    videoList.value?.[0].list.unshift({
        id,
        title: form.title,
        type: form.type,
        videoPath: form.videoPath,
        coverPath: form.coverPath,
        otherName: form.otherName.join(" "),
        description: form.description,
        time: nowTime,
        updateTime: nowTime,
        folderId: videoList.value?.[0].id
    })
    searchInput.value = ""
    if(searchTypeid.value === "folder"){
        searchInputFn()
    }else{
        searchTypeid.value = "folder"
    }
    if (form.save) {
        if (form.type === 1 || form.type === 2) {
            window.electron.ipcRenderer.send('saveVideo', { videoPath: form.videoPath, coverPath: form.coverPath })
            window.electron.ipcRenderer.once('save-video-finish', async (_, { arrayBuffer, coverArrayBuffer }) => {
                console.log("save-video-finish");
                //创建链接
                //arrayBuffer转blob
                const arrayBufferBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
                db.videos_data.add({
                    id,
                    data: arrayBufferBlob
                })
                if (form.coverPath.length == 0) {
                    //coverArrayBuffer转base64
                    const imageBase64 = await bufferToBase64(coverArrayBuffer)
                    db.videos.update(id, {
                        coverPath: `${imageBase64}`
                    })
                    videoList.value![0].list[0].coverPath = `${imageBase64}`
                }
            })
            window.electron.ipcRenderer.once('save-video-error', async (error) => {
                videoList.value?.[0].list.shift()
                await db.videos.delete(id)
                alert(error)
            })
        }
    }
}

const EddVideoFormRef = ref()
onMounted(() => {
    console.log(EddVideoFormRef.value);
})
const editVideo = ({ id, form, nowTime, reloadFlag, base_video, originalFolderId }: { id: number, form: EditVideoInfo, nowTime: string, reloadFlag: boolean, base_video: videos_table, originalFolderId: number }) => {
    if (!ifSearch || searchTypeid.value === 'folder') {
        const index = viewVidoListWithPinyin.value?.findIndex(item => item.id === form.folderId)!;
        viewVidoListWithPinyin.value![index].updateTime = nowTime
        viewVidoListWithPinyin.value?.sort((a, b) => {
            return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
        })
        console.log(viewVidoListWithPinyin.value?.[0].list, id);
        //如果selfId的值为undefined，说明是跨文件夹变动，否则为自变动
        const selfId = viewVidoListWithPinyin.value?.[0].list.find(item => item.id == id)
        if (selfId) {
            viewVidoListWithPinyin.value?.[0].list.unshift(viewVidoListWithPinyin.value?.[0].list.find(item => item.id == id)!)
            viewVidoListWithPinyin.value?.[0].list.splice(viewVidoListWithPinyin.value?.[0].list.findLastIndex(item => item.id === id)!, 1)
        } else {
            const updateFolderListObj = viewVidoListWithPinyin.value?.find(item => item.id === originalFolderId)!.list
            viewVidoListWithPinyin.value?.[0].list.unshift(updateFolderListObj.find(item => item.id === id)!)
            updateFolderListObj.splice(updateFolderListObj.findLastIndex(item => item.id === id)!, 1)
        }
        viewVidoListWithPinyin.value![0].list[0].coverPath = form.coverPath;
        viewVidoListWithPinyin.value![0].list[0].title = form.title;
        viewVidoListWithPinyin.value![0].list[0].description = form.description;
        viewVidoListWithPinyin.value![0].list[0].updateTime = nowTime;
        viewVidoListWithPinyin.value![0].list[0].folderId = form.folderId
        viewVidoListWithPinyin.value![0].list[0].otherName = form.otherName.join(" ");
        viewVidoListWithPinyin.value![0].list[0].type = form.type
        viewVidoListWithPinyin.value![0].list[0].videoPath = form.videoPath;
    } else {
        const index = viewVidoListWithPinyinOther.value.findIndex(item => item.id === id)
        viewVidoListWithPinyinOther.value.unshift(viewVidoListWithPinyinOther.value[index])
        viewVidoListWithPinyinOther.value.splice(index + 1, 1)

        viewVidoListWithPinyinOther.value![0].coverPath = form.coverPath;
        viewVidoListWithPinyinOther.value![0].title = form.title;
        viewVidoListWithPinyinOther.value![0].description = form.description;
        viewVidoListWithPinyinOther.value![0].updateTime = nowTime;
        viewVidoListWithPinyinOther.value![0].folderId = form.folderId
        viewVidoListWithPinyinOther.value![0].otherName = form.otherName.join(" ");
        viewVidoListWithPinyinOther.value![0].type = form.type
        viewVidoListWithPinyinOther.value![0].videoPath = form.videoPath;
    }
    //查询原数据更新
    const origin = videoListWithPinyin.find(item => item.id === originalFolderId)!
    origin.updateTime = nowTime;
    const updateOriginObj = origin.list.find(item => item.id === id)!
    const originIndex = origin.list.findIndex(item => item.id === id)!
    updateOriginObj.coverPath = form.coverPath;
    updateOriginObj.title = form.title;
    updateOriginObj.description = form.description;
    updateOriginObj.updateTime = nowTime;
    updateOriginObj.folderId = form.folderId
    updateOriginObj.otherName = form.otherName.join(" ");
    updateOriginObj.type = form.type
    updateOriginObj.videoPath = form.videoPath;
    origin.list.unshift(updateOriginObj)
    origin.list.splice(originIndex + 1,1)
    if (form.save && reloadFlag && form.videoPath != base_video.videoPath) {
        if (form.type === 1 || form.type === 2) {
            window.electron.ipcRenderer.send('saveVideo', { videoPath: form.videoPath, coverPath: form.coverPath })
            window.electron.ipcRenderer.once('save-video-finish', async (_, { arrayBuffer, coverArrayBuffer }) => {
                console.log("save-video-finish");
                //创建链接
                //arrayBuffer转blob
                const arrayBufferBlob = new Blob([arrayBuffer], { type: 'video/mp4' });
                let t = await db.videos_data.get(id)
                if (t) {
                    db.videos_data.update(id, {
                        data: arrayBufferBlob
                    })
                } else {
                    db.videos_data.add({
                        id,
                        data: arrayBufferBlob
                    })
                }
                if (form.updatePic) {
                    //coverArrayBuffer转base64
                    const imageBase64 = await bufferToBase64(coverArrayBuffer)
                    db.videos.update(id, {
                        coverPath: `${imageBase64}`
                    })
                    updateOriginObj.coverPath =  `${imageBase64}`
                    if(!ifSearch || searchTypeid.value === 'folder')viewVidoListWithPinyin.value![0].list[0].coverPath = `${imageBase64}`
                    else viewVidoListWithPinyinOther.value![0].coverPath = `${imageBase64}`
                }
                EddVideoFormRef.value.updateBaseVideo(id)
            })
            window.electron.ipcRenderer.once('save-video-error', (_, { error }) => {
                //@ts-ignore id only undefined in table create
                viewVidoListWithPinyin.value![0].list[0] = base_video
                db.videos.update(id, base_video)
                EddVideoFormRef.value.rollBackForm()
                alert("\n视频缓存修改失败，已自动回滚")
            })
        }
    } else if (!form.save) {
        db.videos_data.delete(id)
        EddVideoFormRef.value.updateBaseVideo(id)
    } else {
        EddVideoFormRef.value.updateBaseVideo(id)
    }

}


window.electron.ipcRenderer.on('save-video-progress', (_, { progress }) => {
    const canvas: HTMLCanvasElement = getCanvaasList.value[0][0] as HTMLCanvasElement
    //画进度条具体实现,线形的
    canvas.width = canvas.clientWidth
    canvas.height = canvas.clientHeight
    const ctx = canvas.getContext('2d')!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    // 设置背景条样式
    ctx.fillStyle = '#e0e0e0'; // 背景条颜色
    ctx.fillRect(0, 0, canvas.width, canvas.height); // 绘制背景条

    // 计算进度条宽度
    const progressWidth = (progress / 100) * canvas.width;

    // 设置进度条样式
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor'); // 进度条颜色
    ctx.fillRect(0, 0, progressWidth, canvas.height);
    if (progress == 100) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        canvas.width = 0
        canvas.height = 0
    }
})
</script>

<style scoped lang="less">
.video {
    margin: 1em;

    .search-group {

        .options {
            margin-top: .5rem;
            display: flex;
            justify-content: space-between;

            .btns {
                display: flex;

                .btn {
                    justify-content: center;
                    cursor: pointer;
                    user-select: none;
                    width: 150px;
                    height: 32px;
                    font-size: 14px;
                    border-radius: 2em;
                    border: var(--splitLineColor, #e0e0e0) 1px solid;
                    display: flex;
                    align-items: center;
                    flex-wrap: nowrap;
                    background-color: var(--stopBtnBk, #f5f5f5);
                    margin-left: 1rem;

                    span {
                        color: @font-color;
                    }

                    &:hover {
                        background-color: @span-color-hover !important;
                    }
                }

                .btn1 {
                    width: auto;
                    padding: 0 2em;
                }
            }

            .btn-oneself:hover {
                background-color: rgb(66, 66, 66) !important;
            }

            :deep(.el-radio-group) {
                label {
                    --el-radio-input-border: var(--smallFontColor) 1px solid;
                    --el-radio-input-bg-color: none;
                    --el-radio-input-border-color-hover: @font-color-hover;
                    height: 25px;

                    .el-radio__label {
                        font-size: 13px;
                        color: @font-color-oneself;
                    }

                }

                .is-checked {
                    .el-radio__inner {
                        border-color: @primary-color;
                        background-color: @primary-color;
                    }

                    .el-radio__label {
                        color: @primary-color;
                    }
                }
            }
        }
    }

    >.title {
        font-size: 1.2rem;
        margin: .5rem 0;
        font-weight: bold;
    }

    .video-group {
        margin-top: 1rem;

        .el-collapse {
            --el-collapse-header-bg-color: none;
            --el-collapse-header-text-color: @font-color;
            --el-collapse-content-bg-color: none;
            --el-collapse-border-color: @split-line-color;
            --el-collapse-content-text-color: @font-color;

            :deep(.el-collapse-item__content) {
                // display: flex;
                // flex-wrap: wrap;
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
                gap: 30px;
            }

            .el-collapse-item {
                display: flex;
                flex-direction: column;

                .folder-video-item {
                    aspect-ratio: 3 / 2;
                    position: relative;

                    .view {
                        margin: 2% 0;
                        width: 100%;
                        padding-top: 70%;
                        background-size: cover;
                        background-repeat: no-repeat;
                        border-radius: .5em;
                        cursor: pointer;
                        transition: transform .2s ease;

                        &:hover {
                            transform: scale(1.03);
                        }

                        position: relative;

                        canvas {
                            position: absolute;
                            bottom: 0;
                            left: 0;
                            right: 0;
                            height: 5px;
                            width: calc(100% - .2em);
                            margin: 0 auto;
                            border-radius: 2em;
                        }
                    }

                    .msg {
                        .txt {
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            -webkit-line-clamp: 2;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 100%;
                            color: @font-color;
                            font-size: 16px;
                            cursor: pointer;

                            &:hover {
                                color: @primary-color;
                            }
                        }

                        .othername-and-time {
                            display: flex;
                            justify-content: space-between;
                            font-size: 12px;

                            .oN,
                            .t {
                                //限制1行
                                display: -webkit-box;
                                -webkit-box-orient: vertical;
                                -webkit-line-clamp: 1;
                                overflow: hidden;
                                text-overflow: ellipsis;
                                width: 50%;
                            }
                        }
                    }

                    .op {
                        position: absolute;
                        bottom: 0;
                        right: 0;
                        cursor: pointer;
                        border-radius: 2em;
                        padding: .5em;
                        box-sizing: border-box;
                    }

                    .pressed {
                        background-color: @span-color-hover;
                        animation: pressAnimation 0.3s forwards;
                    }

                    @keyframes pressAnimation {
                        0% {
                            background-color: transparent;
                        }

                        100% {
                            background-color: @span-color-hover;
                        }
                    }
                }


            }

            :deep(.el-collapse-item__header) {
                width: 100%;
            }
        }

        .other-folder {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(100px, 200px));
            gap: 30px;

            >.folder-video-item {
                aspect-ratio: 3 / 2;
                position: relative;

                .view {
                    margin: 2% 0;
                    width: 100%;
                    padding-top: 70%;
                    background-size: cover;
                    background-repeat: no-repeat;
                    border-radius: .5em;
                    cursor: pointer;
                    transition: transform .2s ease;

                    &:hover {
                        transform: scale(1.03);
                    }

                    position: relative;

                    canvas {
                        position: absolute;
                        bottom: 0;
                        left: 0;
                        right: 0;
                        height: 5px;
                        width: calc(100% - .2em);
                        margin: 0 auto;
                        border-radius: 2em;
                    }
                }

                .msg {
                    .txt {
                        display: -webkit-box;
                        -webkit-box-orient: vertical;
                        -webkit-line-clamp: 2;
                        overflow: hidden;
                        text-overflow: ellipsis;
                        width: 100%;
                        color: @font-color;
                        font-size: 16px;
                        cursor: pointer;
                        height: 28px;
                        line-height: 28px;

                        &:hover {
                            color: @primary-color;
                        }
                    }

                    .othername-and-time {
                        display: flex;
                        justify-content: space-between;

                        .oN,
                        .t {
                            //限制1行
                            display: -webkit-box;
                            -webkit-box-orient: vertical;
                            -webkit-line-clamp: 1;
                            overflow: hidden;
                            text-overflow: ellipsis;
                            width: 50%;
                            font-size: 12px;
                            height: 21px;
                            line-height: 21px;
                        }
                    }
                }

                .op {
                    position: absolute;
                    bottom: 0;
                    right: 0;
                    cursor: pointer;
                    border-radius: 2em;
                    padding: .5em;
                    box-sizing: border-box;
                }

                .pressed {
                    background-color: @span-color-hover;
                    animation: pressAnimation 0.3s forwards;
                }

                @keyframes pressAnimation {
                    0% {
                        background-color: transparent;
                    }

                    100% {
                        background-color: @span-color-hover;
                    }
                }
            }
        }
    }

}
</style>