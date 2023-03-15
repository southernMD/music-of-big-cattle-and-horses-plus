<template>
    <div class="emoji-bk" @click.self="close">
        <div class="emoji" ref="emoji">
            <i class="iconfont icon-guanbi_o" @click="close"></i>
            <div class="emoji-list">
                <div class="img" v-for="index in 30" @click="addEmoji(index)">
                    <img :src="getAssetsFile(`emoji_${index + baseNumber}.svg`)" 
                    :title="baseNumber == 0?emojiName[index - 1][0].substring(1,emojiName[index - 1][0].length - 1):emojiName[index - 1][1].substring(1,emojiName[index - 1][1].length - 1)">
                </div>
            </div>
            <div class="point">
                <div class="one" @click="active(0)" :class="{
                    active:activeFlag[0],
                    disActive:!activeFlag[0]
                }"></div>
                <div class="two" @click="active(1)" :class="{
                    active:activeFlag[1],
                    disActive:!activeFlag[1]
                }"></div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import {getCurrentInstance, toRef,ComponentInternalInstance,watch,Ref,ref,reactive,nextTick,onUpdated, readonly } from 'vue'
import {getAssetsFile} from '@renderer/utils/importSVG'
import { useMain,useGlobalVar } from '@renderer/store';
const Main = useMain()
const globalVar = useGlobalVar()
const $el = getCurrentInstance() as ComponentInternalInstance 
defineProps<{
    left:number
    top:number
    flag:boolean
}>()


const emojiName = readonly(Main.emojiName)
let leftValue:Ref<number> = toRef($el.props,'left') as Ref<number>
let topValue:Ref<number> = toRef($el.props,'top') as Ref<number>
let baseNumber = ref(0)
//添加emoji
const addEmoji = (index:number)=>{
    let emojiMessage = ref('')
    if(baseNumber.value == 0){
        emojiMessage.value = emojiName[index - 1][0]
    }else{
        emojiMessage.value = emojiName[index - 1][1]
    }
    sendEmojiStrToFather(emojiMessage.value)
}

const sendEmojiStrToFather = (emojiStr:string)=>{
    $emit('sendEmojiStr',emojiStr)
}

let top = toRef($el.props,'top')
watch(top,()=>{
    nextTick(()=>{
        let e = $el.refs.emoji as HTMLElement
        e.style.left = leftValue.value + 'px'
        e.style.top = topValue.value + 25 + 'px'
    })
   
},{immediate:true})

let activeFlag = reactive([true,false])
const active = (index:number)=>{
    activeFlag.forEach((val,i)=>{
        activeFlag[i] = false
    })
    activeFlag[index] = true
}

watch(activeFlag,()=>{
    if(activeFlag[0] == true){
        baseNumber.value = 0 
    }
    if(activeFlag[1] == true){
        baseNumber.value = 30 
    }
})

const wheelFn = (e:WheelEvent)=>{
    if(e.deltaY > 0){   //向下
        activeFlag[0] = false
        activeFlag[1] = true
    }else{
        activeFlag[0] = true
        activeFlag[1] = false
    }
}

let emojiFlag = toRef($el.props,'flag')

watch(emojiFlag,()=>{
    if(emojiFlag.value){
        window.addEventListener('wheel',wheelFn)
    }else{
        window.removeEventListener('wheel',wheelFn)
    }
})


const $emit = defineEmits(['close','sendEmojiStr'])
const close = ()=>{
    $emit('close')
}

</script>

<style lang='less' scoped>
    .emoji-bk{
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0);
        position: fixed;;
        left: 0;
        top: 0;
        z-index: 998;
        .emoji{
            cursor: default;
            width: 370px;
            height: 160px;
            min-height: 130px;
            box-shadow: @shadow;
            background-color: @radio-bk-color;
            position: fixed;
            z-index: 999;
            border-radius: 0.2em;
            .icon-guanbi_o{
                font-size: 20px;
                position: absolute;
                right: 5px;
                top: 5px;
                color: @small-font-color;
                cursor: pointer;
            }
            .emoji-list{
                width: 85%;
                height: 70%;
                margin-left:7.5%;
                margin-right: 7.5%;;
                margin-top: 25px;
                margin-bottom: 30px;
                display: flex;
                flex-wrap:wrap;
                >.img{
                    cursor: pointer;
                    height: 25px;
                    width: 25px;
                    margin: 2px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border: 1px solid rgba(1,1,1,0);
                    &:hover{
                        border: 1px solid rgb(61, 145, 236);
                    }
                }
            }
            .point{
                width: 100px;
                height: 5px;
                position: absolute;
                bottom: 15px;
                left: 0px;
                right: 0px;
                margin: 0 auto;
                display: flex;
                justify-content: center;
                >div{
                    border-radius: 50%;
                    width: 5px;
                    height: 5px;
                    background-color: yellow;
                    margin-left: 5px;
                    cursor: pointer;
                }
                .active{
                    background-color: @emoji-point-active;
                }
                .disActive{
                    background-color:@emoji-point-disActive;
                }
            }
        }
    }

</style>