<template>
  <div class="SongHand">
    <div class="top">
        <div class="left">
            <el-image draggable="false" style="width: 180px; height: 180px" :src="artilseMessage.avatarUrl">
                <template #error>
                    <el-image draggable="false" :src="icon" style="width: 180px; height: 180px"></el-image>
                </template>
            </el-image>
        </div>
        <div class="right">
            <div class="name">
                <span>{{ artilseMessage.name }}</span>
            </div>
            <div class="nickname" v-show="artilseMessage.trans.length != 0 || artilseMessage.alias.length!=0">
                <span>{{ artilseMessage.trans }}{{artilseMessage.alias.join(';')}}</span>
            </div>
            <div class="start h" id="startSelf" @click="subSonger" :class="
                {
                    'start-color-black': mainColor == 'NMblack',
                    'start-color-red': mainColor != 'NMblack',
                }">
                <div class="icon" :class="{ noDrag: !Main.dragMouse }">
                    <i class="iconfont icon-wenjian">
                        <i class="iconfont icon-gou" v-if="isSub"></i>
                        <i class="iconfont icon-jiahao_o" v-else></i>
                    </i>
                </div>
                <div class="txt" :class="{
                    noDrag: !Main.dragMouse,
                }">
                    <span v-if="isSub">已</span>
                    <span>收藏</span>
                </div>
            </div>
            <div class="Message" >
                <div>单曲数:{{ artilseMessage.musicSize }}</div>
                <div>专辑数:{{artilseMessage.albumSize }}</div>
            </div>
        </div>
    </div>
    <div class="bottom">
        <div class="option">
            <div class="tags">
                <Tag message="专辑" :ifClick="TagList[0]" :big="true" @click="changeTag(0,true)"></Tag>
                <Tag message="歌手详情" :ifClick="TagList[1]" :big="true" @click="changeTag(1,true)"></Tag>
                <Tag message="相似歌手" :ifClick="TagList[2]" :big="true" @click="changeTag(2,true)"></Tag>
            </div>
            <div class="way" v-if="TagList[0]">
                <div class="block b1" :class="{active:blockList[0]}" @click="changeBlock(0)">
                    <i class="iconfont icon-datu"></i>
                </div>
                <div class="block b2" :class="{active:blockList[1]}" @click="changeBlock(1)">
                    <i class="iconfont icon-liebiao"></i>
                </div>
                <div class="block b3" :class="{active:blockList[2]}" @click="changeBlock(2)">
                    <i class="iconfont icon-liebiao1"></i>
                </div>
            </div>
        </div>
        <div class="list" :class="{Wlist:MainMenu.width > 1020}" v-if="TagList[0]">
            <PlayListShow v-show="blockList[0]" v-for="({},index) in artilseMessage.alList" 
                :url="artilseMessage.alList[index].picUrl" 
                :i="index"
                :my-index="artilseMessage.alList[index].index"
                :num="Math.floor(artilseMessage.alList.length / 4)*4"
                :idr="artilseMessage.alList[index].id"
                :uid="+$route.query.id!"
                type="al"
                @playAll="playAll"
                @go="go"
                >
                <template #default>
                    <div class="message">
                        <span class="txt">{{artilseMessage.alList[index].name}}</span>
                        <span class="num">{{dayjsStamp(artilseMessage.alList[index].publishTime)}}</span>
                        <!-- <span class="num" v-show="artilseMessage.alList[index].id!=-5">{{artilseMessage.alList[index].size}}首</span> -->
                    </div>
                </template>
            </PlayListShow>
            <HBlock v-show="blockList[1]" v-for="({},index) in artilseMessage.alList"
            :url="artilseMessage.alList[index].picUrl" 
            :Name="artilseMessage.alList[index].name"
            :id="artilseMessage.alList[index].id"
            :trackCount="artilseMessage.alList[index].size"
            :time="artilseMessage.alList[index].publishTime"
            type="songHand"
            @playAll="playAll"
            @click="go({id:artilseMessage.alList[index].id})"
            ></HBlock>
            <HaveSongShow :class="{first:artilseMessage.alList[index].id == -6}" v-show="blockList[2]" v-for="({},index) in artilseMessage.alList"
            :url="artilseMessage.alList[index].picUrl" 
            :title="artilseMessage.alList[index].name"
            :id="artilseMessage.alList[index].id"
            :index="index"
            :uid="+$route.query.id!"
            :list_6="hotSong"
            :time="artilseMessage.alList[index].publishTime"
            type="songHand"
            @playAll="playAll"
            @go="go"
            >
            </HaveSongShow>  
            <div class="pagination">
                <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
                    :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
            </div>  
        </div>
        <div class="detail" v-if="TagList[1]">
            <div class="dec" v-show="artilseMessage.dec.length!=0">
                <div class="title">{{ artilseMessage.name+'的简介' }}</div>
                <div class="mes">
                    {{ artilseMessage.dec }}
                </div>
            </div>
            <div class="intruction" v-for="val in artilseMessage.introduction">
                <div class="title">{{ val.ti }}</div>
                <div class="mes" v-html="val.txt.replaceAll(/\n/g, '<br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;')">
                </div>
            </div>
            <div class="nill" v-show="artilseMessage.dec.length==0 && artilseMessage.introduction.length == 0">暂无介绍</div>
        </div>
        <div class="simi" v-if="TagList[2]">
            <div v-for="val in artilseMessage.simi" @click="goHandSong(val.id)">
                <el-image draggable="false"  :src="val.img1v1Url">
                    <template #error>
                        <el-image draggable="false" :src="icon" style="width: 180px; height: 180px"></el-image>
                    </template>
                </el-image>
                <div class="txt"> {{ val.name }}</div>
            </div>
        </div>
    </div>
    <!-- {{$route.query.id}} -->
    <!-- songhand -->
  </div>
