<template>

  <div class="rightBlock" ref="rightBlockRef" v-show="flag && rightFlag">
    <div class="list">
        <div class="op" @mouseenter="messageList[index].endsWith('收藏') && ((type.startsWith('song') && ! type.startsWith('songHand'))|| type == 'shareSong' || type == 'FM' || type == 'top50')?showStartList():hideStartList()" 
        @click="eventsHandle[index].bind(null,params[index])()"  
        v-for="val,index in eventLength"  :class="{'op-border':ifBorderBottom[index]}" 
        >
            <div class="icon">
                <i class="iconfont" :class="[iconList[index]]"></i>
            </div>
            <div class="msg">{{ messageList[index] }}</div>
            <div class="i" v-if="messageList[index].endsWith('收藏') && ((type.startsWith('song') && ! type.startsWith('songHand'))|| type == 'shareSong' || type == 'FM' || type == 'top50')">
                <i class="iconfont icon-youjiantou"></i>
            </div>
            <div class="list-start" id="listStartRef" @mouseenter.stop  v-show="flagStart" v-if="messageList[index].endsWith('收藏') && ((type.startsWith('song') && ! type.startsWith('songHand'))|| type == 'shareSong' || type == 'FM' || type == 'top50')">
                <el-scrollbar>
                    <div class="op op-border" @click="create()">
                        <div class="icon">
                            <i class="iconfont icon-zengjia" ></i>
                        </div>
                        <div class="msg">创建新歌单</div>
                    </div>
                    <div class="op" @click="pushInto(index,val.id)"  v-for="val,index in Main.playList.slice(0,Main.createPlay + 1)">
                        <div class="icon">
                            <i class="iconfont" :class="{
                                'icon-suoding_o':val.privacy == 10,
                                'icon-icon--':val.privacy != 10
                            }"></i>
                        </div>
                        <div class="msg">{{ index == 0 ?'我喜欢的音乐':val.name }}</div>
                    </div>
                </el-scrollbar>
            </div>
        </div>
    </div>
  </div>

</template>

<script setup lang="ts">
import { watch,watchEffect,ref, nextTick,Ref, inject, ShallowRef, toRef, computed } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { useMain ,useGlobalVar,useBasicApi,useNM} from '@renderer/store'
import Loading from '@renderer/ImperativeComponents/Loading/Loading'
const Main = useMain()
const NM = useNM()
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
const $router = useRouter()
const $route = useRoute()
const flagStart = ref(false)

const props = defineProps<{
    left:number
    top:number
    rightFlag:boolean
    type:string
    id:string
    index:string | null | undefined
    shareTxt:string | null | undefined
    shareAvg:string | null | undefined
    download:boolean | null | undefined
    path:string | null | undefined
    commentType:string | null | undefined
    evid:string | null | undefined
    djName:string | null | undefined
    djId:string | null | undefined
    djprogramid:string | null | undefined
    djprogramName:string | null | undefined
    radioid:string | null | undefined
    videoFolderId:string | null | undefined
    videoFolder:string | null | undefined
    
}>()

const flag = ref(false)
const rightBlockRef = ref<InstanceType<typeof HTMLElement>>()
watchEffect(()=>{
    flagStart.value = false
    if(rightBlockRef.value){
        flag.value = false
        rightBlockRef.value!.style.left = props.left + 10 + 'px'
        rightBlockRef.value!.style.top = props.top + 10 + 'px'
        nextTick(()=>{
            let {height,top,bottom,right,left,width}= rightBlockRef.value!.getBoundingClientRect();
            console.log(top,bottom);
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const visibleHeight = Math.min(bottom, windowHeight-70) - Math.max(top, 0);
            const visibleWidth = Math.min(right, windowWidth) - Math.max(left, 0);
            console.log(visibleHeight,visibleWidth);
            if(visibleHeight < height){
                rightBlockRef.value!.style.top = props.top - height - 10 + 'px'
            }
            if(visibleWidth < width){
                rightBlockRef.value!.style.left = props.left - width - 10 + 'px'
            }
            // rightBlockRef.value!.innerText = new Date().getTime() + '' 
        })
        flag.value = true
    }
})
const eventsHandle = ref([]) as Ref<Function[]> //事件
const eventLength = ref(0)  //长度
const ifBorderBottom = ref([]) as Ref<boolean[]>  //下划线
const messageList = ref([])as Ref<string[]>  //文字
const iconList = ref([])as Ref<string[]>  //前icon
const params = ref([]) as Ref<any[]>//参数
const more = ref([])as Ref<boolean[]> //更多
watch(()=>props.type,()=>{
    buildList()
})
watch(()=>props.id,()=>{
    buildList()
})

