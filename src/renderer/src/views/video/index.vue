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
                    v-for="folder_val, index in videoList">
                    <div class="folder-video-item" v-for="video_val, index in folder_val.list">
                        <div class="view" @click="goVideo(video_val)"
                            :style="{ 'background-image': `url(${video_val.coverPath})` }"></div>
                        <div class="msg">
                            <div class="txt" @click="goVideo(video_val)">{{ video_val.title }}</div>
                            <div class="othername-and-time">
                                <span class="oN">{{ video_val.otherName }}</span>
                                <span class="t">{{ video_val.time }}</span>
                            </div>
                        </div>
                        <div class="op" @mousedown.stop="onMouseDown($event)" @mouseup.stop="onMouseUp($event)">
                            <i class="iconfont icon-gengduo"></i>
                        </div>
                    </div>
                </el-collapse-item>
            </el-collapse>
        </div>
    </div>
    <MyDialog @confirm="confirmDialog" @cancel="cancelDialog" :flag="addVideoFlag" @closeDialog="cancelDialog">
        <template #header>
            <span class="title">上传视频</span>
        </template>
        <template #midle>
            <div class="add-playlist">
                <el-form :model="form" label-width="auto" style="max-width: 600px" :rules="rules" ref=formRef>
                    <el-form-item label="文件夹" prop="folderId">
                        <MyInputSelect :updateOptions="updateOptions" :key="5" v-model="form.folderId"
                            :options="options"></MyInputSelect>
                    </el-form-item>
                    <el-form-item label="视频类型" prop="type">
                        <el-radio-group v-model="form.type">
                            <el-radio :label="VideoType.local">本地视频</el-radio>
                            <el-radio :label="VideoType.web">网络视频</el-radio>
                            <el-radio disabled :label="VideoType.bilibili">b站视频</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="视频标题" prop="title">
                        <MyInput :key="1" v-model="form.title" :placeholder="`请输入标题`"></MyInput>
                    </el-form-item>
                    <el-form-item label="视频地址" prop="videoPath">
                        <MyInput :key="2" v-model="form.videoPath" :placeholder="`请输入视频地址`"></MyInput>
                    </el-form-item>
                    <el-form-item label="封面地址" prop="coverPath">
                        <MyInput @search="searchInputFn2" :key="3" v-model="form.coverPath"
                            :placeholder="`请输入图片地址或者base64图片`">
                        </MyInput>
                    </el-form-item>
                    <el-form-item label="别名" class="height-fix" prop="otherName">
                        <el-tag v-for="tag in form.otherName" :key="tag" closable :disable-transitions="false"
                            @close="handleClose(tag)">
                            {{ tag }}
                        </el-tag>
                        <MyInput :key="4" ref="InputRef" v-if="inputVisible" :size="`small`" v-model="inputValue"
                            @blur="handleInputConfirm" @search="handleInputConfirm" :placeholder="` `" width="79px">
                        </MyInput>
                        <button v-else class="button-new-tag" size="small" @click="showInput">
                            添加别名
                        </button>
                    </el-form-item>
                    <el-form-item label="是否缓存">
                        <el-checkbox v-model="form.save" size="large"></el-checkbox>
                    </el-form-item>
                    <el-form-item label="描述信息">
                        <div class="input-bk">
                            <el-input v-model="form.description" :rows="2" type="textarea" resize="none" ref="text"
                                @keydown.stop />
                        </div>
                    </el-form-item>
                </el-form>
            </div>
        </template>
    </MyDialog>
</template>

<script setup lang="ts">
import { useGlobalVar } from '@renderer/store';
import { inject, nextTick, onUnmounted, reactive, Ref, ref, toRaw, watch } from 'vue'
import { videoFolderList, VideoType, VideoInfo, AddVideoInfo, videoFolder } from './index.d';
import { useRouter } from 'vue-router';
import MyInput from '@renderer/components/myVC/MyInput.vue';
import MyInputSelect from '@renderer/components/myVC/MyInputSelect.vue';
import type { AppDatabase } from '@renderer/indexDB/db'

import saveVideoWorker from '@renderer/workers/saveVideoWorker?worker'
import { bufferToBase64 } from '@renderer/utils/arrayBufferToBase64';
import { videos_folders_table } from '@renderer/indexDB/dbType';

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
const db = inject('db') as AppDatabase

