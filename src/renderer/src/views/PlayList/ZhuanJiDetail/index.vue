<template>
  <div class="ZhuanJiDetail">
    <div class="title">专辑介绍</div>
    <div class="msg" v-html="String('&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + $route.meta.detail).replaceAll(/\n+/g, '\n').replaceAll(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;') ">
    </div>
  </div>
</template>

<script setup lang="ts">
import {} from 'vue'
</script>

<style scoped lang="less">
.ZhuanJiDetail{
    width: 80%;
    height: 400px;
    padding: 20px 20px;
    padding-top: 0;
    .title{
        color: @font-color;
        font-weight: bolder;
        padding-bottom: 20px;
    }
    .msg{
        font-size: 15px;
        line-height: 30px;
        color: @small-font-color;
    }
}
</style>