<template>
    <span @click="go" :class="{'span-singer-null':id == 0}" v-html="name"></span>
    <span v-if="index !== singerLen" class="gang">/</span>
</template>

<script lang="ts" setup>
import { useRouter } from 'vue-router';
import { useMain } from '@renderer/store';
const Main = useMain()
const $router = useRouter()
const props = defineProps<{
    index:any,
    name:any,
    singerLen:any,
    id:number
}>()
const go = ()=>{
    if(props.id != 0){
        Main.detailStatus = 'close'
        $router.push({
            name:'SongHand',
            query:{
                id:props.id
            }
        })
    }

}
</script>

<style lang="less" scoped>
    .span-singer-null{
        &:hover{
            color: @small-can-click !important;
        }
    }
</style>