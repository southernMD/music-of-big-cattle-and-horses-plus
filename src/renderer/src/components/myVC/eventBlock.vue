<template>
  <div class="eventBlock">
    <img  src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" alt="" fill="cover">
    <div class="msg">
        <div class="top">
            <div class="name"><span>荣华之梦</span> <span>{{ '发布动态' }}</span></div>
            <div class="time">11月51日</div>
        </div>
        <div class="msg2" v-show="ifZhuanfu">
            铁转得卖记堂求钱笑娘百对？接可继转需姑恶取。卡农共端曾店！告求团校著争可担卫东靠静果夫。代康价神位？业桌贵生神负养西写馆？置必药森袋可腿呀点德所组须必萨起火接！读缺将啊定坐多旅许。衣方性通迹否忘说。！
        </div>
        <div class="base" :class="{zhuanfa:ifZhuanfu}">
            <div class="msg2">
                <span class="name" v-if="ifZhuanfu">@{{ '荣华之梦' }}</span> <span v-if="ifZhuanfu">{{ '分享单曲：' }}</span>铁转得卖记堂求钱笑娘百对？接可继转需姑恶取。卡农共端曾店！告求团校著争可担卫东靠静果夫。代康价神位？业桌贵生神负养西写馆？置必药森袋可腿呀点德所组须必萨起火接！读缺将啊定坐多旅许。衣方性通迹否忘说。！
            </div>
            <div class="share">
                <div class="bk">
                    <el-image draggable="false"  src="https://fuss10.elemecdn.com/e/5d/4a731a90594a4af544c0c25941171jpeg.jpeg" alt="" fill="cover"></el-image >
                    <div class="t">
                        <div class="title">荣华之恶<span>(原曲:可怜的布尔什)</span></div>
                        <div class="other">
                            <span>污妖王</span>
                            <span class="_">/</span>
                            <span>啊脱看</span>
                        </div>
                    </div>
                </div>
            </div>
            <div class="imgs" v-show="!bigFlag && imgsList.length > 1">
                <!-- squareUrl -->
                <div class="bk" v-for="i in 9" @click="bingImg('http://p1.music.126.net/WQOMKxOQrOVpEobazH_tQQ==/109951168551613493.jpg')">
                </div>
            </div>
            <div class="imgBig" v-show="!bigFlag && imgsList.length == 1">
                <!-- rectangleUrl -->
                <img draggable="false" :src="bigUrl" alt="" @click="bingImg('http://p1.music.126.net/WQOMKxOQrOVpEobazH_tQQ==/109951168551613493.jpg')">
            </div>
            <div class="imgShow" v-show="bigFlag">
                <div class="icon">
                    <span @click="closeBig"><i class="iconfont icon-shangchuan"></i><span>收起</span></span>
                    <span @click="showFill"><i class="iconfont icon-youshangjiao"></i><span>查看原图</span></span>
                    <span><i class="iconfont icon-xiazai1"></i><span>下载</span></span>
                </div>
                <div class="big">
                    <!-- rectangleUrl -->
                    <img  @click="closeBig" src="http://p1.music.126.net/WQOMKxOQrOVpEobazH_tQQ==/109951168551613493.jpg" alt="">
                </div>
            </div>
            <div class="option">
                <i class="iconfont icon-dianzan" v-if="false"><span>(1)</span></i>
                <i class="iconfont icon-dianzan_kuai" v-else><span>(1)</span></i>
                <i class="line">|</i>
                <i class="iconfont icon-fenxiang"><span>(1)</span></i>
                <i class="line">|</i>
                <i class="iconfont icon-pinglun" @click="!ifZhuanfu?showPing():()=>{}"><span>(1)</span></i>
            </div>
        </div>
        <div class="option" v-if="ifZhuanfu">
            <i class="iconfont icon-dianzan" v-if="false"><span>(1)</span></i>
            <i class="iconfont icon-dianzan_kuai" v-else><span>(1)</span></i>
            <i class="line">|</i>
            <i class="iconfont icon-fenxiang"><span>(1)</span></i>
            <i class="line">|</i>
            <i class="iconfont icon-pinglun" @click="showPing()"><span>(1)</span></i>
        </div>
        <div class="comment-list" ref="commentlist" v-show="showPingLun">
            <div class="wr-commit">
                <WriteCommit @getText="getText"></WriteCommit>
                <div class="submit" :class="{noDrag:!Main.dragMouse}" @click="subCommit">
                    <span>评论</span>
                </div>
            </div>
            <CommentList :commentFlag="true" :nowPage="1" :hotComments="[]" :moreHot="false" :comments="[]" :total="1" :totalPage="0" :id="-1" :type="3"> </CommentList>
        </div>
    </div>
  </div>
  <Teleport to="body">
    <div class="model"  @click.self="closeModel" v-show="modelFlag">
        <!-- originUrl -->
        <i class="iconfont icon-guanbi_o" @click="closeModel"></i>
        <Transition name="scl">
            <img :src="modeSrc" ref="imgModel" alt="" v-show="imgModelFlag">
        </Transition>
    </div>
  </Teleport>
