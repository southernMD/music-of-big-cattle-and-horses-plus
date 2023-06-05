<template>
    <editorPage type="playList"
    title="编辑歌单信息"
    titleDialog="编辑歌单封面"
    imgTitle="编辑封面"
    :imgUrl="Main.playList[index].coverImgUrl"
    >
        <template #form>
            <el-form :model="form" label-width="120px">
                <el-form-item label="歌单名：">
                    <div class="input-bk">
                        <el-input v-model="form.name" />
                    </div>
                </el-form-item>
                <el-form-item label="标签：">
                    <div class="tips">
                        <span v-for="val in form.tags" class="tip">
                            <span>{{ val }}</span>
                        </span>
                        <span class="add" @click="add">添加标签</span>
                    </div>
                </el-form-item>
                <el-form-item label="简介：">
                    <div class="text-bk">
                        <el-input :rows="5" type="textarea" resize="none" ref="text" v-model="form.description"
                            maxlength="1000" spellcheck="false" />
                        <span class="limit">{{ 1000 - form.description.length }}</span>
                    </div>
                </el-form-item>
                <el-form-item>
                    <div class="ptns">
                        <div @click="onSubmit">保存</div>
                        <div @click="back">取消</div>
                    </div>
                </el-form-item>
            </el-form>
        </template>
    </editorPage>
    <AddTipDialog ref="AddTipDialogRef" :index="+index"></AddTipDialog>
</template>

<script setup lang="ts">
import editorPage from '@renderer/components/myVC/editorPage.vue';
import AddTipDialog from '@renderer/components/myVC/AddTipDialog.vue'
import { useMain, useGlobalVar, useBasicApi,useNM } from '@renderer/store'
import { onMounted, reactive, ref, toRaw, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
const AddTipDialogRef = ref<InstanceType<typeof AddTipDialog>>()
const Main = useMain()
const NM = useNM()
const $route = useRoute()
const globalVar = useGlobalVar()
const $router = useRouter()
const index = ref($route.query.index as string)

onMounted(() => {
    form.tags = AddTipDialogRef.value!.tags
    watch(() => AddTipDialogRef.value!.tags, () => {
        form.tags = AddTipDialogRef.value!.tags
    })
})
const form = reactive({
    name: toRaw(Main.playList[+index.value]).name,
    tags: [] as any[],
    description: toRaw(Main.playList[+index.value]).description ?? "",
})


const onSubmit = async () => {
    console.log('submit!')
    if (form.name == Main.playList[+index.value].name
        && form.tags == Main.playList[+index.value].tags
        && ((Main.playList[+index.value].description ?? "").toString() == form.description.toString())
    ) return
    globalVar.loadDefault = true
    try {
        if(!localStorage.getItem('NMcookie')){
            await Main.reqUpdatePlayList(index.value, Main.playList[+index.value].id, form.name, form.description, form.tags.join(';'))
        }else{
            await NM.reqUpdatePlayList(index.value, Main.playList[+index.value].id, form.name, form.description, form.tags.join(';'))
        }
        globalVar.loadDefault = false
        globalVar.loadMessageDefault = '保存成功!'
        globalVar.loadMessageDefaultFlag = true
        $router.replace({
            name: 'songPlaylist',
            query: {
                id: Main.playList[+index.value].id, index: index.value, my: 'true',type:'歌单',nm:'true'
            }
        })

    } catch (error) {
        globalVar.loadDefault = false
        globalVar.loadMessageDefault = '保存失败!'
        globalVar.loadMessageDefaultFlag = true
    }

}
const back = () => {
    $router.go(-1)
}
// const addTagsFlag = ref(false)
const add = () => {
    AddTipDialogRef.value!.clearFormTags = false
    AddTipDialogRef.value!.confirmFlag = false
    AddTipDialogRef.value!.addTagsFlag = true
    AddTipDialogRef.value!.choiceNumber = form.tags.length
}
</script>

<style scoped lang="less"></style>