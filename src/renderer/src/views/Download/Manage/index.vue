<template>
    <div class="manage">
        <div class="check">
            <span @click="go('downloaded')" :class="{active:$route.name == 'downloaded'}">已下载</span>
            <span @click="go('downloading')" :class="{active:$route.name == 'downloading'}">正在下载</span>
        </div>

        <router-view v-slot="{ Component }">
            <keep-alive>
                <component :is="Component" />
            </keep-alive>
        </router-view>
    </div>
</template>

<script setup lang="ts">
import { ref} from 'vue'
import { useRouter,useRoute } from 'vue-router';
const $router = useRouter()
const $route = useRoute()
const go = (name:string)=>{
    $router.push({
        name
    })
}
</script>

<style scoped lang="less">
.check{
    >span{
        cursor: pointer;
        margin: 0 10px 0 10px;
        font-size: 14px;
        user-select: none;
    }
    margin-bottom: 10px;
    .active{
        color: @primary-color;
    }
}
</style>