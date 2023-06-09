<template>
    <div class="dropdown xdrop" :class="{'dropdown-oneself':globalVar.oneself}" @click="showList"  ref="dropdownRef" :data-id="rand">
        <span class="xdrop" :data-id="rand">{{ showMessage }}</span>
        <i class="iconfont icon-xiajiantou xdrop" :data-id="rand"></i>
        <div class="list" @click.stop v-show="showListFlag" ref="listRef">
            <el-scrollbar>
                <div class="list-item" @click="choiceItem(it)" v-for="it in list">{{ it.name }}</div>
            </el-scrollbar>
        </div>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref,watch } from 'vue'
import { useGlobalVar } from '@renderer/store'
const globalVar = useGlobalVar()
const props = defineProps<{
    message?: string
    list: any[]
    width?:number
}>()
const showMessage = ref('')
const dropdownRef = ref()
const listRef = ref()
const rand = ref(Math.random())
onMounted(()=>{
    if (props.message) {
        showMessage.value = props.message
    } else {
        showMessage.value = props.list[0].name ?? ''
    }
    
    dropdownRef.value.style.width = (props.width ?? 120)+ 'px'
    listRef.value.style.height = Math.min(25 * props.list.length,200) + 'px'
})

watch(()=>props.message,()=>{
    if (props.message) {
        showMessage.value = props.message
    } else {
        showMessage.value = props.list[0].name ?? ''
    }
})

const showListFlag = ref(false)
const showList = () => {
    showListFlag.value = !showListFlag.value
    $emit('qclick')
}
const $emit = defineEmits(['change','qclick'])
const choiceItem = (ms: any) => {
    showMessage.value = ms.name
    showListFlag.value = false
    $emit('change',ms)
}

const hic = (e)=>{
    if([...e.target.classList].includes('xdrop') == false){
        showListFlag.value = false
    }else{
        if(e.target.getAttribute('data-id') != rand.value){
            showListFlag.value = false
        }
    }
}

watch(showListFlag,()=>{
    if(showListFlag.value){
        window.addEventListener('click',hic)
    }else{
        window.removeEventListener('click',hic)
    }
})

defineExpose({showListFlag})
</script>

<style scoped lang="less">
.dropdown {
    width: 120px;
    height: 25px;
    margin-right: 15px;
    background-color: @commit-block-color;
    border: @commit-block-border-color 1px solid;
    border-radius: .2em;
    position: relative;
    display: flex;
    align-items: center;

    i {
        font-size: 12px;
        position: absolute;
        right: 6px;
    }

    >span {
        font-size: 12px;
        display: inline-block;
        user-select: none;
        padding-left: 10px;
    }

    .list {
        width: 100%;
        background-color: @commit-block-color;
        border: @commit-block-border-color 1px solid;
        position: absolute;
        top: 25px;
        border-bottom-left-radius: .2em;
        border-bottom-right-radius: .2em;
        z-index: 10;
        .list-item {
            width: calc(100% - 6px);
            font-size: 12px;
            height: 25px;
            cursor: pointer;
            text-indent: 12px;
            line-height: 25px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            &:hover {
                background-color: @left-click-color;
            }
        }
    }
}
.dropdown-oneself{
    background-color: rgb(58,58,58);
    border: rgb(39,39,39) 1px solid;
}
</style>