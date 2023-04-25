<template>
  <div class="eventBlock" ref="eventBlock">
    <img  :src="user.avatarUrl" alt="" fill="cover">
    <div class="msg">
        <div class="top">
            <div class="name"><span>{{ user.nickname }}</span> <span>{{ typeMap.get(type) }}</span></div>
            <div class="time">{{ Timeago2(time) }}</div>
        </div>
        <div class="msg2" v-show="ifZhuanfu" v-html="RegTxt(msg)" >
        </div>
        <div class="base" ref="base" :class="{zhuanfa:ifZhuanfu}" @click.self="ifZhuanfu?goZhuanFa():()=>{} ">
            <div class="msg2">
                <span class="name" v-if="ifZhuanfu">@{{ props.val.event.user.nickname }}</span> 
                <span v-if="ifZhuanfu">{{ `${typeMap.get(typeI)}：` }}</span>
                <span class="txt" v-html="!ifZhuanfu?RegTxt(msg):RegTxt(valI.msg)"></span>
            </div>
            <div class="share" @click="shareHandle" v-if="Object.keys(valI).length != 1 && typeI != 35">
                <div class="bk">
                    <el-image draggable="false"  :src="shareCover" alt="" fill="cover">
                        <template #error>
                            <div class="image-slot">
                            </div>
                        </template>
                    </el-image >
                    <div class="t">
                        <div class="title"><span class="tag">{{ tagName }}</span>{{shareTitle}}<span>{{ otherMessage }}</span></div>
                        <div class="other">
                            <span v-for="it,index in smallMessage">
                                {{ it }}
                                <span class="_" v-if="index+1!=smallMessage.length">/</span>
                            </span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="imgs" v-show="!bigFlag && picsI.length > 1">
                <!-- squareUrl -->
                <div class="bk" :style="{backgroundImage:`url('${item.squareUrl}')`}" v-for="item in picsI" @click="bingImg(item.originUrl,item.originUrl)">
                </div>
            </div>
            <div class="imgBig" v-show="!bigFlag && picsI.length == 1">
                <!-- originUrl -->
                <div class="bk">
                    <div class="img" draggable="false" 
                    :class="{
                        'img-heigher':picsI[0]?.height > picsI[0]?.width,
                        'img-widther':picsI[0]?.height < picsI[0]?.width,
                        'img-same':Math.abs(picsI[0]?.height - picsI[0]?.width) <= 100,
                    }"
                    :style="{
                        backgroundImage:`url('${picsI[0]?.originUrl}')`,
                        height:(picsI[0]?.height?picsI[0]?.height:300) + 'px',
                        width:(picsI[0]?.width?picsI[0]?.width:300) + 'px',
                    }"  @click="bingImg(picsI[0].originUrl,picsI[0].originUrl)"></div>
                </div>
            </div>
            <div class="imgShow" v-show="bigFlag">
                <div class="icon">
                    <span @click="closeBig"><i class="iconfont icon-shangchuan"></i><span>收起</span></span>
                    <span @click="showFill"><i class="iconfont icon-youshangjiao"></i><span>查看原图</span></span>
                    <span @click="download"><i class="iconfont icon-xiazai1"></i><span>下载</span></span>
                </div>
                <div class="big" ref="bigImg">
                    <!-- originUrl -->
                    <img  @click="closeBig" :src="bigUrl" alt="">
                </div>
            </div>
            <div class="option">
                <i class="iconfont icon-dianzan" v-if="!infoI.liked"  @click="throttleDianzan(threadIdI,1,'I')"><span>{{ infoI.likedCount?`(${infoI.likedCount})`:'' }}</span></i>
                <i class="iconfont icon-dianzan_kuai" v-else  @click="throttleDianzan(threadIdI,2,'I')"><span>{{ infoI.likedCount?`(${infoI.likedCount})`:'' }}</span></i>
                <i class="line">|</i>
                <i class="iconfont icon-fenxiang" @click="!ifZhuanfu?zhuanfa('w'):zhuanfa('i') "><span>{{ infoI.shareCount?`(${infoI.shareCount})`:'' }}</span></i>
                <i class="line">|</i>
                <i class="iconfont icon-pinglun" @click="!ifZhuanfu?showPing():()=>{}"><span>{{ infoI.commentCount?`(${infoI.commentCount})`:'' }}</span></i>
            </div>
        </div>
        <div class="option" v-if="ifZhuanfu">
            <i class="iconfont icon-dianzan" v-if="!infoW.liked" @click="throttleDianzan(threadId,1,'W')"><span>{{ infoW.likedCount?`(${infoW.likedCount})`:'' }}</span></i>
            <i class="iconfont icon-dianzan_kuai" v-else @click="throttleDianzan(threadId,2,'W')"><span>{{ infoW.likedCount?`(${infoW.likedCount})`:'' }}</span></i>
            <i class="line">|</i>
            <i class="iconfont icon-fenxiang" @click="zhuanfa('w')"><span>{{ infoW.shareCount?`(${infoW.shareCount})`:'' }}</span></i>
            <i class="line">|</i>
            <i class="iconfont icon-pinglun" @click="showPing()"><span>{{ infoW.commentCount?`(${infoW.commentCount})`:'' }}</span></i>
        </div>
        <div ref="commentlist"></div>
        <div class="comment-list"  v-if="showPingLun">
            <div class="wr-commit">
                <WriteCommit @getText="getText" ref="WriteCommitRef2"></WriteCommit>
                <div class="submit" :class="{noDrag:!Main.dragMouse}" @click="subCommit">
                    <span>评论</span>
                </div>
            </div>
            <CommentList ref="CommentListRef" :commentFlag="commentFlag" :nowPage="nowPage"
            :hotComments="hotComments" :moreHot="moreHot" :total="total"
            :comments="comments" :totalPage="totalPage" :threadId="threadId" :type="6"
            @scroll="scroll"
            ></CommentList>
        </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="model" draggable="false"  @click.self="closeModel" v-show="modelFlag">
        <!-- originUrl -->
        <i class="iconfont icon-guanbi_o" @click="closeModel"></i>
        <Transition name="scl">
            <img :src="modeSrc" draggable="false" ref="imgModel" alt="" v-show="imgModelFlag">
        </Transition>
        <div class="download" title="下载" @click="download">
            <i class="iconfont icon-xiazai1"  title="下载"></i>
        </div>
    </div>
  </Teleport>
  <MyDialog :flag="zhuanfuFlag" @closeDialog="closeDialog" @confirm="confirm" @cancel="cancel">
    <template #header>
        <div>转发</div>
    </template>
    <template #midle>
        <WriteCommit @getText="getZhuanfaText" :df="zhuanfadf" ref="WriteCommitRef"></WriteCommit>
    </template>
  </MyDialog>
