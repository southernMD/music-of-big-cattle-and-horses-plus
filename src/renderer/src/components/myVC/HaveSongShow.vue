<template>
  <div class="HaveSongShow">
    <div class="left" >
        <el-image :data-id="id" 
        :data-type="dataType" 
        data-right="1"
        :data-pic="url"
        :data-txt="dataTxt"
         @click="go" draggable="false" :src="url" style="width: 150px; height: 150px"></el-image>
        <div v-if="time && type == 'songHand' ">{{dayjsStamp(time!)}}</div>
    </div>
    <div class="right">
        <div class="title">
            <span @click.stop="go">{{ title }}</span>
            <i class="iconfont icon-gf-play" @click.stop="playAll"></i>
        </div>
        <div class="list record-list" id="record-list" v-if="id == -5">
            <LineMusic v-if="!Recorderror" v-for="(value, index) in list" :index="index + 1"
                :title="list[index]?.name || ''" 
                :singer="list[index]?.ar || ['']"
                :zhuanji="list[index]?.al"
                :id="list[index]?.id || 0" :tns="list[index]?.tns" :alia="list[index]?.alia"
                :key="list[index]?.id" :show-index="true" :length="10" :oneselfColor="true"
                :record="true"
                :count="listCount[index]"
                @recordPlay="recordPlay"
                :dataType="props.uid == BasicApi.profile!.userId && props.id != -5?'songMy':'song'"
                >
            </LineMusic>
            <div class="message" v-else>该用户未公开内容或无内容</div>
            <!-- @recordPlay="recordPlay" -->
        </div>
        <div class="list short-play-list" id="short-play-list" v-else>
            <LineMusic v-for="(value, index) in list" :index="index + 1"
                :title="list[index]?.name || ''" 
                :singer="list[index]?.ar || ['']"
                :time="list[index]?.dt || 0"
                :zhuanji="list[index]?.al"
                :id="list[index]?.id || 0" :tns="list[index]?.tns" :alia="list[index]?.alia"
                :key="list[index]?.id" :show-index="true" :length="10" :oneselfColor="true"
                :onlyTime="true"
                @shorPlayList="shorPlayList"
                :dataType="props.uid == BasicApi.profile!.userId && props.id != -5?'songMy':'song'"
                >
            </LineMusic>
        </div>
        <div class="bt" v-if="Num > 10 && flag">
            <div @click.stop="go">查看全部{{Num}}首></div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {Ref,onMounted,ref, watch,computed } from 'vue'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue';
import { dayjsStamp } from '@renderer/utils/dayjs';
import { useMain,useBasicApi ,useGlobalVar} from '@renderer/store';
import { useRoute } from 'vue-router';
const globalVar = useGlobalVar()
const $route = useRoute()
const Main = useMain()
const BasicApi = useBasicApi()
const size = ref(0)
const $emit = defineEmits(['playAll','go'])
const flag = ref(true)
const change = async()=>{
    if(props.id == -5){
        try {
            Recorderror.value = false
            const result = await Main.reqUserRecord(props.uid,1);
            list.value = result.map(item=>item.song).splice(0,10)
            listCount.value = result.map(item=>item.playCount).splice(0,10)
        } catch (error) {
            Recorderror.value = true
        }
    }else if(props.id == -6){
        list.value = props.list_6!.slice(0,10)
        size.value = props.list_6!.length
        flag.value = true
    }else {
        let result
        if(props.type == 'playList'){
            result = (await Main.reqPlaylistTrackAll(props.id,10)).data
            list.value = result.songs
        }
        else if(props.type == 'songHand'){
            result = (await Main.reqAlbumTrackAll(props.id)).data
            list.value = result.songs.slice(0,10)
            size.value = result.songs.length
        }
    }
}
onMounted(async()=>{
    change()
})
const props = defineProps<{
    url:string
    title:string
    id:number
    uid:number
    index:number
    time?:number
    num?:number
    type:'songHand' | 'playList'
    list_6?:any[]
    dataType:string
}>()
watch(()=>props.id,async()=>{
    change()
})
const list:Ref<any[]> = ref([])
const listCount:Ref<any[]> = ref([])
const Num = computed(()=>{
    if(props.type == 'playList'){
        if(props.uid == BasicApi.profile!.userId){
            if(props.index == undefined)return 100
            else{
                let num = Main.playList[props.index].trackCount
                return num
            }
        }else{
            return props.num
        }
    }else if(props.type == 'songHand'){
        return size.value
    }

})
const playAll = ()=>{
    $emit('playAll',props.id)
}
const go = ()=>{
    if(props.id != -6){
        $emit('go',{id:props.id,index:props.index,uid:props.uid})
    }else{
        list.value = props.list_6!
        flag.value = false
    }
}

