<template>
    <div class="comment-li">
        <div class="comment-li-bk">
            <div class="head" draggable="false">
                <el-image lazy style="width:35px; height:35px;" draggable="false" :src="userUrl">
                </el-image>
            </div>
            <div class="comment-txt">
                <div class="user">
                    <span class="user-comment">
                        <span class="user-name" @click="go(userId)">{{userNickname}}:&nbsp;</span>
                        <span class="word" v-html="regEmoji(content)"></span>
                    </span>
                </div>
                <div class="reply" v-if="beReplied.length != 0">
                    <span class="user-comment">
                        <span class="user-name" @click="go(beReplied[0]?.user?.userId)">@{{beReplied[0]?.user?.nickname}}:&nbsp;</span>
                        <span class="word" v-html="regEmoji(beReplied[0]?.content)" ></span>
                    </span>
                </div>
                <div class="option">
                    <span class="time">{{!timeStr.includes('-')?timeStr:fixTime}} </span>
                    <span class="icon">
                        <i class="iconfont icon-dianzan" @click="throttleDianzan" v-if="!liked2">&nbsp;<span style="font-size:11px" v-show="likedCount2 != 0">{{likedCount2}}</span></i>
                        <i class="iconfont icon-dianzan_kuai" @click="throttleDianzan" v-else>&nbsp;<span style="font-size:11px">{{likedCount2}}</span></i>
                        <i class="iconfont icon-anjianfengexian"></i>
                        <i class="iconfont icon-fenxiang" v-if="!fenxiang" @click="fenxaing"></i>
                        <i class="iconfont icon-anjianfengexian" v-if="!fenxiang"></i>
                        <i class="iconfont icon-pinglun" @click="reply"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { computed, getCurrentInstance, ComponentInternalInstance, inject, toRef,ref, watchEffect, Ref } from 'vue'
import { dayjsCN } from '@renderer/utils/dayjs'
import { regEmoji } from '@renderer/utils/regEmoji'
import { useRouter } from 'vue-router'
import { useMain ,useGlobalVar} from '@renderer/store'
import  {throttle} from 'lodash'
const Main = useMain()
const globalVar = useGlobalVar()
const $router = useRouter()
const $el = getCurrentInstance() as ComponentInternalInstance
const props = defineProps<{
    userUrl: string
    userNickname: string
    userId: number
    content: string
    time: number
    timeStr: string
    liked: boolean
    beReplied: any
    likedCount: number
    commentId:number
    type : 0 | 1 | 2 | 3 |4 | 5 | 6 | 7
    resourceId:number | string
}>()

const fenxiang = inject('fenxiang',false)

const liked2 = ref(props.liked)
const likedCount2 =  ref(props.likedCount)
watchEffect(()=>{
    liked2.value = props.liked
    likedCount2.value = props.likedCount
})
const fixTime = computed<string>(() => {
    let str = dayjsCN($el.props.time as number);
    let year = String(new Date().getFullYear());
    if (str.startsWith(year)) return str.substring(5)
    else return str
})

const go = (id)=>{
    useMain().detailStatus = 'close'
    $router.push({
        name:'PersonalCenter',
        query:{
            id
        }
    })
}

const dianzan = async()=>{
    let t = {}
    if(props.type == 6 ){
        t = {threadId:props.resourceId}
    }else{
        t = {id:props.resourceId}
    }
    if(!liked2.value){
        //去点赞
        let code = await Main.reqcommentLike(props.commentId,t,1,props.type)
        if(code == 200){
            likedCount2.value++ 
            liked2.value = !liked2.value
        }
        else {
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefault = '点赞失败'
            globalVar.loadMessageDefaultFlag = true
        }
    }else{
        let code = await Main.reqcommentLike(props.commentId,t,0,props.type)
        if(code == 200){
            likedCount2.value--
            liked2.value = !liked2.value
        }else{
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefault = '点赞失败'
            globalVar.loadMessageDefaultFlag = true
        }
    }
}
const fenxaing = async()=>{
    globalVar.share.name = props.userNickname
    globalVar.share.message = props.content
    globalVar.share.type = 'comment'
    globalVar.share.id = props.commentId
    globalVar.shareDialogFlag = true
}
const throttleDianzan = throttle(dianzan,1000)

const replayFlag:Ref<boolean> = inject('replayFlag')!
const replayName:Ref<string> = inject('replayName')!
const replayId:Ref<number> = inject('replayId')!
const replayContent:Ref<string> = inject('replayContent')!

const reply = ()=>{
    replayName.value = props.userNickname
    replayId.value = props.commentId
    replayContent.value = props.content
    replayFlag.value = true
}
</script>

<style lang='less' scoped>
.comment-li {
    width: 100%;
    min-height: 40px;
    margin-top: 10px;
    // background-color: green;
    display: flex;
    justify-content: center;
    align-items: center;
    border-bottom: 1px solid @split-line-color;

    >.comment-li-bk {
        display: flex;
        font-size: 13px;
        width: 100%;
        position: relative;

        .head {
            width: 50px;
            height: 100%;
            min-height: 60px;
            user-select: none;

            .el-image {
                border-radius: 50%;
                overflow: hidden;

                >img {
                    border-radius: 50%;
                }
            }
        }

        .comment-txt {
            width:100%;
            transform: scale(1.05, 1.05);
            margin-left: -10px;
            >.user,
            >.reply {
                width: 96%;
                transform: scale(0.9, 0.9);

                >span {
                    line-height: 20px;
                    display: inline-block;
                    width: 110%;
                }

                .user-comment {
                    color: @font-color;

                    .user-name {
                        font-size: 13px;
                        color: @url-color;
                        cursor: pointer;
                        transform: scale(1, 1);
                        user-select: none;
                        &:hover {
                            color: @url-color-hover;
                        }
                    }
                    :deep(.word){
                        word-break: break-word;
                    }
                }
            }

            >.user {
                margin-bottom: 10px;
            }

            >.reply {
                min-height: 40px;
                display: flex;
                align-items: center;
                background-color: @commit-bk-color;
                width: 100%;
                padding-left: 10px;
                padding-right: 10px;
                margin-top: 5px;
                margin-bottom: 5px;
                //     >.user-comment{
                //         position: relative;
                //         left: -11px;
                //         width: 110%;
                //     }
            }
            .option {
                display: flex;
                justify-content: space-between;
                margin-bottom: 15px;
                width: 90%;
                margin-left: auto;
                margin-right: auto;
                user-select: none;
                >.time {
                    font-size: 11px;
                    color: @small-font-color;
                    margin-bottom: 5px;
                    display: inline-block;
                    user-select: none;
                }

                >.icon {
                    color: @icon-small-color;

                    i {
                        margin: 0 3px;
                        font-size: 12px;
                        cursor: pointer;

                        &:not(.icon-anjianfengexian,.icon-dianzan_kuai):hover {
                            color: @icon-small-color-hover;
                        }
                    }
                    .icon-dianzan_kuai{
                        color: @small-font-red;
                    }
                }
            }


        }
    }
}
</style>