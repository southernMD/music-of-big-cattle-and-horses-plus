<template>
      <LineMusic 
        v-show="searchKey.length == 0"
        :title="val.title" 
        :singer=" getSinger(index,val.artist, val?.userDefinedText?.[2],val?.comment?.text)"
        :id="getSongid(index,val?.userDefinedText?.[0],val?.comment?.text)" 
        :showIndex="true" 
        :oneselfColor="true"
        :zhuanji="getZhuanji(index,val.album, val?.userDefinedText?.[1],val?.comment?.text)" 
        :local="true" 
        :index="index+1"
        :path="val.path"
        :dataType="getSongid(index,val?.userDefinedText?.[0],val?.comment?.text)>0?'songLocal':'songLocalnor'"
        :imageBuffer="val.image?.imageBuffer"
        :playListid="-2"
        @localPlay="localPlay"
        v-for="val,index in list" ></LineMusic>
        <LineMusic 
        v-show="searchKey.length != 0"
        :title="listCopy[index].title" 
        :singer="getSinger(index,listCopy[index].ar, list[listCopy[index].indexList-1]?.userDefinedText?.[2],list[listCopy[index].indexList-1]?.comment?.text)"
        :id="getSongid(index,list[listCopy[index].indexList-1]?.userDefinedText?.[0],list[listCopy[index].indexList-1]?.comment?.text)" 
        :showIndex="true" 
        :oneselfColor="true"
        :zhuanji="getZhuanji(index,listCopy[index].al, list[listCopy[index].indexList-1]?.userDefinedText?.[1],list[listCopy[index].indexList-1]?.comment?.text)" 
        :local="true" 
        :index="listCopy[index].indexList"
        :path="list[listCopy[index].indexList-1].path"
        :dataType="getSongid(index,list[listCopy[index].indexList-1]?.userDefinedText?.[0],list[listCopy[index].indexList-1]?.comment?.text)>0?'songLocal':'songLocalnor'"
        :imageBuffer="list[listCopy[index].indexList-1].image?.imageBuffer"
        :playListid="-2"

        @localPlay="localPlay"
        v-for="val,index in listCopyLength" ></LineMusic>
</template>

<script setup lang="ts">
import {watch,nextTick,ref, Ref} from 'vue'
import { useGlobalVar, useMain } from '@renderer/store';
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'
import { throttle } from 'lodash';
const globalVar = useGlobalVar()
const props = defineProps<{
    list:id3Message[]
    searchKey:string
}>()
watch(()=>props.list,async()=>{
    console.log(props.list,"传递过来的idmessage");
},{immediate:true})
// let searchKey = ref(props.searchKey)
// watch(()=>props.searchKey,()=>{
//     searchKey.value = props.searchKey
// })

const getZhuanji = (index:number,name: string ,detail: {description: string;value: string;} | undefined,_163key:string | undefined) => {
    if(detail && detail.description == 'al id'){
        return { name, id: +detail.value, tns: [] }
    }else if(_163key){
        //@ts-ignore
        return { name, id: props.list[index].comment.text.albumId ?? -new Date().getTime(), tns: [] }
    }else{
        return { name, id: -new Date().getTime(), tns: [] }
    }
}
const getSongid = (index:number,detail: {description: string;value: string;} | undefined,_163key:string | undefined)=>{
    console.log(props.list[index],index);
    if(detail && detail.description == 'song id'){
        return detail.value
    }
    else if(_163key){
        //@ts-ignore
        return props.list[index].comment.text.musicId ?? -new Date().getTime()
    }else{
        return -new Date().getTime()
    }
}