watch(()=>props.list_6!,()=>{
    list.value = props.list_6!.slice(0,10)
})
const Recorderror = ref(false)
watch(()=>props.uid,async()=>{
    if(props.id == -5){
        try {
            Recorderror.value = false
            const result = await Main.reqUserRecord(props.uid,1);
            list.value = result.map(item=>item.song).splice(0,10)
            listCount.value = result.map(item=>item.playCount).splice(0,10)
        } catch (error) {
            Recorderror.value = true
        }
    }
})

const recordPlay = ({index,id})=>{
    Main.playingList = list.value
    Main.playingPrivileges = list.value.map(item=>item.privilege)
    Main.playingindex = index
    Main.playStatus = 'play'
    Main.songType = 'song'
    Main.playing = id
    Main.beforePlayListId = -5
}
const shorPlayList = async({index,id})=>{
    if(props.id == -6){
        if(globalVar.setting.playWay){
            Main.playingList = props.list_6!
            Main.playingPrivileges = props.list_6!.map(item=>item.privilege)
            Main.playingindex = index
            Main.beforePlayListId = props.id
        }else{
            if(Main.playingindex == -1){
                Main.playingList = props.list_6!.slice(index!-1,index)
                Main.playingPrivileges = [props.list_6!.slice(props.index!-1,props.index)[0].privilege]
                Main.playingindex = 1
            }else{
                Main.playingList.splice(Main.playingindex,0,...props.list_6!.slice(props.index!-1,props.index)) 
                Main.playingPrivileges.splice(Main.playingindex,0,...[props.list_6!.slice(props.index!-1,props.index)[0].privilege])
                Main.playingindex++
            }
        }
    }else{
        if(globalVar.setting.playWay){
            let result
            if(props.type == 'playList'){
                result = (await Main.reqPlaylistTrackAll(props.id)).data
                Main.playingPrivileges = result.privileges
            }else if(props.type == 'songHand'){
                result = (await Main.reqAlbumTrackAll(props.id)).data
                Main.playingPrivileges = result.songs.map(item=>item.privilege)
            }
            Main.playingindex = index
            Main.playingList = result.songs
            Main.beforePlayListId = props.id
        }else{
            let result = (await Main.reqSongDetail([props.id])).data
            if(Main.playingindex == -1){
                Main.playingList = result.songs
                Main.playingPrivileges = result.privileges
                Main.playingindex = 1
            }else{
                Main.playingList.splice(Main.playingindex,0,...result.songs) 
                Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                Main.playingindex++
            }
        }
    }
    Main.playing = id
    Main.playStatus = 'play'
    Main.songType = 'song'
}
const dataTxt = ref('')
watch(()=>props.type,()=>{
    if( props.type == 'songHand'){
        dataTxt.value = `专辑：${props.title} - ${$route.query.name}`
    }else if(props.type == 'playList'){
        dataTxt.value = `歌单：${props.title} by ${$route.query.name}`
    }
},{immediate:true})
</script>

<style scoped lang="less">
.HaveSongShow{
    width: 100%;
    user-select: none;
    display: flex;
    .left{
        width: 210px;
        height: auto;
        :deep(.el-image){
            user-select: none;
            border-radius: .2em;
            cursor: pointer;
        }
        >div{
            color: @small-font-color;
            font-size: 11px;
            margin-top: 5px;
        }
    }
    .right{
        // background-color: red;
        width: calc(100% - 210px);
        .title{
            width: 100%;
            height: 30px;
            font-size: 16px;
            font-weight: bolder;
            span{
                display: inline-block;
                text-overflow: ellipsis;
                max-width: 90%;
                white-space: nowrap;
                overflow: hidden;
                cursor: pointer;
                &:hover{
                    color: @font-color-hover;
                }
            }
            i{
                color: @small-font-color;
                cursor: pointer;
                font-size: 10px;
                border: 1px solid @small-font-color;
                border-radius: 2em;
                padding: 4px;
                margin-left: 35px;
                position: relative;
                top: -5px;
                &:hover{
                    color: @small-font-color-hover;
                    border: 1px solid @small-font-color-hover;
                }
            }
        }
        .list{
            :deep(.line-music){
                width: 100%;
                .song-name{
                    width: 80%;
                }
                .time{
                    margin-right:10px;
                }
                .count{
                    min-width: 50px;
                }
            }
            .message{
                font-size: 13px;
                font-weight: bolder;
            }
        }

        .bt{
            height: 30px;
            font-size: 12px;
            color: @small-font-color;
            background-color: @commit-block-color;
            display: flex;
            align-items: center;
            justify-content: end;
            >div{
                cursor: pointer;
                margin-right: 5px;
                &:hover{
                    color:@small-font-color-hover;
                }
            }
        }
    }
}
</style>