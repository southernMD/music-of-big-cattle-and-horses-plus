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
                        <i class="iconfont icon-dianzan" v-if="!liked">&nbsp;<span style="font-size:11px" v-show="likedCount != 0">{{likedCount}}</span></i>
                        <i class="iconfont icon-dianzan_kuai" v-else>&nbsp;<span style="font-size:11px">{{likedCount}}</span></i>
                        <i class="iconfont icon-anjianfengexian"></i>
                        <i class="iconfont icon-fenxiang" v-if="!fenxiang"></i>
                        <i class="iconfont icon-anjianfengexian" v-if="!fenxiang"></i>
                        <i class="iconfont icon-pinglun"></i>
                    </span>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { computed, getCurrentInstance, ComponentInternalInstance, inject } from 'vue'
import { dayjsCN } from '@renderer/utils/dayjs'
import {regEmoji} from '@renderer/utils/regEmoji'
import { useRouter } from 'vue-router'
import { useMain } from '@renderer/store'
const $router = useRouter()
const $el = getCurrentInstance() as ComponentInternalInstance
defineProps<{
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
}>()

const fenxiang = inject('fenxiang')

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