</template>

<script setup lang="ts">
import {ComponentInternalInstance, Ref, getCurrentInstance, nextTick, onMounted, provide, ref, toRaw, watch} from 'vue'
import {useMain,useGlobalVar} from '@renderer/store'
import { Timeago2 } from '@renderer/utils/dayjs'
import CommentList from './CommentList.vue'
import MyDialog from './MyDialog.vue'
import {throttle} from 'lodash'
// import {regEmoji} from '@/utils/regEmoji'
const fenxiang = ref(true)
provide('fenxiang', fenxiang)
const props = defineProps<{
    val:any
    pics:any[]
    type:number
    user:any
    time:number
    info:any
    threadId:any
    id:number
}>()
const valI = ref()
const msg = ref('')
const picsI:Ref<any[]> = ref([])
const typeI = ref()
const infoI = ref()
const infoW = ref()
const threadIdI = ref()
watch(()=>props,()=>{
    valI.value = props.val
    msg.value = props.val.msg
    picsI.value = props.pics
    typeI.value = props.type
    infoI.value = Object.assign({}, props.info)
    infoW.value = Object.assign({}, props.info)
    threadIdI.value = props.threadId
},{immediate:true,deep:true})

const typeMap = new Map([
[18,'分享单曲'],
[19,'分享专辑'],
[28,'分享电台节目'],
[17, '分享电台节目'],
[22,'转发'],
[35,'发布动态'],
[13,'分享歌单'],
[24,'分享专栏文章'],
[41, '分享视频'],
[21,'分享视频'],
[56,'发布动态']
])

const tagName = ref('')
const shareTitle = ref('')
const otherMessage = ref('')
const shareCover = ref('')
const smallMessage:Ref<string[]> = ref([])
//是不是转发
const ifZhuanfu = ref(false)

