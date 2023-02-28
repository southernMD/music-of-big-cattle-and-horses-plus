<template>
    <div class="playingPointOut" ref="playingPointOut">
        <div class="message">{{message}}</div>
    </div>
</template>

<script lang='ts' setup>
import { getCurrentInstance, onMounted ,ComponentInternalInstance } from 'vue';
const $el = getCurrentInstance() as ComponentInternalInstance 

defineProps<{
    message:string,
}>()

const $emit = defineEmits(['close'])
onMounted(()=>{
   let t = setTimeout(()=>{
        clearTimeout(t)
        $emit('close')
   },1500)
})
</script>

<style lang='less' scoped>
    .playingPointOut{
        user-select: none;
        min-width: 100px;
        height: 25px;
        background-color: @other-bk-color;
        position: fixed;
        z-index: 15;
        right: 10px;
        bottom: 55px;
        display: flex;
        justify-content: center;
        align-items: center;
        border: 1px solid @point-out-border;
        box-shadow: @shadow;
        border-radius: 0.5em;
        .message{
            font-size: 12px;
            color: @small-font-color;
            padding-left: 10px;
            padding-right: 10px;
            :hover{
                color: @small-font-color-hover;
            }
        }
    }
</style>