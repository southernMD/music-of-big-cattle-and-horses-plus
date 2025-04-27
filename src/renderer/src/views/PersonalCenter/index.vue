<template>
    <div class="personalCenter" v-if="!loading">
        <div class="top">
            <div class="left">
                <el-image draggable="false" style="width: 180px; height: 180px" :src="personalMessage.avatarUrl">
                    <template #error>
                        <el-image draggable="false" :src="icon" style="width: 180px; height: 180px"></el-image>
                    </template>
                </el-image>
            </div>
            <div class="right">
                <div class="name">
                    <span>{{ personalMessage.name }}</span>
                    <div class="btn" @click="editorPersonal" v-if="$route.query.id == BasicApi.profile!.userId">
                        <div>
                            <i class="iconfont icon-bianji"></i>
                            <span>编辑个人信息</span>
                        </div>
                    </div>
                    <div class="btns" v-if="$route.query.id != BasicApi.profile!.userId">
                        <!-- <div>
                        <i class="iconfont icon-xinfeng"></i>
                        <span>发私信</span>
                    </div> -->
                        <div @click="followUser">
                            <i class="iconfont icon-big-gou" v-if="personalMessage.followed"></i>
                            <i class="iconfont icon-jiahao_o" v-else></i>
                            <span>{{ personalMessage.followed ? '已' : '' }}关注</span>
                        </div>
                    </div>
                </div>
                <div class="numbers">
                    <div class="tip" @click="goEvents">
                        <div class="number">{{ personalMessage.follow }}</div>
                        <div class="txt">动态</div>
                    </div>
                    <div class="line"></div>
                    <div class="tip" @click="goLike">
                        <div class="number">{{ personalMessage.like }}</div>
                        <div class="txt">关注</div>
                    </div>
                    <div class="line"></div>
                    <div class="tip" @click="goFans">
                        <div class="number">{{ personalMessage.fans }}</div>
                        <div class="txt">粉丝</div>
                    </div>
                </div>
                <div class="Message">
                    <div class="potion">
                        <span class="title">所在地区:</span>
                        <span class="txt">浙江省 杭州市</span>
                    </div>
                    <div class="describe">
                        <span class="title">个人介绍:</span>
                        <span class="txt" ref="describe">
                            {{ personalMessage.describe }}
                        </span>
                        <div class="open-jiantou" v-if="openJiantou">
                            <i class="iconfont icon-xiajiantou" v-if="openDescribeFlag" @click="openDescribe"></i>
                            <i class="iconfont icon-shangjiantou" v-else @click="openDescribe"></i>
                        </div>
                    </div>

                </div>
            </div>
        </div>
        <div class="bottom">
            <div class="option">
                <div class="tags">
                    <Tag message="创建的歌单" :ifClick="TagList[0]" :big="true" @click="changeTag(0, true)"></Tag>
                    <Tag message="收藏的歌单" :ifClick="TagList[1]" :big="true" @click="changeTag(1, true)"></Tag>
                </div>
                <div class="way">
                    <div class="block b1" :class="{ active: blockList[0] }" @click="changeBlock(0)">
                        <i class="iconfont icon-datu"></i>
                    </div>
                    <div class="block b2" :class="{ active: blockList[1] }" @click="changeBlock(1)">
                        <i class="iconfont icon-liebiao"></i>
                    </div>
                    <div class="block b3" :class="{ active: blockList[2] }" @click="changeBlock(2)">
                        <i class="iconfont icon-liebiao1"></i>
                    </div>
                </div>
            </div>
            <div class="list" :class="{ Wlist: MainMenu.width > 1020 }">
                <PlayListShow data-right="1" :data-type="personalMessage.dataTypeList[index]" v-if="blockList[0]"
                    v-for="({}, index) in personalMessage.MyplayList"
                    :url="personalMessage.MyplayList[index].coverImgUrl" :i="index"
                    :my-index="personalMessage.MyplayList[index].index"
                    :num="Math.floor(personalMessage.MyplayList.length / 4) * 4"
                    :idr="personalMessage.MyplayList[index].id" :uid="+$route.query.id!"
                    :data-txt="`歌单:${personalMessage.MyplayList[index].name} by${personalMessage.name}`" type="playList"
                    @go="go" @playAll="playAll">
                    <template #default>
                        <div class="message">
                            <span class="txt">{{ personalMessage.MyplayList[index].name }}</span>
                            <span class="num"
                                v-show="personalMessage.MyplayList[index].id != -5">{{ personalMessage.MyplayList[index].trackCount }}首</span>
                        </div>
                    </template>
                </PlayListShow>
                <HBlock data-right="1" :data-type="personalMessage.dataTypeList[index]" v-if="blockList[1]"
                    v-for="({}, index) in personalMessage.MyplayList"
                    :url="personalMessage.MyplayList[index]?.coverImgUrl"
                    :Name="personalMessage.MyplayList[index]?.name" :id="personalMessage.MyplayList[index]?.id"
                    :playCount="personalMessage.MyplayList[index]?.playCount"
                    :trackCount="personalMessage.MyplayList[index]?.trackCount"
                    :creator="personalMessage.MyplayList[index]?.creator"
                    :startNumber="personalMessage.MyplayList[index]?.subscribedCount" type="showPersonal"
                    @playAll="playAll"
                    @click="go({ id: personalMessage.MyplayList[index].id, index: personalMessage.MyplayList[index].index, uid: +$route.query.id! })">
                </HBlock>
                <HaveSongShow :data-type="personalMessage.dataTypeList[index]" v-if="!saveBlock2 ? blockList[2] : true"
                    v-show="saveBlock2 ? blockList[2] : true" v-for="({}, index) in personalMessage.MyplayList"
                    :url="personalMessage.MyplayList[index].coverImgUrl" :title="personalMessage.MyplayList[index].name"
                    :id="personalMessage.MyplayList[index].id" :index="personalMessage.MyplayList[index].index"
                    :uid="+$route.query.id!" :num="personalMessage.MyplayList[index].trackCount" @playAll="playAll"
                    @go="go" type="playList">
                </HaveSongShow>
            </div>
            <div class="pagination">
                <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
                    :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
            </div>
        </div>
        <!-- {{ $route.query.id }} -->
    </div>
    <div class="loading" v-else>加载中</div>
