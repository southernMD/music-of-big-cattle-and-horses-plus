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
            <el-collapse v-model="activeNames">
                <el-collapse-item :title="folder_val.folderName" :name="folder_val.id"
                    v-for="folder_val, folder_index in videoList">
                    <div class="folder-video-item" v-for="video_val, video_index in folder_val.list">
                        <div class="view" @click="goVideo(video_val, folder_val.folderName,folder_index, video_index)"
                            :style="{ 'background-image': `url(${video_val.coverPath})` }">
                            <canvas :ref="el => getCanvaasRef(el, folder_index, video_index)" width="0" height="0"></canvas>
                        </div>
                        <div class="msg">
                            <div class="txt" @click="goVideo(video_val, folder_val.folderName,folder_index, video_index)">{{ video_val.title }}
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
        </div>
    </div>
    <AddVideoForm key="AddVideoForm" v-model:addVideoFlag="addVideoFlag" v-model:options="options"
        @updateFolder="updateFolder" @addVideo="addVideo"></AddVideoForm>
    <EddVideoForm ref="EddVideoFormRef" key="EddVideoForm" v-model:editVideoFlag="editVideoFlag" v-model:options="options"
        @updateFolder="updateFolder" @editVideo="editVideo" :id="globalVar.editVideo.videoId" ></EddVideoForm>
</template>

<script setup lang="ts">
import { useGlobalVar } from '@renderer/store';
import { onMounted, Ref, ref, toRaw, watch } from 'vue'
import type { videoFolderList, VideoInfo, AddVideoInfo, videoFolder, EditVideoInfo } from './indexType.d.ts';
import { useRouter } from 'vue-router';
import MyInput from '@renderer/components/myVC/MyInput.vue';
// import MyInputSelect from '@renderer/components/myVC/MyInputSelect.vue';
import AddVideoForm from '@renderer/components/video/AddVideoForm.vue'
import { db } from '@renderer/indexDB/db'
// import saveVideoWorker from '@renderer/workers/saveVideoWorker?worker'
import { bufferToBase64 } from '@renderer/utils/arrayBufferToBase64';
import { videos_folders_table, videos_table } from '@renderer/indexDB/dbType';

const getCanvaasList = ref<HTMLCanvasElement[][]>([]);
const getCanvaasRef = (el, folder_index, video_index) => {
    if (el) {
        if (!getCanvaasList.value[folder_index]) {
            getCanvaasList.value[folder_index] = [];
        }
        getCanvaasList.value[folder_index][video_index] = el;
    }
};
console.log(getCanvaasList.value);

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

const searchInputFn = () => {
    console.log(searchInput.value);
}
const goVideo = (videMsg: VideoInfo, folderName: string,folder_index:number, video_index:number) => {
    console.log(getCanvaasList.value[folder_index][video_index].width);
    if(getCanvaasList.value[folder_index][video_index].width !== 0){
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
            window.electron.ipcRenderer.once('save-video-error',async(error)=>{
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
const editVideo = ({ id, form, nowTime, reloadFlag,base_video }: { id: number, form: EditVideoInfo, nowTime: string, reloadFlag: boolean,base_video:videos_table }) => {
    const index = videoList.value?.findIndex(item => item.id === form.folderId)!;
    videoList.value![index].updateTime = nowTime
    videoList.value?.sort((a, b) => {
        return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
    })
    videoList.value?.[0].list.unshift(videoList.value?.[0].list.find(item => item.id === id)!)
    videoList.value?.[0].list.splice(videoList.value?.[0].list.findLastIndex(item => item.id === id)!, 1)
    videoList.value![0].list[0].coverPath = form.coverPath;
    videoList.value![0].list[0].title = form.title;
    videoList.value![0].list[0].description = form.description;
    videoList.value![0].list[0].updateTime = nowTime;
    videoList.value![0].list[0].folderId = form.folderId
    videoList.value![0].list[0].otherName = form.otherName.join(" ");
    videoList.value![0].list[0].type = form.type
    videoList.value![0].list[0].videoPath = form.videoPath;
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
                    videoList.value![0].list[0].coverPath = `${imageBase64}`
                }
                EddVideoFormRef.value.updateBaseVideo(id)
            })
            window.electron.ipcRenderer.once('save-video-error',(_,{error})=>{
                //@ts-ignore id only undefined in table create
                videoList.value![0].list[0] = base_video
                db.videos.update(id, base_video)
                EddVideoFormRef.value.rollBackForm()
                alert("\n视频缓存修改失败，已自动回滚")
            })
        }
    } else if (!form.save) {
        db.videos_data.delete(id)
        EddVideoFormRef.value.updateBaseVideo(id)
    }else{
        EddVideoFormRef.value.updateBaseVideo(id)
    }
}


window.electron.ipcRenderer.on('save-video-progress', (_, { progress}) => {
    const canvas:HTMLCanvasElement =  getCanvaasList.value[0][0] as HTMLCanvasElement
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
    if(progress == 100){
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
                        canvas{
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

    }

}
</style>