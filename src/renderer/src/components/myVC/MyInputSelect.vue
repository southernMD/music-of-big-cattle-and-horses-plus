<template>
    <div class="inputSelect">
        <MyInput ref="myInputRef" :width="props.width" @search="addOption" @focus="focus" @blur="blur()" v-model="searchInputC" :placeholder="placeholder">
            <template #suffix>
                <slot name="prefix">
                    <i :class="{ 'icon-focus': iconStatus }" class="iconfont icon-xiangxiajiantou icon"></i>
                </slot>
            </template>
        </MyInput>
        <div class="inputSelect-list" @click.stop v-show="listFlag" ref="listRef" :style="{height:props.itemHeight}">
            <el-scrollbar>
                <div class="list-item" @click="choiceItem(val)" v-for="val,index in optionsC ">{{ val.label }}</div>
            </el-scrollbar>
        </div>
    </div>
</template>
<script setup lang="ts">
import { videoFolder } from '@renderer/views/video';
import { nextTick, ref, watch } from 'vue'
const props = defineProps({
    modelValue: {
        type: [String, Number],
        default: ''
    },
    placeholder: {
        type: String,
        default: ''
    },
    width:{
        type: String,
        default: '100%'
    },
    itemHeight:{
        type: String,
        default: "100px"
    },
    options: {
        type: Array<videoFolder>,
        default: () => []
    },
    updateOptions:{
        type:Function,
        default:async()=>{}
    }
})

const optionsC = ref(props.options)
const iconStatus = ref(false);
const listFlag = ref(false)

const listRef = ref()
let timer:NodeJS.Timeout | undefined
const blur = () => {
    iconStatus.value = false;
    timer = setTimeout(() => {
        const val = props.options.find(item=>item.label == searchInputC.value)?.value
        $emit('update:modelValue',val );
        listFlag.value = false
        clearTimeout(timer)
    }, 100);
}

const focus = () => {
    iconStatus.value = true;
    listFlag.value = true
    
}
const searchInputC = ref(props.options.find(item=>item.value ==  props.modelValue)?.label)
watch(() => props.modelValue, () => {
    searchInputC.value = props.options.find(item=>item.value ==  props.modelValue)?.label
})
watch(() => props.options, () => {
    optionsC.value = props.options
},{deep:true})

watch(()=>searchInputC.value,()=>{
    if(searchInputC.value?.trim().length == 0 || searchInputC.value == undefined){
        optionsC.value = props.options
    }else{
        optionsC.value = props.options.filter(item=>item.label.includes(searchInputC.value!))
    }
    // $emit('update:modelValue',undefined );
})
const $emit = defineEmits(['update:modelValue'])
const choiceItem = (val: videoFolder) => {
    event?.stopPropagation() 
    searchInputC.value = val.label;
    $emit('update:modelValue', val.value);
    listFlag.value = false
    // iconStatus.value = false;
}

const myInputRef = ref()

const addOption = async()=>{
    if(searchInputC.value && searchInputC.value?.length != 0 && optionsC.value.length == 0){
        const num = await props.updateOptions(searchInputC.value!)
        // const num = Math.floor(Math.random() * 1000).toString()
        props.options.push({value:num,label:searchInputC.value!})
        optionsC.value.push({value:num,label:searchInputC.value!})
        //让input失去焦点
        myInputRef.value.$refs.searchInputRef!.input!.blur()
        $emit('update:modelValue', num);
    }else{
        searchInputC.value = optionsC.value[0].label
        myInputRef.value.$refs.searchInputRef!.input!.blur()
    }
}
</script>

<style scoped lang="less">
.inputSelect {
    position: relative;
    width: 100%;
    .inputSelect-list {
        width: 100%;
        background-color: @commit-block-color;
        border: @split-line-color 1px solid;
        position: absolute;
        top: 100%;
        left: 0;
        border-bottom-left-radius: .2em;
        border-bottom-right-radius: .2em;
        z-index: 10;
        margin-left: 0px;

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
            color:@font-color;
            &:hover {
                background-color: @left-click-color;
            }
        }
    }
}

.icon {
    font-size: 12px;
    transition: transform .3s;
}

.icon-focus {
    transform: rotate(180deg);
}
</style>