</template>

<script setup lang="ts">
import icon from '@renderer/assets/icon.png'
import {toRef,ref, watchEffect,Ref, reactive, watch} from 'vue'
import { useMain,useMainMenu,useGlobalVar } from '@renderer/store';
import { useRoute,useRouter } from 'vue-router';
import { dayjsStamp } from '@renderer/utils/dayjs';
import { useBasicApi } from '@renderer/store';
const Main = useMain()
const $route = useRoute()
const $router = useRouter()
const MainMenu = useMainMenu()
const globalVar = useGlobalVar()
const BasicApi = useBasicApi()
let mainColor = toRef(MainMenu, 'colorBlock')
const TagList = ref()
const blockList = ref()
const nowPage = ref(1)
const hotSong:Ref<any[]> = ref([])
const alList:Ref<any[]> = ref([])
const isSub = ref(BasicApi.startSongHand.some(it=>it.id == $route.query.id))
const artilseMessage = reactive<{
    alList:Ref<any[]>
    name:string | undefined
    avatarUrl:string
    fans:number
    like:number
    follow:number
    trans:string
    alias:string[]
    albumSize:number
    musicSize:number
    dec:string
    introduction:any[]
    simi:any[]
}>({
    alList:ref([]),
    name:undefined,
    avatarUrl:'',
    fans:0,
    like:0,
    follow:0,
    trans:'',
    alias:[],
    albumSize:0,
    musicSize:0,
    dec:'',
    introduction:[],
    simi:[]
})

