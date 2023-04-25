<template>
    <div class="follow">
        <header>
            <div class="title">动态</div>
            <div class="btn" @click="senddongtai">
                <i class="iconfont icon-xiugaioryijian"></i>
                <span>发动态</span>
            </div>
        </header>
        <main>
            <div class="left" ref="leftRef">
                <eventBlock v-for="item,index in list" 
                :val="item" 
                :pics="otherList[index].pics"
                :type="otherList[index].type"
                :user="otherList[index].user"
                :time="otherList[index].showTime"
                :info="otherList[index].info"
                :threadId="otherList[index].threadId"
                :id="otherList[index].id"
                ></eventBlock>
                <div v-show="valFlag">加载中</div>
            </div>
            <div class="right">
                <div class="top">
                    <div class="message">
                        <el-image :src="BasicApi.profile?.avatarUrl" fit="cover"></el-image>
                        <div class="ms">
                            <div class="name">{{BasicApi.profile?.nickname}}</div>
                            <div class="des"><span>{{ BasicApi.profile?.signature }}</span></div>
                        </div>
                    </div>
                    <div class="numbers">
                        <div class="tip">
                            <div class="number">{{ BasicApi.profile?.eventCount }}</div>
                            <div class="txt">动态</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip">
                            <div class="number">{{ BasicApi.profile?.follows }}</div>
                            <div class="txt">关注</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip">
                            <div class="number">{{ BasicApi.profile?.followeds }}</div>
                            <div class="txt">粉丝</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <MyDialog :flag="senddongtaiFlag" @closeDialog="closeDialog" @confirm="confirm" @cancel="cancel" confirmName="分享">
        <template #header>
            <div>分享</div>
        </template>
        <template #midle>
            <div class="writ">
                <WriteCommit @getText="getZhuanfaText" ref="WriteCommitRef"></WriteCommit>
            </div>
            <div class="add">
                <div class="img" >
                    <i class="iconfont icon-yinle1"></i>
                </div>
                <div class="message">给动态配上音乐</div>
            </div>
        </template>
    </MyDialog>
</template>

<script setup lang="ts">
import {ref,Ref, watch,nextTick } from 'vue'
import eventBlock from '@renderer/components/myVC/eventBlock.vue';
import { useMain,useBasicApi } from '@renderer/store';
const BasicApi = useBasicApi()
const Main = useMain()
const valFlag = ref(true)
const listFlag = ref(false)
const list:Ref<any[]> = ref([])
const otherList:Ref<any[]> = ref([])
const lasttime = ref(-1)
const leftRef = ref<(InstanceType<typeof HTMLElement>)>()
Main.reqMyEvent().then(async(val)=>{
    const event:any[] = val.event
    event.sort((a,b)=>{
        return b.showTime - a.showTime;
    })
    event.forEach((item,index)=>{
        list.value.push(JSON.parse(item.json))
        delete event[index].json
    })
    console.log(list.value);
    otherList.value = event
    console.log(otherList.value);
    listFlag.value = true
    lasttime.value = val.lasttime
    nextTick(()=>{
        // 获取所有子元素
        const children = leftRef.value!.querySelectorAll('.eventBlock')
        // 获取子元素数量
        const length = children.length;
        // 获取最后一个子元素
        const lastChild = children[length - 1];
        observer.observe(lastChild)
    })
})
watch(listFlag,()=>{
    if(listFlag.value ){
        valFlag.value = false;
    }else{
        valFlag.value = true;
    }
})//
const observer = new IntersectionObserver((entries) => {
    console.log(entries);
    if (entries[0].isIntersecting) {
        console.log('元素已经出现在视口中');
        listFlag.value = false
        Main.reqMyEvent(lasttime.value).then((val)=>{
            const event:any[] = val.event
            event.forEach((item,index)=>{
                list.value.push(JSON.parse(item.json))
                delete event[index].json
            })
            console.log(list.value);
            otherList.value.push(...event)
            console.log(otherList.value);
            listFlag.value = true
            lasttime.value = val.lasttime
            observer.disconnect()
            nextTick(()=>{
                // 获取所有子元素
                const children = leftRef.value!.querySelectorAll('.eventBlock')
                // 获取子元素数量
                const length = children.length;
                // 获取最后一个子元素
                const lastChild = children[length - 1];
                observer.observe(lastChild)
            })
        })
    } else {
        console.log('元素还未出现在视口中');
    }
});

//发送动态
const senddongtaiFlag = ref(false)
const senddongtai = ()=>{
    senddongtaiFlag.value = true
}
const closeDialog = (done:()=>void)=>{
    done()
    senddongtaiFlag.value = false
}
const confirm = ()=>{
    senddongtaiFlag.value = false
}
const WriteCommitRef = ref()
const cancel = ()=>{
    WriteCommitRef.value.textarea = ''
    senddongtaiFlag.value = false
}
let zhuanfaMessage = ref('')

const getZhuanfaText = (message:string)=>{
    zhuanfaMessage.value = message
}
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
.writ{
    border: 1px solid @small-font-color;
    border-radius: .2em;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    box-sizing: border-box;
    :deep(.writeCommit){
        .input-bk{
            margin-left: 0;
            margin-right: 2px;
        }
    }
    :deep(.option){
        margin-left: 10px;
        margin-top: 0px;
    }
}
.add{
    height: 50px;
    widows: 90%;
    border: 1px solid @small-font-color;
    border-top: none;
    cursor: pointer;
    &:hover{
        background-color: @flow-hover-color;
    }
    display: flex;
    align-items: center;
    .img{
        background-color: @primary-color;
        height: 30px;
        width: 30px;
        margin-left: 10px;
        margin-right: 10px;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: .2em;
        i{
            color: white;
        }
    }
    .message{
        user-select: none;
        color: @font-color;
    }
}
</style>