<template>
    <Teleport to="body">
        <MyDialog @confirm="confirmAddDialog" @cancel="cancelAddDialog" :flag="flag"
            @closeDialog="cancelAddDialog">
            <template #header>
                <span class="title">上传视频</span>
            </template>
            <template #midle>
                <div class="add-playlist">
                    <el-form :model="form" label-width="auto" style="max-width: 600px" :rules="rules" ref="addFormRef">
                        <el-form-item label="文件夹" prop="folderId">
                            <MyInputSelect :updateOptions="updateOptions" :key="5" v-model="form.folderId"
                                :options="optionsC"></MyInputSelect>
                        </el-form-item>
                        <el-form-item label="视频类型" prop="type">
                            <el-radio-group v-model="form.type">
                                <el-radio :label="VideoType.local">本地视频</el-radio>
                                <el-radio :label="VideoType.web">网络视频</el-radio>
                                <el-radio :label="VideoType.bilibili">b站视频</el-radio>
                            </el-radio-group>
                        </el-form-item>
                        <el-form-item label="视频标题" prop="title">
                            <MyInput :key="1" v-model="form.title" :placeholder="`请输入标题`"></MyInput>
                        </el-form-item>
                        <el-form-item label="视频地址" prop="videoPath">
                            <MyInput :key="2" v-model="form.videoPath" :placeholder="`请输入视频地址`"></MyInput>
                        </el-form-item>
                        <el-form-item label="封面地址" prop="coverPath">
                            <MyInput :key="3" v-model="form.coverPath" :placeholder="`请输入图片地址或者base64图片`">
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
                        <el-form-item label="是否缓存" prop="save">
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
    </Teleport>
</template>

<script setup lang="ts">
import {watch} from 'vue'
import { db } from '@renderer/indexDB/db';
import type  { AddVideoInfo, videoFolder } from '@renderer/views/video/indexType.d.ts';
import { VideoType } from '@renderer/views/video/index';

import { reactive, ref,Ref ,nextTick} from 'vue'
import { useGlobalVar } from '@renderer/store';
const flag = ref(false)
const props = defineProps({
    addVideoFlag:{
        type:Boolean,
        default: false
    },
    options: {
        type: Array<videoFolder>,
        default: () => []
    }
})

watch(()=>props.addVideoFlag,()=>{
    flag.value = props.addVideoFlag
})
const optionsC = ref(props.options)
watch(()=>props.options,()=>{
    optionsC.value = props.options
},{deep:true})

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

const addFormRef = ref()
const $emit = defineEmits(['updateFolder','addVideo','update:addVideoFlag'])
const confirmAddDialog = () => {
    addFormRef.value.validate(async (valid: boolean) => {
        console.log(form.value);
        if (valid) {
            const nowTime = new Date().toLocaleString()
            const id = await db.videos.add({
                title: form.value.title,
                type: form.value.type,
                videoPath: form.value.videoPath,
                coverPath: form.value.coverPath,
                otherName: form.value.otherName.join(","),
                description: form.value.description,
                folderId: form.value.folderId!,
                time: nowTime,
                updateTime: nowTime
            })
            await db.videos_folders.where('id').equals(form.value.folderId!).modify({
                updateTime: nowTime
            })
            $emit("addVideo",{id,form:form.value,nowTime})
            $emit('update:addVideoFlag',false)
        } else {
            console.log(form.value);
        }
    })
}
const globalVar = useGlobalVar()
watch(() => form.value.videoPath, () => {
    const linkRegex = /^http/;
    const bilibiliRegex = /^https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+/;
    if (linkRegex.test(form.value.videoPath.trim()) && !bilibiliRegex.test(form.value.videoPath.trim())) {
        form.value.type = VideoType.web
    } else if(bilibiliRegex.test(form.value.videoPath.trim())){
        console.log(globalVar.setting.sessdata);

        form.value.type = VideoType.bilibili
    }else{
        form.value.type = VideoType.local
    }
    console.log(form.value)
})
watch(()=>form.value.type,(newValue,oldValue)=>{
    const bilibiliRegex = /^https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+/;
    if(oldValue === VideoType.bilibili && bilibiliRegex.test(form.value.videoPath.trim())){
        form.value.type = VideoType.bilibili
    }
})

const cancelAddDialog = () => {
    $emit('update:addVideoFlag',false)
}
const updateOptions = async (folderName: string) => {
    //videos_folders插入一条数据
    const id = await db.videos_folders.add({
        folderName: folderName,
        updateTime: new Date().toLocaleString()
    })
    $emit('updateFolder',{id,folderName})
    return id

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
                const bilibiliRegex = /^https:\/\/www\.bilibili\.com\/video\/BV[A-Za-z0-9]+/;
                if (!value) {
                    callback();
                } else if (form.value.type === VideoType.web && linkRegex.test(value.trim())) {
                    callback();
                } else if (form.value.type === VideoType.local && localFileRegex.test(value.trim())) {
                    callback();
                }else if(form.value.type === VideoType.bilibili && bilibiliRegex.test(value.trim())){
                    if(globalVar.setting.sessdata.trim().length === 0){
                        callback(new Error('你必须要先设置哔哩哔哩SESSDATA才能使用bilibili解析'));
                    }else{
                        callback();
                    }
                } else {
                    callback(new Error(`请输入有效的${
                    (()=>{
                        switch(form.value.type){
                            case VideoType.web: return '链接'
                            case VideoType.local: return '本地文件路径'
                            case VideoType.bilibili: return 'bilibiliBV视频链接'
                            default: return '链接'
                        }
                    })()
                    }`));
                }
            },
            trigger: 'blur'
        }
    ],
    coverPath: [
        {
            validator: (rule: any, value: any, callback: any) => {
                if (value) {
                    const isUrl = /^(http|https):\/\/.+/.test(value.trim());
                    const isBase64 = /^data:image\/\w+;base64,.+$/.test(value.trim());
                    const localFileRegex = /^([a-zA-Z]:\\|\/|\.\/|\.\.\/)[^ "]*$/.test(value.trim());

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
    ],
    save:[
        {
            validator:(rule: any, value: any, callback: any) => {
                if(form.value.type === VideoType.bilibili){
                    console.log(value);
                    if(value === false){
                        callback(new Error('如果你要上传的的是一个B站视频，那么必须缓存'));
                    }else{
                        callback();
                    }
                }else{
                    callback();
                }
            },
            trigger: 'blur'
        }
    ]

});

const handleClose = (tag: string) => {
    form.value.otherName.splice(form.value.otherName.indexOf(tag), 1)
}

const inputValue = ref('')
const inputVisible = ref(false)
const InputRef = ref()

const handleInputConfirm = () => {
    if (inputValue.value) {
        if (!form.value.otherName.includes(inputValue.value)) {
            form.value.otherName.push(inputValue.value)
        }
    }
    inputVisible.value = false
    inputValue.value = ''
}

const showInput = () => {
    inputVisible.value = true
    nextTick(() => {
        InputRef.value.$refs.searchInputRef!.input!.focus()
    })
}

</script>

<style scoped lang="less"></style>