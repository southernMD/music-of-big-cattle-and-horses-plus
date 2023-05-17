<template>
  <div class="rightBlock" ref="rightBlockRef" v-show="flag && rightFlag">
    {{ type }}
    <div class="op" @click="eventsHandle[index].bind(null,params[index])()"  v-for="val,index in eventLength"  :class="{'op-border':ifBorderBottom[index]}" 
    >
    <!-- -->
        <div class="icon">
            <i class="iconfont" :class="[iconList[index]]"></i>
        </div>
        <div class="msg">{{ messageList[index] }}</div>
        <div class="i" v-if=" messageList[index] == '收藏' && (type == ('song' || 'songMy' || 'shareSong'))">
            <i class="iconfont icon-youjiantou"></i>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch,watchEffect,ref, nextTick,Ref, inject, ShallowRef, toRef } from 'vue'
import { useRouter,useRoute } from 'vue-router'
import { useMain ,useGlobalVar,useBasicApi} from '@renderer/store'
import PromiseQueue, { QueueAddOptions } from 'p-queue'
import { Queue, RunFunction } from 'p-queue/dist/queue';
const Main = useMain()
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
const $router = useRouter()
const $route = useRoute()

const props = defineProps<{
    left:number
    top:number
    rightFlag:boolean
    type:string
    id:string
    index:string | null
    shareTxt:string | null
    shareAvg:string | null
    download:boolean | null
    path:string | null
    commentType:string | null
    evid:string | null
}>()
const flag = ref(false)
const rightBlockRef = ref<InstanceType<typeof HTMLElement>>()
watchEffect(()=>{
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
        }else {
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
        eventsHandle.value.push(...[play,nextPlay,start])
    }else if(props.type == 'FM'){
        messageList.value.push(...['收藏','分享','下载'])
        ifBorderBottom.value.push(...[false,false,false])
        iconList.value.push(...['icon-tianjiawenjian','icon-fenxiang1','icon-xiazai1'])
        params.value.push(...[props.id,props.id,props.id])
        eventsHandle.value.push(...[start,share,download])
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
    }
}

