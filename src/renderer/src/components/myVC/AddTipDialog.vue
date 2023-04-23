<template>
    <MyDialog :flag="addTagsFlag" :destroy="true" confirmName="完成" @confirm="confirm" @cancel="cancel"
        @closeDialog="closeDialog">
        <template #header>
            <div class="title">添加标签</div>
        </template>
        <template #midle>
            <el-scrollbar style="margin-top: -20px; margin-bottom: -20px;">
                <div class="main-slot">
                    <div class="title">选择合适的标签，最多可选<span>3</span>个</div>
                    <div class="tag-list" v-for="val, index in BasicApi.tagsDetail.categories">
                        <div class="tag-header left">
                            <span>{{ val }}</span>
                        </div>
                        <div class="right">
                            <div class="tag-bk" @click="choice(index, it)" v-choick="{ index, it }"
                                v-for="item, it in BasicApi.tagsDetail.sub.filter((it) => it.category == index)">
                                <div class="tag-item" :class="{ 'active': Flags[index][it] }">
                                    <span>{{ item.name }}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </el-scrollbar>
        </template>
    </MyDialog>
</template>

<script setup lang="ts">
import MyDialog from '@renderer/components/myVC/MyDialog.vue';
import {ref,Ref,toRaw } from 'vue'
import {useBasicApi,useMain} from '@renderer/store'
const BasicApi = useBasicApi()
if(BasicApi.tagsDetail.sub.length == 0)BasicApi.reqPlayListTags()
const clearFormTags = ref(false)
const choiceNumber = ref(0)
const Main = useMain()

const props = defineProps<{
    index:number
}>()

const Flags:Ref<Boolean[][]> = ref([])
for(let i=0;i<BasicApi.tagsDetail.categories.length;i++){
    let t:boolean[] = []
    // Flags.value.set(i,[])
    t.length = BasicApi.tagsDetail.sub.filter((it)=>it.category == i).length
    t.fill(false)
    Flags.value.push(t)
}
const tags:Ref<string[]> = ref(toRaw(Main.playList[props.index]).tags)
const choice = (index,it)=>{
    console.log(choiceNumber.value);
    if(choiceNumber.value==3 && !Flags.value[index][it]) return
    if(Flags.value[index][it])choiceNumber.value--
    else choiceNumber.value++
    Flags.value[index][it] = !Flags.value[index][it]
}
const confirmFlag = ref(false)
let cnt = 0
const $emit = defineEmits(['confirm'])
const vChoick = {
    created(el, binding){
        cnt++
        if(tags.value.includes(el.querySelector('span')?.innerText)){
            Flags.value[binding.value.index][binding.value.it] = true
        }
    },
    unmounted(el, binding) {
        if(!clearFormTags.value){
            tags.value= []
            clearFormTags.value = true
        }
        if(Flags.value[binding.value.index][binding.value.it] == true && confirmFlag.value){
            tags.value.push(el.querySelector('span')?.innerText)
        }
        if(--cnt == 0 && confirmFlag.value){
            $emit('confirm',tags.value)
            console.log(tags.value);
        }
        if(!confirmFlag.value)choiceNumber.value = 0
    }
}
const addTagsFlag = ref(false)
const confirm = ()=>{
    addTagsFlag.value = false
    confirmFlag.value = true
}
const cancel = ()=>{
    addTagsFlag.value = false
    clearFormTags.value = true
}
const closeDialog = (done:()=>void)=>{
    done()
    addTagsFlag.value = false
}
defineExpose({tags,clearFormTags,confirmFlag,addTagsFlag,choiceNumber})

// const add = ()=>{
//     clearFormTags.value = false
//     confirmFlag.value = false
//     addTagsFlag.value = true
//     choiceNumber.value = form.tags.length
// }
</script>

<style scoped lang="less">
.main-slot{
    max-width: 100%;
    .title{
        color: @small-font-color;
        font-weight: normal;
        font-size: 13px;
        user-select: none;
        >span{
            color: @primary-color !important;
        }
        margin-bottom: 20px;
    }
    
    .tag-list{
        display: flex;
        width: 100%;
        align-items: start;
        .tag-header{
            height: 30px;
            font-size: 15px;
            display: flex;
            align-items: center;
            margin-bottom: 10px;
            flex-basis: 10%;
        }
        .right{
            flex-basis:90%;
            display: flex;
            flex-wrap: wrap;
            .tag-bk{
                // width: 100px;
                flex-basis: 25%;
                display: flex;
                justify-items: flex-start;
                .tag-item{
                    cursor: pointer;
                    box-sizing: border-box;
                    display: flex;
                    margin-right: 10px;
                    margin-bottom: 10px;
                    min-width: 60px;
                    height: 30px;
                    justify-content: center;
                    align-items: center;
                    border: 1px solid @border-color;
                    border-radius: 2em;
                    background-color: @none-button;
                    color: @font-color;
                    font-size: 13px;
                    user-select: none;
                    >span{
                        margin-left: 10px;
                        margin-right: 10px;
                    }
                    &:hover{
                        color: @primary-color;
                    }
                }
                .active{
                    color: @primary-color;
                    border: none;
                    background-color: rgba(236,65,65,.4) !important;
                }
            }
        }
    }
}

</style>