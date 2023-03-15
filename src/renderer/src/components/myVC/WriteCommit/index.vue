<template>
    <div class="writeCommit">
        <div class="input-bk">
            <el-input
            v-model="textarea"
            :rows="3"
            type="textarea"
            resize="none"
            :autofocus="$route.name != 'personalFM'"
            ref="text"
            :key="routeId"
            @keydown.stop
            />
            <div class="number" :class="{red:(140 - textarea.length)<0}">{{140 - textarea.length}}</div>
        </div>
    </div>
    <div class="option">
       <i class="iconfont icon-biaoqing" ref="i" :class="{noDrag:!Main.dragMouse}" @click.self="ShowEmoji"></i>
        <Teleport to="body">
            <Emoji v-show="emoji" :top="topValue" :left="leftValue" @close="emoji = false" :flag="emoji" @sendEmojiStr="sendEmojiStr"></Emoji>
        </Teleport>
       <!-- <img :src="getAssetsFile('emoji_1.svg')" alt=""> -->
    </div>
</template>

<script lang='ts' setup>
import {useRoute} from 'vue-router'
import {onMounted, ref,toRef,watch,getCurrentInstance,ComponentInternalInstance } from 'vue'
import {useMain,useGlobalVar} from '@renderer/store'
import { ElInput } from 'element-plus'
import Emoji from './emoji/index.vue'
const Main = useMain()
const $route = useRoute()
const globalVar = useGlobalVar()
const $el = getCurrentInstance() as ComponentInternalInstance 
const text = ref<InstanceType<typeof ElInput>>()
let routeQuery = toRef($route,'query')
let routeId = ref(routeQuery.value.id)
watch(routeQuery,()=>{
    routeId.value = routeQuery.value.id
})
watch(routeId,()=>{
    textarea.value = ''
})
let textarea = ref('')
let emoji = ref(false)
const ShowEmoji = ()=>{
    emoji.value = !emoji.value
}
let topValue = ref(0)
let leftValue = ref(0)
let mainScroll = toRef(globalVar,'mainScroll')

const reSizePositon = ()=>{
    let dom = $el.refs.i as HTMLElement
    let {left,top} = dom.getBoundingClientRect()
    topValue.value = top
    leftValue.value = left
}

watch(mainScroll,()=>{
    reSizePositon();
})
window.electron.ipcRenderer.on('to-changeFished-finshed',()=>{
    reSizePositon();
})
onMounted(()=>{
    reSizePositon();
})

//输入emoji
const sendEmojiStr = (emojistr:string)=>{
    textarea.value+=emojistr
    text.value!.focus()
}

//传回文本
const $emit = defineEmits(['getText'])
watch(textarea,()=>{
    $emit('getText',textarea.value)
})

let clearText = toRef(Main,'clearText')
watch(clearText,()=>{
    if(clearText.value){
        textarea.value = ''
        clearText.value = false
    }
})
</script>

<style lang='less' scoped>
    .noDrag{
        cursor: pointer;
    }
    .writeCommit{
        display: flex;
        justify-content: center;
        .input-bk{
            width: 90vw;
            margin-left: 30px;
            margin-right:30px ;
            position: relative;
            :deep(.el-textarea){
                --el-input-hover-border-color: none; 
                --el-input-focus-border-color: none;
                width: 100%;
                font-size: 14px;
                border: 1px solid @commit-block-border-color;
                border-radius: 0.2em;
                background-color: @commit-block-color;
                padding-bottom: 5px;
                padding-top: 5px;
                .el-textarea__inner{
                    background-color: @commit-block-color;
                    box-shadow: none;
                    color:@font-color;
                    padding-bottom: 5px;
                    padding-top: 5px;
                    padding-right: 15px;
                    &::-webkit-scrollbar{
                        height: 80%;
                    }
                    &::-webkit-scrollbar-button{
                        display: none;
                    }
                    &::-webkit-scrollbar{
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
            .number{
                position: absolute;
                bottom: 7px;
                right: 6px;
                font-size: 12px;
            }
        }

        .red{
            color: rgb(205,24,24);
        }

    }
    .option{
        display: flex;
        width: calc(100% - 60px);
        margin-left: 30px;
        margin-right:30px ;
        height: 30px;
        align-items: center;
        margin-top: 5px;
        i{
            font-size: 20px;
            color: @small-font-color;
            &:hover{
                color: @small-font-color-hover;
            }
        }
        .submit{

        }
    }

</style>