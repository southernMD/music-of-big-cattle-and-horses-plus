<template>
    <div class="find-music">
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>

<script lang="ts" setup>

</script>

<style lang="less" scoped>
    .find-music{
        width: calc(100vw - 200px - 50px);
        height: calc(100vh - 60px - 70px - 40px);
        margin:0px 25px;
    }

</style>