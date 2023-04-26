<template>
    <div class="Hblock" :class="{ noDrag: !Main.dragMouse }">
        <div class="left">
            <el-image :src="url" style="width: 60px; height: 60px"></el-image>
            <div :class="{name:type =='DJ','name-singer':type == 'singer' || 'ZhuanJi' || 'playList'}">
                <span>{{ Name }}</span>
            </div>
        </div>
        <div class="right" v-if="type == 'DJ'">
            <div class="one">收藏{{ startNumber }}</div>
            <div class="two">声音{{ songNumber}}</div>
        </div>
        <div class="right" v-if="type == 'ZhuanJi'">
            <div class="one h">{{ZhunaJi }}</div>
        </div>
        <div class="right playList" v-if="type == 'playList'">
            <div class="number" v-if="trackCount">{{ trackCount }}首</div>
            <div class="author" @click.stop>by <span>{{ creator.nickname}}</span></div>
            <div class="playCount" v-if="playCount" >{{ numberSimp(playCount as number) }}</div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { useMain } from '@renderer/store';
import {numberSimp} from '@renderer/utils/numberSimp'
import { useRouter } from 'vue-router';
const $router = useRouter()
const Main = useMain()
const props = defineProps<{
    url: string
    Name: string
    startNumber?: number
    songNumber?: number
    id:number
    arId?:number
    ZhunaJi?:string
    trackCount?:number
    creator?:any
    playCount?:number
    type: 'singer' | 'DJ' | 'ZhuanJi' | 'playList'
}>()

</script>

<style lang='less' scoped>
.Hblock {
    height: 80px;
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    cursor: pointer;
    .left {
        display: flex;
        justify-content: flex-start;
        align-items: center;
        // padding-left: 30px;

        .name {
            width: 380px;
            overflow-x: hidden;
            text-overflow: ellipsis;
            padding-left: 10px;
            height: 80px;
            display: flex;
            align-items: center;
            user-select: none;
            :hover{
                color: @font-color-hover;
            }
        }
        .name-singer{
            font-size: 14px;
            width: 380px;
            overflow-x: hidden;
            text-overflow: ellipsis;
            margin-left: 10px;
            height: 80px;
            display: flex;
            align-items: center;
            user-select: none;
            >span{
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
            }
            :hover{
                color: @font-color-hover;
            }
        }
        :deep(.el-image) {
            padding-left: 20px;
            img{
                border-radius: .2em;
            }
            .el-image__placeholder {
                width: 59px;
                height: 60px;
                background-repeat: no-repeat;
                margin-left: 5px;
                transform: translate(15px, 1px);
            }

        }
    }

    .right {
        display: flex;
        align-items: center;
        margin-right: 30px;

        .one {
            margin-right: 150px;
            min-width: 50px;
            width: 100px;
            font-size: 12px;
            color: @small-font-color;
            user-select: none;
        }
        .h{
            width: 200px;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .h:hover{
            color: @small-font-color-hover;
        }

        .two {
            margin-right: 50px;
            min-width: 50px;
            font-size: 12px;
            width: auto;
            color: @small-font-color;
            user-select: none;

        }
    }
    .playList{
        flex: 0.9;
        font-size: 13px;
        color: @small-font-color;
        .number{
            flex:1;
        }
        .author{
            flex:3;
            >span{
                &:hover{
                    color:@small-font-color-hover
                }
            }
        }
        .playCount{
            flex:1;
        }
    }

    &:hover {
        background-color: @line-color-hover !important;
    }
}
</style>