const typeChange = ()=>{
    if(typeI.value == 18){
        tagName.value = '歌曲'
        shareTitle.value = valI.value.song.name
        otherMessage.value =valI.value.song.alias.length == 0?'':'('+ valI.value.song.alias.join('、') + ')'
        shareCover.value = valI.value.song.album.picUrl
        smallMessage.value = valI.value.song.artists.map(it=>it.name)
    }else if(typeI.value == 13){
        tagName.value = '歌单'
        shareTitle.value = valI.value.playlist.name
        shareCover.value = valI.value.playlist.coverImgUrl
        smallMessage.value = [`by ${valI.value.playlist.creator.nickname}`]
    }else if(typeI.value == 19){
        tagName.value = '专辑'
        shareCover.value = valI.value.album.picUrl
        shareTitle.value = valI.value.album.name
        smallMessage.value = valI.value.album.artists.map(it=>it.name)
    }else if(typeI.value== 56){
        tagName.value = '手机活动'
        shareCover.value = valI.value.resource.coverImgUrl
        shareTitle.value = valI.value.resource.title
        smallMessage.value =[valI.value.resource.subTitle]
    }else if(typeI.value == 35){}
    else if(typeI.value== 41){
        tagName.value = '视频'
        shareCover.value = valI.value.video.coverUrl
        shareTitle.value = valI.value.video.description
        smallMessage.value = ['视频暂不支持播放']
    }else if(typeI.value== 22){
        ifZhuanfu.value = true
        valI.value = JSON.parse(props.val.event.json)
        console.log(valI.value);
        picsI.value = props.val.event.pics
        typeI.value = props.val.event.type
        infoI.value = Object.assign({}, props.val.event.info) 
        threadIdI.value = props.val.event.threadId
        typeChange()
    }else if(typeI.value== 28 || typeI.value==17){
        tagName.value = '电台'
        shareCover.value = valI.value.program.coverUrl
        shareTitle.value = valI.value.program.name
        smallMessage.value = [valI.value.program.radio.name]
    }
}

watch(()=>typeI,()=>{
    typeChange()
},{immediate:true})


const Main = useMain()
const globalVar = useGlobalVar();
let commitMessage = ref('')
const getText = (message:string)=>{
    commitMessage.value = message
}
const WriteCommitRef2 = ref()
const subCommit = async()=>{
    if(commitMessage.value == ''){
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefault = '写点东西吧，内容不能为空哦！'
        globalVar.loadMessageDefaultFlag = true
    }else{
        let obj:comment.sendComment = {
            t:1,
            type:6,
            threadId:props.threadId,
            content:commitMessage.value
        }
        let result = (await Main.reqcomment(obj)).data;
        if(result.code == 200){
            globalVar.loadMessageDefault = '评论成功！'
            globalVar.loadMessageDefaultFlag = true
            WriteCommitRef2.value.textarea = ''
        }else{
            globalVar.loadMessageDefault = '评论失败！'
            globalVar.loadMessageDefaultFlag = true
        }
        let addComment = result.comment
        addComment['likedCount'] = 0;
        addComment['liked'] = false;
        addComment['timeStr'] = '刚刚'
        addComment['beReplied'] = []
        comments.value.unshift(addComment)
        if(ifZhuanfu.value)infoW.value.commentCount++
        else infoI.value.commentCount++
        total.value ++;
    }
}

const showPingLun = ref(false)
const bigUrl = ref('')
const bigFlag = ref(false)
const originUrlT = ref('')
const bigImg = ref<InstanceType<typeof HTMLElement>>()
const bingImg = (url:string,originUrl:string)=>{
    bigUrl.value = url
    bigFlag.value = true
    originUrlT.value = originUrl
}
const closeBig = ()=>{
    bigFlag.value = false
}
const showFill = ()=>{
    modelFlag.value = true
    modeSrc.value = originUrlT.value;
}
const modelFlag = ref(false)
const modeSrc = ref('')
const imgModel = ref<InstanceType<typeof Image >>()
const imgModelFlag = ref(false)
watch(modeSrc,()=>{
    if(modeSrc.value != ''){
        imgModel.value!.onload = ()=>{
            cal.value = 1
            imgModelFlag.value = true;
        }
    }
})
const closeModel = ()=>{
    imgModelFlag.value = false;
    const t = setTimeout(()=>{
        modelFlag.value = false
        modeSrc.value = ''
        clearTimeout(t);
    },300)
}

