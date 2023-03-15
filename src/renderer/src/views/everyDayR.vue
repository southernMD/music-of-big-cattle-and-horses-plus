<template>
    <div class="everyDayR">
        <div class="top">
            <div class="icon">
                <div class="line left"></div>
                <div class="line right"></div>
                <div class="lineH"></div>
                <div class="number">{{date}}</div>
            </div>
            <div class="message">
                <div class="title">每日歌曲推荐</div>
                <div class="fu">根据你的音乐口味生成，每天6:00更新</div>
            </div>
        </div>
        <div class="btn">
            <div class="playAll">
                <div class="left" :class="{noDrag:!Main.dragMouse}" @click="playAll">
                    <i class="iconfont icon-bofang"></i>
                    <span>播放全部</span>
                </div>
                <div class="right" :class="{noDrag:!Main.dragMouse}" @click="addAll">
                    <i class="iconfont icon-jiahao_o"></i>
                </div>
            </div>
            <div class="start">
                <div class="icon" :class="{noDrag:!Main.dragMouse}">
                    <i class="iconfont icon-wenjian">
                        <i class="iconfont icon-jiahao_o"></i>
                    </i>
                </div>
                <div class="txt" :class="{
                    noDrag:!Main.dragMouse,
                }">
                    <span>收藏全部</span>
                </div>
            </div>
        </div>
        <div class="play-list-title" :class="{'play-list-title-oneself':globalVar.oneself==1}">
            <div class="caozuo"><span></span></div>
            <div class="song-name">
                <span>音乐标题</span>
            </div>
            <div class="song-hand">
                <span>歌手</span>
            </div>
            <div class="zhuanji">
                <span>专辑</span>
            </div>
            <div class="time">
                <span>时间</span>
            </div>
        </div>
        <div id="every-day" class="every-day" :class="{'music-list-oneself': globalVar.oneself == 1}">
            <LineMusic v-for="(value, index) in everyDaySong.length" :index="value" :title="everyDaySong[index]?.name || ''" :singer="everyDaySong[index]?.ar || ['']"
                :zhuanji="everyDaySong[index]?.al || ''" :time="everyDaySong[index]?.dt  || 0" :id="everyDaySong[index]?.id || 0" :tns="everyDaySong[index]?.tns"
                :alia="everyDaySong[index]?.alia" :key="everyDaySong[index]?.id"
                :show-index="true"
                :length="everyDaySong.length"
                :oneselfColor="true"
            ></LineMusic>
        </div>

    </div>
</template>

<script lang='ts' setup>
import { ref,toRef } from 'vue'
import { useMain,useBasicApi,useGlobalVar } from '@renderer/store'
const Main = useMain()
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
let date = ref(new Date().getDate())
let everyDaySong = toRef(BasicApi,'everyDaySong')

const playAll = ()=>{
    Main.playingList = everyDaySong.value
    let playingPrivileges:Array<any> = []
    everyDaySong.value.forEach((val)=>{
        playingPrivileges.push(val.privilege)
    })
    Main.playingPrivileges = playingPrivileges
    Main.playingindex = 1
    Main.playing = everyDaySong.value[0].id
    Main.playStatus = 'play'
    globalVar.closePointOutMessage = '已经开始播放'
    globalVar.closePointOut = true
}

const addAll = ()=>{
    if(Main.playingList.length == 0){
        playAll()
    }else{
        Main.playingList.push(...everyDaySong.value)
        let playingPrivileges:Array<any> = []
        everyDaySong.value.forEach((val)=>{
            playingPrivileges.push(val.privilege)
        })
        Main.playingPrivileges.push(...playingPrivileges)
        Main.playStatus = 'play'
        globalVar.closePointOutMessage = '已添加到播放列表'
        globalVar.closePointOut = true
    }
}
</script>

<style lang='less' scoped>
.noDrag {
    cursor: pointer;
}

.everyDayR {
    .top {
        margin: 30px 30px;
        display: flex;

        .icon {
            border: 3px solid @primary-color;
            border-radius: 1em;
            height: 64px;
            width: 72px;
            position: relative;
            display: flex;
            justify-content: center;
            align-items: center;
            margin-right: 30px;

            .line {
                position: absolute;
                width: 3px;
                height: 12px;
                border-radius: 0.2em;
                background-color: @primary-color;
            }

            .left {
                position: absolute;
                left: 15px;
                top: -6px;
            }

            .right {
                position: absolute;
                right: 15px;
                top: -6px;
            }

            .lineH {
                position: absolute;
                top: 12px;
                left: 8px;
                width: 55px;
                height: 3px;
                background-color: @primary-color;
            }

            .number {
                height: 40px;
                margin-top: 15px;
                font-size: 40px;
                font-weight: bold;
                color: @primary-color;
                user-select:none;
            }
        }

        .message {
            .title {
                font-size: 23px;
                color: @font-color;
                font-weight: bold;
                margin-top: 15px;
                margin-bottom: 10px;
            }

            .fu {
                font-size: 12px;
                color: @small-font-color;
            }
        }
    }

    .btn {
        display: flex;
        margin-left: 30px;

        .playAll {
            display: flex;
            height: 32px;
            width: 150px;
            align-items: center;
            color: white;

            .left {
                width: 110px;
                height: inherit;
                display: flex;
                align-items: center;
                border-top-left-radius: 2em;
                border-bottom-left-radius: 2em;
                background-color: @small-font-red;
                font-size: 14px;
                border-right: 1px solid #ee5454;

                i {
                    font-size: 14px;
                    margin-right: 5px;
                    padding-left: 18px;
                }

                &:hover {
                    background-color: @play-all-button-hover;
                }
            }

            .right {
                width: 40px;
                height: inherit;
                background-color: @small-font-red;
                display: flex;
                align-items: center;
                border-top-right-radius: 2em;
                border-bottom-right-radius: 2em;

                &:hover {
                    background-color: @play-all-button-hover;
                }

                i {
                    margin-left: 8px;
                    font-size: 20px;
                }
            }
        }

        .start {
            margin-left: 10px;
            width: 120px;
            height: 32px;
            border-radius: 2em;
            border: @split-line-color 1px solid;
            display: flex;
            align-items: center;

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

            &:hover {
                background-color: @span-color-hover !important;
            }
        }
    }

    .play-list-title {
        height: 35px;
        width: calc(100% - 8px);
        color: @small-font-color;
        display: flex;
        user-select: none;
        font-size: 14px;

        &:not(:first-child)>div {
            align-items: center;
            display: flex;
            position: relative;
            box-sizing: border-box;

            &>span {
                margin-left: 5px;
            }
        }

        &>.caozuo {
            width: 110px;
            height: inherit;
            position: relative;
            display: flex;
            align-items: center;
            box-sizing: border-box;

            &>span {
                position: absolute;
                right: 25%;
            }
        }

        &>.song-name {
            width: calc((100% - 110px) * 0.42);
            height: inherit;
        }

        &>.song-hand {
            width: calc((100% - 110px) * 0.2);
            height: inherit;
        }

        &>.zhuanji {
            width: calc((100% - 110px) * 0.272);
            height: inherit;
        }

        &>.time {
            width: calc((100% - 110px) * 0.108);
            height: inherit;
        }
    }
    .play-list-title-oneself{
        background-color: rgba(65, 65, 65,.7);
        color: rgb(150, 150, 150);
        &:not(:first-child)>div {
            &:not(:first-child):hover {
                background-color: rgb(55, 55, 55) !important;
            }
        }

    }
    .every-day{
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

}
</style>