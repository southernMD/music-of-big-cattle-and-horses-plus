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
                                <span class="oN">{{ video_val.otherName.join(" ") }}</span>
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
                <el-form :model="form" label-width="auto" style="max-width: 600px">
                    <el-form-item label="文件夹">
                        <MyInputSelect :key="5" v-model="form.folderId" :options="options"></MyInputSelect>
                    </el-form-item>
                    <el-form-item label="视频类型">
                        <el-radio-group v-model="form.type">
                            <el-radio :label="VideoType.local">本地视频</el-radio>
                            <el-radio :label="VideoType.web">网络视频</el-radio>
                            <el-radio :label="VideoType.bilibili">b站视频</el-radio>
                        </el-radio-group>
                    </el-form-item>
                    <el-form-item label="视频标题">
                        <MyInput :key="1" v-model="form.title" :placeholder="`请输入标题`"></MyInput>
                    </el-form-item>
                    <el-form-item label="视频地址">
                        <MyInput :key="2" v-model="form.videoPath" @search="searchInputFn2" :placeholder="`请输入视频地址`"></MyInput>
                    </el-form-item>
                    <el-form-item label="封面地址">
                        <MyInput :key="3"  v-model="form.coverPath" @search="searchInputFn2" :placeholder="`请输入图片地址或者base64图片`">
                        </MyInput>
                    </el-form-item>
                    <el-form-item label="别名" class="height-fix">
                        <el-tag v-for="tag in form.otherName" :key="tag" closable :disable-transitions="false"
                            @close="handleClose(tag)">
                            {{ tag }}
                        </el-tag>
                        <MyInput :key="4" ref="InputRef" v-if="inputVisible"  :size="`small`" v-model="inputValue" @blur="handleInputConfirm" @search="handleInputConfirm" :placeholder="` `" width="79px">
                        </MyInput>
                        <button v-else class="button-new-tag" size="small" @click="showInput">
                            添加别名
                        </button>
                    </el-form-item>
                </el-form>
            </div>
        </template>
    </MyDialog>
</template>

<script setup lang="ts">
import { useGlobalVar } from '@renderer/store';
import { nextTick, reactive, Ref, ref, toRaw, watch } from 'vue'
import { VideoListInfo, VideoType, VideoInfo, AddVideoInfo } from './index.d';
import { useRouter } from 'vue-router';
import MyInput from '@renderer/components/myVC/MyInput.vue';
import MyInputSelect from '@renderer/components/myVC/MyInputSelect.vue';
const $router = useRouter()
const searchInput = ref('')
const searchType = ref("查询视频标题")
const searchTypeid = ref("folder")
const videoList: Ref<VideoListInfo[]> = ref([
    {
        id: 1,
        folderName: "日高大地",
        list: [
            {
                id: 1,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊啊学'],
                time: "2004-01-02"
            },
            {
                id: 2,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 3,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 4,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 5,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 6,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 7,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
        ]
    },
    {
        id: 2,
        folderName: "日高大地",
        list: [
            {
                id: 1,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 2,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
            {
                id: 3,
                title: "独学画伯",
                type: VideoType.local,
                videoPath: "C:\\Users\\southernMD\\Desktop\\娱乐杂项\\righthere.mp4",
                coverPath: "https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg",
                otherName: ['学'],
                time: "2004-01-02"
            },
        ]
    }
])

const options: any[] = [
    {
        value: 1,
        label: '日高大地',
    },
    {
        value: 2,
        label: 'SHIDO',
    },
];
const activeNames = ref(toRaw(videoList.value.map(item => item.id)))
console.log(activeNames);

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

const confirmDialog = () => {
    console.log(form.value);
    addVideoFlag.value = false
}

const form:Ref<AddVideoInfo> = ref({
    folderId: undefined,
    title: '',
    type: VideoType.local,
    videoPath: '',
    coverPath: '',
    otherName: [],
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
    form.value.otherName.push(inputValue.value)
  }
  inputVisible.value = false
  inputValue.value = ''
}
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
                grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
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
.height-fix{
    :deep(.el-form-item__content){
        height: 32px;
        .el-tag{
            margin-right: 5px;
            --el-tag-bg-color:none;
            --el-tag-text-color:@primary-color;
            --el-tag-hover-color:@primary-color;
            border-color:@font-color;
        }
    }
}
</style>