const getSinger = (index:number,names: string | string[], detail: {description: string;value: string;} | undefined,_163key:string | undefined): any[] => {
    if(detail && detail.description == 'ar ids'){
        const arr: { id: number, name: string }[] = []
        let namesList = names as string[]
        if(typeof(names)=='string') namesList = names.split('/')
        const idsList = detail?.value.split(',')
        namesList?.forEach(({ }, index) => {
            arr.push({ id: +idsList[index], name: namesList[index] })
        })
        return arr
    }else if(_163key){
        const arr:{}[] = []
        const list = props.list[index].comment?.text.artist ?? []
        list.forEach((item:[string,number])=>{
            arr.push({id:item[1],name:item[0]})
        })
        // console.log(arr);//[ [ 'AO', 18444 ], [ 'TOPHAMHAT-KYO', 201635 ] ],
        // console.log(props.list[index].comment?.text);
        return arr
    }else{
        console.log(names,"?????????PPPPPP");
        const arr: { id: number, name: string }[] = []
        let namesList = names as string[]
        if(typeof(names)=='string') namesList = names.split('/')
        namesList.forEach(({ }, index) => {
            arr.push({ id: 0, name: namesList[index] })
        })
        return arr
    }

}
const getTime = (item:id3Message)=>{
    if(item.comment && item.comment.text.duration){
        return item.comment.text.duration
    }else if(item.time){
        return item.time
    }else{
        return 0
    }
}
const Main = useMain()

const pushPlayList = async(flag:number | undefined,list = Array.from(props.list))=>{
    const playingList:any[] = []
    const playingPrivileges:any[] = []
    console.log(list);
    let promises 
    if(flag){
        promises = list.map(async(item,index)=>{
            const song = {
                name:item.title,
                id:getSongid(flag,item?.userDefinedText?.[0],item?.comment?.text),
                ar:getSinger(flag,item.artist, item?.userDefinedText?.[2],item?.comment?.text),
                al:getZhuanji(flag,item.album, item?.userDefinedText?.[1],item?.comment?.text),
                localPath:item.path,
                dt:getTime(item)
            }
            console.log(item);
            playingList.push(song)
            playingList[playingList.length - 1].al['picUrl'] = await bufferToBase64(item.image?.imageBuffer)
            const privilege = {
                id:getSongid(flag,item?.userDefinedText?.[0],item?.comment?.text),
                maxBrLevel: "local",
                playMaxBrLevel: "local",
                downloadMaxBrLevel: "local",
                plLevel: "local",
                dlLevel: "local",
                flLevel: "local",
            }
            playingPrivileges.push(privilege)
        })
    }else{
        promises = list.map(async(item,index)=>{
            const song = {
                name:item.title,
                id:getSongid(index,item?.userDefinedText?.[0],item?.comment?.text),
                ar:getSinger(index,item.artist, item?.userDefinedText?.[2],item?.comment?.text),
                al:getZhuanji(index,item.album, item?.userDefinedText?.[1],item?.comment?.text),
                localPath:item.path,
                dt:getTime(item)
            }
            console.log(item);
            playingList.push(song)
            playingList[playingList.length - 1].al['picUrl'] = await bufferToBase64(item.image?.imageBuffer)
            const privilege = {
                id:getSongid(index,item?.userDefinedText?.[0],item?.comment?.text),
                maxBrLevel: "local",
                playMaxBrLevel: "local",
                downloadMaxBrLevel: "local",
                plLevel: "local",
                dlLevel: "local",
                flLevel: "local",
            }
            playingPrivileges.push(privilege)
        })
    }
    return Promise.all(promises).then(()=>{
        if(Main.playingindex == -1 || flag == undefined){
            Main.playingList = playingList
            Main.playingPrivileges = playingPrivileges
        }else if(flag!=undefined){
            Main.playingList.splice(Main.playingindex,0,...playingList)
            Main.playingPrivileges.splice(Main.playingindex,0,...playingPrivileges)
        }
    })
}

