<template>
    <div v-html="name"></div>
    <span v-if="Len" v-html="`(${tns})`"></span>
</template>

<script setup lang="ts">
    defineProps<{
        name:any,
        tns:any,
        Len:any
    }>()
</script>

<style lang="less" scoped>
    div{
        display: inline;
    }
    span{
        padding-left: 5px;
    }
</style>