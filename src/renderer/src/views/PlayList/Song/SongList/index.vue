<template>
    <div v-if="loadingFlag">加载中</div>
    <div v-else class="music-list" @mouseleave="removeBottomColor" :class="{
        dragMouseStyleCan: Main.dragMouse && Main.dragType == 'songMy',
        'music-list-oneself': globalVar.oneself == 1
    }" id="song-sheet">
        <LineMusic v-show="searchKey.length == 0" v-for="(value, index) in forLength" :index="value"
            :title="list[index]?.name || ''" :singer="list[index]?.ar || ['']" :zhuanji="list[index]?.al || ''"
            :time="list[index]?.dt || 0" :id="list[index]?.id || 0" :tns="list[index]?.tns" :alia="list[index]?.alia"
            :key="list[index]?.id" :show-index="true" :length="forLength" :oneselfColor="true" @warpPlace="warpPlace" v-load>
        </LineMusic>
        <LineMusic v-show="searchKey.length != 0" v-for="(value, index) in searchLength" :index="listCopy[index]?.indexList"
            :title="listCopy[index]?.name || ''" :singer="listCopy[index]?.ar || ['']" :zhuanji="listCopy[index]?.al || ''"
            :time="listCopy[index]?.dt || 0" :id="listCopy[index]?.id || 0" :tns="listCopy[index]?.tns"
            :alia="listCopy[index]?.alia" :key="listCopy[index]?.id" :show-index="true" :indexSearch="value"
            :length="searchLength" :oneselfColor="true" @warpPlace="warpPlace"></LineMusic>
    </div>
</template>

<script lang="ts" setup>
import { inject, Ref, watch, ref, shallowRef, toRef,Directive, nextTick } from 'vue'
import { useRoute } from 'vue-router';
import { useMain, useGlobalVar } from '@renderer/store'
import { throttle } from 'lodash'
const Main = useMain();
const globalVar = useGlobalVar();
const route = useRoute();
let id = ref(route.query.id) as Ref<string>

let songNumber = inject<Ref<number>>('songNumber') as Ref<number>
let searchKey = inject<Ref<string>>('searchKey') as Ref<string>
let forLength = ref(0);
let searchLength = ref(0);
let loadingFlag = ref(true);
let list = shallowRef<Array<any>>() as Ref<any[]>;
let listCopy = shallowRef<Array<any>>() as Ref<any[]>;

type dragObj = {
    from: number
    to: number
}

let likeChange = toRef(Main, 'likeChange')
let playListId = toRef(Main, 'playListId')

watch(likeChange, async (newValue, oldValue) => {
    console.log(list.value);
    console.log('likeChange激活');
    
    if (newValue != ' , ') {
        let arr = newValue.split(',')
        console.log(arr[0] == id.value,'231294u0xzzzzzzzzzzzzz');
        
        if (id.value == playListId.value[0]) {
            //true是增加
            if (arr[1] == 'false') {
                for (let i = 0; i < list.value.length; i++) {
                    console.log(list.value[i].id, arr[0], i);
                    console.log(list.value[i].id == arr[0]);
                    if (list.value[i].id == arr[0]) {
                        list.value.splice(i, 1)
                        forLength.value--
                        break
                    }
                }
                console.log(list.value);
            }
        } else if(route.name == 'songPlaylist' && arr[0] == id.value) {
            let song = (await Main.reqSongDetail([+Main.playing])).data.songs[0]
            list.value.unshift(song)
            forLength.value++
            likeChange.value = ' , '
        }else{
            likeChange.value = ' , '
        }
    }


})


const warpPlace = (obj: dragObj) => {
    let { to, from } = obj
    console.log(to, from);

    if (to == -1) {
        let del = list.value.splice(from, 1)
        list.value.push(del[0])
    } else {
        let del = list.value.splice(from, 1)
        if (to == 0) {
            list.value.unshift(del[0])
        } else {
            list.value.splice(to, 0, del[0])
        }
    }
}


const removeBottomColor = () => {
    Main.mouseDragOnIndex = -2
}

watch(route, () => {
    searchKey.value = ''
})

function searchKeyFn() {
    if (searchKey.value != '') {
        listCopy.value = [];
        list.value.forEach((element, index) => {
            // console.log(Boolean(element.tns));

            let songName = element.name;
            let songTns = (element.tns && element.tns?.length !== 0) ? element.tns[0] : ''
            let songAlia = (element.alia.length !== 0 && songTns == '') ? element.alia[0] : ''
            let songAlName = element.al?.name ? element.al?.name : '未知专辑'
            let songAlTns = (element.al?.tns?.length ?? 0) !== 0 ? element.al?.tns?.[0] : ''
            let songAr = element.ar
            console.log(songName,'****',songTns,'****',songAlia,'****'
            ,songAlName,'****',songAlTns,'****',songAr);

            if (songName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
                songTns.toLowerCase().includes(searchKey.value.toLowerCase()) ||
                songAlia.toLowerCase().includes(searchKey.value.toLowerCase()) ||
                songAlName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
                songAlTns.toLowerCase().includes(searchKey.value.toLowerCase()) ||
                songAr.some((element2: any) => {
                    return element2.name?.toLowerCase().includes(searchKey.value.toLowerCase())
                })) {
                listCopy.value.push(JSON.parse(JSON.stringify(element)))
                listCopy.value[listCopy.value.length - 1]['indexList'] = index + 1;
            }
        })

        let reg = new RegExp(`${searchKey.value}`, 'gi');
        listCopy.value.forEach((currentValue: any, index: any, array: any) => {
            // currentValue = JSON.parse(currentValue)
            // array[index] = JSON.parse(currentValue)
            let songName = currentValue.name;
            let songTns = (currentValue.tns && currentValue.tns?.length !== 0) ? currentValue.tns[0] : ''
            let songAlia = (currentValue.alia.length !== 0 && songTns == '') ? currentValue.alia[0] : ''
            let songAlName = (currentValue.al?.name) ? (currentValue.al?.name) : '未知专辑'
            let songAlTns = (currentValue.al?.tns?.length ?? 0) !== 0 ? currentValue.al?.tns?.[0] : ''
            let songAr = currentValue.ar

            let t = 0
            let Match;
            Match = array[index].name.match(reg)
            if (Match) array[index].name = songName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            if (songTns != '') {
                t = 0
                Match = array[index].tns[0].match(reg)
                if (Match) array[index].tns[0] = songTns.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            }
            if (songAlia != '') {
                t = 0
                Match = array[index].alia[0].match(reg)
                if (Match) array[index].alia[0] = songAlia.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            }
            t = 0
            Match = array[index].al?.name?.match(reg)
            console.log(Match);
            if (Match) array[index].al.name = songAlName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            if (songAlTns != '') {
                t = 0
                Match = array[index].al.tns[0].match(reg)
                if (Match) array[index].al.tns[0] = songAlTns.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            }
            songAr.forEach((ele: any, i: number) => {
                if (ele.name) {
                    t = 0
                    Match = ele.name.match(reg)
                    if (Match) array[index].ar[i].name = ele.name.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
                }
            })
        })

        searchLength.value = listCopy.value.length;
    }
}