const localPlay = async({index,id})=>{
    console.log(id,"我是nan?");
    
    if(globalVar.setting.playWay){//替换
        await pushPlayList(undefined)
        Main.playingindex = index
    }  
    else {
        await pushPlayList(index - 1,[props.list[index - 1]])
        Main.playingindex = Main.playingindex == -1?1:Main.playingindex+1
    }
    Main.playStatus = 'play'
    Main.songType = 'song'
    if(globalVar.setting.playWay)Main.beforePlayListId = -2
    Main.playing = id
}
function bufferToBase64(buffer) {
    if(buffer == undefined)return Promise.resolve('')
    const reader = new FileReader();
    reader.readAsDataURL(new Blob([buffer], { type: 'image/jpeg' }));
    return new Promise((resolve, reject) => {
        reader.onloadend = () => {
        const base64String = reader.result;
        resolve(base64String);
        };
        reader.onerror = reject;
    });
}
const listCopyLength = ref(0)
const listCopy:Ref<{title:string,al:string,ar:string[],indexList:number}[]> = ref([])
watch(()=>props.searchKey,throttle(searchKeyFn, 500))
function searchKeyFn() {
    if (props.searchKey != '') {
        listCopy.value = [];
        props.list.forEach((element, index) => {
            // console.log(Boolean(element.tns));

            let songName = element.title;
            // let songTns = (element.tns && element.tns?.length !== 0) ? element.tns[0] : ''
            // let songAlia = (element.alia.length !== 0 && songTns == '') ? element.alia[0] : ''
            let songAlName = element.comment?.text?element.comment.text.album:element.album
            // let songAlTns = element.al?.tns.length !== 0 ? element.al?.tns[0] : ''
            let songAr = element.artist.split('/')
            // console.log(songName,'****',songTns,'****',songAlia,'****'
            // ,songAlName,'****',songAlTns,'****',songAr);

            if (songName.toLowerCase().includes(props.searchKey.toLowerCase()) ||
                songAlName.toLowerCase().includes(props.searchKey.toLowerCase()) ||
                songAr.some((element) => {
                    return element.toLowerCase().includes(props.searchKey.toLowerCase())
                })) {
                listCopy.value.push({title:songName,al:songAlName,ar:songAr,indexList:index+1})
            }
        })

        let reg = new RegExp(`${props.searchKey}`, 'gi');
        listCopy.value.forEach((currentValue, index:number, array) => {
            // currentValue = JSON.parse(currentValue)
            // array[index] = JSON.parse(currentValue)
            let songName = currentValue.title;
            // let songTns = (currentValue.tns && currentValue.tns?.length !== 0) ? currentValue.tns[0] : ''
            // let songAlia = (currentValue.alia.length !== 0 && songTns == '') ? currentValue.alia[0] : ''
            let songAlName =  currentValue.al
            // let songAlTns = currentValue.al?.tns.length !== 0 ? currentValue.al?.tns[0] : ''
            let songAr = currentValue.ar

            let t = 0
            let Match;
            Match = array[index].title.match(reg)
            if (Match) array[index].title = songName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            t = 0
            Match = array[index].al.match(reg)
            console.log(Match);
            if (Match) array[index].al = songAlName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            songAr.forEach((ele, i: number) => {
                if (ele) {
                    t = 0
                    Match = ele.match(reg)
                    if (Match) array[index].ar[i] = ele.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
                }
            })
        })
        listCopyLength.value = listCopy.value.length;
    }
}

watch(()=>globalVar.playLoacalIndex,async()=>{
    if(globalVar.playLoacalIndex!=0){
        let tflag = false
        if(Main.playingList.length == 0)tflag = true
        console.log(Math.abs(globalVar.playLoacalIndex));
        console.log(props.list);
        await pushPlayList(1,Array.from([props.list[Math.abs(globalVar.playLoacalIndex)-1]]))
        console.log(Main.playingList);
        if(tflag){
            Main.playingindex = 1
            Main.playStatus = 'play'
            Main.songType = 'song'
            Main.playing = Main.playingList[0].id
            globalVar.closePointOutMessage = '已经开始播放'
            globalVar.closePointOut = true
        }else if(globalVar.playLoacalIndex > 0 ){
            Main.playingindex++
            Main.playStatus = 'play'
            Main.songType = 'song'
            Main.playing = Main.playingList[Main.playingindex-1].id
            globalVar.closePointOutMessage = '已经开始播放'
            globalVar.closePointOut = true
        }else{
            globalVar.closePointOutMessage = '已添加到播放列表'
            globalVar.closePointOut = true
        }
        globalVar.playLoacalIndex = 0
    }
})

defineExpose({pushPlayList})
</script>

<style scoped lang="less">
:deep(.caozuo){
    width: 75px !important;
}
:deep(.xin){
    padding-left: 15px !important;
}
:deep(.song-name){
    width: calc((100%) * 0.32 - 2px) !important;
}
:deep(.song-hand){
    width: calc((100%) * 0.3)!important;
}
</style>