<template>
    <LineMusic 
    v-show="searchKey.length == 0"
    :title="val?.title" 
    :singer="getSinger(val.artist, val.userDefinedText[2]?.value)"
    :id="+val.userDefinedText[0]?.value" 
    :showIndex="true" 
    :oneselfColor="true"
    :zhuanji="getZhuanji(val.album, val.userDefinedText[1]?.value)" 
    :local="true" 
    :index="index+1"
    :path="val.path"
    :key="+val.userDefinedText[0]?.value"
    :imageBuffer="val.image?.imageBuffer"
    dataType="songDownload"
    v-for="val,index in list" @localPlay="localPlay"></LineMusic>
    <LineMusic 
    v-show="searchKey.length != 0"
    :title="listCopy[index]?.title" 
    :singer="getSinger(listCopy[index].ar, list[listCopy[index].indexList-1].userDefinedText[2].value)"
    :id="+list[listCopy[index].indexList-1].userDefinedText[0].value" 
    :showIndex="true" 
    :oneselfColor="true"
    :zhuanji="getZhuanji(listCopy[index].al, list[listCopy[index].indexList-1]?.userDefinedText[1]?.value)" 
    :local="true" 
    :index="listCopy[index].indexList"
    :path="list[listCopy[index].indexList-1].path"
    :imageBuffer="list[listCopy[index].indexList-1].image?.imageBuffer"
    :key="+list[listCopy[index].indexList-1].userDefinedText[0].value"
    dataType="songDownload"
    @localPlay="localPlay"
    v-for="val,index in listCopyLength" ></LineMusic>
</template>

<script setup lang="ts">
import { shallowRef, ShallowRef,nextTick, watch, Ref, ref } from 'vue'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'
import { useMain } from '@renderer/store';
import {throttle} from 'lodash'
import { useGlobalVar } from '@renderer/store';
const globalVar = useGlobalVar()
const props = defineProps<{
    searchKey:string
}>()
const list: ShallowRef<id3Message[]> = shallowRef([])
const Main = useMain()
window.electron.ipcRenderer.send('get-download-list-detail')
window.electron.ipcRenderer.on('look-download-list-detail', ({ }, data: any[]) => {
    data = data.filter(it=>it.userDefinedText[0].description=='song id')
    console.log(data);
    list.value = data
})
window.electron.ipcRenderer.on('look-download-list-del-path',({},path)=>{
    console.log(path);
    list.value = list.value.filter((it)=>{
        console.log(it.path);
        return it.path != path
    })
})
window.electron.ipcRenderer.on('look-download-list-add-path',({},val)=>{
    list.value.unshift(val)
})
const getSinger = (names: string | string[], ids: string): any[] => {
    const arr: { id: number, name: string }[] = []
    let namesList = names as string[]
    if(typeof(names) == 'string')namesList = names.split('/')
    const idsList = ids.split(',')
    namesList.forEach(({ }, index) => {
        arr.push({ id: +idsList[index], name: namesList[index] })
    })
    return arr
}

const getZhuanji = (name: string, id: string): any => {
    return { name, id: +id, tns: []}
}

const pushPlayList = async(flag:1 | undefined,list2 = Array.from(list.value))=>{
    const playingList:any[] = []
    const playingPrivileges:any[] = []
    const promises = list2.map(async(item)=>{
        const song = {
            name:item.title,
            id:+item.userDefinedText[0].value,
            ar:getSinger(item.artist,item.userDefinedText[2].value),
            al:{
                id:item.userDefinedText[1].value,
                name:item.album,
                picUrl:'',
                tns:[]
            },
            localPath:item.path,
            dt:+item.time
        }
        playingList.push(song)
        playingList[playingList.length - 1].al.picUrl = await bufferToBase64(item.image.imageBuffer)
        const privilege = {
            id:+item.userDefinedText[0].value,
            maxBrLevel: "local",
            playMaxBrLevel: "local",
            downloadMaxBrLevel: "local",
            plLevel: "local",
            dlLevel: "local",
            flLevel: "local",
        }
        playingPrivileges.push(privilege)
    })
    return Promise.all(promises).then(()=>{
        if(Main.playingindex == -1 || flag == undefined){
            Main.playingList = playingList
            Main.playingPrivileges = playingPrivileges
        }else if(flag == 1){
            Main.playingList.splice(Main.playingindex,0,...playingList)
            Main.playingPrivileges.splice(Main.playingindex,0,...playingPrivileges)
        }
    })
}

const localPlay = async({index,id})=>{
    if(globalVar.setting.playWay){//替换
        await pushPlayList(undefined)
        Main.playingindex = index
    }  
    else {
        await pushPlayList(1,[list.value[index - 1]])
        Main.playingindex = Main.playingindex == -1?1:Main.playingindex+1
    }
    Main.playStatus = 'play'
    Main.songType = 'song'
    if(globalVar.setting.playWay)Main.beforePlayListId = 0
    Main.playing = id
}

watch(()=>globalVar.playLoacalIndex,async()=>{
    if(globalVar.playLoacalIndex!=0){
        let tflag = false
        if(Main.playingList.length == 0)tflag = true
        console.log(Math.abs(globalVar.playLoacalIndex));
        await pushPlayList(1,Array.from([list.value[Math.abs(globalVar.playLoacalIndex)-1]]))
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

function bufferToBase64(buffer) {
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
        list.value.forEach((element, index) => {
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
defineExpose({pushPlayList,list})
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