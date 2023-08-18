<template>
    <div class="loading" v-if="loadingFlag">大牛马音乐</div>
</template>

<script setup lang="ts">
import {ref} from 'vue'
const loadingFlag = ref(true)
</script>

<style scoped lang="less">
.loading{
    width: 100vw;
    height: 50vh;
    background-color: @other-bk-color;
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 13;
    position: absolute;
    font-size: 50px;
    color: @font-color;
    font-family: '方正准圆简体';
    user-select: none;
    letter-spacing:10px

}
</style>