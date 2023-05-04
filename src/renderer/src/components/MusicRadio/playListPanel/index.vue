<template>
    <div class="playListPanel">
        <el-scrollbar>
            <div class="top">
                <div class="title">当前播放</div>
                <div class="number">总{{ list.length }}首</div>
                <div class="right">
                    <div class="start">
                        <i class="iconfont icon-wenjian">
                            <i class="iconfont icon-jiahao_o"></i>
                        </i>
                        <span>收藏全部</span>
                    </div>
                    <div class="clear" @click="clearList">清空列表</div>
                </div>
            </div>
            <div class="bottom" id="play-list-Panel-bottom">
                <LineMusic v-for="(value, index) in  list" :showIndex="false" :title="value.name" :singer="value.ar"
                    :time="value.dt" :id="value.id" :index="index" :key="value.id" :tns="value?.tns"
                    :alia="value?.alia" :oneselfColor="false" type="radio">
                    <template #default>
                        <i class="iconfont icon-youjiantou" v-if="Main.playing == value.id"></i>
                    </template>
                </LineMusic>
            </div>
        </el-scrollbar>
    </div>

</template>

<script lang="ts" setup>
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose';
import { getCurrentInstance, ComponentInternalInstance, toRef } from 'vue';
import { useMain } from '@renderer/store';
const $el = getCurrentInstance() as ComponentInternalInstance
const $emit = defineEmits(['close','stopPlay'])
const Main = useMain();

let list = toRef(Main, 'playingList')

const clearList = ()=>{
    Main.playingList = []
    Main.playingPrivileges = []
    Main.playing = -1
    Main.playingindex = -1
    Main.beforePlayListId = -1
    Main.wayIndex = 0
    Main.heartJump = false
    Main.playStatus = 'stop'
    Main.detailStatus = 'close'
    $emit('stopPlay')
}


let deleteDilog: any
useClickElsewhereToClose(deleteDilog, $emit, "playlistIcon")
</script>

<style lang="less" scoped>
.playListPanel {
    cursor: default;
    position: fixed;
    top: 60px;
    right: 0px;
    width: 420px;
    height: calc(100% - 60px - 70px);
    background-color: @mianban-bk-color;
    box-shadow: @shadow;
    z-index: 5;
    overflow: hidden;
    color: @font-color;
    .top {
        margin: 25px 20px 0px 20px;
        padding-bottom: 15px;
        height: 25%;
        border-bottom: 1px solid @split-line-color;
        position: relative;

        .title {
            font-size: 20px;
            font-weight: bolder;
        }

        .number {
            margin-top: 20px;
            font-size: 12px;
            color: @small-font-color;
        }

        .right {
            display: flex;
            position: absolute;
            bottom: 15px;
            right: 0;

            .start {
                cursor: pointer;
                position: relative;
                left: -15px;

                .icon-wenjian {
                    font-size: 20px;
                    position: relative;
                    padding-right: 5px;
                    color: @small-font-color;

                    .icon-jiahao_o {
                        position: absolute;
                        left: 5px;
                        top: 5px;
                        font-size: 11px;
                    }

                    &:hover {
                        color: @small-font-color-hover;
                    }
                }

                >span {
                    font-size: 13px;
                    display: inline-block;
                    transform: translateY(-2px);
                }
            }
        }

        .clear {
            cursor: pointer;
            font-size: 13px;
            transform: translateY(3px);
            color: @url-color ;

            &:hover {
                color: @url-color-hover;
            }
        }

        .none {
            cursor: default;

            &:hover {
                color: @url-color ;
            }
        }

        .none-start {
            cursor: default !important;

            >span {
                color: @small-font-color  !important;
            }

            >i {
                color: @small-font-color  !important;
            }
        }
    }

    .bottom {
        :deep(.line-music) {
            .song-name {
                width: 50%;
                padding-left: 17px;
            }

            .song-hand {
                width: 30%;
                font-size: 13px !important;
            }

            &:hover {
                color: @font-color  !important;
                background-color: @line-color-hover-small  !important;
            }

            &:hover .song-name .limit span:not(.red):first-child {
                color: @font-color-hover  !important;
            }
        }
        .icon-youjiantou{
            font-size: 10px;
            line-height: 10px;
            margin-right: -10px;
            color: @small-font-red;
        }
        >:nth-child(odd) {
            background-color: @line-color-odd-small  !important;
        }

        >:nth-child(even) {
            background-color: @line-color-even-small  !important;
        }
    }
}
</style>