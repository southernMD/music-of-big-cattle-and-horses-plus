<template>
  <div class="PersonalRecord">
    <div class="title">{{$route.query.id == BasicApi.profile!.userId?'我':$route.query.name}}的听歌排行</div>
    <div class="tips">
        <div class="tip" :class="{active:flag}" @click="flag = true">最近一周</div>
        <div class="tip" :class="{active:!flag}" @click="flag = false">所有时间</div>
    </div>
    <div class="record-list" id="record-list" v-show="listLength!=0">
        <LineMusic v-for="(value, index) in list" :index="index + 1"
            :title="list[index]?.name || ''" 
            :singer="list[index]?.ar || ['']"
            :id="list[index]?.id || 0" :tns="list[index]?.tns" :alia="list[index]?.alia"
            :key="list[index]?.id" :show-index="true" :length="listLength" :oneselfColor="true"
            :record="true"
            :count="listCount[index]"
            @recordPlay="recordPlay"
            >
        </LineMusic>
    </div>
    <div class="message" v-show="loadingFlag && !flagError">
        加载中
    </div>
    <div class="message" v-show="flagError">
        该用户未公开内容或无内容
    </div>
    <!-- {{ $route.query.id }} -->
  </div>
</template>

<script setup lang="ts">
import {useRoute} from 'vue-router'
import { useMain,useBasicApi,useGlobalVar,useNM } from '@renderer/store'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'
import {ref,Ref,onMounted,watch} from 'vue'
const $route = useRoute()
const Main = useMain()
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
const NM = useNM()
const flag = ref(true)
const list:Ref<any[]> = ref([])
const listCount:Ref<any[]> = ref([])
const listLength = ref(0)
const flagError = ref(false)
const loadingFlag = ref(true)
onMounted(async()=>{
    try {
        flagError.value = false
        let result 
        loadingFlag.value = true
        if(localStorage.getItem('NMcookie')){
            result = await NM.reqUserRecord(Number(+$route.query.id!),1);
        }else{
            result = await Main.reqUserRecord(Number(+$route.query.id!),1);
        }
        list.value = result.map(item=>item.song)
        listCount.value = result.map(item=>item.playCount)
        listLength.value = list.value.length  
        loadingFlag.value = false
    } catch (error) {
        flagError.value = true
    }

})
watch(flag,async()=>{
    try {
        let result
        listCount.value =[]
        listLength.value = 0
        flagError.value = false
        loadingFlag.value = true
        if(flag.value){
            if(localStorage.getItem('NMcookie')){
                result = await NM.reqUserRecord(Number(+$route.query.id!),1);
            }else{
                result = await Main.reqUserRecord(Number(+$route.query.id!),1);
            }
        }else{
            if(localStorage.getItem('NMcookie')){
                result = await NM.reqUserRecord(Number(+$route.query.id!),0);
            }else{
                result = await Main.reqUserRecord(Number(+$route.query.id!),0);
            }
        }
        list.value = result.map(item=>item.song)
        listCount.value = result.map(item=>item.playCount)
        listLength.value = list.value.length  
        loadingFlag.value = false
    } catch (error) {
        flagError.value = true
    }

})
const recordPlay = ({index,id})=>{
    if(globalVar.setting.playWay){
        Main.playingList = list.value
        Main.playingPrivileges = list.value.map(item=>item.privilege)
        Main.playingindex = index
        Main.beforePlayListId = -5
    }else{
        if(Main.playingindex == -1){
            Main.playingList = list.value.slice(index!-1,index)
            Main.playingPrivileges = [list.value.slice(index!-1,index)[0].privilege]
            Main.playingindex = 1
        }else{
            Main.playingList.splice(Main.playingindex,0,list.value.slice(index!-1,index)) 
            Main.playingPrivileges.splice(Main.playingindex,0,[list.value.slice(index!-1,index)[0].privilege])
            Main.playingindex++
        }
    }
    Main.playing = id
    Main.playStatus = 'play'
    Main.songType = 'song'
}
</script>

<style scoped lang="less">
.PersonalRecord{
    margin: 20px;
    .title{
        font-weight: bolder;
        font-size: 20px;
        margin-bottom: 20px;
    }
    .tips{
        display: flex;
        margin-bottom: 15px;
        .tip{
            margin-right: 30px;
            cursor: pointer;
        }
        .active{
            font-weight: bolder;
        }
    }
    .record-list{
        margin: -20px;
        margin-top: 0;
        :deep(.line-music){
            .song-name{
                width: calc((100% - 110px)*0.9);
                .limit{
                    width: 100%;
                }
            }
        }
    }
    .message{
        font-size: 13px;
        font-weight: bolder;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 300px;
    }
}
</style>