if(sessionStorage.getItem('SongHand') == null){
    TagList.value = [true,false,false]
    blockList.value = [false,false,true]
    sessionStorage.setItem('SongHand',JSON.stringify({
        TagList:[true,false,false],
        blockList:[false,false,true],
        nowPage:1,
    }))
}else{
    const obj = JSON.parse(sessionStorage.getItem('SongHand')!)
    TagList.value = obj.TagList
    blockList.value = obj.blockList
    nowPage.value = obj.nowPage
}
watchEffect(()=>{
    sessionStorage.setItem('SongHand',JSON.stringify({
        TagList:TagList.value,
        blockList:blockList.value,
        nowPage:nowPage.value
    }))
})
let result
const changePage = async(num?:number)=>{
    let result = await Main.reqartistAlbum(+$route.query.id!,20,(nowPage.value - 1)*20)
    artilseMessage.alList = result.hotAlbums
    if(blockList.value[2] && nowPage.value == 1){
        artilseMessage.alList.unshift({
            picUrl:'https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305052027910.png',
            name:'热门50首',
            id:-6,
            uid:+$route.query.id!
        })
    }else{
    }
    if(flag && num == undefined){
        globalVar.changeMainScroll = -(globalVar.mainScroll - 220)
    }else{
        flag = true
    }
}
let flag = false
const total = ref()
const totalPage = ref()
const init = async (id,num?:number)=>{
    const p1 = Main.reqArtists(id!)
    const p2 = Main.reqartistDesc(id!)
    const p3 = Main.reqsimiartist(id!)
    const results = await Promise.all([p1,p2,p3])
    result = results[0]
    const mesg = results[1]
    artilseMessage.simi = results[2].artists
    hotSong.value = result.hotSongs
    artilseMessage.avatarUrl = result.artist.img1v1Url
    artilseMessage.name =  result.artist.name
    artilseMessage.trans = result.artist.trans ?? ''
    if(artilseMessage.trans.length != 0)artilseMessage.trans +=';'
    artilseMessage.albumSize =  result.artist.albumSize
    artilseMessage.musicSize =  result.artist.musicSize
    artilseMessage.alias = result.artist.alias ?? []
    artilseMessage.introduction = mesg.introduction
    artilseMessage.dec =  mesg.briefDesc
    changePage(num)
    total.value = result.artist.albumSize
    totalPage.value = Math.ceil(total.value / 20)
}
try {
    await init($route.query.id)
} catch (error) {
    console.log(error);
    $router.replace({
        name:'404'
    })
}

const changeTag = (index:number,flag:boolean)=>{
    TagList.value.fill(false)
    TagList.value[index] = true
    if(flag)nowPage.value = 1
    if(index == 0){
        changePage(1)
        // total.value = Main.createPlay + 1
        // BaseList.value = Main.playList.slice(0,Main.createPlay + 1)
    }else if(index == 1){
        // total.value = Main.startPlay + 1
        // BaseList.value = Main.playList.slice(Main.createPlay + 1)
    }
    // totalPage.value = Math.ceil(total.value / 20)
    // changePage()

}


watch(nowPage,()=>{
    changePage()
})

const changeBlock = (index:number)=>{
    blockList.value.fill(false)
    blockList.value[index] = true
    if( index!= 2 && artilseMessage.alList[0].id == -6) artilseMessage.alList.shift()
    else if(index == 2 && artilseMessage.alList[0].id != -6){
        artilseMessage.alList.unshift({
            picUrl:'https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305052027910.png',
            name:'热门50首',
            id:-6,
            uid:+$route.query.id!
        })
    }
}

const playAll = async (id)=>{
    if(id == -6){
        const songList = hotSong.value
        console.log(result,songList);
        Main.playingList = songList
        Main.playingPrivileges = songList.map(item=>item.privilege)
        Main.playingindex = 1
        Main.playing = songList[0].id as number
        Main.beforePlayListId = -6
        Main.playStatus = 'play'
        let str = songList[0].name +' - ';
        let singerArr = songList[0].ar as unknown as Array<any>
        singerArr.forEach((element,index)=>{
            str+=element.name
            if(index != singerArr.length - 1)str+=' / '
        })
        window.electron.ipcRenderer.send('change-play-thum',str)
        window.electron.ipcRenderer.send('render-play')
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }else{
        let result = (await Main.reqAlbumTrackAll(id)).data;
        Main.playingList = result.songs
        Main.playingPrivileges = result.songs.map(item=>item.privilege)
        Main.playingindex = 1
        Main.playing = result.songs[0].id as number
        Main.beforePlayListId = id
        Main.playStatus = 'play'
        let str = result.songs[0].name +' - ';
        let singerArr = result.songs[0].ar as unknown as Array<any>
        singerArr.forEach((element,index)=>{
            str+=element.name
            if(index != singerArr.length - 1)str+=' / '
        })
        window.electron.ipcRenderer.send('change-play-thum',str)
        window.electron.ipcRenderer.send('render-play')
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }
}

