<template>

        <div class="smallTips" ref="smallTips">
            {{message}}
        </div>
</template>

<script lang="ts" setup>
import { onMounted, getCurrentInstance, ComponentInternalInstance,onUnmounted,Ref,toRef,watch,ref } from 'vue';
let $el = getCurrentInstance() as ComponentInternalInstance
let time:any

defineProps<{
    message:string
}>()


// let tMessage = toRef($el.props,'message')

let $emit = defineEmits(['close'])
onMounted(() => {
    let dom = $el.refs.smallTips as HTMLElement
    let father = dom.parentNode as HTMLElement
    father.style.position = 'relative'
    time = setTimeout(()=>{
        $emit('close')
    },1500)
    watch($el.props,()=>{
        clearTimeout(time)
        time = setTimeout(()=>{
            $emit('close')
        },1500)
    },{ deep: true})
})

onUnmounted(()=>{
    clearTimeout(time)
})
</script>

<style lang="less" scoped>
.smallTips {
    width: 120px;
    height: 30px;
    background-color: @small-tips;
    border-radius: 2em;
    position: absolute;
    top: -40px;
    left: -50px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: default;
    color: @font-color;
    font-size: 14px;
}
</style>