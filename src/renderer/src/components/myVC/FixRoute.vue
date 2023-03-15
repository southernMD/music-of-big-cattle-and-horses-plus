<template>
<div></div>
</template>

<script lang="ts" setup>
    import { onMounted } from 'vue';
import {useRoute,useRouter} from 'vue-router'
    const $route = useRoute()
    const $router= useRouter()
    $router.replace({
        path:String($route.query.path)
    })
    onMounted(()=>{
        console.log($route.query);
    })
</script>

<style lang="less" scoped>

</style>