const videoList: Ref<videoFolderList[] | undefined> = ref()
//  = ref([
//     {
//         id: 1,
//         folderName: "日高大地",
//         list: [
//             {
//                 id: 1,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 2,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 3,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 4,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 5,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 6,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 7,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//         ]
//     },
//     {
//         id: 2,
//         folderName: "日高大地",
//         list: [
//             {
//                 id: 1,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 2,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//             {
//                 id: 3,
//                 title: "独学画伯",
//                 type: VideoType.local,
//                 videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
//                 coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
//                 otherName: ['学'],
//                 time: "2004-01-02"
//             },
//         ]
//     }
// ])
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
        return {...videos_folder, list: videoTableList.filter(video => video.folderId === videos_folder.id)};
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



const updateOptions = async (folderName: string) => {
    //videos_folders插入一条数据
    const id = await db.videos_folders.add({
        folderName: folderName,
        updateTime: new Date().toLocaleString()
    })
    videoList.value?.unshift({
        id: id,
        folderName: folderName,
        list: [],
        updateTime: new Date().toLocaleString()
    })
    activeNames.value.unshift(id)
    return id

}


const globalVar = useGlobalVar();


const searchInputFn = () => {
    console.log(searchInput.value);
}
const goVideo = (videMsg: VideoInfo) => {
    $router.push({
        name: 'video_detail',
        query: {
            id: videMsg.id
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

const addVideoFlag = ref(false)

const cancelDialog = () => {
    addVideoFlag.value = false
}

const formRef = ref()
const saveVideo = new saveVideoWorker()
const confirmDialog = () => {
    formRef.value.validate(async (valid: boolean) => {
        if (valid) {
            const nowTime = new Date().toLocaleString()
            const id = await db.videos.add({
                title: form.value.title,
                type: form.value.type,
                videoPath: form.value.videoPath,
                coverPath: form.value.coverPath,
                otherName: form.value.otherName.join(" "),
                description: form.value.description,
                folderId: form.value.folderId!,
                time: nowTime,
                updateTime: nowTime
            })
            await db.videos_folders.where('id').equals(form.value.folderId!).modify({
                updateTime:nowTime
            })
            //查找id与form.value.folderId相同的项
            const index = videoList.value?.findIndex(item => item.id === form.value.folderId)!;
            videoList.value![index].updateTime = nowTime
            videoList.value?.sort((a, b) => {
                return new Date(b.updateTime).getTime() - new Date(a.updateTime).getTime()
            })
            //把form.value.folderId对应的放到videoList.value 的第一个
            videoList.value?.unshift(videoList.value?.find(item => item.id === form.value.folderId)!)
            videoList.value?.splice(videoList.value?.findIndex(item => item.id === form.value.folderId)!, 1)
            videoList.value?.[0].list.unshift({
                id,
                title: form.value.title,
                type: form.value.type,
                videoPath: form.value.videoPath,
                coverPath: form.value.coverPath,
                otherName: form.value.otherName.join(" "),
                description: form.value.description,
                time: nowTime,
                updateTime: nowTime
            })
            if (form.value.save) {
                
                saveVideo.postMessage({
                    coverPath: form.value.coverPath,
                    videoPath: form.value.videoPath,
                    type: form.value.type,
                })
                saveVideo.addEventListener('message', (event) => {
                    const { type, value } = event.data
                    if (type === "ffmpeg") {
                        const { videoPath, coverPath } = value
                        window.electron.ipcRenderer.send('saveVideo', { videoPath, coverPath })
                        window.electron.ipcRenderer.once('save-video-finish', async (_, { arrayBuffer,coverArrayBuffer }) => {
                            console.log("save-video-finish");
                            //创建链接
                            db.videos_data.add({
                                id,
                                data: arrayBuffer
                            })
                            if(form.value.coverPath.length == 0){
                                //coverArrayBuffer转base64
                                const imageBase64 =  await bufferToBase64(coverArrayBuffer)
                                db.videos.update(id, {
                                    coverPath: `${imageBase64}`
                                })
                                videoList.value![0].list[0].coverPath = `${imageBase64}`
                            }
                        })
                    }
                })
            }
            addVideoFlag.value = false
        } else {
            console.log(form.value);

        }
    })
}
onUnmounted(() => {
    saveVideo.terminate()
})


const form: Ref<AddVideoInfo> = ref({
    folderId: undefined,
    title: '',
    type: VideoType.local,
    videoPath: '',
    coverPath: '',
    otherName: [],
    description: '',
    save: false
})
const searchInputFn2 = (e: KeyboardEvent) => {
    console.log(form.value);
}


const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref()

const handleClose = (tag: string) => {
    form.value.otherName.splice(form.value.otherName.indexOf(tag), 1)
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value.$refs.searchInputRef!.input!.focus()
    })
}

const handleInputConfirm = () => {
    if (inputValue.value) {
        if (!form.value.otherName.includes(inputValue.value)) {
            form.value.otherName.push(inputValue.value)
        }
    }
    inputVisible.value = false
    inputValue.value = ''
}


const rules = reactive<any>({
    folderId: [
        {
            validator: (rule: any, value: any, callback: any) => {
                let t = setTimeout(() => {
                    console.log(form.value.folderId);
                    clearTimeout(t);
                    if (form.value.folderId === undefined) {
                        callback(new Error('请选择加入的文件夹'))
                    } else {
                        callback()
                    }
                }, 300)

            }, trigger: 'blur', required: true
        }
    ],
    title: [
        { required: true, message: '请输入视频标题', trigger: 'blur' }
    ],
    videoPath: [
        {
            required: true,
            message: '请输入视频地址',
            trigger: 'blur'
        },
        {
            validator: (rule: any, value: any, callback: any) => {
                const linkRegex = /^(http|https):\/\/[^ "]+$/;
                const localFileRegex = /^([a-zA-Z]:\\|\/|\.\/|\.\.\/)[^ "]*$/;

                if (!value) {
                    callback();
                } else if (form.value.type === VideoType.web && linkRegex.test(value)) {
                    callback();
                } else if (form.value.type === VideoType.local && localFileRegex.test(value)) {
                    callback();
                } else {
                    callback(new Error(`请输入有效的${form.value.type === VideoType.web ? '链接' : '本地文件路径'}`));
                }
            },
            trigger: 'blur'
        }
    ],
    coverPath: [
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value) {
                    const isUrl = /^(http|https):\/\/.+/.test(value);
                    const isBase64 = /^data:image\/\w+;base64,.+$/.test(value);
                    const localFileRegex = /^([a-zA-Z]:\\|\/|\.\/|\.\.\/)[^ "]*$/.test(value);

                    if (!isUrl && !isBase64 && !localFileRegex) {
                        callback(new Error('请输入有效的图片地址或 base64 图片'));
                    } else {
                        callback();
                    }
                } else {
                    if (!form.value.save) {
                        callback(new Error('如果你不想填写图片地址，那么必须选择缓存'))
                    } else {
                        callback();
                    }
                }
            },
            trigger: 'blur'
        }
    ]
});
watch(() => form.value.videoPath, () => {
    const linkRegex = /^http/;
    console.log(linkRegex.test(form.value.videoPath));
    if (linkRegex.test(form.value.videoPath)) {
        form.value.type = VideoType.web
    } else {
        form.value.type = VideoType.local
    }
    console.log(form.value)
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
                        border-radius: 2em;
                        cursor: pointer;
                        transition: transform .2s ease;

                        &:hover {
                            transform: scale(1.03);
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

.height-fix {
    :deep(.el-form-item__content) {
        height: 32px;

        .el-tag {
            margin-right: 5px;
            --el-tag-bg-color: none;
            --el-tag-text-color: @primary-color;
            --el-tag-hover-color: @primary-color;
            border-color: @font-color;
        }
    }
}

.input-bk {
    position: relative;
    width: 100%;

    :deep(.el-textarea) {
        --el-input-hover-border-color: none;
        --el-input-focus-border-color: none;
        width: 100%;
        font-size: 14px;
        border: 1px solid @commit-block-border-color;
        border-radius: 0.2em;
        background-color: @commit-block-color;
        padding-bottom: 5px;
        padding-top: 5px;

        .el-textarea__inner {
            background-color: @commit-block-color;
            box-shadow: none;
            color: @font-color;
            padding-bottom: 5px;
            padding-top: 5px;
            padding-right: 15px;

            &::-webkit-scrollbar {
                height: 80%;
            }

            &::-webkit-scrollbar-button {
                display: none;
            }

            &::-webkit-scrollbar {
                width: 7px;
                height: 90%;
                background-color: @commit-block-scroll-line;
            }

            &::-webkit-scrollbar-thumb {
                border-radius: 0.4em;
                background: @commit-block-scroll-button;
            }
        }
    }

    .number {
        position: absolute;
        bottom: 7px;
        right: 6px;
        font-size: 12px;
        color: @font-color;
    }
}

.el-checkbox.el-checkbox--large {
    height: auto;
}

:deep(label) {
    height: 25px;

    .el-checkbox__label {
        font-size: 13px;
        color: @font-color;
    }

    --el-checkbox-bg-color:@other-bk-color;
    --el-checkbox-input-border-color-hover:@primary-color;
    --el-checkbox-input-border:1px solid @border-color;
}

:deep(.is-checked) {
    :deep(.el-el-checkbox__input) {
        border-color: @primary-color;
        background-color: @primary-color;
    }

    --el-checkbox-checked-bg-color:@primary-color;
    --el-checkbox-checked-input-border-color:@primary-color;

    .el-checkbox__label {
        color: @primary-color;
    }
}
</style>