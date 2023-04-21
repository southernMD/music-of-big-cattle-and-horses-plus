<template>
    <div class="follow">
        <header>
            <div class="title">动态</div>
            <div class="btn">
                <i class="iconfont icon-xiugaioryijian"></i>
                <span>发动态</span>
            </div>
        </header>
        <main>
            <div class="left">
                <div v-show="valFlag">加载中</div>
                <eventBlock v-for="item,index in list" 
                :val="item" 
                :pics="otherList[index].pics"
                :type="otherList[index].type"
                :user="otherList[index].user"
                :time="otherList[index].showTime"
                ></eventBlock>
            </div>
            <div class="right">
                <div class="top">
                    <div class="message">
                        <el-image src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" fit="cover"></el-image>
                        <div class="ms">
                            <div class="name">难受香菇</div>
                            <div class="des"><span>也许在遥远中我会看到另一个世界</span></div>
                        </div>
                    </div>
                    <div class="numbers">
                        <div class="tip">
                            <div class="number">12</div>
                            <div class="txt">动态</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip">
                            <div class="number">12</div>
                            <div class="txt">关注</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip">
                            <div class="number">12</div>
                            <div class="txt">粉丝</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>

</template>

<script setup lang="ts">
import {ref,Ref, watch } from 'vue'
import { useMain } from '@renderer/store';
const Main = useMain()
const valFlag = ref(true)
const listFlag = ref(false)
const list:Ref<any[]> = ref([])
const otherList:Ref<any[]> = ref([])
Main.reqMyEvent().then((val)=>{
    val.sort((a,b)=>{
        return b.showTime - a.showTime;
    })
    val.forEach((item,index)=>{
        list.value.push(JSON.parse(item.json))
        delete val[index].json
    })
    console.log(list.value);
    otherList.value = val
    console.log(otherList.value);
    listFlag.value = true
})
watch(listFlag,()=>{
    valFlag.value = false;
})
//
</script>

<style scoped lang="less">
.follow {
    header {
        height: 40px;
        display: flex;
        align-items: center;
        padding: 20px 25px;
        padding-bottom: 5px;
        padding-top: 5px;
        width: calc(100vw - 200px - 275px - 2px);
        background-color: @other-bk-color;
        position: fixed;
        z-index: 10;
        .title {
            font-size: 20px;
            font-weight: bolder;
        }

        .btn {
            width: 90px;
            height: 32px;
            background-color: @primary-color;
            border-radius: 2em;
            margin-left: 20px;
            display: flex;
            justify-content: center;
            align-items: center;
            user-select: none;
            cursor: pointer;

            i {
                font-size: 18px;
                margin-right: 5px;
            }

            &:hover {
                background-color: @play-all-button-hover;
            }
        }
    }
    main{
        padding-top: 50px;
        display: flex;
        .left{
            min-height: calc(100vh - 180px);
            width: calc(100% - 225px);
            // width: 100%;
            // background-color: red;
        }
        .right{
            margin-top: -50px;
            width: 225px;
            background-color: @leftClickColorOneself;
            border-left: 1px solid @small-font-color;
            .top{
                width: 225px;
                height: 150px;
                display: flex;
                justify-content: center;
                flex-direction: column;
                .message{
                    display: flex;
                    margin-left: 25px;
                    .el-image{
                        width: 50px;
                        height: 50px;
                        border-radius: 50%;
                        margin-right: 10px;
                    }
                    .ms{
                        display: flex;
                        justify-content: center;
                        flex-direction: column;
                        .des{
                            white-space: nowrap;
                            text-overflow: ellipsis;
                            overflow: hidden;
                            width: 120px;
                            font-size: 13px;
                            color: @small-font-color;
                        }
                        .name{
                            font-size: 14px;
                            margin-bottom: 5px;
                            cursor: pointer;
                            &:hover{
                                color: @font-color-hover;
                            }
                        }
                    }
                }

                .numbers{
                    display: flex;
                    justify-content: center;
                    width: 225px;
                    margin-top: 20px;
                    .line{
                        width: 1px;
                        background-color: @small-font-color;
                        margin: 0 15px;
                    }
                    .tip{
                        color: @small-font-color;
                        font-size: 20px;
                        height: 40px;
                        display: flex;
                        flex-direction: column;
                        align-items: center;
                        user-select: none;
                        width: 30px;
                        cursor: pointer;
                        &:hover  >div{
                            color: @small-font-color-hover;
                        }
                        .number{
                            text-align: center;
                            margin-bottom: 10px;
                        }
                        .txt{
                            font-size: 12px;
                            text-align: center;
                        }
                    }
                }
            }

        }
    }
}
</style>