const cal = ref(1);
const scaleFn = (e:WheelEvent)=>{
    //放大图片
    if(e.deltaY < 0){
        cal.value+=0.1
    }else{
        cal.value-=0.1
    }
    if(cal.value >=2)cal.value = 2;
    else if(cal.value <=0.5)cal.value = 0.5
    console.log(cal.value);
    imgModel.value!.style.transform = `scale(${cal.value})`
}

const dragX = ref(0)
const dragY = ref(0)
const dragstart = (e:MouseEvent)=>{
    dragX.value += e.clientX
    dragY.value += e.clientY
    imgModel.value!.style.cursor = 'grabbing'
    window.addEventListener('mousemove',draging)
    window.addEventListener('mouseup',dragend)
}
const draging = (e:MouseEvent)=>{
    imgModel.value!.style.left = e.clientX - dragX.value + 'px'
    imgModel.value!.style.top =  e.clientY - dragY.value + 'px'
}

const dragend = (e:MouseEvent)=>{
    imgModel.value!.style.cursor = 'grab'
    dragX.value = -imgModel.value!.style.left.split('px')[0]
    dragY.value = -imgModel.value!.style.top.split('px')[0]
    window.removeEventListener('mousemove',draging)
    window.removeEventListener('mouseup',dragend)
}

watch(modelFlag,()=>{
    if(modelFlag.value){
        window.addEventListener('wheel',scaleFn)
        imgModel.value!.addEventListener('mousedown',dragstart)
    }else{
        window.removeEventListener('wheel',scaleFn)
        imgModel.value!.removeEventListener('mousedown',dragstart)
        dragX.value = 0
        dragY.value = 0
        imgModel.value!.style.left = '0px'
        imgModel.value!.style.top = '0px'
        imgModel.value!.style.transform = `scale(1)`
    }
})

//是否滚动主页面
const commentlist = ref<InstanceType<typeof HTMLElement>>()
const observer = new IntersectionObserver((entries) => {
    console.log(entries);
  if (entries[0].isIntersecting) {
    console.log('元素已经出现在视口中');
  } else {
    console.log('元素还未出现在视口中',showPingLun.value);
    if(showPingLun.value){
        globalVar.changeMainScroll = 300
    }
  }
  observer.unobserve(commentlist.value!)
});

//打开评论
const showPing = ()=>{
    showPingLun.value = !showPingLun.value
    nextTick(()=>{
        observer.observe(commentlist.value!)
    })
}

const scrollVal = ref()
watch(showPingLun,async()=>{
    if(showPingLun.value){
        loadComment()
        console.log(globalVar.mainScroll);
        scrollVal.value = globalVar.mainScroll
    }
})

let commentFlag = ref(false)
let hotComments: Ref<any[]> = ref([]);
let comments: Ref<any[]> = ref([]);
let total = ref(0)
let totalPage = ref(0)
let nowPage = ref(1);
let moreHot = ref(false)
const loadComment = async()=>{
    commentFlag.value = false
    let result = (await Main.reqMyEventComment(props.threadId,20,0))
    hotComments.value = result.hotComments;
    comments.value = result.comments;
    total.value = result.total
    totalPage.value = Math.ceil((total.value) / 20)
    moreHot.value = result.moreHot
    commentFlag.value = true
    nowPage.value = 1;
}

const base = ref<InstanceType<typeof HTMLElement>>()
const scroll = ()=>{
    console.log(globalVar.mainScroll);
    console.log(scrollVal.value);
    globalVar.changeMainScroll = scrollVal.value - globalVar.mainScroll + base.value!.offsetHeight 
}