//搜索列表
watch(searchKey,throttle(searchKeyFn, 500))

let routeQuery = toRef(route, 'query')
let routeId = ref(routeQuery.value.id)
watch(routeQuery, () => {
    routeId.value = routeQuery.value.id
})
let alsongs = inject<Ref<any[]>>('alsongs')!

watch(routeId, async () => {
    console.log(routeQuery.value,'PPPPPPPP{}}}');
    if (route.fullPath.startsWith('/app/playlist/song')) {
        if(routeQuery.value.type == '歌单'){
            loadingFlag.value = true
            id.value = route.query.id as string
            list.value = (await Main.reqPlaylistTrackAll(id.value,500,0)).data.songs
            let arr: [any] | [] = []
            list.value.forEach((element): void => {
                arr.push(element.id as never);
            })
            Main.openPlayListId = arr
            listCopy.value = []
            loadingFlag.value = false
        }else if(routeQuery.value.type == '专辑'){
            // loadingFlag.value = true
            // list.value = alsongs.value
            // let arr: [any] | [] = []
            // list.value.forEach((element): void => {
            //     arr.push(element.id as never);
            // })
            // Main.openPlayListId = arr
            // listCopy.value = []
            // loadingFlag.value = false
            // console.log(alsongs,'{}}}OOKKK');
        }
    }
}, { immediate: true })

watch(alsongs,()=>{
    if(routeQuery.value.type == '专辑'){
        loadingFlag.value = true
        list.value = alsongs.value
        let arr: [any] | [] = []
        list.value.forEach((element): void => {
            arr.push(element.id as never);
        })
        Main.openPlayListId = arr
        listCopy.value = []
        loadingFlag.value = false
    }
})

watch(songNumber,()=>{
    if (songNumber.value <= 500) {
        forLength.value = songNumber.value
    } else {
        forLength.value = 500
    }
},{immediate:true})

const vLoad: Directive = (el: HTMLElement) => {
    const observer = new IntersectionObserver(([{ isIntersecting }]) => {
        if (isIntersecting) {
            if(+String(el.getAttribute('data-index'))+10 == forLength.value){
                load()          
            }
        }
    })
    observer.observe(el)
}


const load = async() => {
    if (forLength.value + 500 > songNumber.value && songNumber.value - forLength.value > 0){
        const MoreSong:any[] = (await Main.reqPlaylistTrackAll(id.value,songNumber.value - forLength.value,forLength.value)).data.songs
        list.value.push(...MoreSong);
        let arr: [any] | [] = []
        list.value.forEach((element): void => {
            arr.push(element.id as never);
        })
        Main.openPlayListId.push(...arr)
        forLength.value += songNumber.value - forLength.value
    }
    else if (songNumber.value - forLength.value > 0){
        const MoreSong:any[] = (await Main.reqPlaylistTrackAll(id.value,500,forLength.value)).data.songs
        list.value.push(...MoreSong);
        let arr: [any] | [] = []
        list.value.forEach((element): void => {
            arr.push(element.id as never);
        })
        Main.openPlayListId.push(...arr)
        forLength.value += 500
    }
}

</script>

<style lang="less" scoped>
.dragMouseStyleCan {
    cursor: url('@renderer/assets/point.png'), auto;
}

.music-list {
    width: 100%;
    padding-bottom: 20px;
    overflow: auto;
    >.topColor {
        position: relative;

        &::before {
            content: '';
            width: calc(100% - 8px);
            height: 2px;
            background-color: @primary-color;
            position: absolute;
            top: 0;
        }
    }

    >.bottomColor {
        position: relative;

        &::after {
            content: '';
            width: calc(100% - 8px);
            height: 2px;
            background-color: @primary-color;
            position: absolute;
            top: 34px;
        }
    }

    >:nth-child(odd) {
        background-color: @line-color-odd;
    }

    >:nth-child(even) {
        background-color: @line-color-even;
    }
}

.music-list-oneself {
    >:nth-child(odd) {
        background-color: rgba(46, 46, 46, .4);
    }

    >:nth-child(even) {
        background-color: rgba(43, 43, 43, .6);
    }
}
</style>