const go = ({id})=>{
    if(id != -6){
        $router.push({
            name:'songPlaylist',
            query:{
                id,my:'false',type:'专辑'
            }
        })
    }
}
const goHandSong = async(id)=>{
    // await init(id,1)
    $router.push({
        name:'SongHand',
        query:{
            id
        }
    })
    // changeTag(0,true)
    // globalVar.scrollToTop = true
    // const path = location.href.substring(0, location.href.indexOf('?'));
    // window.location.href = path +`?id=${id}`
}
$router.afterEach(async(to, from, failure) => {
    if(to.query.id != from.query.id && to.name == from.name){
        await init(to.query.id,1)
        changeTag(0,true)
        globalVar.scrollToTop = true
    }
})

const subSonger = async()=>{
    try {
        let flag
        //取关
        if(isSub.value)flag  = await Main.reqArtistSub($route.query.id,2)
        else flag = await Main.reqArtistSub($route.query.id,1)
        if(flag){
            if(isSub.value){
                globalVar.loadMessageDefault = '取消收藏成功'
                BasicApi.startSongHand = BasicApi.startSongHand.filter(item=>item.id != $route.query.id)
            }
            else{
                globalVar.loadMessageDefault = '收藏成功'
                BasicApi.followsId.push(+$route.query.id!)
                BasicApi.reqartistSublist()
            }
            isSub.value =!isSub.value
        }else{
            globalVar.loadMessageDefaultType = 'error'
            if(isSub.value)globalVar.loadMessageDefault = '取消收藏失败'
            else globalVar.loadMessageDefault = '收藏失败'
        }
        globalVar.loadMessageDefaultFlag = true
    } catch (error) {
        globalVar.loadMessageDefaultType = 'error'
        if(isSub.value)globalVar.loadMessageDefault = '取消收藏失败'
        else globalVar.loadMessageDefault = '收藏失败'
        globalVar.loadMessageDefaultFlag = true
    }
}

</script>

