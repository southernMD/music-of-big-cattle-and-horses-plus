<template>
  <div class="card">
    <div class="header">
        <el-image @click="go" draggable="false" :src="src"></el-image>
    </div>
    <div class="mesaage">
        <div class="name" @click="go">{{ name }}</div>
        <div class="des">{{ des }}</div>
        <div class="num" v-if=" type != 'other'">
            <div>歌单：{{ numberSimp(playlistnum) }}</div>
            <div>粉丝：{{ numberSimp(fans) }}</div>
        </div>
    </div>
    <div class="btn" v-if="type != 'other'">
        <div @click.stop="" class="bk h" v-if="$route.query.id == BasicApi.profile!.userId && type == 'like'">
            <i class="iconfont icon-xinfeng"></i>
            <span>私信</span>
        </div>
        <div @click.stop="" class="bk h" v-else-if="!followed">
            <i class="iconfont icon-jiahao_o"></i>
            <span>关注</span>
        </div>
        <div @click.stop="" class="bk stop" v-else>
            <span>已关注</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {} from 'vue'
import { useBasicApi } from '@renderer/store'
import { numberSimp } from '@renderer/utils/numberSimp'
import { useRouter } from 'vue-router'
const BasicApi = useBasicApi()
const $router = useRouter()
const props = defineProps<{
    name:string
    des:string
    playlistnum?:number
    fans?:number
    id:number
    followed?:boolean
    src:string
    type:'fan' | 'like' | 'other'
}>()

const go = ()=>{
    $router.push({
        name:'PersonalCenter',
        query:{
            id:props.id
        }
    })
}

</script>

<style scoped lang="less">
.card{
    display: flex;
    align-items: center;
    width:360px;
    margin-top: 10px;
    &:hover{
        background-color: @left-click-color;
    }
    .header{
        width: 100px;
        height: 100px;
        padding: 10px;
        .el-image{
            width: 100px;
            height: 100px;
            border-radius: 50%;
            cursor: pointer;
        }
    }
    .mesaage{
        width: 170px;
        margin-right: 10px;
        height: 80px;
        .name{
            cursor: pointer;
            width: 100%;
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
            height: 30px;
            &:hover{
                color: @font-color-hover;
            }
        }
        .des{
            width: 100%;
            overflow: hidden;
            font-size: 13px;
            color: @pagin-font;
            user-select: none;
            white-space: nowrap;
            text-overflow: ellipsis;
        }
        .num{
            margin-top: 5px;
            display: flex;
            font-size: 13px;
            color: @pagin-font;
            >:first-child{
                margin-right: 15px;
            }
        }
    }
    .btn{
        .bk{
            cursor: pointer;
            width: 55px;
            height: 20px;
            border-radius: 2em;
            border: 1px solid @small-font-color;
            display: flex;
            justify-content: center;
            align-items: center;
            i{
                font-size: 15px;
                margin-right: 2px;
            }
            >span{
                font-size: 10px;
            }
        }
        .h:hover{
            background-color: @left-click-color;
        }
        .stop{
            user-select: none;
            cursor: default;
            background-color:@none-button;
            color: @none-font ;
        }
    }
}
</style>