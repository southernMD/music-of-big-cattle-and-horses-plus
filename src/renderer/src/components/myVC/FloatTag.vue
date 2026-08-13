<template>
    <div class="floatTag" ref="floatTag" @click="methods">
        <slot></slot>
    </div>
</template>

<script lang='ts' setup>
import { onMounted, ref, toRef, watch } from 'vue';
import { useMain } from '@renderer/store';
const Main = useMain()
const props = defineProps<{
    width?: string
    height?: string
    left?: string
    right?: string
    bottom?: string
    top?: string
    align?: string
    size?:string
    option?:string
}>()

const floatTag = ref<HTMLElement>()
const $emit = defineEmits(['write','goToTop'])

const methods = ()=>{
    if(props.option == 'write')$emit('write');
    else if(props.option == 'goToTop')$emit('goToTop');
}

let detailStatus = toRef(Main, 'detailStatus')

watch(detailStatus, () => {
    if (detailStatus.value === 'open') {
        let dom = floatTag.value
        if (dom) {
            console.log(props.align); 
            dom.style.width = String(props.width)
            dom.style.height = String(props.height)
            dom.style.left = String(props.left)
            dom.style.right = String(props.right)
            dom.style.bottom = String(props.bottom)
            dom.style.top = String(props.top)
            dom.style.fontSize = String(props.size)
            if (props.align == 'center') {
                dom.style.left = '0px'
                dom.style.right = '0px'
                dom.style.margin = '0 auto';
            }
        }
    }
})
</script>


<style lang='less' scoped>
.floatTag {
    height: 35px;
    width: 100px;
    position: fixed;
    border-radius: 2em;
    border: 1px solid @split-line-color;
    background-color: @float-tag-bk;
    // background-color: red;
    color: @float-tag-font;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    z-index: 12;

    &:hover {
        background-color: @float-tag-hover;
    }
}
</style>