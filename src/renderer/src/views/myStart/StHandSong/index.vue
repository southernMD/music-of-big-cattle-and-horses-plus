<template>
    <div class="StZhuanJi">
        <div class="top">
            <div class="title">收藏的歌手<span>({{ BasicApi.startSongHand.length }})</span></div>
            <div class="search">
                <input type="text" v-model="searchKey" :placeholder="`搜索收藏歌手`" @keydown.stop>
                <i class="iconfont icon-search" v-if="!searchKey"></i>
                <i class="iconfont icon-guanbi_o" v-else @click="clearSearch" :class="{ noDrag: !Main.dragMouse }"></i>
            </div>
        </div>
        <div class="list">
            <HBlock v-show="searchKey.length == 0" 
                v-for="val in list" 
                type="startSongHand"
                :Name="val.name" 
                :url="val.picUrl"
                :trackCount="val.albumSize" 
                :id="val.id" 
                :creators="val.artists"
                @click="go(val.id)"
            ></HBlock>
            <HBlock 
                v-show="searchKey.length != 0" 
                v-for="val in listCopy"
                type="startSongHand" 
                :Name="val.name"
                :url="val.picUrl" 
                :trackCount="val.albumSize" 
                :id="val.id" 
                :creators="val.artists"
                @click="go(val.id)"
            ></HBlock>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, Ref } from 'vue'
import { useMain, useBasicApi } from '@renderer/store'
import { useRouter } from 'vue-router'
import HBlock from '@renderer/components/myVC/HBlock.vue'
import { throttle } from 'lodash'
const Main = useMain()
const $router = useRouter()
const BasicApi = useBasicApi()
const searchKey = ref('')
const clearSearch = () => {
    searchKey.value = ''
}
let searchLength = ref(0);
const list = ref(BasicApi.startSongHand)
const listCopy: Ref<Array<any>> = ref([])
function searchKeyFn() {
    if (searchKey.value != '') {
        listCopy.value = [];
        list.value.forEach((element, index) => {
            // console.log(Boolean(element.tns));

            let songName = element.name;
            let songAr = element.artists

            if (songName.toLowerCase().includes(searchKey.value.toLowerCase()) ||
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
            let songAr = currentValue.artists

            let t = 0
            let Match;
            Match = array[index].name.match(reg)
            if (Match) array[index].name = songName.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
            t = 0
            Match = array[index].al?.name?.match(reg)
            console.log(Match);
            songAr.forEach((ele: any, i: number) => {
                if (ele.name) {
                    t = 0
                    Match = ele.name.match(reg)
                    if (Match) array[index].artists[i].name = ele.name.replace(reg, `<span style="color:var(--urlColor)" >${Match[t++]}</span>`)
                }
            })
        })

        searchLength.value = listCopy.value.length;
    }
}

//搜索列表
watch(searchKey, throttle(searchKeyFn, 500))

const go = (id)=>{
    if(id != 0){
        Main.detailStatus = 'close'
        $router.push({
            name:'SongHand',
            query:{
                id
            }
        })
    }
}
</script>


<style scoped lang="less">
.noDrag {
    cursor: pointer;
}

.StZhuanJi {
    .top {
        display: flex;
        justify-content: space-between;
        margin-top: 20px;
        margin-bottom: 20px;

        .title {
            font-size: 14px;
            line-height: 30px;
            font-weight: bolder;
            user-select: none;

            >span {
                font-size: 12px;
                color: @small-font-color;
            }
        }

        .search {
            width: 200px;
            height: 30px;
            background-color: rgba(0, 0, 0, .05);
            border-radius: 2em;

            input {
                background-color: rgba(0, 0, 0, .0);
                color: @small-font-color;
                height: 30px;
                width: 160px;
                margin-left: 10px;
            }
        }
    }

    .list {
        margin-left: -20px;

        >:nth-child(odd) {
            background-color: @line-color-odd;
        }

        >:nth-child(even) {
            background-color: @line-color-even;
        }
    }
}
</style>