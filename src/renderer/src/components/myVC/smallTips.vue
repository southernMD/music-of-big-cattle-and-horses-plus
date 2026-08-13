<template>

        <div class="smallTips" ref="smallTips">
            {{message}}
        </div>
</template>

<script lang="ts" setup>
import { onMounted, onUnmounted, watch, ref } from 'vue';

const props = defineProps<{
    message:string
}>()

const smallTips = ref<HTMLElement>()
let time:any

let $emit = defineEmits(['close'])
onMounted(() => {
    let dom = smallTips.value
    if (dom) {
        let father = dom.parentNode as HTMLElement
        father.style.position = 'relative'
    }
    time = setTimeout(()=>{
        $emit('close')
    },1500)
    watch(props,()=>{
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