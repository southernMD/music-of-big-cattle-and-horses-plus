<template>
    <div class="follow">
        <header :class="{'header-oneself':globalVar.oneself}">
            <div class="title">动态</div>
            <div class="btn" @click="senddongtai">
                <i class="iconfont icon-xiugaioryijian"></i>
                <span>发动态</span>
            </div>
        </header>
        <main>
            <div class="left" ref="leftRef">
                <eventBlock v-for="item,index in otherList" 
                :val="list[index]" 
                :pics="item.pics"
                :type="item.type"
                :user="item.user"
                :time="item.showTime"
                :info="item.info"
                :threadId="item.threadId"
                :id="item.id"
                :key="item.id"
                ></eventBlock>
                <div v-show="valFlag">加载中</div>
            </div>
            <div class="right" :class="{'right-oneself':globalVar.oneself}">
                <div class="top">
                    <div class="message">
                        <el-image @click="goPersonal" :src="BasicApi.profile?.avatarUrl" fit="cover"></el-image>
                        <div class="ms">
                            <div class="name" @click="goPersonal">{{BasicApi.profile?.nickname}}</div>
                            <div class="des"><span>{{ BasicApi.profile?.signature }}</span></div>
                        </div>
                    </div>
                    <div class="numbers">
                        <div class="tip" @click="goEvents">
                            <div class="number">{{ BasicApi.profile?.eventCount }}</div>
                            <div class="txt">动态</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip" @click="goLike">
                            <div class="number">{{ BasicApi.profile?.follows }}</div>
                            <div class="txt">关注</div>
                        </div>
                        <div class="line"></div>
                        <div class="tip" @click="goFans">
                            <div class="number">{{ BasicApi.profile?.followeds }}</div>
                            <div class="txt">粉丝</div>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    </div>
    <MyDialog :flag="senddongtaiFlag" @closeDialog="closeDialog" @confirm="confirm" @cancel="cancel" :confirmName="confirmName" :cancelName="cancelName">
        <template #header>
            <div>分享</div>
        </template>
        <template #midle>
            <div class="default" v-show="change">
                <div class="writ">
                    <WriteCommit @getText="getZhuanfaText" ref="WriteCommitRef">
                        <template #share v-if="ifNM">
                            <i @click.self="addShareImage" class="iconfont icon-icon-" :class="{noDrag:!Main.dragMouse}" ></i>
                        </template>
                    </WriteCommit>
                </div>
                <div class="add" @click="changeFn">
                    <div class="img" ref="imgRef">
                        <i class="iconfont icon-yinle1" v-show="choiceType == 'noresource'"></i>
                    </div>
                    <div class="message">{{choiceMessage}}</div>
                    <i class="iconfont icon-guanbi_o" v-show="choiceType != 'noresource'" @click.stop="clearChoice"></i> 
                </div>
                <div class="imgs" v-show="shareimages.length!= 0">
                    <div class="ig" v-for="buffer,index in shareimages" draggable="false">
                        <el-image draggable="false" :src="buffer"></el-image>
                        <i class="icon-cuowu iconfont" @click="delimg(index)"></i>
                    </div>
                    <div class="ig addd" @click="addShareImage" v-show="shareimages.length != 9">
                        <i class="iconfont icon-jiahao_o"></i>
                    </div>
                </div>
            </div>
            <div class="search" v-show="!change">
                <el-input placeholder="单曲/歌手/专辑/歌单"  v-model="input" @keydown.enter="goSearch(nowIndex)">
                    <template #prefix>
                        <i class="iconfont icon-search"></i>
                    </template>
                </el-input>
                <div class="l" v-show="change2">
                    <div class="T">最近播放：</div>
                    <div class="f" v-for="it in Main.latelyPlay.filter(t=>t.id>0).slice(0,5)"  @click="choice('song',it.id,it.al.picUrl,it.name,it.ar.map(i=>i.name).join('/'))">
                        <span class="name">{{ it.name }}</span>
                        <span>-{{it.ar.map(i=>i.name).join('/') }}</span>
                    </div> 
                </div>
                <div class="s" v-if="!change2">
                    <div class="top">
                        <div class="tagt"  v-for="it,index in messageList">
                            <Tag @click="goSearch(index)" :message="it" :ifClick="FlagList[index]"></Tag>
                        </div>
                    </div>
                    <el-scrollbar>
                        <div class="bottom">
                            <div v-if="FlagList[0]" class="search-line-list">
                                <div class="item" v-for="it in listSearch" @click="choice('song',it.id,it.al.picUrl,it.name,it.ar.map(i=>i.name).join('/'))">
                                    <span class="name">{{ it.name }}</span>
                                    <span>-{{it.ar.map(i=>i.name).join('/') }}</span>
                                </div>
                            </div>
                            <div v-if="FlagList[1]" class="singer">
                                <HBlock type="singer"
                                :id="val.id" 
                                :Name="HName(val.name,val.alias)"
                                :url="val.picUrl"
                                v-for="val in listSearch"
                                @click="choice('artist',val.id,val.picUrl,val.name,'')"
                                ></HBlock>
                            </div>
                            <div v-if="FlagList[2] " class="ZhuanJi">
                                <HBlock type="ZhuanJi" 
                                :id="val.id" 
                                :Name="HName(val.name,val.alias)" 
                                :ZhunaJi="Hzhuan(val.artist)" 
                                :arId="val.artist.id" :url="val.picUrl" 
                                @click="choice('album',val.id,val.picUrl,val.name,Hzhuan(val.artist))"
                                v-for="val in listSearch"></HBlock>
                            </div>
                            <div v-if="FlagList[3]" class="playList">
                                <HBlock type="playList" 
                                :id="val.id" 
                                :Name="val.name" 
                                :url="val.coverImgUrl"
                                :creator="val.creator" 
                                @click="choice('playlist',val.id,val.coverImgUrl,val.name,`by${val.creator.nickname}`)"
                                @click.stop
                                v-for="val in listSearch"></HBlock>
                            </div>
                            <div v-if="listSearch.length == 0">无结果</div>
                        </div>
                    </el-scrollbar>
                </div>
            </div>
        </template>
    </MyDialog>
