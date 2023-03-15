<template>
    <span v-html="name"></span>
    <span v-if="index !== singerLen" class="gang">/</span>
</template>

<script lang="ts" setup>
    defineProps<{
        index:any,
        name:any,
        singerLen:any
    }>()
</script>

<style lang="less" scoped>

</style>