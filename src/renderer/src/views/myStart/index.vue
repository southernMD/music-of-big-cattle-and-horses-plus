<template>
  <div class="myStart">
    <div class="tags">
        <Tag class="tag-play" :oneself="1" message="专辑" :ifClick="flagList[0]" :big="true" @click="go(0,'startAl')"></Tag>
        <Tag class="tag-play" :oneself="1" message="歌手" :ifClick="flagList[1]" :big="true" @click="go(1,'startHS')"></Tag>
    </div>
    <router-view v-slot="{ Component }">
        <keep-alive>
            <component :is="Component" />
        </keep-alive>
    </router-view>
  </div>
</template>

<script setup lang="ts">
import Tag from '@renderer/components/myVC/Tag.vue';
import { useRouter,useRoute } from 'vue-router';
import {ref,Ref} from 'vue'
const flagList:Ref<boolean[]> = ref([])
const $router = useRouter()
const $route = useRoute()
if($route.name == 'startAl'){
    flagList.value = [true,false]
}else if($route.name == 'startHS'){
    flagList.value = [false,true]
}
const go = (index,name)=>{
    flagList.value.fill(false)
    flagList.value[index] = true
    $router.push({
        name:name,
    })
}
</script>

<style scoped lang="less">
.myStart{
    margin: 20px 20px;
    .tags{
        display: flex;
        >.tag-play{
            margin-right: 20px;
        }
    }
}

</style>