const play = async(id:string)=>{
    if(props.type.startsWith('playList')){
        let result 
        if(['playListMy','playListLike','playListSearchMy','playListStart','playList'].includes(props.type)){
            result = (await Main.reqPlaylistTrackAll(id)).data;
            Main.playingList = result.songs
            Main.playingPrivileges = result.privileges
            Main.playingindex = 1
            Main.playing = result.songs[0].id as number
            Main.beforePlayListId = +id
        }else if(['playListRank'].includes(props.type)){
            result = await Main.reqUserRecord(+$route.query.id!,1);
            const songList = result.map(item=>item.song)
            Main.playingList = songList
            Main.playingPrivileges = songList.map(item=>item.privilege)
            Main.playingindex = 1
            Main.playing = songList[0].id as number
            Main.beforePlayListId = -5
        }
        Main.playStatus = 'play'
        let str = result.songs[0].name + ' - ';
        let singerArr = result.songs[0].ar as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else if(props.type.startsWith('share')){
        let result 
        if(props.type.startsWith('sharePlayList') ){
            result = (await Main.reqPlaylistTrackAll(+id)).data;
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
        let str = result.songs[0].name + ' - ';
        let singerArr = result.songs[0].ar as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
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
        let str = songs[0].name + ' - ';
        let singerArr = songs[0].ar as unknown as Array<any>
        singerArr.forEach((element, index) => {
            str += element.name
            if (index != singerArr.length - 1) str += ' / '
        })
        window.electron.ipcRenderer.send('change-play-thum', str)
        window.electron.ipcRenderer.send('render-play')
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else if(props.type.startsWith('song')){
        if(props.type == 'songLocalnor'){
            globalVar.playLoacalIndex = +id
        }else if(props.type == 'songLocal'){
            globalVar.playLoacalIndex = +id
        }else if(props.type == 'songDownload'){
            globalVar.playLoacalIndex = +id
        }
    }
}

const nextPlay = async(id:string)=>{
    if(props.type.startsWith('playList')){
        if(Main.playingList.length == 0){
            play(id)
            return
        }
        let result 
        if(['playListMy','playListLike','playListSearchMy','playListStart','playList',].includes(props.type)){
            result = (await Main.reqPlaylistTrackAll(id)).data;
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
            result = await Main.reqUserRecord(+$route.query.id!,1);
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
                result = (await Main.reqPlaylistTrackAll(+id)).data;
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
        }
    }
}

const share = (id:string)=>{
    if(props.type.startsWith('playList')){
        globalVar.share.type = 'playlist'
    }else if(props.type.startsWith('al')){
        globalVar.share.type = 'album'
    }else if(props.type.startsWith('song') && !props.type.startsWith('songHand')){
        globalVar.share.type = 'song'
    }else if(props.type.startsWith('songHand')){
        globalVar.share.type = 'artist'
    }else if(props.type.startsWith('FM')){
        globalVar.share.type = 'song'
    }
    globalVar.shareDialogFlag = true
    globalVar.share.id = +id
    globalVar.share.message = props.shareTxt as string
    globalVar.share.imgUrl = props.shareAvg as string

}
const downloadQueue = inject('downloadQueue') as ShallowRef<PromiseQueue<Queue<RunFunction, QueueAddOptions>, QueueAddOptions>>
const promises: Promise<any>[] = []
const dowloadAll = async (id) => {
    // globalVar.downloadId.push(...Main.openPlayListId.filter((num) => !globalVar.downloadId.includes(num)));
    // const promises = globalVar.downloadId.map(id => downloadOne(id))
    // await Promise.all(promises);
    let oldlength = globalVar.downloadList.length
    let songs
    if(props.type.startsWith('playList')) songs = (await Main.reqPlaylistDetail(id)).data.playlist.tracks
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
    globalVar.loadDefault = true
    const result = await Main.reqSongDetail([id])
    globalVar.loadDefault = false
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
    try {
        if(props.type == 'playListMy'){
            globalVar.loadDefault = true
            let flag = await Main.reqPlaylistDelete(id)
            globalVar.loadDefault = false
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.createPlay--
                globalVar.loadMessageDefault = '删除成功'
                globalVar.loadMessageDefaultFlag = true
            }else{
                globalVar.loadMessageDefault = '删除失败'
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true
            }
        }else if(props.type == 'playListStart'){
            globalVar.loadDefault = true
            let flag = await Main.reqPlaylistSubscribe(2,id)
            globalVar.loadDefault = false
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.startPlay--
                globalVar.loadMessageDefault = '删除成功'
                globalVar.loadMessageDefaultFlag = true
            }else{
                globalVar.loadMessageDefault = '删除失败'
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true
            }
        }

    } catch (error) {
        globalVar.loadMessageDefault = '删除失败'
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadDefault = false
    }
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
        result = await Main.reqSongDlUrl(id, 999000)
        //@ts-ignore
        url = result.data.data.url
        if (url == null) {
            result = await Main.reqSongUrl(id, 'standard')
            //@ts-ignore
            url = result.data.data[0].url
            //@ts-ignore
            downloadObj.level = 'standard'
        } else {
            //@ts-ignore
            downloadObj.br = 999000
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

const openFile = (path)=>{
    console.log(path);
    window.electron.ipcRenderer.send('open-path',path)
}
const start = async(id:string)=>{
    try {
        if(props.type.startsWith('playList')){
            globalVar.loadDefault = true
            let flag = await Main.reqPlaylistSubscribe(1,+id)
            globalVar.loadDefault = false
            if(flag){
                const index = Main.playListId.indexOf(+id)
                Main.playListId.splice(index,1)
                Main.playList.splice(index,1)
                Main.startPlay--
                Main.reqUserPlaylist(BasicApi.profile!.userId)
                globalVar.loadMessageDefault = '收藏成功'
                globalVar.loadMessageDefaultFlag = true
            }else{
                globalVar.loadMessageDefault = '收藏失败'
                globalVar.loadMessageDefaultType = 'error'
                globalVar.loadMessageDefaultFlag = true
            }
        }else if(props.type == 'songHand'){
            let flag = await Main.reqArtistSub(id,1)
            if(flag){
                globalVar.loadMessageDefault = '关注成功'
                BasicApi.reqartistSublist()

            }else{
                globalVar.loadMessageDefault = '关注失败'
            }
            globalVar.loadMessageDefaultFlag = true
        }else if(props.type == 'al'){
            let flag = await Main.reqAlbumSub(1,+id)
            if(flag){
                globalVar.loadMessageDefault = '收藏成功'
                BasicApi.reqalbumSublist(1)
            }else{
                globalVar.loadMessageDefault = '收藏失败'
            }
            globalVar.loadMessageDefaultFlag = true
        }
    } catch (error) {
        globalVar.loadMessageDefault = '失败'
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadDefault = false
    }

}
const delstart = async(id)=>{
    if(props.type == 'songHandHad'){
        let flag = await Main.reqArtistSub(id,2)
        if(flag){
            globalVar.loadMessageDefault = '取关成功'
            BasicApi.startSongHand = BasicApi.startSongHand.filter(item=>item.id != +id)
        }else{
            globalVar.loadMessageDefault = '取关失败'
        }
        globalVar.loadMessageDefaultFlag = true
    }else if(props.type == 'alHad'){
        let flag = await  Main.reqAlbumSub(2,+id)
        if(flag){
            globalVar.loadMessageDefault = '专辑取消收藏成功'
            BasicApi.startalbum = BasicApi.startalbum.filter(item=>item.id != +id)
        }else{
            globalVar.loadMessageDefault = '专辑取消收藏失败'
        }
        globalVar.loadMessageDefaultFlag = true
    }
}

const delComment = async(ids:string)=>{
    const id = ids.split(',')[0]
    const resId = ids.split(',')[1]
    if(isNaN(+resId)){
        globalVar.loadDefault = true
        let res = await Main.reqcomment({
            t:0,
            type:+props.commentType!,
            threadId:resId,
            commentId:+id
        })
        globalVar.loadDefault = false
        if(res.data.code == 200){
            const selectedElements = document.querySelectorAll(`[data-id="${ids}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((element) => {
                element.remove()
            });
            globalVar.loadMessageDefault = '删除成功'
            globalVar.loadMessageDefaultFlag = true
        }else{
            globalVar.loadMessageDefault = '删除失败'
            globalVar.loadMessageDefaultFlag = true
        }
    }else{
        globalVar.loadDefault = true
        let res = await Main.reqcomment({
            t:0,
            type:+props.commentType!,
            id:+resId,
            commentId:+id
        })
        globalVar.loadDefault = false
        globalVar.loadDefault = false
        if(res.data.code == 200){
            const selectedElements = document.querySelectorAll(`[data-id="${ids}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((element) => {
                element.remove()
            });
            globalVar.loadMessageDefault = '删除成功'
            globalVar.loadMessageDefaultFlag = true
        }else{
            globalVar.loadMessageDefault = '删除失败'
            globalVar.loadMessageDefaultFlag = true
        }
    }
}

const delev = async(id)=>{
    try {
        let flag = await Main.reqEventDel(id)
        if(flag){
            globalVar.loadMessageDefault = '删除成功'
            globalVar.loadMessageDefaultFlag = true
            const selectedElements = document.querySelectorAll(`[data-evid="${id}"]`) as unknown as HTMLElement[] 
            selectedElements.forEach((it)=>{
                it.remove()
            })
        }else{
            globalVar.loadMessageDefault = '删除失败'
            globalVar.loadMessageDefaultFlag = true
        } 
    } catch (error) {
        globalVar.loadMessageDefault = '删除失败'
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefaultFlag = true
    }

}
const delDownload = async(path)=>{
   const res = await window.electron.ipcRenderer.invoke('del-music',path)
   console.log(res);
   if(res.length == 0){
    globalVar.loadMessageDefault = '删除成功'
    globalVar.loadMessageDefaultFlag = true
   }else {
    globalVar.loadMessageDefault = '删除失败'
    globalVar.loadMessageDefaultType = 'error'
    globalVar.loadMessageDefaultFlag = true
   }
}
const delfromPlayList = async({id,index})=>{
  let res =  await Main.reqPlaylistTracks('del',+$route.query.id!,[id])
  if(res.data.status == 200){
    globalVar.loadMessageDefault = '删除成功'
    globalVar.loadMessageDefaultFlag = true
    globalVar.delMyPlayListSongIndex = index
  }else{
    globalVar.loadMessageDefault = '删除失败'
    globalVar.loadMessageDefaultFlag = true
  }
}

</script>

<style scoped lang="less">
.rightBlock{
    height: auto;
    min-height: 43px;
    width: 230px;
    padding: 4px 0 4px 0;
    background-color: @my-dialog-bk;
    border-radius: .5em;
    // background-color: red;
    position: fixed;
    .op{
        height: 35px;
        box-sizing: border-box;
        user-select: none;
        display: flex;
        color: @font-color;
        align-items: center;
       
        .icon{
            width: 15px;
            padding:0 10px 0 10px;
            text-align: center;
        }
        .msg{
            width: calc(100% - 45px);
            font-size: 14px;
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
}
</style>