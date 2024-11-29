<template>
  <div class="bk" ref="bk" id="bkSearchTip">
    <div class="scroll">
        <el-scrollbar>
            <div class="noLength" v-if="globalVar.searchKey.trim().length == 0">
                <div class="title">搜索历史<i class="iconfont icon-lajixiang" @click="changeFlag"></i></div>
                <div class="historyList">
                    <div class="tip" v-for="val,index in Main.searchHistory">
                        <span @click="goSearch(val)">{{val}}</span>
                        <i class="iconfont icon-guanbi_o" @click.stop="del(index)"></i>
                    </div>
                </div>
            </div>
            <div class="length" v-else>
                <div class="title">
                    <i class="iconfont icon-search"></i>
                    猜你想搜
                </div>
                <div class="key" v-for="val in listTop" v-html="getKey(val.keyword)" @click="fasterSearch(val.keyword,val.type)">
                </div>
            </div>
        </el-scrollbar>
    </div>
  </div>

</template>
<!-- 'confirm','cancel','closeDialog' -->
<script setup lang="ts">
// import {toRef,Ref,watch,onMounted,ComponentInternalInstance,getCurrentInstance} from 'vue'
import {ref} from 'vue'
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose';
// const $el = getCurrentInstance() as ComponentInternalInstance;
import { useMain,useGlobalVar } from '@renderer/store';
import { useRouter } from 'vue-router';
defineProps<{
    listTop:any[]
}>()
const $router = useRouter()
const Main = useMain()
const globalVar = useGlobalVar()
let deleteDilog: any;
const $emit = defineEmits(['close','changeFlag'])
useClickElsewhereToClose(deleteDilog,$emit,'bkSearchTip');
const del = (index:number)=>{
    Main.searchHistory.splice(index,1)
}
const changeFlag = ()=>{
    $emit('changeFlag')
}

const getKey = (key:string)=>{
    console.log(globalVar.searchKey.trim(),key);
    const reg = new RegExp(globalVar.searchKey.trim(),'gi')
    return key?.replace(reg, `<span style="color:var(--urlColor)" >${globalVar.searchKey.trim()}</span>`)
}
const fasterSearch = (key:string,type:number)=>{
    $router.push({
        name:type.toString(),
        query:{
            key
        }
    })
    globalVar.searchKey = key
    $emit('close')
}
const goSearch = (key:string)=>{
    $router.push({
        name:'1',
        query:{
            key
        }
    })
    $emit('close')
}
</script>

<style scoped lang="less">
.bk{
    float: left;
    position: absolute;
    top: 70px;
    left: 300px;
    height: 300px;
    background-color: @mainban-bk-color;
    box-shadow: @shadow;
    width: 400px;
    transform: translate(-40px, 2px);
    display: flex;
    flex-direction: column;
    user-select: none;
    z-index: 10;
    border-radius: .4em;
    .scroll{
        margin: 20px 20px;
        margin-right: 0;
        height: 280px;
        .noLength{
            height: inherit;
            .title{
                color: @font-color;
                height: 30px;
                i{
                    margin-left: 10px;
                    cursor: pointer;
                }
            }
            .historyList{
                display: flex;
                align-items: center;
                flex-wrap: wrap;
                .tip{
                    min-width: 50px;
                    max-width: 300px;
                    margin-right: 10px;
                    margin-bottom: 10px;
                    color: @font-color;
                    border: 1px solid @border-color;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    height: 20px;
                    border-radius: 2em;
                    span{
                        padding-left: 10px;
                        font-size: 12px;
                        white-space: nowrap;
                        text-overflow: ellipsis;
                        overflow: hidden;
                        cursor: pointer;
                    }
                    i{
                        font-size: 12px;
                        padding-right: 5px;
                        cursor: pointer;
                    }
                }
            }
        }
        .length{
            .title{
                color: @small-font-color;
                margin-bottom: 10px;
            }
            .key{
                color: @font-color;
                width: calc(100% - 20px - 8px);
                height: 20px;
                font-size: 13px;
                margin: 10px 0;
                padding-left: 20px;
                display: flex;
                align-items: center;
                cursor: pointer;
                &:hover{
                    background-color: @span-color-hover;
                }
            }
        }
    }

}
</style>