</template>

<script setup lang="ts">
import { computed, nextTick, reactive, ref, Ref, watch, watchEffect } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useBasicApi, useMain, useGlobalVar, useMainMenu, useNM } from '@renderer/store';
import icon from '@renderer/assets/icon.png'
import Tag from '@renderer/components/myVC/Tag.vue';
import PlayListShow from '@renderer/components/myVC/PlayListShow.vue';
import HBlock from '@renderer/components/myVC/HBlock.vue';
import HaveSongShow from '@renderer/components/myVC/HaveSongShow.vue';
import Loading from '@renderer/ImperativeComponents/Loading/Loading';
const $route = useRoute()
let openJiantou = ref(true);
let openDescribeFlag = ref(true);
const BasicApi = useBasicApi()
const Main = useMain()
const globalVar = useGlobalVar()
const MainMenu = useMainMenu()
const $router = useRouter()
const describe = ref()
const TagList = ref()
const blockList = ref()
const nowPage = ref(1)
const NM = useNM()
const loading = ref(true)
if (sessionStorage.getItem('PersonalCenter') == null) {
    TagList.value = [true, false]
    blockList.value = [true, false, false]
    sessionStorage.setItem('PersonalCenter', JSON.stringify({
        TagList: [true, false],
        blockList: [true, false, false],
        nowPage: 1,
    }))
} else {
    const obj = JSON.parse(sessionStorage.getItem('PersonalCenter')!)
    TagList.value = obj.TagList
    blockList.value = obj.blockList
    nowPage.value = obj.nowPage
}
watchEffect(() => {
    sessionStorage.setItem('PersonalCenter', JSON.stringify({
        TagList: TagList.value,
        blockList: blockList.value,
        nowPage: nowPage.value
    }))
})

const openDescribe = () => {
    let description = describe.value as HTMLElement
    if (openDescribeFlag.value) {
        description.style.whiteSpace = 'pre-line'
    } else {
        description.style.whiteSpace = 'nowrap'
    }
    openDescribeFlag.value = !openDescribeFlag.value
    // let widthBox = zi.offsetWidth
    // let widthscrool = zi.scrollWidth
    // console.log(widthBox);
    // console.log(widthscrool);

}

