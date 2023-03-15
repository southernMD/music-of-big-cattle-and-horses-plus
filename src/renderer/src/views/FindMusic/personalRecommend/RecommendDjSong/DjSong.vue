<template>
    <div class="djSong">
        <div class="bk">
            <div class="img" ref="image" :class="{noDrag:!Main.dragMouse}">
                <div class="play">
                    <i class="iconfont icon-gf-play"></i>
                </div>
            </div>
            <div class="message" :class="{'message-oneself':globalVar.oneself}">
                <div class="title">{{song.name}}</div>
                <div class="tag">
                    <span>{{radio.category}}</span>
                </div>
                <div class="line">
                    <div class="title-dj" :class="{noDrag:!Main.dragMouse}">{{radio.name}}</div>
                    <div class="l-count">
                        <i class="iconfont icon-24gl-play"></i>
                        <span>{{numberSimp(listenerCount)}}</span>
                    </div>
                    <div class="time">
                        <i class="iconfont icon-shizhong"></i>
                        <span>{{dayjsMMSS(duration)}}</span>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { getCurrentInstance, onMounted, ComponentInternalInstance } from 'vue';
import { useMain ,useGlobalVar} from '@renderer/store'
import { numberSimp } from '@renderer/utils/numberSimp'
import { dayjsMMSS } from '@renderer/utils/dayjs'
const Main = useMain()
const $el = getCurrentInstance() as ComponentInternalInstance
const globalVar = useGlobalVar()
defineProps<{
    song: {
        [propName: string]: any;
    },
    author: {
        [propName: string]: any;
    },
    radio: {
        [propName: string]: any;
    },
    url: string
    listenerCount: number
    duration: number
}>()

onMounted(() => {
    let pic = $el.refs.image as HTMLElement
    pic.style.backgroundImage = 'url(' + $el.props.url + ')'
})

</script>

<style lang='less' scoped>
.djSong {
    width: 46%;
    height: 75px;
    flex: 0 0 48%;
    margin-left: 2%;
    margin-bottom: 2%;

    &:hover .message {
        background-color: @span-color-hover;
    }
    &:hover  .message-oneself{
        background-color: rgba(0,0,0,0) !important;
    }

    .bk {
        display: flex;

        .img {
            width: 75px;
            height: 75px;
            background-image: url("https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg");
            background-size: cover;
            border-radius: 0.5em;
            position: relative;
            margin-right: 2%;

            .play {
                position: absolute;
                right: 5px;
                bottom: 5px;
                background-color: rgba(255, 255, 255, 0.8);
                width: 25px;
                height: 25px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;

                i {
                    color: @primary-color;
                    font-size: 13px;
                }
            }
        }

        .message {
            height: 75px;
            width: calc(98% - 85px);
            padding: 5px 5px;
            user-select: none;
            padding-bottom: 0px;
            .title {
                font-size: 14px;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
                margin-bottom: 4px;
                padding-top: 8px;
            }

            .tag {
                margin-top: 5px;
                margin-bottom: 5px;
                >span {
                    display: inline-block;
                    font-size: 11px;
                    min-width: 24px;
                    width: auto;
                    height: 13px;
                    padding: 1px 1px;
                    color: @small-font-color;
                    border: 1px solid @small-font-color;
                    text-align: center;
                    border-radius: 0.2em;
                }

            }
            .line{
                display: flex;
                .title-dj{
                    width: 120px;
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    color: @small-font-color;
                    font-size: 12px;
                    &:hover{
                        color: @small-font-color-hover;
                    }
                }
                .l-count{
                    color: @small-font-color;
                    i{
                        margin-right: 5px;
                        font-size: 11px;
                        font-weight: bolder;
                    }
                    >span{
                        font-size: 11px;
                    }
                }
                .time{
                    margin-left: 10px;
                    color: @small-font-color;
                    i{
                        margin-right: 5px;
                        font-weight: bolder;
                        font-size: 11px;
                    }
                    >span{
                        font-size: 11px;
                    }
                }
            }
        }
    }
}

</style>