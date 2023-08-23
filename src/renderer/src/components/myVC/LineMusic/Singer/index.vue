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
    type?:string
}>()
const go = ()=>{
    if(props.id != 0){
        Main.detailStatus = 'close'
        if(props.type != 'DJ'){
            $router.push({
                name:'SongHand',
                query:{
                    id:props.id
                }
            })
        }else{
            $router.push({
                name:'djPlaylist',
                query:{
                    type:'播客',
                    id:props.id,
                    my:'false',
                }
            })
        }

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