const personalMessage = reactive<{
    MyplayList: Ref<any[]>
    dataTypeList: Ref<any[]>
    name: string | undefined
    avatarUrl: string
    fans: number
    like: number
    follow: number
    describe: string
    followed: boolean
}>({
    MyplayList: ref([]),
    dataTypeList: ref([]),
    name: undefined,
    avatarUrl: '',
    fans: 0,
    like: 0,
    follow: 0,
    describe: '',
    followed: false
})
const total = ref()
const totalPage = ref()
const BaseList: Ref<any[]> = ref([])
const createPlay = ref()
const playList: Ref<any[]> = ref([])
let flag = false
const changePage = () => {
    let l = nowPage.value == 1 ? (nowPage.value - 1) * 20 : (nowPage.value - 1) * 20 - 1
    if (TagList.value[0] != true) l = (nowPage.value - 1) * 20
    let r = nowPage.value == 1 && TagList.value[0] == true ? 19 : l + 20
    personalMessage.MyplayList = BaseList.value.slice(l, r)
    if (nowPage.value == 1 && TagList.value[0] == true) {
        personalMessage.MyplayList.unshift({
            coverImgUrl: 'https://cdn.jsdelivr.net/gh/southernMD/images@main/img/202305041345401.png',
            id: -5,
            name: `${$route.query.id == BasicApi.profile!.userId ? '我' : personalMessage.name}的听歌排行`,
            creator: {
                id: $route.query.id,
                name: personalMessage.name
            }
        })
    }
    personalMessage.dataTypeList.length = personalMessage.MyplayList.length
    personalMessage.dataTypeList.fill('playList')
    if (TagList.value[1] == true && $route.query.id == BasicApi.profile!.userId) personalMessage.dataTypeList.fill('playListStart')
    if (TagList.value[0] == true && $route.query.id == BasicApi.profile!.userId) personalMessage.dataTypeList.fill('playListMy')
    if (nowPage.value == 1 && TagList.value[0] == true) personalMessage.dataTypeList[0] = 'playListRank'
    if (nowPage.value == 1 && TagList.value[0] == true && $route.query.id == BasicApi.profile!.userId) personalMessage.dataTypeList[1] = 'playListLike'
    if (flag) {
        globalVar.changeMainScroll = -(globalVar.mainScroll - 220)
    } else {
        flag = true
    }
}
const changeTag = (index: number, flag: boolean) => {
    TagList.value.fill(false)
    TagList.value[index] = true
    if (flag) nowPage.value = 1
    if (index == 0) {
        total.value = createPlay.value + 1
        BaseList.value = playList.value.slice(0, createPlay.value + 1)
    } else if (index == 1) {
        total.value = Main.startPlay + 1
        BaseList.value = playList.value.slice(createPlay.value + 1)
    }
    totalPage.value = Math.ceil(total.value / 20)
    changePage()

}
const init = async () => {
    if ($route.query.id == BasicApi.profile?.userId) {
        personalMessage.name = BasicApi.profile!.nickname
        //@ts-ignore
        $route.query.name = personalMessage.name
        personalMessage.avatarUrl = BasicApi.profile!.avatarUrl
        personalMessage.fans = BasicApi.profile!.followeds
        personalMessage.like = BasicApi.profile!.follows
        personalMessage.follow = BasicApi.profile!.eventCount
        personalMessage.describe = BasicApi.profile!.signature
        createPlay.value = Main.createPlay
        playList.value = Main.playList
    } else {
        try {
            let p1, p2
            if (!localStorage.getItem('NMcookie')) {
                p1 = BasicApi.reqDetail($route.query.id!)
                p2 = Main.reqUserPlaylist($route.query.id! + '')
            } else {
                p1 = NM.reqDetail($route.query.id!)
                p2 = NM.reqUserPlaylist($route.query.id! + '')
            }
            let results = await Promise.all([p1, p2])
            personalMessage.name = results[0].data.profile!.nickname
            //@ts-ignore
            $route.query.name = personalMessage.name
            personalMessage.avatarUrl = results[0].data.profile!.avatarUrl
            personalMessage.fans = results[0].data.profile!.followeds
            personalMessage.like = results[0].data.profile!.follows
            personalMessage.follow = results[0].data.profile!.eventCount
            personalMessage.describe = results[0].data.profile!.signature
            personalMessage.followed = BasicApi.followsId.includes(results[0].data.profile!.userId)
            createPlay.value = results[0].data.profile!.playlistCount - 1
            playList.value = results[1].data.playlist
            console.log(playList.value);
        } catch (error) {
            $router.replace({
                name: '404'
            })
        }

    }
}
loading.value = true
await init()
loading.value = false



for (let i = 0; i < TagList.value.length; i++) {
    if (TagList.value[i] == true) changeTag(i, false)
}