const buildList = ()=>{
    eventsHandle.value = []
    eventLength.value = 0
    ifBorderBottom.value = []
    messageList.value = []
    params.value = []
    iconList.value = []
    more.value = []
    console.log(props.type);
    if(props.type.startsWith('playList')){
        messageList.value.push(...['查看','播放','下一首播放','分享','下载'])
        ifBorderBottom.value.push(...[false,false,true,false,true])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-fenxiang1','icon-xiazai1'])
        params.value.push(...[props.id,props.id,props.id,props.id,props.id,props.id])
        eventsHandle.value.push(...[look,play,nextPlay,share,dowloadAll])
        if(props.type == 'playListMy'){
            messageList.value.push(...['编辑歌单信息','删除歌单'])
            ifBorderBottom.value.push(...[false,false])
            iconList.value.push(...['icon-bianji1','icon-lajixiang'])
            eventsHandle.value.push(...[gotoUpdatePlayList,delPlayList])
            params.value.push(...[props.id,props.id])
        }else if(props.type == 'playListLike'){
            ifBorderBottom.value[4] = false
        }else if(props.type == 'playListStart'){
            messageList.value.push(...['删除歌单'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
            eventsHandle.value.push(...[delPlayList])
            params.value.push(...[props.id])
        }else if(props.type == 'playListRank'){
            messageList.value.splice(3,2)
            ifBorderBottom.value.splice(3,2)
            iconList.value.splice(3,2)
            ifBorderBottom.value[2] = false
        }else if(props.type == 'playListSearchMy'){
            messageList.value.push(...['编辑歌单信息'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-bianji1'])
            eventsHandle.value.push(...[gotoUpdatePlayList])
            params.value.push(...[props.id])
        }else{
            messageList.value.splice(3,0,'收藏')
            ifBorderBottom.value.splice(3,0,false)
            iconList.value.splice(3,0,'icon-tianjiawenjian')
            params.value.splice(3,0,props.id)
            eventsHandle.value.splice(3,0,start)
            ifBorderBottom.value[5]=false
        }
    }else if(props.type == 'commentMy'){
        messageList.value.push(...['删除'])
        ifBorderBottom.value.push(...[false])
        iconList.value.push(...['icon-lajixiang'])
        eventsHandle.value.push(...[delComment])
        params.value.push(...[props.id])
    }else if(props.type.startsWith('songHand')){
        messageList.value.push(...['查看'])
        ifBorderBottom.value.push(...[true])
        iconList.value.push(...['icon-chakan'])
        params.value.push(...[props.id])
        eventsHandle.value.push(...[look])
        if(props.type == 'songHand'){
            messageList.value.push(...['收藏'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-tianjiawenjian'])
            params.value.push(...[props.id])
            eventsHandle.value.push(...[start])
        }else{
            messageList.value.push(...['删除'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
            params.value.push(...[props.id])
            eventsHandle.value.push(...[delstart])
        }
    }else if(props.type.startsWith('al')){
        messageList.value.push(...['查看专辑','播放','下一首播放','分享','下载全部'])
        ifBorderBottom.value.push(...[false,false,true,false,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-fenxiang1','icon-xiazai1'])
        params.value.push(...[props.id,props.id,props.id,props.id,props.id])
        eventsHandle.value.push(...[look,play,nextPlay,share,dowloadAll])
        if(props.type == 'al'){
            messageList.value.splice(3,0,'收藏专辑')
            ifBorderBottom.value.splice(3,0,false)
            iconList.value.splice(3,0,'icon-tianjiawenjian')
            params.value.splice(3,0,props.id)
            eventsHandle.value.splice(3,0,start)
        }else{
            ifBorderBottom.value[4] = true
            messageList.value.push('删除专辑')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-lajixiang')
            params.value.push(props.id)
            eventsHandle.value.push(delstart)
        }
    }else if(props.type == 'user'){
        messageList.value.push('查看用户')
        ifBorderBottom.value.push(false)
        iconList.value.push('icon-chakan')
        params.value.push(props.id)
        eventsHandle.value.push(look)
    }else if(props.type.startsWith('share')){
        if(props.type == 'shareMy'){
            messageList.value = ['删除']
            ifBorderBottom.value =[false]
            iconList.value = ['icon-lajixiang']
            params.value.push(...[props.evid])
            eventsHandle.value.push(...[delev])
        }else if(!props.type.startsWith('shareAr')){
            messageList.value.push(...['播放','下一首播放'])
            ifBorderBottom.value.push(...[false,false])
            iconList.value.push(...['icon-bofang_o','icon-nextplay'])
            params.value.push(...[props.id,props.id])
            eventsHandle.value.push(...[play,nextPlay])
        }
        if(props.type.endsWith('My') && props.type != 'shareMy'){
            ifBorderBottom.value[1] = true
            messageList.value.push(...['删除'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
            params.value.push(...[props.evid])
            eventsHandle.value.push(...[delev])
        }
    }else if(props.type == 'top50'){
        messageList.value.push(...['播放','下一首播放','全部收藏'])
        ifBorderBottom.value.push(...[false,false,false])
        iconList.value.push(...['icon-bofang_o','icon-nextplay','icon-tianjiawenjian'])
        params.value.push(...[])
        eventsHandle.value.push(...[play,nextPlay,function(){}])
    }else if(props.type == 'FM'){
        messageList.value.push(...['收藏','分享','下载'])
        ifBorderBottom.value.push(...[false,false,false])
        iconList.value.push(...['icon-tianjiawenjian','icon-fenxiang1','icon-xiazai1'])
        params.value.push(...[props.id,props.id,props.id])
        eventsHandle.value.push(...[function(){},share,download])
    }else if(props.type == 'songDownload'){
        messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享','打开文件所在目录','删除下载'])
        ifBorderBottom.value.push(...[false,false,true,false,false,true,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1','icon-wenjian','icon-lajixiang'])
        params.value.push(...[props.id,props.index,props.index,props.id,props.id,props.path,props.path])
        eventsHandle.value.push(...[look,play,nextPlay,function(){},share,openFile,delDownload])
    }else if(props.type.startsWith('songLocal')){
        if(props.type.endsWith('nor')){
            messageList.value.push(...['播放','下一首播放','打开文件所在目录','删除下载'])
            iconList.value.push(...['icon-bofang_o','icon-nextplay','icon-wenjian','icon-lajixiang'])
            ifBorderBottom.value.push(...[false,true,true,false])
            params.value.push(...[props.index,props.index,props.path,props.path])
            eventsHandle.value.push(...[play,nextPlay,openFile,delDownload])
        }else{
            messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享','打开文件所在目录','删除下载'])
            ifBorderBottom.value.push(...[false,false,true,false,false,true,false])
            iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1','icon-wenjian','icon-lajixiang'])
            params.value.push(...[props.id,props.index,props.index,props.id,props.id,props.path,props.path])
            eventsHandle.value.push(...[look,play,nextPlay,function(){},share,openFile,delDownload])
        }
    }else if(props.type.startsWith('songPanel')){
        if(props.type.endsWith('nor')){
            messageList.value.push(...['播放'])
            ifBorderBottom.value.push(...[true])
            iconList.value.push(...['icon-bofang_o'])
            params.value.push(...[props.id])
            eventsHandle.value.push(...[play])
            messageList.value.push('打开文件所在目录','从列表中删除')
            ifBorderBottom.value.push(...[true,false])
            iconList.value.push(...['icon-wenjian','icon-lajixiang'])
            eventsHandle.value.push(openFile,deleteFromList)
            params.value.push(...[props.path,props.index])
        }else{
            messageList.value.push(...['查看评论','播放'])
            ifBorderBottom.value.push(...[false,true])
            iconList.value.push(...['icon-chakan','icon-bofang_o'])
            params.value.push(...[props.id,props.id])
            eventsHandle.value.push(...[look,play])
            if(props.type.endsWith('Local')){
                messageList.value.push(...['收藏','分享','打开文件所在目录','从列表中删除'])
                ifBorderBottom.value.push(...[false,false,true,false])
                iconList.value.push(...['icon-tianjiawenjian','icon-fenxiang1','icon-wenjian','icon-lajixiang'])
                eventsHandle.value.push(...[function(){},share,openFile,deleteFromList])
                params.value.push(...[props.id,props.id,props.path,props.index])
            }else if(props.type.endsWith('DJ')){
                messageList.value.push(...[`主播：${props.djName}`,`来自：${props.djprogramName}`,'分享'])
                ifBorderBottom.value.push(...[false,true,false])
                iconList.value.push(...['icon-gerenzhongxin-wodexinxi','icon-relevance','icon-fenxiang1'])
                eventsHandle.value.push(...[DJPersonalpage,DJprogrampage,share])
                params.value.push(...[props.djId,props.radioid,props.djprogramid])
                if(props.type.includes('Local')){
                    messageList.value.push(...['打开文件所在目录'])
                    ifBorderBottom.value.push(...[true])
                    iconList.value.push(...['icon-wenjian'])
                    eventsHandle.value.push(...[openFile])
                    params.value.push(...[props.path])
                }else{
                    messageList.value.push(...['下载'])
                    ifBorderBottom.value.push(...[true])
                    iconList.value.push(...['icon-xiazai1'])
                    eventsHandle.value.push(...[download])
                    params.value.push(...[props.id])
                }
                messageList.value.push('从列表中删除')
                ifBorderBottom.value.push(false)
                iconList.value.push('icon-lajixiang')
                params.value.push(props.index)
                eventsHandle.value.push(deleteFromList)
            }else{
                messageList.value.push(...['收藏','分享','下载','从列表中删除'])
                ifBorderBottom.value.push(...[false,false,true,false])
                iconList.value.push(...['icon-tianjiawenjian','icon-fenxiang1','icon-xiazai1','icon-lajixiang'])
                eventsHandle.value.push(...[function(){},share,download,deleteFromList])
                params.value.push(...[props.id,props.id,props.id,props.index])
            }
        }
    }else if(props.type.startsWith('song')){
        messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享'])
        ifBorderBottom.value.push(...[false,false,true,false,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1'])
        params.value.push(...[props.id,props.id,props.id,props.id,props.id])
        eventsHandle.value.push(...[look,play,nextPlay,function(){},share])
        console.log(globalVar.downloadId,props.id);
        console.log(props.download);
        if(props.download){
            messageList.value.push('打开文件所在目录')
            ifBorderBottom.value.push(false)
            iconList.value.push(...['icon-wenjian'])
            eventsHandle.value.push(openFile)
            params.value.push(props.path)
        }else{
            messageList.value.push('下载')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-xiazai1')
            params.value.push(props.id)
            eventsHandle.value.push(download)
        }
        if(props.type == 'songMy'){
            ifBorderBottom.value[5] = true
            messageList.value.push('从歌单中删除')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-lajixiang')
            params.value.push({id:props.id,index:props.index})
            eventsHandle.value.push(delfromPlayList)
        }else if(props.type == 'songLately'){
            ifBorderBottom.value[5] = true
            messageList.value.push('从列表中删除')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-lajixiang')
            params.value.push(props.index)
            eventsHandle.value.push(delfromlately)
        }
    }else if(props.type.startsWith('DJprograme')){
        messageList.value.push(...['查看评论','播放','下一首播放','分享'])
        ifBorderBottom.value.push(...[false,false,true,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-fenxiang1'])
        params.value.push(...[props.id,props.id,props.id,props.djprogramid])
        eventsHandle.value.push(...[look,play,nextPlay,share])
        if(props.type.endsWith('Local')){
            messageList.value.push('打开文件所在目录')
            ifBorderBottom.value.push(false)
            iconList.value.push(...['icon-wenjian'])
            eventsHandle.value.push(openFile)
            params.value.push(props.path)
        }else{
            messageList.value.push('下载')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-xiazai1')
            params.value.push(props.id)
            eventsHandle.value.push(download)
        }
    }else if(props.type.startsWith('video')){
        if(props.type.endsWith('_detail')){
            messageList.value.push(...['编辑','删除'])
            ifBorderBottom.value.push(...[false,false])
            iconList.value.push(...['icon-bianji1','icon-lajixiang'])
            params.value.push(props.id,props.id)
            eventsHandle.value.push(...[editVideo,delVideo])
        }else{
            messageList.value.push(...['查看','编辑','删除'])
            ifBorderBottom.value.push(...[false,false,false])
            iconList.value.push(...['icon-chakan','icon-bianji1','icon-lajixiang'])
            params.value.push({id:props.id,videoFolder:props.videoFolder,videoFolderId:Number(props.videoFolderId)},props.id,props.id)
            eventsHandle.value.push(...[lookVideo,editVideo,delVideo])
        }

    }
    eventLength.value = messageList.value.length
}

const look = (id:string)=>{
    if(props.type.startsWith('playList')){
        if(['playListMy','playListLike','playListSearchMy'].includes(props.type)){
            $router.push({
                name:'songPlaylist',
                query:{
                    id,
                    index:Main.playListId.indexOf(+id),
                    my:'true',
                    type:'歌单'
                }
            })
        }else if(['playListStart'].includes(props.type)){
            $router.push({
                name:'songPlaylist',
                query:{
                    id,
                    index:Main.playListId.indexOf(+id),
                    my:'false',
                    type:'歌单'
                }
            }) 
        }else if(['playList'].includes(props.type)){
            $router.push({
                name:'songPlaylist',
                query:{
                    id,
                    my:'false',
                    type:'歌单'
                }
            })
        }else if(['playListRank'].includes(props.type)){
            $router.push({
                name:'PersonalRecord',
                query:{
                    id:$route.query.id,
                    name:$route.query.name
                }
            })
        }

    }else if(props.type.startsWith('songHand')){
        $router.push({
            name:'SongHand',
            query:{
                id
            }
        })
    }else if(props.type == 'user'){
        $router.push({
            name:'PersonalCenter',
            query:{
                id,
            }
        })
    }else if(props.type.startsWith('song')){
        if(props.type.includes('DJ')){
            $router.push({
                name:'SongComments',
                query:{
                    id:props.djprogramid,type:'声音',programId:id
                }
            })
        }else{
            $router.push({
                name:'SongComments',
                query:{
                    id,type:'歌曲'
                }
            })
        }
    }else if(props.type.startsWith('DJprograme')){
        $router.push({
            name:'SongComments',
            query:{
                id:props.djprogramid,type:'声音',programId:id
            }
        })
    }
}

const play = async(id:string)=>{
    if(props.type.startsWith('playList')){
        let result 
        if(['playListMy','playListLike','playListSearchMy','playListStart','playList'].includes(props.type)){
            if(localStorage.getItem('NMcookie')){
                result = (await NM.reqPlaylistTrackAll(id)).data;
            }else{
                result = (await Main.reqPlaylistTrackAll(id)).data;
            }
            Main.playingList = result.songs
            Main.playingPrivileges = result.privileges
            Main.playingindex = 1
            Main.playing = result.songs[0].id as number
            Main.beforePlayListId = +id
        }else if(['playListRank'].includes(props.type)){
            if(localStorage.getItem('NMcookie')){
                result = await NM.reqUserRecord(+$route.query.id!,1);
            }else{
                result = await Main.reqUserRecord(+$route.query.id!,1);
            }
            const songList = result.map(item=>item.song)
            Main.playingList = songList
            Main.playingPrivileges = songList.map(item=>item.privilege)
            Main.playingindex = 1
            Main.playing = songList[0].id as number
            Main.beforePlayListId = -5
        }
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else if(props.type.startsWith('share')){
        let result 
        if(props.type.startsWith('sharePlayList') ){
            if(localStorage.getItem('NMcookie')){
                result = (await NM.reqPlaylistTrackAll(+id)).data;
            }else{
                result = (await Main.reqPlaylistTrackAll(+id)).data;
            }
            Main.playingList = result.songs
            Main.playingPrivileges = result.privileges
            Main.playingindex = 1
            Main.playing = result.songs[0].id as number
            Main.beforePlayListId = +id
        }else if( props.type.startsWith('shareSong') ){
            result = (await Main.reqSongDetail([+id])).data;
            Main.playingList = result.songs
            Main.playingPrivileges = result.privileges
            Main.playingindex = 1
            Main.playing = result.songs[0].id as number
            Main.beforePlayListId = +id
        }else if( props.type.startsWith('shareAl')){
            result = (await Main.reqAlbumTrackAll(+id)).data;
            Main.playingList = result.songs
            Main.playingPrivileges = result.songs.map(it=>it.privilege)
            Main.playingindex = 1
            Main.playing = result.songs[0].id as number
            Main.beforePlayListId = +id
        }
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else if(props.type == 'top50'){
        let songs = await Main.reqArtistTopSong($route.query.id)
        Main.playingList = songs
        Main.playingPrivileges = songs.map(it=>it.privilege)
        Main.playingindex = 1
        Main.playing = songs[0].id as number
        Main.beforePlayListId = +id
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else if(props.type.startsWith('song')){
        if(props.type == 'songLocalnor'){
            globalVar.playLoacalIndex = +id
        }else if(props.type == 'songLocal'){
            globalVar.playLoacalIndex = +id
        }else if(props.type == 'songDownload'){
            globalVar.playLoacalIndex = +id
        }else if(props.type == 'songMy' || props.type == 'song'){
            console.log(id,props.path);
            //@ts-ignore
            if(props.path == 'undefined'){
                let result = (await Main.reqSongDetail([+id])).data
                if(Main.playingindex == -1){
                    Main.playingList = result.songs
                    Main.playingPrivileges = result.privileges
                    Main.playingindex = 1
                    Main.playing = +id
                    Main.playStatus = 'play'
                    Main.songType = 'song'
                }else{
                    Main.playingList.splice(Main.playingindex,0,...result.songs)
                    Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                    Main.playingindex++
                    Main.playing = +id
                    Main.playStatus = 'play'
                    Main.songType = 'song'
                }
            }else{
                window.electron.ipcRenderer.send('right-click',{flag:true,path:props.path})
            }
        }else if(props.type.startsWith('songPanel')){
            console.log('songPanel','songPanel','songPanel');
            Main.playing = +id 
            Main.playingindex = +props.index! + 1
            Main.playStatus = 'play'
            if(Main.playingPrivileges[Main.playingindex - 1].maxBrLevel == 'DJ'){
                Main.songType = 'DJ'
            }else{
                Main.songType = 'song'
            }
        }
    }else if(props.type.startsWith('DJprograme')){
        let result = await Main.djProgramDetail(props.djprogramid)
        if(Main.playingindex == -1)Main.playingindex = 0
        Main.playingList.splice(Main.playingindex,0,result)
        Main.playingPrivileges.splice(Main.playingindex,0,{
            id,
            maxBrLevel: "DJ",
            playMaxBrLevel: "DJ",
            downloadMaxBrLevel: "DJ",
            plLevel: "DJ",
            dlLevel: "DJ",
            flLevel: "DJ",
        })
        Main.playingindex++
        Main.playing = +id
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
        Main.songType = 'DJ'
    }
    if(!props.type.startsWith('songPanel') || !props.type.startsWith('DJprograme'))Main.songType = 'song'
}
    // if(flag){
    //     if(id > 0){
    //         if(path != undefined){
    //             return 'songPanelLocal'
    //         }else{
    //             return 'songPanel'
    //         }
    //     }else{
    //         return 'songPanelnor'
    //     }
    // }else{
    //     if(path != undefined){
    //         return 'songPanelLocalDJ'
    //     }else{
    //         return 'songPanelDJ'
    //     }
    // }
const nextPlay = async(id:string)=>{
    console.log(Main.playingindex);
    if(props.type.startsWith('playList')){
        if(Main.playingList.length == 0){
            play(id)
            return
        }
        let result 
        if(['playListMy','playListLike','playListSearchMy','playListStart','playList',].includes(props.type)){
            if(localStorage.getItem('NMcookie')){
                result = (await NM.reqPlaylistTrackAll(+id)).data;
            }else{
                result = (await Main.reqPlaylistTrackAll(+id)).data;
            }
            const list:any = []
            const listPrivileges:any = []
            result.songs.forEach((element: any, index: number) => {
                if (Main.playingList.every((base) => base.id != element.id)) {
                    list.push(element)
                    listPrivileges.push(result.privileges[index])
                }
            });
            Main.playingList.splice(Main.playingindex,0,...list)
            Main.playingPrivileges.splice(Main.playingindex,0,...listPrivileges)
        }else if(['playListRank'].includes(props.type)){
            if(localStorage.getItem('NMcookie')){
                result = await NM.reqUserRecord(+$route.query.id!,1);
            }else{
                result = await Main.reqUserRecord(+$route.query.id!,1);
            }
            const list = result.map(item=>item.song)
            const listPrivileges = list.map(item=>item.privilege)
            Main.playingList.splice(Main.playingindex,0,...list)
            Main.playingPrivileges.splice(Main.playingindex,0,...listPrivileges)
        }
        globalVar.closePointOutMessage = '已添加到播放列表'
        globalVar.closePointOut = true
    }else if(props.type.startsWith('share')){
        if(Main.playingList.length == 0){
            play(id)
            return
        }else{
            let result
            let list:any = []
            let listPrivileges:any = []
            if(props.type.startsWith('sharePlayList')){
                if(localStorage.getItem('NMcookie')){
                    result = (await NM.reqPlaylistTrackAll(+id)).data;
                }else{
                    result = (await Main.reqPlaylistTrackAll(+id)).data;
                }
                list = result.songs
                listPrivileges = result.privileges
            }else if(props.type.startsWith('shareSong')){
                result = (await Main.reqSongDetail([+id])).data;
                list = result.songs
                listPrivileges = result.privileges
            }else if(props.type.startsWith('shareAl')){
                result = (await Main.reqAlbumTrackAll(+id)).data;
                list = result.songs
                listPrivileges = result.songs.map(it=>it.privilege)
            }
            Main.playingList.splice(Main.playingindex,0,...list)
            Main.playingPrivileges.splice(Main.playingindex,0,...listPrivileges)
            globalVar.closePointOutMessage = '已添加到播放列表'
            globalVar.closePointOut = true
        }
    }else if(props.type == 'top50'){
        if(Main.playingList.length == 0){
            play($route.query.id!+'')
            return
        }else{
            let list:any = []
            let listPrivileges:any = []
            let songs = await Main.reqArtistTopSong($route.query.id)
            list = songs
            listPrivileges = songs.map(it=>it.privilege)
            Main.playingList.splice(Main.playingindex,0,...list)
            Main.playingPrivileges.splice(Main.playingindex,0,...listPrivileges)
            globalVar.closePointOutMessage = '已添加到播放列表'
            globalVar.closePointOut = true
        }
    }else if(props.type.startsWith('song')){
        if(props.type == 'songLocalnor'){
            globalVar.playLoacalIndex = -id
        }else if(props.type == 'songLocal'){
            globalVar.playLoacalIndex = -id
        }else if(props.type == 'songDownload'){
            globalVar.playLoacalIndex = -id
        }else if(props.type == 'songMy' || props.type == 'song'){
            console.log(id,props.path);
            //@ts-ignore
            if(props.path == 'undefined'){
                let result = (await Main.reqSongDetail([+id])).data
                if(Main.playingindex == -1){
                    Main.playingList = result.songs
                    Main.playingPrivileges = result.privileges
                    Main.playingindex = 1
                    Main.playing = +id
                    Main.playStatus = 'play'
                    Main.songType = 'song'
                }else{
                    Main.playingList.splice(Main.playingindex,0,...result.songs)
                    Main.playingPrivileges.splice(Main.playingindex,0,...result.privileges)
                    globalVar.closePointOutMessage = '已添加到播放列表'
                    globalVar.closePointOut = true
                }
            }else{
                if(Main.playingindex == -1){
                    window.electron.ipcRenderer.send('right-click',{flag:true,path:props.path})
                }else{
                    window.electron.ipcRenderer.send('right-click',{flag:false,path:props.path})
                }
                // globalVar.playLoacalIndex = -id
            }
        }
    }else if(props.type.startsWith('DJprograme')){
        let result = await Main.djProgramDetail(props.djprogramid)
        if(Main.playingindex == -1)Main.playingindex = 0
        Main.playingList.splice(Main.playingindex,0,result)
        Main.playingPrivileges.splice(Main.playingindex,0,{
            id,
            maxBrLevel: "DJ",
            playMaxBrLevel: "DJ",
            downloadMaxBrLevel: "DJ",
            plLevel: "DJ",
            dlLevel: "DJ",
            flLevel: "DJ",
        })
        globalVar.closePointOutMessage = '已经添加到播放列表'
        globalVar.closePointOut = true
    }
}

const share = (id:string)=>{
    if(props.type.startsWith('playList')){
        globalVar.share.type = 'playlist'
    }else if(props.type.startsWith('al')){
        globalVar.share.type = 'album'
    }else if(props.type.startsWith('song') && !props.type.startsWith('songHand')){
        if(props.type.endsWith('DJ')){
            globalVar.share.type = 'djprogram'
        }else{
            globalVar.share.type = 'song'
        }
    }else if(props.type.startsWith('songHand')){
        globalVar.share.type = 'artist'
    }else if(props.type.startsWith('FM')){
        globalVar.share.type = 'song'
    }else if(props.type.startsWith('DJprograme')){
        globalVar.share.type = 'djprogram'
    }
    console.log(id);
    
    globalVar.shareDialogFlag = true
    globalVar.share.id = +id
    globalVar.share.message = props.shareTxt as string
    globalVar.share.imgUrl = props.shareAvg as string

}
const downloadQueue = inject('downloadQueue') 
const promises: Promise<any>[] = []
const dowloadAll = async (id) => {
    // globalVar.downloadId.push(...Main.openPlayListId.filter((num) => !globalVar.downloadId.includes(num)));
    // const promises = globalVar.downloadId.map(id => downloadOne(id))
    // await Promise.all(promises);
    let oldlength = globalVar.downloadList.length
    let songs
    if(props.type.startsWith('playList')){
        if(localStorage.getItem('NMcookie')){
            songs = (await NM.reqPlaylistTrackAll(id)).data.songs
        }else{
            songs = (await Main.reqPlaylistDetail(id)).data.playlist.tracks
        }
    }
    else if(props.type.startsWith('al')) songs =  (await Main.reqAlbumTrackAll(id)).data.songs
    songs.forEach((item)=>{
        let name = ''
        item.ar.forEach((el, index) => {
        name += el.name
            if (index != item.ar!.length - 1) name += ','
        })
        name = name + ' - ' + item.name
        const cleanFileName = name.replace(/[\\/:\*\?"<>\|]/g, "");
        globalVar.downloadId.push(item.id)
        globalVar.downloadList.push({ id: item.id, name: cleanFileName, controller: new AbortController(), ifcancel: false, url: '' })
    })
    // console.log(globalVar.downloadId);
    // console.log(oldlength,WaitdownloadList.value.length);
    const newList = globalVar.downloadList.slice(oldlength, globalVar.downloadList.length)
    // console.log(oldlength,WaitdownloadList.value.length);
    // console.log(newList);
    for (const item of newList) {
        const id = item!.id
        const name = item!.name
        globalVar.loadingValue.set(id, [0, 1])
        const signal = item.controller.signal
        const pq = downloadQueue.value.add(() => getUrl(id, name), { signal })
        promises.push(pq)
    }
    // await Promise.allSettled(promises)
}
const downloadFlag = toRef(globalVar, 'downloadFlag')
const download = async (id: number) => {
    const { destory } = Loading({
        loading:true,
        width:20,
        tra:20
    })
    const result = await Main.reqSongDetail([id])
    destory()
    let songName = ''
    const arList = result.data.songs[0].ar as any[]
    arList.forEach((el, index) => {
        songName = songName + el.name
        if (index != arList.length - 1) songName = songName + ','
    })
    songName = songName + ' - ' + result.data.songs[0].name
    const dl = result.data.privileges[0].dlLevel
    const pl = result.data.privileges[0].plLevel
    if (dl == 'none' && pl == 'none') {
        ElMessage({
            type: 'error',
            message: '无可下载资源',
            duration: 1000
        })
    } else {
        downloadFlag.value = true
        globalVar.downloadLevel = {
            play: pl,
            download: dl,
            songName,
            id
        }
    }

}
const gotoUpdatePlayList = (id)=>{
    $router.push({
        name: 'editPlayList',
        query: {
            index:Main.playListId.indexOf(+id)
        }
    })
}

//删除歌单
const delPlayList = async(id)=>{
    const { destory } = Loading({
        loading:true,
        width:20,
        tra:20
    })
    try {
        if(props.type == 'playListMy'){
            let flag 
            if(localStorage.getItem('NMcookie')){
                flag = await NM.reqPlaylistDelete(id)
            }else{
                flag = await Main.reqPlaylistDelete(id)
            }
            destory()
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.createPlay--
                Loading({
                    message:'删除成功',
                    showTime:1000
                })
                if($route.name == 'songPlaylist' && index < +$route.query.index!){
                    $router.replace({
                        name:'songPlaylist',
                        query:{
                            my:'true',
                            id:Main.playList[+$route.query.index! - 1].id,
                            index:+$route.query.index! - 1,
                            type:'歌单'
                        }
                    })
                }
            }else{
                Loading({
                    type:'error',
                    message:'删除失败',
                    showTime:1000
                })
                destory()
            }
        }else if(props.type == 'playListStart'){
            let flag 
            if(localStorage.getItem('NMcookie')){
                flag = await NM.reqPlaylistSubscribe(2,id)
            }else{
                flag = await Main.reqPlaylistSubscribe(2,id)
            }
            destory()
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.startPlay--
                Loading({
                    message:'删除成功',
                    showTime:1000
                })
            }else{
                Loading({
                    type:'error',
                    message:'删除失败',
                    showTime:1000
                })
            }
        }

    } catch (error) {
        Loading({
            type:'error',
            message:'删除失败',
            showTime:1000
        })
        destory()
    }
}
const br = (str: string) => {
    if (str == 'standard') return 128000
    else if (str == 'higher') return 192000
    else if (str == 'exhigh') return 320000
    else return 999000
}

//下载请求
const getUrl = async (id, name) => {
    globalVar.initDownloadButton = true
    const downloadObj = globalVar.downloadList.find(item => item.id === id)
    //判断请求是否被取消
    let url = ''
    let result
    let chunks: Uint8Array[]
    if (globalVar.musicPick.get(id) == undefined) { //切片数据)
        //@ts-ignore
        chunks = []
    } else {
        //@ts-ignore
        chunks = globalVar.musicPick.get(id)
    }
    try {
        result = await Main.reqSongDlUrl(id, br(globalVar.setting.downloadlevel))
        //@ts-ignore
        url = result.data.data.url
        if (url == null) {
            url = await Main.reqSongUrl(id, globalVar.setting.downloadlevel)
            //@ts-ignore
            downloadObj.level = globalVar.setting.downloadlevel
        } else {
            //@ts-ignore
            downloadObj.br = br(globalVar.setting.downloadlevel)
        }
    } catch (error) {
        globalVar.musicPick.set(id, chunks)
        //@ts-ignore
        downloadObj.ifcancel = true
    }
    if (url == null) {
        globalVar.loadingValue.delete(id)
    }
    //@ts-ignore
    downloadObj.url = url
    if (downloadObj?.controller.signal.aborted) return
    return fetch(url, {
        signal: downloadObj?.controller.signal
    }).then(response => {
        const total = response.headers.get('content-length') as string//响应体大小
        let loaded = 0
        const reader = response.body?.getReader() as ReadableStreamDefaultReader<Uint8Array>
        return new ReadableStream({
            start(controller) {
                function push() {
                    reader.read().then(({ done, value }) => {
                        if (done) {
                            controller.close()
                            return
                        }

                        loaded += value.byteLength
                        controller.enqueue(value)
                        chunks.push(value)
                        // 计算进度
                        globalVar.loadingValue.set(id, [loaded, (+total)])
                        push()
                    }).catch(error => {
                        if (error.name === 'AbortError') {
                            globalVar.musicPick.set(id, chunks)
                            return null

                        } else {
                            globalVar.musicPick.set(id, chunks)
                            //@ts-ignore
                            downloadObj.ifcancel = true
                            return null

                        }
                    })
                }
                push()
            }
        })
    })
        .then(stream => new Response(stream))
        .then(response => response.arrayBuffer())
        .then(async () => {
            const detail = (await Main.reqSongDetail([id])).data.songs[0]
            console.log(detail);
            const title = `${detail.name}`
            const artistId:any[] = []
            const artist = (detail.ar.map((item)=>{
                artistId.push(item.id)
                return `${item.name}`
            })).join('/')
            const image = detail.al.picUrl
            const album = `${detail.al.name}`
            const id3 = {
                title,artist,image,album,ids:[detail.id,detail.al.id,...artistId],time:detail.dt
            }
            const mergedChunks = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
            let offset = 0;
            for (const chunk of chunks) {
                mergedChunks.set(chunk, offset);
                offset += chunk.byteLength;
            }
            const arrayBuffer = mergedChunks.buffer;
            window.electron.ipcRenderer.send('save-music', { arrayBuffer, name: name,id3 })
            globalVar.musicPick.delete(id)
            globalVar.downloadList = globalVar.downloadList.filter(item => item.id !== id)
            // window.electron.ipcRenderer.send('save-music-pick',{name})
        }).catch(() => {
            globalVar.musicPick.set(id, chunks)
            //@ts-ignore
            downloadObj.ifcancel = true
        })
    // .catch((error) =>{
    //     console.error(error)
    //     // WaitdownloadList.value = WaitdownloadList.value.filter(item => item.id !== id)
    // })
}


window.electron.ipcRenderer.on('save-music-finished', ({ }, {which,id}) => {
    globalVar.downloadId = globalVar.downloadId.filter(el => el != id)
    globalVar.loadingValue.delete(id)
})

const openFile = ({})=>{
    console.log(props.path);
    window.electron.ipcRenderer.send('open-path',props.path)
}
const start = async(id:string)=>{
    const { destory } = Loading({
        loading:true,
        width:20,
        tra:20
    })
    try {
        if(props.type.startsWith('playList')){
            let flag
            if(!localStorage.getItem('NMcookie')){
                flag = await Main.reqPlaylistSubscribe(1,+id)
            }else{
                flag = await NM.reqPlaylistSubscribe(1,+id)
            }
            destory()
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.startPlay++
                if(localStorage.getItem('NMcookie')){
                    NM.reqUserPlaylist(BasicApi.profile!.userId)
                }else{
                    Main.reqUserPlaylist(BasicApi.profile!.userId)
                }
                Loading({
                    message:'收藏成功',
                    showTime:1000
                })
            }else{
                Loading({
                    type:'error',
                    message:'收藏失败',
                    showTime:1000
                })
            }
        }else if(props.type == 'songHand'){
            let flag
            if(localStorage.getItem('NMcookie')){
                flag = await NM.reqArtistSub(id,1)
            }else{
                flag = await Main.reqArtistSub(id,1)
            }
            destory()
            if(flag){
                Loading({
                    message:'关注成功',
                    showTime:1000
                })
                if(localStorage.getItem('NMcookie')){
                    NM.reqartistSublist()
                }else{
                    BasicApi.reqartistSublist()
                }
            }else{
                Loading({
                    type:'error',
                    message:'关注失败',
                    showTime:1000
                })
            }
        }else if(props.type == 'al'){
            let flag
            if(localStorage.getItem('NMcookie')){
                flag = await NM.reqAlbumSub(1,+id)
            }else{
                flag = await Main.reqAlbumSub(1,+id)
            }
            destory()
            if(flag){
                Loading({
                    message:'收藏成功',
                    showTime:1000
                })
                if(localStorage.getItem('NMcookie')){
                    NM.reqalbumSublist(1)
                }else{
                    BasicApi.reqalbumSublist(1)
                }
            }else{
                Loading({
                    type:'error',
                    message:'收藏失败',
                    showTime:1000
                })
            }
        }
    } catch (error) {
        Loading({
            type:'error',
            message:'发生错误',
            showTime:1000
        })
        destory()
    }

}
const delstart = async(id)=>{
    if(props.type == 'songHandHad'){
        let flag 
        if(localStorage.getItem('NMcookie')){
            flag = await NM.reqArtistSub(id,2)
        }else{
            flag = await Main.reqArtistSub(id,2)
        }
        if(flag){
            Loading({
                message:'取关成功',
                showTime:1000
            })
            BasicApi.startSongHand = BasicApi.startSongHand.filter(item=>item.id != +id)
        }else{
            Loading({
                type:'error',
                message:'取关失败',
                showTime:1000
            })
        }
    }else if(props.type == 'alHad'){
        let flag
        if(localStorage.getItem('NMcookie')){
            flag = await NM.reqAlbumSub(2,+id)
        }else{
            flag = await Main.reqAlbumSub(2,+id)
        }
        if(flag){
            Loading({
                message:'专辑取消收藏成功',
                showTime:1000
            })
            BasicApi.startalbum = BasicApi.startalbum.filter(item=>item.id != +id)
        }else{
            Loading({
                type:'error',
                message:'专辑取消收藏失败',
                showTime:1000
            })
        }
    }
}

const delComment = async(ids:string)=>{
    const id = ids.split(',')[0]
    const resId = ids.split(',')[1]
    const { destory } = Loading({
        loading:true,
        width:20,
        tra:20
    })
    if(isNaN(+resId)){
        let res = await Main.reqcomment({
            t:0,
            type:+props.commentType!,
            threadId:resId,
            commentId:+id
        })
        destory()
        if(res.data.code == 200){
            const selectedElements = document.querySelectorAll(`[data-id="${ids}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((element) => {
                element.remove()
            });
            Loading({
                message:'删除成功',
                showTime:1000
            })
        }else{
            Loading({
                type:'error',
                message:'删除失败',
                showTime:1000
            })
        }
    }else{
        let res
        if(localStorage.getItem('NMcookie')){
            res = await NM.reqcomment({
                t:0,
                type:+props.commentType!,
                id:+resId,
                commentId:+id
            })
        }else{
            res = await Main.reqcomment({
                t:0,
                type:+props.commentType!,
                id:+resId,
                commentId:+id
            })
        }
        destory()
        if(res.data.code == 200){
            const selectedElements = document.querySelectorAll(`[data-id="${ids}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((element) => {
                element.remove()
            });
            Loading({
                message:'删除成功',
                showTime:1000
            })
        }else{
            Loading({
                type:'error',
                message:'删除失败',
                showTime:1000
            })
        }
    }
}

const delev = async(id)=>{
    try {
        let flag
        if(localStorage.getItem('NMcookie')){
            flag = await NM.reqEventDel(props.evid)
        }else{
            flag = await Main.reqEventDel(props.evid)
        }
        if(flag){
            Loading({
                type:'error',
                message:'删除成功',
                showTime:1000
            })
            const selectedElements = document.querySelectorAll(`[data-evid="${props.evid}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((it)=>{
                it.remove()
            })
            BasicApi.profile!.eventCount--
        }else{
            Loading({
                type:'error',
                message:'删除失败',
                showTime:1000
            })
        } 
    } catch (error) {
        Loading({
            type:'error',
            message:'删除失败',
            showTime:1000
        })
    }

}
const delDownload = async({})=>{
   const res = await window.electron.ipcRenderer.invoke('del-music',props.path)
   console.log(res);
   if(res.length == 0){
    Loading({
        message:'删除成功',
        showTime:1000
    })
   }else {
    Loading({
        type:'error',
        message:'删除失败',
        showTime:1000
    })
   }
}
const delfromPlayList = async({id,index})=>{
    let res 
    if(localStorage.getItem('NMcookie')){
        res = await NM.reqPlaylistTracks('del',+$route.query.id!,[id])
    }else{
        res = await Main.reqPlaylistTracks('del',+$route.query.id!,[id])
    }
    if(res.data.url){
        Main.playList[+$route.query.index!].coverImgUrl = res.data.url
    }
  if(res.data.status == 200 || res.data.code == 200 ||  res.data.body.code == 200){
    Loading({
        message:'删除成功',
        showTime:1000
    })
    globalVar.delMyPlayListSongIndex = index
    Main.playList[+$route.query.index!].trackCount--
  }else{
    Loading({
        type:'error',
        message:'删除失败',
        showTime:1000
    })
  }
}

const delfromlately = async(index)=>{
    Main.latelyPlay.splice(index-1,1)
}
let flagover = true
const showStartList = ()=>{
    if(flagover){
        flagover = false
        flagStart.value = true
        const listStartRef = document.querySelector('#listStartRef') as HTMLElement
        listStartRef.style.left =  props.left + 250 + 'px'
        listStartRef.style.height = 'auto'
        nextTick(()=>{
            if(window.innerHeight *0.9 <=listStartRef!.offsetHeight){
                listStartRef!.style.height = window.innerHeight *0.9 + 'px'
                listStartRef!.style.top = window.innerHeight *0.05 + 'px'
            }
            let {right,left,width}= listStartRef.getBoundingClientRect();
            const visibleWidth = Math.min(right, window.innerWidth) - Math.max(left, 0);
            console.log(visibleWidth ,width);
            if(visibleWidth < width){
                listStartRef!.style.left = +rightBlockRef.value!.style.left.split('px')[0] - 240 + 'px'
            }
        })
        flagover = true
    }
}

const pushInto = async(index,id)=>{
    let ids:number[]
    try {
        if(props.type.startsWith('song') || props.type == 'FM'){
            ids = [+props.id!]
            let res 
            if(localStorage.getItem('NMcookie')){
                res = await NM.reqPlaylistTracks('add',id,ids)
            }else{
                res = await Main.reqPlaylistTracks('add',id,ids)
            }
            if(res.data.url){
                Main.playList[index].coverImgUrl = res.data.url
            }
            console.log(res.data);
            if(res.data.body.code == 200 || (res.data.code == 200 && localStorage.getItem('NMcookie'))){
                Loading({
                    message:'添加成功',
                    showTime:1000
                })
                Main.playList[index].trackCount++
            }else{
                throw Error(res?.data?.body?.message ?? '添加失败')
            }
        }else if(props.type.startsWith('top50')){
            ids = (await Main.reqArtistTopSong(+$route.query.id!)).map(it=>it.id)
            let res 
            if(localStorage.getItem('NMcookie')){
                res = await NM.reqPlaylistTracks('add',id,ids)
            }else{
                res = await Main.reqPlaylistTracks('add',id,ids)
            }
            if(res.data.url){
                Main.playList[index].coverImgUrl = res.data.url
            }
            if(res.data.body.code == 200 || (res.data.code == 200 && localStorage.getItem('NMcookie'))){
                Loading({
                    message:'添加成功',
                    showTime:1000
                })
                Main.playList[index].trackCount+=ids.length
            }else{
                throw Error(res?.data?.body?.message ?? '添加失败')
            }
            Loading({
                message:'添加成功',
                showTime:1000
            })
        }
    } catch (error) {
        Loading({
            type:'error',
            message:error as string,
            showTime:1000
        })
    }

}
const create = async()=>{
    if(props.type.startsWith('song') || props.type == 'FM'){
        let ids = [+props.id!]
        globalVar.addPlayId = ids
        globalVar.addPlayFlag = true
    }else if(props.type.startsWith('top50')){
        let ids = (await Main.reqArtistTopSong(+$route.query.id!)).map(it=>it.id)
        globalVar.addPlayId = ids
        globalVar.addPlayFlag = true
    }
}

const hideStartList = ()=>{
    flagStart.value = false
}

const deleteFromList = (index)=>{
    console.log(index,Main.playingindex - 1); //0,0
    if(index == Main.playingindex - 1){
        Main.playingList.splice(index,1)
        Main.playingPrivileges.splice(index,1)
        if(Main.playingList.length != 0){
            if(Main.playingindex == Main.playingList.length + 1)Main.playingindex-- //1,2
            console.log(Main.playingPrivileges,Main.playingList,Main.playingindex - 1);
            if(Main.playingPrivileges[Main.playingindex - 1].maxBrLevel == 'DJ'){
                Main.playing = Main.playingList[Main.playingindex - 1].mainSong.id
            }else{
                Main.playing = Main.playingList[Main.playingindex - 1].id
            }
        }
    }else{
        Main.playingList.splice(index,1)
        Main.playingPrivileges.splice(index,1)
        if(index <  Main.playingindex - 1){
            Main.playingindex--
        }
    }
    if(Main.playingList.length == 0){
        globalVar.clearList = true
    }
}

const DJPersonalpage = (id)=>{
    $router.push({
        name:'PersonalCenter',
        query:{
            id
        }
    })
}

const DJprogrampage = (id)=>{
    console.log(id,props.radioid);
    $router.push({
        name:'djPlaylist',
        query:{
            type:'播客',
            id,
            my:'false',
            count:undefined
        }
    })
}

// eventsHandle.value.push(...[look,editVideo,delVideo])

const lookVideo = (obj)=>{
    const {id,videoFolder,videoFolderId} = obj;
    $router.push({
        name: 'video_detail',
        query: {
            id: id,
            floderId:videoFolderId,
            floderName:videoFolder
        }
    })
}

const editVideo = (id) =>{
    console.log(id);
    globalVar.editVideo = {
        videoId:+id,
        flag:true
    }
}

const delVideo = (id)=>{
    globalVar.delVideo = {
        videoId:+id,
        flag:true
    }
}

</script>

<style scoped lang="less">
.rightBlock{
    // display: flex;
    // background-color: red;
    position: fixed;
    display: flex;
    z-index: 13;
    .list{
        height: auto;
        min-height: 43px;
        width: 230px;
        padding: 4px 0 4px 0;
        background-color: @my-dialog-bk;
        border-radius: .5em;
        .op{
            height: 35px;
            box-sizing: border-box;
            user-select: none;
            display: flex;
            color: @font-color;
            align-items: center;
            position: relative;
            .icon{
                width: 15px;
                padding:0 10px 0 10px;
                text-align: center;
            }
            .msg{
                width: calc(100% - 45px);
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
            }
            .i{
                padding-right: 10px;
                i{
                    font-size: 10px;
                }
            }
            &:hover{
                background-color: @right-button-hover;
            }
        }
        .op-border{
            border-bottom: 1px solid @font-color;
        }
        .list-start{
            min-height: 78px;
            width: 230px;
            padding: 4px 0 4px 0;
            background-color: @my-dialog-bk;
            border-radius: .5em;
            position: fixed;
            .op{
                .msg{
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    width: 180px;
                }
            }
        }
    }

}
</style>