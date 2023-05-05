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
                <span>ZUN</span>
            </div>
            <div class="nickname">
                <span>ずん； 太田順也</span>
            </div>
            <div class="start h" id="startSelf" :class="
                {
                    'start-color-black': mainColor == 'NMblack',
                    'start-color-red': mainColor != 'NMblack',
                }">
                <div class="icon" :class="{ noDrag: !Main.dragMouse }">
                    <i class="iconfont icon-wenjian">
                        <i class="iconfont icon-gou" v-if="true"></i>
                        <i class="iconfont icon-jiahao_o" v-else></i>
                    </i>
                </div>
                <div class="txt" :class="{
                    noDrag: !Main.dragMouse,
                }">
                    <span v-if="true">已</span>
                    <span>收藏</span>
                </div>
            </div>
            <div class="Message" >
                <div>单曲数:114</div>
                <div>专辑数:514</div>
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
                >
                <!-- @go="go"
                @playAll="playAll" -->
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
            type="songHand"
            ></HBlock>
             <!-- @playAll="playAll"
            @click="go({id:artilseMessage.alList[index].id,index:artilseMessage.alList[index].index,uid:+$route.query.id!})" -->
            <HaveSongShow v-show="blockList[2]" v-for="({},index) in artilseMessage.alList"
            :url="artilseMessage.alList[index].picUrl" 
            :title="artilseMessage.alList[index].name"
            :id="artilseMessage.alList[index].id"
            :index="index"
            :uid="+$route.query.id!"
            :list_6="hotSong"
            type="songHand"
            >
            <!--             @playAll="playAll"
            @go="go" -->
            </HaveSongShow>  
            <div class="pagination">
                <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
                    :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
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
import { useRoute } from 'vue-router';
import { dayjsStamp } from '@renderer/utils/dayjs';
const Main = useMain()
const $route = useRoute()
const MainMenu = useMainMenu()
const globalVar = useGlobalVar()
let mainColor = toRef(MainMenu, 'colorBlock')
const TagList = ref()
const blockList = ref()
const nowPage = ref(1)
const hotSong:Ref<any[]> = ref([])
const alList:Ref<any[]> = ref([])

const artilseMessage = reactive<{
    alList:Ref<any[]>
    name:string | undefined
    avatarUrl:string
    fans:number
    like:number
    follow:number
    describe:string
}>({
    alList:ref([]),
    name:undefined,
    avatarUrl:'',
    fans:0,
    like:0,
    follow:0,
    describe:''
})

console.log(hotSong.value,alList.value);
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

const result = await Main.reqArtists(+$route.query.id!)
hotSong.value = result.hotSongs
artilseMessage.avatarUrl = result.artist.img1v1Url
let flag = false
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

    // let l = nowPage.value == 1?(nowPage.value-1) * 20:(nowPage.value-1) * 20-1
    // if(TagList.value[0] != true)l = (nowPage.value-1) * 20
    // let r = nowPage.value == 1 && TagList.value[0] == true?19:l+20
    // artilseMessage.alList= BaseList.value.slice(l,r)
    // if(nowPage.value == 1 && $route.query.id == BasicApi.profile!.userId && TagList.value[0] == true){
    //     artilseMessage.alList.unshift({
    //         coverImgUrl:'https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305041345401.png',
    //         id:-5,
    //         name:'我的听歌排行',
    //         creator:{
    //             id:$route.query.id,
    //             name:BasicApi.profile!.nickname
    //         }
    //     })
    // }
    // if(flag){
    //     globalVar.changeMainScroll = -(globalVar.mainScroll - 220)
    // }else{
    //     flag = true
    // }
}
changePage()




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
const total = ref(result.artist.albumSize)
const totalPage = ref(Math.ceil(total.value / 20))

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
        }
        .Wlist{
            :deep(.imgae){
                flex: 0 0 12%;
                padding-bottom:12%;
            }
        }
    }
}
</style>