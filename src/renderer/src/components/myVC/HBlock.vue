<template>
    <div class="Hblock" :class="{ noDrag: !Main.dragMouse ,'Hblock-oneself':globalVar.oneself}" 
    :data-id="id" 
    :data-type="dataType" 
    :data-right="1"
    :data-txt="dataTxt"
    :data-pic="url"
    :data-djprogramid="djprogramid"
    :data-path="path"
    @dblclick.stop="playDj"
    >
        <div class="left" :class="{ruName:type == 'searchUser'}">
            <div class="index" v-if="type == 'DJprograme'">
                <i v-if="Main.playing == id && Main.playStatus == 'play'" class="iconfont icon-shengyin_shiti"></i>
                <i v-else-if="Main.playing == id && Main.playStatus == 'stop'" class="iconfont icon-shengyin03-mianxing"></i>
                <div v-else class="index-number">{{showIndex }}</div>
            </div>
            <el-image @click.stop="playDj" :class="{ru:type == 'searchUser'}" :src="url" style="width: 60px; height: 60px">
                <template #error>
                    <el-image src="/src/assets/image/cloudmusic_5e9Ef54bbN.png"  style="width: 60px; height: 60px"></el-image>
                </template>
            </el-image>
            <div class="n" :class="{
                name:type =='DJ' || 'showPersonal',
                'name-singer':type == 'singer' || 'ZhuanJi' || 'playList',
                'name-dj':type == 'DJprograme'
                }">
                <span v-html="Name"></span>
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
            <div class="playCount" v-if="playCount" >
                <i class="iconfont icon-gf-play"></i>
                {{ numberSimp(playCount as number) }}
            </div>
        </div>
        <div class="right showPersonal" v-if="type == 'showPersonal' && id!=-5">
            <div class="number">歌曲：{{ trackCount }}首</div>
            <div class="author" @click.stop> <span>by {{ creator.nickname}}</span></div>
            <div class="start">收藏：{{ numberSimp(startNumber!)}}</div>
            <div class="play" @click.stop="playAll">
                <i class="iconfont icon-gf-play"></i>
                {{ numberSimp(playCount!) }}
            </div>
        </div>
        <div class="right songHand" v-if="type == 'songHand'">
            <div class="number">{{ trackCount }}首</div>
            <div class="time">发行时间：{{dayjsStamp(time!)}}</div>
        </div>
        <div class="right startal" v-if="type == 'startal'">
            <div class="author">
                <div class="ar" v-for="val,index in creators">
                    <span class="author-name" @click.stop="goAr(val.id)" v-html="val.name"></span>
                    <span class="author-separator" v-if="index + 1!= creators!.length">/</span>
                </div>
            </div>
            <div class="number">{{ trackCount }}首</div>
        </div>
        <div class="right startSongHand" v-if="type == 'startSongHand'">
            <div>专辑：{{trackCount}}</div>
        </div>
        <div class="signature"  v-if="type == 'searchUser'">
            <div> {{ signature }}</div>
        </div>
        <div class="right Djprograme" v-if="type == 'DJprograme'">
            <div class="playCount"  >
                <i class="iconfont icon-gf-play"></i>
                {{ numberSimp(playCount as number) }}
            </div>
            <div class="sub">
                <i class="iconfont icon-dianzan" v-if="!subscribed"></i>
                <i class="iconfont icon-dianzan_kuai" v-else></i>
                {{ numberSimp(likedCount as number) }}
            </div>
            <div class="time">
                {{dayjsStamp(createTime!)}}
            </div>
            <div class="songTime">
                {{dayjsMMSS(songTime) }}
            </div>
        </div>
    </div>
</template>

<script lang='ts' setup>
import {ref,watch} from 'vue'
import { useMain ,useGlobalVar} from '@renderer/store';
import {numberSimp} from '@renderer/utils/numberSimp'
import { dayjsStamp,dayjsMMSS } from '@renderer/utils/dayjs';
import { useRouter } from 'vue-router';
const $router = useRouter()
const Main = useMain()
const globalVar = useGlobalVar()
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
    type: 'singer' |
    'DJ' | 
    'ZhuanJi' | 
    'playList' |
    'showPersonal' | 
    'songHand' |
    'start' | 
    'startal' |
    'startSongHand'|
    'searchUser' |
    'DJprograme'
    time?:number
    creators?:any[]
    signature?:string
    dataType?:string
    likedCount?:number
    subscribed?:boolean
    createTime?:number
    songTime?:number
    index?:number
    showIndex?:number
    djprogramid?:number
    djName?:string
    path?:string
}>()
const $emit = defineEmits(['playAll','goAr','playDj'])
const playAll = ()=>{
    $emit('playAll',props.id)
}
const goAr = (id)=>{
    $emit('goAr',id)
}
const dataTxt = ref('')
// console.log(props.type);