//处理文字
const RegTxt = (msg:string)=>{
    msg = msg.replace(/#.*?#/g, '');
    const linkRegex = /((http|https):\/\/[\w\-_]+(\.[\w\-_]+)+([\w\-\.,@?^=%&amp;:/~\+#]*[\w\-\@?^=%&amp;/~\+#])?)/g;
    msg = msg.replace(linkRegex, '<a href="$1" target="_blank">链接地址</a>');
    msg = msg.replace(/(@.+?) /g, '<a href="javascript:;">$1</a> ');
    msg = msg.replace(/\/\/(@.+?)：/g, '//<a href="javascript:;">$1</a>：');
    msg = msg.replace(/\n/g, "<br>");
    return msg;
}

const shareHandle = async()=>{
    if(typeI.value == 18){
        const result = (await Main.reqSongDetail([valI.value.song.id])).data
        console.log(result);
        let index = 0
        if (Main.playingindex == -1) index = 0
        else index = Main.playingindex
        Main.playingList.splice(index, 0, result.songs[0])
        Main.playingPrivileges.splice(index, 0, result.privileges[0])
        Main.playingindex = index + 1
        Main.playing =  valI.value.song.id
        Main.playStatus = 'play'
        Main.songType = 'song'
    }else if(typeI.value == 19){
        console.log('props');
    }else if(typeI.value == 56){
        window.open(valI.value.resource.webviewUrl, '_blank')
    }
}
const goZhuanFa = ()=>{
    console.log('转发页');
}
//点赞
const dianzan = async(id:string,t:1|2,T:'I'|'W')=>{
    let info:any;
    if(T== 'I')info = infoI
    else info = infoW
    if(await Main.reqLikeResource(id,6,t)){
        if(t == 2)info.value.likedCount--
        else info.value.likedCount++
        info.value.liked = !info.value.liked
    }else{
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadMessageDefault = '点赞失败'
    }
}
const throttleDianzan = throttle(dianzan,1000,{leading:true})

//转发
const zhuanfuFlag = ref(false)
const WriteCommitRef = ref()
const way = ref('')
const zhuanfa = (str:string)=>{
    way.value = str
    if(str == 'w'){
        if(props.type == 22){
            zhuanfadf.value = '//@'+props.user.nickname+'：' + msg.value
        }
    }else{
        zhuanfadf.value = ''
    }
    console.log(zhuanfadf.value);
    zhuanfuFlag.value = true
    nextTick(()=>{
        WriteCommitRef.value?.getFocus()
    })

}

const closeDialog = (done: () => void)=>{
    WriteCommitRef.value.textarea = zhuanfadf.value
    done()
    zhuanfuFlag.value = false
    zhuanfaMessage.value  = ''
}

const confirm = async()=>{
    WriteCommitRef.value.textarea = zhuanfadf.value
    zhuanfuFlag.value = false
    globalVar.loadDefault = true
    let result 
    if(way.value == 'w')result =  await Main.reqEventForward(props.user.userId,props.id,zhuanfaMessage.value)
    else result =  await Main.reqEventForward( props.val.event.user.userId, props.val.event.id,zhuanfaMessage.value)
    globalVar.loadDefault = false
    if(result.code == 200){
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadMessageDefault = '转发成功'
    }else{
        globalVar.loadMessageDefaultFlag = true
        globalVar.loadMessageDefault = '转发失败'
    }
    zhuanfaMessage.value  = ''
}

const cancel = ()=>{
    WriteCommitRef.value.textarea = zhuanfadf.value
    zhuanfuFlag.value = false
    zhuanfaMessage.value  = ''
}
let zhuanfaMessage = ref('')
const zhuanfadf = ref('')

const getZhuanfaText = (message:string)=>{
    zhuanfaMessage.value = message
}
//转发结束

//下载图片
const download = ()=>{
    const lastDotIndex = bigUrl.value.lastIndexOf('.');
    const ext = bigUrl.value.slice(lastDotIndex);
    fetch(bigUrl.value)
    .then(response => response.arrayBuffer())
    .then(async(buffer) => {
        let flag = await window.electron.ipcRenderer.invoke('save-image',{buffer,ext})
        if(flag){
            globalVar.loadMessageDefault = '保存成功'
            globalVar.loadMessageDefaultFlag = true
        }else{
            globalVar.loadMessageDefaultType = 'error'
            globalVar.loadMessageDefault = '保存失败'
            globalVar.loadMessageDefaultFlag = true
        }
        // 二进制数据处理
    })
    .catch(() => {
        globalVar.loadMessageDefaultType = 'error'
        globalVar.loadMessageDefault = '保存失败'
        globalVar.loadMessageDefaultFlag = true
    });
}
</script>
<style scoped lang="less">
    .noDrag{
        cursor: pointer;
    }
    .eventBlock{
        min-height: 150px;
        width: 92%;
        margin: 0 auto;
        border-bottom: 1px solid @small-font-color;
        display: flex;
        position: relative;
        margin-bottom: 20px;
        >img {
            width: 45px;
            height: 45px;
            border-radius: 50%;
            position: static;
        }
        >.msg{
            padding-left: 10px;
            width: calc(100% - 40px);
            >.top{
                height: 45px;
                display: flex;
                z-index: 10;
                flex-direction: column;
                justify-content: center;
                .name{
                    display: flex;
                    align-items: center;
                    &>:first-child{
                        color: @url-color;
                        &:hover{
                            color: @url-color-hover;
                        }
                        font-size: 14px;
                        margin-right: 10px;
                    }
                    &>:last-child{
                        color: @small-font-color;
                        font-size: 12px;
                    }
                }
                .time{
                    color: @small-font-color;
                    font-size: 12px;
                    margin-top: 8px;
                }
            }
            >.msg2{
                margin-top: 5px;
                margin-bottom: 15px;
                font-size: 14px;
                line-height: 20px;
                >:deep(a){
                    color: @url-color;
                    &:hover{
                        color: @url-color-hover;
                    }
                }
            }
            .base{
                >.msg2{
                    margin-top: 5px;
                    margin-bottom: 15px;
                    font-size: 14px;
                    line-height: 20px;
                    .txt{
                        >:deep(a){
                            color: @url-color;
                            &:hover{
                                color: @url-color-hover;
                            }
                        }
                    }
                }
                .share{
                    margin-bottom: 10px;
                    .bk{
                        display: flex;
                        border-radius: .5em;
                        background-color: @left-click-color;
                        cursor: pointer;
                        &:hover{
                            background-color: @span-color-hover;
                        }
                        >div{
                            padding: 5px 5px;
                        }
                        >.el-image{
                            position:static;
                            width: 40px;
                            height: 40px;
                            :deep(img){
                                border-radius: .2em;
                            }
                        }
                    }
                    .t{
                        display: flex;
                        justify-content: center;
                        flex-direction: column;
                        .title{
                            font-size: 13px;
                            >span{
                                color: @small-font-color;
                            }
                            >.tag{
                                color: @primary-color;
                                display: inline-block;
                                border: 1px solid  @primary-color;
                                font-size: 10px;
                                padding: 1px;
                                margin-right: 5px;
                            }
                        }
                        .other{
                            font-size: 13px;
                            color: @small-font-color;
                            display: flex;
                            align-items: center;
                            margin-top: 5px;
                            ._{
                                font-size: 10px;
                                margin-right: 5px;
                                transform: rotate(-5deg);
                            }
                        }
                    }
                }

                >.imgs{
                    display: flex;
                    width: 100%;
                    flex-wrap: wrap;
                    .bk{
                        width: 120px;
                        height:120px;
                        margin-right: 15px;
                        margin-bottom: 10px;
                        border-radius: .2em;
                        background-color: black;
                        cursor: zoom-in;
                        background-size: cover ;
                        background-position: center;
                        background-repeat: no-repeat;
                    }
                }
                >.imgBig{
                    user-select: none;
                    .bk{
                        max-height: 500px;
                        max-width: 500px;
                        user-select: none;
                        .img-heigher{
                            max-height: 500px;
                            max-width: 300px;
                        }
                        .img-widther{
                            max-width: 380px;
                            max-height: 250px;
                        }
                        .img-same{
                            max-width: 250px;
                            max-height: 250px;
                        }
                        .img{
                            border-radius: .5em;
                            cursor:zoom-in;
                            background-size: cover;
                            background-position: center;
                        }
                    }
                }
                >.imgShow{
                    height: auto;
                    background-color: @left-click-color;
                    border-radius: .5em;
                    margin-bottom: 10px;
                    .icon{
                        user-select: none;
                        cursor: pointer;
                        height: 30px;
                        display: flex;
                        align-items: center;
                        font-size: 12px;
                        color: @small-font-color;
                        >span{
                            margin:10px 10px;
                            &:hover{
                                color: @small-font-color-hover;
                            }
                            &:hover i{
                                color: @small-font-color;
                            }
                            i{
                                padding-right: 5px;
                            }
                        }
                    }
                    .big{
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        padding: 10px;
                        height: auto;
                        img{
                            max-width:100%;
                            cursor: zoom-out;
                        }
                    }
                }
                >.option{
                    user-select: none;
                    height: 30px;
                    // position: absolute;
                    width: 100%;
                    display: flex;
                    justify-content: end;
                    margin-top: 10px;
                    .icon-dianzan_kuai{
                        color: @primary-color !important;
                        >span{
                            color: @small-font-color;
                            &:hover{
                                color: @small-font-color-hover;
                            }
                        }
                    }
                    i{
                        font-size: 12px;
                        color: @small-font-color;
                        margin: 5px 5px;
                        &:not(.line):hover{
                            color: @small-font-color-hover;
                            cursor: pointer;
                        }
                        >span{
                            margin-left: 5px;
                        }
                    }
                }
            }
            >.comment-list{
                border-radius: .5em;
                background-color: @left-click-color;
                .wr-commit{
                    padding-top: 20px;
                    width: inherit;
                    position: relative;
                    .submit{
                        height: 30px;
                        width:55px;
                        border-radius: 2em;
                        border: 1px solid @split-line-color;
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        position: absolute;
                        right: 30px;
                        bottom: -5px;
                        >span{
                            user-select: none;
                            font-size: 14px;
                        }
                        &:hover{
                            background-color: @span-color-hover
                        }
                    }
                }
                :deep(.comment){
                    width: 100%;
                    .commentList{
                        width: 90%;
                    }
                }
                :deep(.input-bk){
                    width: 100% !important;
                }
            }
            >.option{
                user-select: none;
                height: 30px;
                // position: absolute;
                width: 100%;
                display: flex;
                justify-content: end;
                margin-top: 10px;
                .icon-dianzan_kuai{
                    color: @primary-color !important;
                    >span{
                        color: @small-font-color;
                        &:hover{
                            color: @small-font-color-hover;
                        }
                    }
                }
                i{
                    font-size: 12px;
                    color: @small-font-color;
                    margin: 5px 10px;
                    &:not(.line):hover{
                        color: @small-font-color-hover;
                        cursor: pointer;
                    }
                    >span{
                        margin-left: 5px;
                    }
                }
                }
            .zhuanfa{
                background-color: @left-click-color;
                border-radius: .5em;
                margin-bottom: 10px;
                cursor: pointer;
                &:hover{
                    background-color: @flow-hover-color;
                }
                >.msg2{
                    color: @small-font-color;
                    padding-top: 10px;
                    font-size: 13px;
                    >.name{
                        color: @url-color;
                        &:hover{
                            color: @url-color-hover;
                            cursor: pointer;
                            user-select: none;
                        }
                    }
                }
                >.share{
                    .bk{
                        background-color: @other-bk-color;
                        &:hover{
                            background-color: @other-bk-color-op;
                        }
                    }
                }
                >div{
                    padding-left: 10px;
                    padding-right: 10px;
                }
                >.option{
                    width: 95%;
                    margin-top: 0;
                }
        
            }
        }
    }
    .model{
        position: fixed;
        left: 0;
        top: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,.6);
        z-index: 1000;
        display: flex;
        justify-content: center;
        align-items: center;
        >i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 50px;
            color: @font-color;
            cursor: pointer;
            z-index: 1002;
        }
        img{
            z-index: 1001;
            max-width: 80%;
            max-height: 80%;
            position: relative;
            cursor: grab;
        }
        .download{
            width:80px;
            height: 30px;
            position: absolute;
            left: 0;
            right: 0;
            margin: 0 auto;
            bottom: 20px;
            background-color: @other-bk-color-op;
            z-index: 1002;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor:pointer;
            &:hover{
                background-color: @other-bk-color;
            }
            i{
                font-size: 20px;
                color: @font-color;
            }
        }
    }
    //开始过度
    .scl-enter-from{
        transform:scale(0%) !important;
    }
    //开始过度了
    .scl-enter-active{
        transition: all .2s linear;
    }
    //过度完成
    .scl-enter-to{
        transform:scale(100%) !important;
    }

    //离开中过度
    .scl-leave-active{
        transition: all .2s linear;
    }
    //离开完成
    .scl-leave-to{
        transform:scale(0%) !important;
    }
</style>