// Main.createPlay + 1
watch(nowPage, () => {
    changePage()
})
const playAll = async (id) => {
    if (id == -5) {
        let result
        if (localStorage.getItem('NMcookie')) {
            result = await NM.reqUserRecord(+$route.query.id!, 1);
        } else {
            result = await Main.reqUserRecord(+$route.query.id!, 1);
        }
        console.log(result);
        const songList = result.map(item => item.song)
        if (songList.length == 0) return
        console.log(result, songList);
        Main.playingList = songList
        Main.playingPrivileges = songList.map(item => item.privilege)
        Main.playingindex = 1
        Main.playing = songList[0].id as number
        Main.beforePlayListId = -5
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    } else {
        let result
        if (localStorage.getItem('NMcookie')) {
            result = (await NM.reqPlaylistTrackAll(+id)).data;
        } else {
            result = (await Main.reqPlaylistTrackAll(+id)).data;
        }
        if (result.songs.length == 0) return
        Main.playingList = result.songs
        Main.playingPrivileges = result.privileges
        Main.playingindex = 1
        Main.playing = result.songs[0].id as number
        Main.beforePlayListId = id
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已经开始播放'
        globalVar.closePointOut = true
    }
}
const go = ({ id, index, uid }) => {
    console.log(id, index, uid, BasicApi.profile!.userId);
    if (id != -5) {
        if (uid == BasicApi.profile!.userId) {
            $router.push({
                name: 'songPlaylist',
                query: {
                    id, my: 'true', index, type: '歌单',
                    nm: localStorage.getItem('NMcookie') ? 'true' : 'false'
                }
            })
        } else {
            $router.push({
                name: 'songPlaylist',
                query: {
                    id, my: 'false', index, type: '歌单',
                    nm: localStorage.getItem('NMcookie') ? 'true' : 'false'
                }
            })
        }
    } else {
        $router.push({
            name: 'PersonalRecord',
            query: {
                id: $route.query.id,
                name: personalMessage.name
            }
        })
    }
}


const saveBlock2 = ref(false)
const changeBlock = (index: number) => {
    blockList.value.fill(false)
    blockList.value[index] = true
    if (index == 2) {
        saveBlock2.value = true
    }
}

const editorPersonal = () => {
    $router.push({
        name: 'editPersonal'
    })
}

$router.afterEach(async (to, from, failure) => {
    console.log(to.name, from.name, "我走了");

    if (to.query.id != from.query.id && to.name == from.name && to.name == 'PersonalCenter' ||
        to.name == 'PersonalCenter' && from.name !== 'PersonalCenter') {
        saveBlock2.value = false
        loading.value = true
        await init()
        loading.value = false
        changeTag(0, true)
        globalVar.scrollToTop = true
    }
})

const goEvents = () => {
    $router.push({
        name: 'SomeoneEvent',
        query: {
            id: $route.query.id,
            name: personalMessage.name
        }
    })
}
const goLike = () => {
    $router.push({
        name: 'SomeoneLike',
        query: {
            id: $route.query.id,
            name: personalMessage.name
        }
    })

}
const goFans = () => {
    $router.push({
        name: 'SomeoneFans',
        query: {
            id: $route.query.id,
            name: personalMessage.name
        }
    })

}

const followUser = async () => {
    try {
        let flag
        //取关
        if (localStorage.getItem('NMcookie')) {
            if (personalMessage.followed) flag = await NM.reqFollow($route.query.id, 2)
            else flag = await NM.reqFollow($route.query.id, 1)
        } else {
            if (personalMessage.followed) flag = await Main.reqFollow($route.query.id, 2)
            else flag = await Main.reqFollow($route.query.id, 1)
        }
        if (flag) {
            if (personalMessage.followed) {
                Loading({
                    message: '取关成功',
                    showTime: 1000
                })
                BasicApi.followsId = BasicApi.followsId.filter(it => it != +$route.query.id!)
                BasicApi.profile!.follows--
                personalMessage.fans--
            }
            else {
                Loading({
                    message: '关注成功',
                    showTime: 1000
                })
                BasicApi.followsId.push(+$route.query.id!)
                BasicApi.profile!.follows++
                personalMessage.fans++
            }
            personalMessage.followed = !personalMessage.followed
        } else {
            Loading({
                type: 'error',
                message: '操作失败',
                showTime: 1000
            })
        }
    } catch (error) {
        Loading({
            type: 'error',
            message: '操作失败',
            showTime: 1000
        })
    }
}


</script>