// if(props.type=='ZhuanJi'){
//     dataTxt.value = `专辑:${props.Name} - ${props.ZhunaJi}`
// }else if(props.type == 'showPersonal'){
//     dataTxt.value = `歌单:${props.Name} by ${props.creator.nickname}`
// }
watch(()=>props.type,()=>{
    if(props.type=='songHand'){
        dataTxt.value = `专辑:${props.Name} - ${props.ZhunaJi}`
    }else if(props.type == 'showPersonal'){
        dataTxt.value = `歌单:${props.Name} by ${props.creator.nickname}`
    }else if(props.type == 'DJprograme'){
        dataTxt.value = `声音:${props.Name} - ${props.djName}`
    }
},{immediate:true})

const playDj = ()=>{
    $emit('playDj',props.id,props.index)
}
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
        width: 55%;
        min-width: 300px;
        .name {
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
            overflow-x: hidden;
            text-overflow: ellipsis;
            margin-left: 10px;
            height: 80px;
            display: flex;
            align-items: center;
            user-select: none;
            max-width: calc(100% - 120px);
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
        .ru{
            :deep(img){
                border-radius: 50%;
            }
        }
        >.index{
            width: 80px;
            display: flex;
            justify-content: center;
            align-items: center;
            color: @small-font-color;
            margin-right: -20px;
            font-size: 12px;
            .iconfont{
                color: @primary-color;
            }
        }
        .name-dj{
            width: 60%;
        }
    }
    .ruName{
        .n{
            width: auto;
            margin-right: 20px;
        }
    }

    .right {
        display: flex;
        align-items: center;
        margin-right: 30px;
        width: 45%;
        .one {
            width: 50%;
            font-size: 12px;
            color: @small-font-color;
            user-select: none;
        }
        .h{
            width: 180px;
            text-overflow: ellipsis;
            overflow: hidden;
        }
        .h:hover{
            color: @small-font-color-hover;
        }

        .two {
            width: 50%;
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
            i{
                font-size: 10px;
                border: 1px solid @small-font-color;
                border-radius: 50%;
                padding: 3px;
                margin-right: 2px;
            }
        }
    }
    .showPersonal{
        flex: 1;
        font-size: 13px;
        color: @small-font-color;
        display: flex;
        >div{
            flex-basis: 25%;
        }
        .author{
            margin-right: 5px;
            >span{
                width: 100px;
                display: inline-block;
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                &:hover{
                    color:@small-font-color-hover
                }
            }
        }
        .play{
            i{
                font-size: 10px;
                border: 1px solid @small-font-color;
                border-radius: 50%;
                padding: 3px;
                margin-right: 2px;
            }
            &:hover{
                color: @small-font-color-hover;
                i{
                    border: 1px solid @small-font-color-hover;
                }
            }
        }
    }
    .songHand{
        color: @small-font-color;
        font-size: 12px;
        >div{
            margin-left: 100px;
        }
    }
    .startal{
        color: @small-font-color;
        font-size: 12px;
        >div{
            margin-left: 100px;
        }
        .author {
            width: 100px;
            display: flex;
            overflow: hidden;
            white-space: nowrap;
            margin-left: 20px;
        }

        .ar {
            display: flex;
            span:first-child {
                text-overflow: ellipsis;
                overflow: hidden;
                white-space: nowrap;
                &:hover{
                    color: @small-font-color-hover;
                }
            }
        }
        .number{
            width: 50px;
        }
    }

    .startSongHand{
        font-size: 12px;
        width: 100px;
    }
    .signature{
        width: 100%;
        padding-right: 20px;
        white-space: nowrap;
        overflow: hidden;
        font-size: 12px;
        color: @small-font-color;
        margin-right: auto;
        >div{
            overflow: hidden;
            text-overflow: ellipsis;
            align-self: flex-end;
            text-align:right;
        }
    }
    .Djprograme{
        width: 40%;
        font-size: 12px;
        color: @small-font-color;
        >.playCount{
            width: 20%;
            >.icon-gf-play{
                font-size: 10px;
                height: 12px;
                border: 1px solid @small-font-color;
                border-radius: 2em;
                padding: 2px;
            }
        }
        >.sub{
            width: 25%;
        }
        >.time{
            width: 35%;
        }
        >.songTime{
            width: 20%;
        }
    }
    &:hover {
        background-color: @line-color-hover !important;
    }
}
.Hblock-oneself{
    &:hover {
        background-color: rgba(55, 55, 55,.7) !important;
    }
}
</style>