</template>

<script setup lang="ts">
import {ref,Ref, watch,nextTick, onMounted } from 'vue'
import eventBlock from '@renderer/components/myVC/eventBlock.vue';
import Tag from '@renderer/components/myVC/Tag.vue';
import { useMain,useBasicApi,useGlobalVar,useNM } from '@renderer/store';
import { useRouter } from 'vue-router';
const BasicApi = useBasicApi()
const NM = useNM()
const $router = useRouter()
const Main = useMain()
const valFlag = ref(true)
const listFlag = ref(false)
const list:Ref<any[]> = ref([])
const otherList:Ref<any[]> = ref([])
const lasttime = ref(-1)
const globalVar = useGlobalVar()
//
const ifNM = ref(false)
if(localStorage.getItem('NMcookie'))ifNM.value = true
const leftRef = ref<(InstanceType<typeof HTMLElement>)>()

let eventRes 

const eventResolve = (val)=>{
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
}
onMounted(async()=>{
    if(localStorage.getItem('NMcookie')){
        eventRes = await NM.reqMyEvent()
    }else{
        eventRes = await Main.reqMyEvent()
    }
    eventResolve(eventRes)
})

watch(listFlag,()=>{
    if(listFlag.value ){
        valFlag.value = false;
    }else{
        valFlag.value = true;
    }
})//
const observer = new IntersectionObserver(async (entries) => {
    console.log(entries);
    if (entries[0].isIntersecting) {
        observer.disconnect()
        console.log('元素已经出现在视口中');
        listFlag.value = false;
        let eventRes
        if(localStorage.getItem('NMcookie')){
            console.log('QIU');
            eventRes = await NM.reqMyEvent(lasttime.value);
        }else{
            eventRes = await Main.reqMyEvent(lasttime.value);
        }
        const event:any[] = eventRes.event
        event.forEach((item,index)=>{
            list.value.push(JSON.parse(item.json))
            delete event[index].json
        })
        console.log(list.value);
        otherList.value.push(...event)
        console.log(otherList.value);
        listFlag.value = true
        lasttime.value = eventRes.lasttime
        if(event.length == 0)return
        nextTick(()=>{
            // 获取所有子元素
            const children = leftRef.value!.querySelectorAll('.eventBlock')
            // 获取子元素数量
            const length = children.length;
            // 获取最后一个子元素
            const lastChild = children[length - 1];
            observer.observe(lastChild)
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
    confirmName.value = '分享'
    cancelName.value = '取消'
    senddongtaiFlag.value = false
    init()
}

function base64toFile(base64Data) {
  const arr = base64Data.split(',');
  const mime = arr[0].match(/:(.*?);/)[1];
  const extension = mime.split('/')[1];
  const timestamp = Date.now();
  const fileName = `${timestamp}.${extension}`;
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new File([u8arr], fileName, { type: mime });
}

const confirm = async()=>{
    if(change.value){
        senddongtaiFlag.value = false
        globalVar.loadDefault  = true
        let result
        if(localStorage.getItem('NMcookie')){
            const formData = new FormData()
            shareimages.value.forEach((base64,index)=>{
                formData.append('files',base64toFile(base64))
            })
            if(choiceType.value != 'noresource')formData.append('id', choiceId.value);
            formData.append('type', choiceType.value);
            formData.append('msg', zhuanfaMessage.value);
            result = await NM.reqShareResource(formData)
        }else{
            result = await Main.reqShareResource(choiceType.value,choiceId.value,zhuanfaMessage.value)
        }
        globalVar.loadDefault  = false
        if(result.code == 200){
            globalVar.loadMessageDefault = '分享成功'
            globalVar.loadMessageDefaultFlag = true
            list.value.unshift(JSON.parse(result.event.json))
            let t  = result.event
            delete t['json']
            otherList.value.unshift(t)
            BasicApi.profile!.eventCount++
        }else{
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefault = '分享失败'
            globalVar.loadMessageDefaultFlag = true
        }
        zhuanfaMessage.value = ''
    }else{
        confirmName.value = '分享'
        cancelName.value = '取消'
        change.value = true
    }
    init()
}
const WriteCommitRef = ref()
const cancel = ()=>{
    if(change.value){
        WriteCommitRef.value.textarea = ''
        senddongtaiFlag.value = false
    }else{
        confirmName.value = '分享'
        cancelName.value = '取消'
        change.value = true
    }
    init()
}
let zhuanfaMessage = ref('')

const getZhuanfaText = (message:string)=>{
    zhuanfaMessage.value = message
}

const change = ref(true)
const change2 = ref(true)
const confirmName = ref('分享')
const cancelName = ref('取消')
const input = ref('')
const changeFn = ()=>{
    change.value = false
    confirmName.value = '返回'
    cancelName.value = '返回'
}
const messageList = ['单曲','歌手','专辑','歌单']
const messageType = ['1','100','10','1000']
const FlagList = ref([false,false,false,false])
const nowIndex = ref(0)
const listSearch:Ref<any[]> = ref([])
const goSearch = async(index:number)=>{
    listSearch.value = []
    if(input.value.trim().length ==0)return
    nowIndex.value = index;
    change2.value = false
    FlagList.value.fill(false)
    FlagList.value[index] = true
    if(['1002','1000'].includes(messageType[index]) && localStorage.getItem('NMcookie')){
        listSearch.value= await NM.reqSearch(input.value.trim(),messageType[index],30,0)
    }else{
        listSearch.value= await Main.reqSearch(input.value.trim(),messageType[index],30,0)
    }
    console.log(listSearch.value);
}
watch(input,()=>{
    if(input.value.length == 0){
        change2.value = true
        listSearch.value = []
    }
})
//song,playlist,mv,djradio,djprogram,artist,album
//song,playlist,artist,album,noresource
const choiceType=ref('noresource')
const choiceMessage = ref('给动态配上音乐')
const choiceId = ref(0)
const imgUrl = ref('')
const choice = (type:string,id:number,url:string,name:string,ar:string)=>{
    if(type == 'song'){
        choiceMessage.value = `单曲：${name}-${ar}`
    }else if(type == 'artist'){
        choiceMessage.value = `歌手：${name}`
    }else if(type == 'album'){
        choiceMessage.value = `专辑：${name}-${ar}`
    }else if(type == 'playlist'){
        choiceMessage.value = `歌单：${name}-${ar}`
    }
    choiceType.value = type
    choiceId.value = id
    imgUrl.value = url
    imgRef.value!.style.backgroundImage = `url(${url})`
    change.value = true
    confirmName.value = '分享'
    cancelName.value = '取消'
}
const imgRef = ref<InstanceType<typeof HTMLElement>>()
const init = ()=>{
    choiceType.value = 'noresource'
    choiceMessage.value = '给动态配上音乐'
    choiceId.value
    imgUrl.value = ''
    FlagList.value = [false,false,false,false]
    nowIndex.value = 0
    listSearch.value = []
    input.value = ''
    imgRef.value!.style.backgroundImage =''
}//
const HName = (name:string,alias:any[])=>{
  if(alias.length == 0)return name
  else return `${name} (${alias.join(',')}) `
}

const Hzhuan = (obj:any)=>{
  if(obj.alias.length == 0)return obj.name
  else return `${obj.name} (${obj.alias.join(',')}) `
}
const clearChoice = ()=>{
    choiceType.value = 'noresource'
    choiceId.value = 0
    imgUrl.value = ''
    choiceMessage.value = '给动态配上音乐'
    imgRef.value!.style.backgroundImage = ''
}

const goPersonal = ()=>{
    $router.push({
        name:'PersonalCenter',
        query:{
            id:BasicApi.profile?.userId
        }
    })
}
const goEvents = ()=>{
    $router.push({
        name:'SomeoneEvent',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
}
const goLike = ()=>{
    $router.push({
        name:'SomeoneLike',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
    
}
const goFans = ()=>{
    $router.push({
        name:'SomeoneFans',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
}
const shareimages:Ref<ArrayBuffer[]> = ref([])
const addShareImage = ()=>{
    window.electron.ipcRenderer.invoke('add-share-image',shareimages.value.length).then(async(lius:PromiseSettledResult<any>[])=>{
        let p = await Promise.allSettled(lius.map((item)=>{
            return new Promise<any>((resolve, reject) => {
                if(item.status == 'fulfilled'){
                    const blob = new Blob([item.value], { type: 'image/png' });
                    const reader = new FileReader();
                    reader.readAsDataURL(blob);
                    reader.onload = function(event) {
                        const base64Data:ArrayBuffer = event.target!.result as ArrayBuffer;
                        console.log(base64Data);
                        resolve(base64Data!)
                    };
                }else{
                    resolve(new ArrayBuffer(1))
                }
            })
        }))
        p.forEach((item:any)=>{
            shareimages.value.push(item.value)
        })
        console.log(shareimages.value);
    })
}
const delimg = (index)=>{
    shareimages.value.splice(index,1)
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
                color: white;
            }

            &:hover {
                background-color: @play-all-button-hover;
            }
            >span{
                color: white;
            }
        }
    }
    .header-oneself{
        background-color: rgb(43,43,43,.7);
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
            background-color: @follow-right-bk;
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
                        cursor: pointer;
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
        .right-oneself{
            background-color: rgb(43,43,43,.7);
        }
    }
}
.default{
    margin-top: -20px;
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

        .icon-icon-{
            font-size: 25px;
            margin-left: 5px;
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
            background-size: cover;
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
            width: 80%;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space:nowrap;
            user-select: none;
            color: @font-color;
        }
        >i{
            color: @font-color;
            margin-left: 5px;
            &:hover{
                color: @font-color-hover;
            }
        }
    }
    .imgs{
        margin-top: 10px;
        width: 100%;
        // background-color: red;
        position: relative;
        display: flex;
        align-items: center;
        margin-right: 10px;
        flex-wrap: wrap;
        .ig{
            user-select: none;
            flex: 0 0 15%;
            position: relative;
            border-radius: .5em;
            margin-bottom: 10px;
            box-sizing: border-box;
            .el-image{
                width: 100%;
                height: 100%;
                :deep(img){
                    width:100%;
                    height: 65px;
                    border-radius: .5em;
                }
            }
            .icon-cuowu{
                position: absolute;
                top: -5px;
                right: -5px;
                font-size: 20px;
                background-color: white;
                border-radius: 2em;
                display: none;
            }
            &:hover i{
                display: block;
                cursor: pointer;
            }
        }
        .addd{
            height: 67px;
            width: 65px;
            border: 1px dashed  @small-font-color;
            box-sizing: border-box;
            display: flex;
            justify-content: center;
            align-items: center;
            i{
                font-size: 40px;
            }
        }
        :not(:nth-child(6n)) {
            margin-right: 2%;
        }

    }
}
.search{
    margin-top: -20px;
    :deep(.el-input){
        --el-input-hover-border-color: none; 
        --el-input-focus-border-color: none;
        width: 100%;
        font-size: 12px;
        border: 1px solid @small-font-color;
        border-radius: 0.2em;
        background-color: @other-bk-color;
        padding-bottom: 5px;
        padding-top: 5px;
        .el-input__wrapper{
            background-color: @other-bk-color;
            box-shadow: none;
            padding-bottom: 5px;
            padding-top: 5px;
            padding-right: 15px;
            height: 10px;
            &::-webkit-scrollbar{
                height: 80%;
            }
            &::-webkit-scrollbar-button{
                display: none;
            }
            &::-webkit-scrollbar{
                width: 7px;
                height: 90%;
                background-color: @commit-block-scroll-line;
            }
            &::-webkit-scrollbar-thumb {
                border-radius: 0.4em;
                background: @commit-block-scroll-button;
            }
            ::placeholder{
                color: @small-font-color;    
            }
            
        }
        input{
            color: @font-color;
        }
    } 
    .l{
        height: 135px;
        .T{
            height: 30px;
            line-height: 30px;
            font-size: 12px;
        }
        .f{
            line-height: 25px;
            height: 25px;
            user-select: none;
            font-size: 12px;
            cursor: pointer;
            border-radius: .2em;
            .name{
                color: @font-color;
                padding-left: 5px;
            }
            &:hover{
                background-color: @commit-block-color;
            }
        }
    }
    .s{
        height: 235px;
        .top{
            margin-top: 5px;
            display: flex;
            .tagt{
                flex-basis: 25%;
                :deep(>.tag){
                    width: 20px;
                }
            }

        }
        .bottom{
            .search-line-list{
                .item{
                    line-height: 25px;
                    height: 25px;
                    user-select: none;
                    font-size: 12px;
                    cursor: pointer;
                    border-radius: .2em;
                    .name{
                        color: @font-color;
                        padding-left: 5px;
                    }
                    &:hover{
                        background-color: @commit-block-color;
                    }
                }
            }
            :deep(.singer){
                .Hblock{
                    .left{
                        .name{
                            width: auto;
                        }
                        .name-singer{
                            width: auto;
                            color: @font-color;
                        }
                    }
                }
            }
            :deep(.ZhuanJi){
                .Hblock{
                    overflow: hidden;
                    .left{
                        .name{
                            width: 100px;
                            overflow: hidden;
                        }
                        .name-singer{
                            margin-right: 5px;
                            width: 150px;
                            overflow: hidden;
                            color: @font-color;
                        }
                    }
                }
            }
            :deep(.playList){
                .Hblock{
                    overflow: hidden;
                    .left{
                        .name{
                            width: 100px;
                            overflow: hidden;
                            color: @font-color;
                        }
                        .name-singer{
                            margin-right: 5px;
                            width: 150px;
                            overflow: hidden;
                            color: @font-color;
                        }
                    }
                }
            }
        }
    }
}


</style>