<style scoped lang="less">
.personalCenter {
    width: 100%;

    .top {
        padding: 30px 30px;
        // background-color: red;
        display: flex;

        .left {
            width: 180px;
            height: 180px;
            border-radius: 50%;
            // background-color: blue;
            margin-right: 20px;

            .el-image {
                border-radius: 50%;
            }
        }

        .right {
            width: calc(100%);

            .name {
                display: flex;
                justify-content: space-between;
                width: calc(100%);
                height: 30px;
                align-items: center;
                border-bottom: 1px solid @small-font-color;
                padding-bottom: 10px;

                >span {
                    color: @font-color;
                    font-weight: bolder;
                    font-size: 22px;
                }

                .btn {
                    cursor: pointer;
                    border: 1px solid @split-line-color;
                    height: 30px;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 2em;

                    >div {
                        padding: 10px;

                        i {
                            padding-right: 5px;
                        }
                    }

                    &:hover {
                        color: @font-color-hover;
                        background-color: @left-click-color;
                    }
                }

                .btns {
                    height: 30px;
                    display: flex;
                    user-select: none;

                    >div {
                        border: 1px solid @split-line-color;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        border-radius: 2em;
                        padding: 10px;
                        margin-right: 10px;
                        cursor: pointer;

                        i {
                            padding-right: 5px;
                        }

                        &:hover {
                            color: @font-color-hover;
                            background-color: @left-click-color;
                        }
                    }
                }
            }

            .numbers {
                display: flex;
                margin-top: 10px;

                .line {
                    width: 1px;
                    background-color: @font-color;
                    margin: 0 15px;
                }

                .tip {
                    color: @font-color;
                    font-size: 20px;
                    height: 40px;
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    user-select: none;
                    width: 30px;
                    cursor: pointer;

                    &:hover>div {
                        color: @font-color-hover;
                    }

                    .number {
                        text-align: center;
                        margin-bottom: 10px;
                    }

                    .txt {
                        font-size: 12px;
                        text-align: center;
                    }
                }
            }

            .Message {
                >div {
                    margin-top: 15px;

                    >.title {
                        color: @font-color;
                        font-size: 13px;
                        user-select: none;
                    }

                    >.txt {
                        color: @small-font-color;
                        font-size: 13px;
                        user-select: none;
                    }
                }

                .describe {
                    display: flex;
                    align-items: flex-start;
                    position: relative;

                    &>span {
                        display: inline-block;
                    }

                    &>.title {
                        margin-right: 0px;
                        height: 18px;
                    }

                    >.txt {
                        margin-top: 5px;
                        overflow: hidden;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        height: auto;
                        width: 500px;
                        color: @small-font-color;
                        line-height: 20px;
                        margin-top: -4px;
                        // transform: translateY(-5px);
                    }

                    >.txt-oneself {
                        color: rgb(200, 200, 200);
                    }

                    i {
                        transform: translateX(20px);
                        font-size: 14px;
                    }

                    .open-jiantou {
                        position: absolute;
                        right: 0px;
                        top: -3px;
                        cursor: pointer;
                    }
                }
            }

        }
    }

    .bottom {
        padding: 30px 30px;
        padding-top: 0;

        // background-color: red;
        .option {
            display: flex;
            justify-content: space-between;
            width: 100%;

            .tags {
                display: flex;

                >div {
                    margin-right: 15px;
                }
            }

            .way {
                display: flex;

                .block {
                    width: 26px;
                    height: 20px;
                    background-color: @small-choice-block-color-default;
                    margin-right: 2px;
                    color: @small-font-color;
                    cursor: pointer;

                    &:hover {
                        background-color: @small-choice-block-color-hover;
                    }
                }

                .b1 {
                    border-top-left-radius: .2em;
                    border-bottom-left-radius: .2em;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    i {
                        font-size: 25px;
                    }
                }

                .b2 {
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    i {
                        font-size: 12px;
                    }
                }

                .b3 {
                    border-bottom-right-radius: .2em;
                    border-top-right-radius: .2em;
                    display: flex;
                    justify-content: center;
                    align-items: center;

                    i {
                        font-size: 14px;
                    }
                }

                .active {
                    background-color: @small-choice-block-color-click;
                    color: @font-color !important;
                }
            }
        }

        .list {
            display: flex;
            justify-content: start;
            flex-wrap: wrap;
            margin-top: 10px;

            :deep(.imgae) {
                flex: 0 0 20%;
                padding-bottom: 20%;
            }

            .message {
                display: flex;
                flex-direction: column;

                .txt {
                    white-space: nowrap;
                    text-overflow: ellipsis;
                    overflow: hidden;
                    display: block;
                }

                .num {
                    color: @small-font-color;
                }
            }

            :deep(.Hblock) {
                .left {
                    .name {
                        width: 300px;
                    }
                }

                .right {
                    margin-right: 0;
                }
            }

            :deep(.HaveSongShow) {
                margin-bottom: 30px;
            }
        }

        .Wlist {
            :deep(.imgae) {
                flex: 0 0 12%;
                padding-bottom: 12%;
            }
        }
    }
}

.pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 20px;

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
</style>