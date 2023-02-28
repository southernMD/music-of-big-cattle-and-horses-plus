<template>
    <div class="floatTag" ref="floatTag" @click="methods">
        <slot></slot>
    </div>
</template>

<script lang='ts' setup>
import { getCurrentInstance, onMounted, ComponentInternalInstance, toRef, watch } from 'vue';
import { useMain } from '@renderer/store';
const Main = useMain()
const $el = getCurrentInstance() as ComponentInternalInstance
defineProps<{
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

const $emit = defineEmits(['write','goToTop'])

const methods = ()=>{
    if($el.props.option == 'write')$emit('write');
    else if($el.props.option == 'goToTop')$emit('goToTop');
}

let detailStatus = toRef(Main, 'detailStatus')



watch(detailStatus, () => {
    if (detailStatus.value === 'open') {
        let dom = $el.refs.floatTag as HTMLElement
        console.log($el.props.align); 
        dom.style.width = String($el.props.width)
        dom.style.height = String($el.props.height)
        dom.style.left = String($el.props.left)
        dom.style.right = String($el.props.right)
        dom.style.bottom = String($el.props.bottom)
        dom.style.top = String($el.props.top)
        dom.style.fontSize = String($el.props.size)
        if ($el.props.align == 'center') {
            dom.style.left = '0px'
            dom.style.right = '0px'
            dom.style.margin = '0 auto';
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