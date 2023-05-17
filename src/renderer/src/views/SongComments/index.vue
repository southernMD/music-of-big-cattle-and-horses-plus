<template>
    <div class="SongComments">
        <div class="block">
            <div class="img" @click="playsong">
                <el-image :src="songMessage.url" style="width: 80px; height: 80px;"></el-image>
                <i class="iconfont icon-gf-play"></i>
            </div>
            <div class="message">
                <div class="title">{{ songMessage.name }}</div>
                <div class="other">
                    <div class="zhuanji">
                        <span>专辑：</span>
                        <span class="name" @click="goZhuanji(songMessage.al.id)">{{ songMessage.al.name }}</span>
                    </div>
                    <div class="handsong">歌手：
                        <span v-for="it,index in songMessage.ar">
                            <span class="name" @click="goPersonal(it.id)">{{ it.name}}</span>
                            <span v-if="index != songMessage.ar.length - 1">/</span>
                        </span>    
                    </div>
                </div>
            </div>
        </div>
        <Comment>
            <template #now v-if="cid">
                <div class="now-comment">
                    <div class="bk">
                        <div class="title">当前评论</div>
                        <CommentLine 
                        :userUrl="nowComment?.user?.avatarUrl"
                        :userNickname="nowComment?.user?.nickname" :userId="nowComment?.user?.userId"
                        :content="nowComment?.content" :time="nowComment?.time" :timeStr="nowComment?.timeStr"
                        :liked="nowComment?.liked" :beReplied="nowComment?.beReplied"
                        :likedCount="nowComment?.likedCount"
                        :commentId="nowComment?.commentId"
                        :resourceId="sid"
                        :type="0"
                        ></CommentLine>
                    </div>
                </div>
            </template>
        </Comment>
        <!-- {{ $route.query }} -->
    </div>
</template>

<script setup lang="ts">
import {reactive, ref} from 'vue'
import {useRouter,useRoute} from 'vue-router'
import Comment from '@renderer/views/PlayList/Comment/index.vue'
import CommentLine from '@renderer/components/myVC/Comment.vue'
import { useMain } from '@renderer/store'
const Main = useMain()
const $router = useRouter()
const $route = useRoute()
const cid = ref(+$route.query.cid!)
const sid = ref(+$route.query.id!)
const songMessage = reactive<{
    url:string,
    name:string,
    al:any,
    ar:any[]
}>({
    url:'',
    name:'',
    al:{},
    ar:[{}]
})

const nowComment = ref()
let songDetail 
try {
    if(cid.value){
        const p1 = Main.reqSongDetail([sid.value])
        const p2 = Main.reqCommentFloor(cid.value,sid.value,0)
        Promise.all([p1,p2]).then((results)=>{
            console.log(p1,p2);
            songDetail = results[0]
            const song = results[0].data.songs[0]
            nowComment.value = results[1].fa
            songMessage.url = song.al.picUrl
            songMessage.name = song.name
            songMessage.al = song.al
            songMessage.ar = song.ar
        })
    }else{
        const res = await Main.reqSongDetail([sid.value])
        songDetail = res
        const song = res.data.songs[0]
        songMessage.url = song.al.picUrl
        songMessage.name = song.name
        songMessage.al = song.al
        songMessage.ar = song.ar
    }

} catch (error) {
    $router.push({
        name:'404'
    })
}

const playsong = ()=>{
    Main.playingList.splice(Main.playingindex, 0, songDetail.data.songs[0])
    Main.playingPrivileges.splice(Main.playingindex, 0, songDetail.data.privileges[0])
    Main.playingindex == -1 ?Main.playingindex = 1:Main.playingindex++
    Main.playing = songDetail.data.songs[0].id
    Main.playStatus = 'play'
    Main.songType = 'song'
}

const goZhuanji = (id)=>{
    $router.push({
        name:'songPlaylist',
        query:{
            id,type:"专辑",my:'false'
        }
    })
    console.log(id);
}

const goPersonal = (id)=>{
    if(id != 0){
        Main.detailStatus = 'close'
        $router.push({
            name:'SongHand',
            query:{
                id:id
            }
        })
    }
}

</script>

<style scoped lang="less">
.SongComments{
    padding: 20px;
    .block{
        display: flex;
        align-items: center;
        width: auto;
        height: 100px;
        margin-left:20px;  
        margin-right:20px;  
        margin-bottom: 30px;
        .img{
            width: 80px;
            height: 80px;
            margin: 10px;
            background-color: red;
            border-radius: .2em;
            position: relative;
            cursor: pointer;
            .el-image{
                border-radius: .2em;
                img{
                    border-radius: .2em;
                }
            }
            i{
                position: absolute;
                height: 30px;
                width: 30px;
                background-color: white;
                line-height: 30px;
                text-align: center;
                color: @primary-color;
                border-radius: 50%;
                font-size: 15px;
                top: 0;
                left: 0;
                bottom: 0;
                right: 0;
                margin: auto auto;
            }
        }

        .message{
            display: flex;
            flex-direction: column;
            margin-left: 10px;
            .title{
                font-size: 18px;
                margin-bottom: 20px;
            }
            .other{
                display: flex;
                color: @small-font-color;
                user-select: none;
                font-size: 12px;
                .zhuanji{
                    margin-right: 10px;
                    >.name:hover{
                        cursor: pointer;
                        color: @small-font-color-hover;
                    }
                }
                .handsong{
                    .name{
                        cursor: pointer;
                        &:hover{
                            color: @small-font-color-hover;
                        }
                    }
                }
            }
        }
    }
    .now-comment{
        width: 100%;
        .bk{
            width: 90%;
            margin: 0 auto;
            .title{
                margin-bottom: 20px;
                user-select: none;
                color: @font-color;
                font-size: 15px;
                font-weight: bolder;
            }
        }

    }
}
</style>