</template>

<script setup lang="ts">
import {Ref, ref, watch} from 'vue'
import {useMain,useGlobalVar} from '@renderer/store'
// import {regEmoji} from '@/utils/regEmoji'
const Main = useMain()
const globalVar = useGlobalVar();
let commitMessage = ref('')
const getText = (message:string)=>{
    commitMessage.value = message
}
const subCommit = ()=>{
}

const showPingLun = ref(false)
const bigUrl = ref('')
const bigFlag = ref(false)
const bingImg = (url:string)=>{
    bigUrl.value = url
    bigFlag.value = true
}
const closeBig = ()=>{
    bigFlag.value = false
}
const showFill = ()=>{
    modelFlag.value = true
    modeSrc.value = 'http://p1.music.126.net/VUd7IchQS3bZh05I-_pw9Q==/109951168551613491.jpg'
}
const modelFlag = ref(false)
const modeSrc = ref('')
const imgModel = ref<InstanceType<typeof Image>>()
const imgModelFlag = ref(false)
watch(modeSrc,()=>{
    if(modeSrc.value != ''){
        imgModel.value!.onload = ()=>{
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
    observer.observe(commentlist.value!)
}

//是不是转发
const ifZhuanfu = ref(true)
const imgsList = ref([1,2])
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
            }
            .base{
                >.msg2{
                margin-top: 5px;
                margin-bottom: 15px;
                font-size: 14px;
                line-height: 20px;
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
                            border-radius: 5rem;
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
                        }
                        .other{
                            font-size: 13px;
                            color: @small-font-color;
                            display: flex;
                            align-items: center;
                            margin-top: 5px;
                            ._{
                                font-size: 10px;
                                margin-right: 3px;
                                margin-left: 3px;
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
                        //squareUrl
                        background-image: url("http://p1.music.126.net/P8qfDfgEytgzxPpzBNSaUw==/109951168551623586.jpg");
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
                    img{
                        max-width: 400px;
                        max-height: 300px;
                        border-radius: .5em;
                        cursor:zoom-in;
                    }
                }
                >.imgShow{
                    height: 300px;
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
                        height: calc(100% - 30px);
                        img{
                            max-width: 460px;
                            max-height: 280px;
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
        i{
            position: absolute;
            top: 20px;
            right: 20px;
            font-size: 50px;
            color: @font-color;
            cursor: pointer;
        }
    }
    //开始过度
    .scl-enter-from{
        transform:scale(0%);
    }
    //开始过度了
    .scl-enter-active{
        transition: all .2s linear;
    }
    //过度完成
    .scl-enter-to{
        transform:scale(100%);
    }
    //离开的过度
    .scl-leave-from{
        transform:scale(100%);
    }
    //离开中过度
    .scl-leave-active{
        transition: all .2s linear;
    }
    //离开完成
    .scl-leave-to{
        transform:scale(0%);
    }
</style>