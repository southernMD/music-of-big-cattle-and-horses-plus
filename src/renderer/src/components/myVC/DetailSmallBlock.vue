<template>
    <div class="block" @click="gotoDetail">
        <el-image draggable="false" :noresize="true" style="width: 30px; height: 30px" :src="url" fit="cover"></el-image>
        <span>{{message}}</span>
    </div>
</template>

<script lang='ts' setup>
import {computed, toRef,ref,getCurrentInstance,ComponentInternalInstance} from 'vue'
import {useMain} from '@renderer/store/index'
import { useRouter } from 'vue-router';
const $router = useRouter()
const $el = getCurrentInstance() as ComponentInternalInstance
const Main = useMain()
defineProps<{
    url:string;
    id:number;
    name:string
    privilege?:any;
    artists?:[any];
    type:string;
}>()

let playingId = toRef(Main,'playing');
let playingindex = toRef(Main,'playingindex');
let playListId = toRef(Main,'beforePlayListId');
let playingList = toRef(Main,'playingList');
let playingPrivileges = toRef(Main,'playingPrivileges');
let detailStatus = toRef(Main, "detailStatus");

let message = computed<string>(()=>{
    if($el.props){
        if($el.props.type == 'playList')return $el.props.name as unknown as string
        else if($el.props.type == 'song'){
            let str:string='';
            let arr:[any] = $el.props.artists as unknown as [any]
            str+= $el.props.name+ ' -'
            arr.forEach((obj)=>{
                str+=' ' +obj.name
            })
            return str
        }else return ''
    }else{
        return ''
    }
})

let flag = ref(true)
const gotoDetail = async()=>{
    if($el.props.type == 'song' && flag.value){
        flag.value = false;
        let t = setTimeout(()=>{
            flag.value = true
            clearTimeout(t);
        },1000)
        playingId.value = $el.props.id as unknown as number
        // playingList.value.splice(playingindex.value - 1,0,'d')
        let result = (await Main.reqSongDetail([playingId.value])).data;
        playingList.value.splice(playingindex.value,0,result.songs[0])
        playingPrivileges.value.splice(playingindex.value,0,result.privileges[0])
        playingindex.value++;
        Main.beforePlayListId = -1
        Main.playStatus = 'play'
    }else if($el.props.type == 'playList' && flag.value){
        flag.value = false;
        let t = setTimeout(()=>{
            flag.value = true
            clearTimeout(t);
        },1000)
        detailStatus.value = 'close'
        $router.push({
            name:'songPlaylist',
            query:{
                id:$el.props.id as number,my:'false',type:'歌单'
            }
        })
    }

}


</script>

<style lang='less' scoped>

.block{
    height: 40px;
    width: 200px;
    margin: 10px 0px;
    display: flex;
    align-items: center;
    :deep(.el-image){
        margin-left: 5px;
        user-select: none;
        img{
            border-radius: 0.3em;
        }
    }
    >span{
        font-size: 13px;
        margin-left: 5px;
        width: calc(100% - 10px - 40px);
        white-space: nowrap;
        overflow: hidden;
        color: @font-color;
        font-weight: normal;
        text-overflow: ellipsis;
        user-select: none;
    }
    &:hover{
        background-color: @span-color-hover;
    }
    &:hover >span{
        color:@font-color-hover !important;
    }
}
</style>