<style scoped lang="less">
.SongHand{
    margin: 30px;
    .top{
        // background-color: red;
        display: flex;
        margin-bottom: 30px;
        .left{
            width:180px;
            height: 180px;
            border-radius: .4em;
            // background-color: blue;
            margin-right: 20px;
            .el-image{
                border-radius: .4em;
            }
        }
        .right{
            width: calc(100% - 180px - 20px);
            .name{
                display: flex;
                justify-content: space-between;
                width: calc(100%);
                height: 30px;
                align-items: center;
                padding-bottom: 10px;
                >span{
                    color: @font-color;
                    font-weight: bolder;
                    font-size: 22px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
            }
            .nickname{
                font-size: 14px;
            }
            .Message{
                margin-top: 20px;
                display: flex;
                font-size: 13px;
                >div{
                    margin-right: 10px;
                }
            }
            .start {
                cursor: pointer;
                height: 32px;
                border-radius: 2em;
                border: @split-line-color 1px solid;
                display: flex;
                align-items: center;
                width: 100px;
                margin: 10px 0px;
                .icon {
                    color: inherit;
                    padding-left: 15px;
                    padding-right: 2px;

                    .icon-wenjian {
                        position: relative;
                        font-size: 18px;

                        &>.icon-jiahao_o {
                            font-size: 13px;
                            position: absolute;
                            left: 3px;
                            top: 3px;
                        }

                        &>.icon-gou {
                            font-size: 16px;
                            position: absolute;
                            left: 2px;
                            top: 1px;
                        }
                    }
                }

                .txt {
                    font-size: 14px;
                    padding-right: 10px;
                    padding-left: 5px;
                    display: flex;
                    max-width: 150px;
                    
                    >span:nth-child(2) {
                        display: block;
                        word-wrap: normal;
                    }
                }
            }
            
            .h:hover {
                background-color: @span-color-hover !important;
            }
            .start-color-black {
                background-color: rgb(43, 43, 43);
                color: @font-color !important;
            }

            .start-color-black-stop {
                background-color: @none-button !important;
                color: @none-font !important;
            }
        }
    }
    .bottom{
        .option{
            display: flex;
            justify-content: space-between;
            width: 100%;
            .tags{
                display: flex;
                >div{
                    margin-right: 15px;
                }
            }
            .way{
                display: flex;
                .block{
                    width: 26px;
                    height: 20px;
                    background-color: @small-choice-block-color-default;
                    margin-right: 2px;
                    color: @small-font-color;
                    cursor: pointer;
                    &:hover{
                        background-color: @small-choice-block-color-hover;
                    }
                }
                .b1{
                    border-top-left-radius: .2em;
                    border-bottom-left-radius: .2em;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    i{
                        font-size: 25px;
                    }
                }
                .b2{
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    i{
                        font-size: 12px;
                    }
                }
                .b3{
                    border-bottom-right-radius: .2em;
                    border-top-right-radius: .2em;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    i{
                        font-size: 14px;
                    }
                }
                .active{
                    background-color: @small-choice-block-color-click;
                    color: @font-color !important; 
                }
            }
        }
        .list{
            display: flex;
            justify-content: start;
            flex-wrap: wrap;
            margin-top: 10px;
            :deep(.imgae){
                flex: 0 0 20%;
                padding-bottom:20%;
            }
            .message{
                display: flex;
                flex-direction: column;
                .txt{
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: block;
                }
                .num{
                    color: @small-font-color;
                }
            }
            :deep(.Hblock){
                .left{
                    .name{
                        width: 300px;
                    }
                }
                .right{
                    margin-right: 0;
                }
            }
            :deep(.HaveSongShow){
                margin-bottom: 30px;
            }
            .pagination {
                display: flex;
                justify-content: center;
                margin-bottom: 20px;
                margin-top: 20px;
                width: 100%;
                :deep(.el-pagination) {
                    --el-pagination-hover-color: @font-color;

                    li,
                    .btn-prev,
                    .btn-next {
                        box-sizing: border-box;
                        border-radius: 3px !important;
                        background-color: rgba(0, 0, 0, 0);
                        border: 1px solid @split-line-color;
                        font-weight: normal;
                        margin: 2px;
                        width: 25px;
                        height: 25px;
                        color: @pagin-font;
                    }

                    .btn-prev,
                    .btn-next {
                        background-color: @pagin-bk-btn-color !important;
                        font-weight: bold;

                    }

                    li:not(.is-disabled).is-active {
                        background-color: @primary-color !important;
                        color: rgb(255, 255, 255) !important;
                    }

                    li:hover,
                    .btn-prev:not(:disabled):hover,
                    .btn-next:not(:disabled):hover {
                        background-color: @pagin-bk-hover-color !important;
                    }

                    button:disabled {
                        cursor: default !important;
                        color: @pagin-disable-font-color !important;
                    }
                }
            }
            .first{
                :deep(.right){
                    .title{
                        >span{
                            cursor: default !important;
                        }
                    }
                }
                :deep(.left){
                    .el-image{
                        cursor: default !important;
                    }
                }

            }
        }
        .Wlist{
            :deep(.imgae){
                flex: 0 0 12%;
                padding-bottom:12%;
            }
        }
        .detail{
            >div{
                margin-top: 20px;
                >.title{
                    margin-bottom: 10px
                }
                >.mes{
                    text-indent:2em;
                    color: @small-font-color;
                    line-height: 30px;
                    font-size: 14px;
                }
            }
            .nill{
                display: flex;
                justify-content: center;
                align-items: center;
                color: @small-font-color;
            }
        }
        .simi{
            margin-top: 20px;
            display: flex;
            flex-wrap: wrap;
            >div{
                flex-basis: 18.4%;
                width: 18.4%;
                margin-bottom: 20px;
                >.el-image{
                    border-radius: .4em;
                    cursor: pointer;
                }
                >.txt{
                    font-size: 13px;
                    height: 30px;
                    line-height: 30px;
                    user-select: none;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    width: 100%;
                    &:hover{
                        color: @font-color-hover;
                        cursor: pointer;
                    }
                }
            }
            >div:not(:nth-child(5n)){
                margin-right: 2%;
            }
        }
    }
}
</style>