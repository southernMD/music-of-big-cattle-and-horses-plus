<template>
    <div class="p-r">
        <div>
            <EveryDayRecommend></EveryDayRecommend>
            <EveryDayRecommendPlayList></EveryDayRecommendPlayList>
            <RecommendDjSong v-if="false"></RecommendDjSong>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { onActivated,onMounted } from 'vue'
import { useRoute } from 'vue-router';
import EveryDayRecommend from './EveryDayRecommend.vue'
import EveryDayRecommendPlayList from './EveryDayRecommendPlayList.vue'
import RecommendDjSong from './RecommendDjSong/index.vue'
const route = useRoute();
onActivated(()=>{
    console.log(route.fullPath);
})
</script>

<style lang='less' scoped>
:deep(.noDrag) {
    cursor: pointer;
}

.p-r {
    margin-left: 5px;
}
</style>