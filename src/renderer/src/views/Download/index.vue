<template>
    <div class="Download">
        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { } from 'vue'
import { useRouter } from 'vue-router';
// const $router = useRouter()
// $router.push({
//     name:'downloaded'
// })

</script>

<style scoped lang="less">
    .Download{
        width: calc(100vw - 200px - 50px);
        height: calc(100vh - 60px - 70px - 40px);
        margin:0px 25px;
    }

</style>