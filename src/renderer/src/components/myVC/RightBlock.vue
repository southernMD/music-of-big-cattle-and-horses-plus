<template>
  <div class="rightBlock" ref="rightBlockRef" v-show="flag && rightFlag">
    <!-- {{ type }} -->
    <div class="op" v-for="val,index in eventLength"  :class="{'op-border':ifBorderBottom[index]}" 
    >
    <!-- @click="eventsHandle[index].bind(null,params[index])" -->
        <div class="icon">
            <i class="iconfont" :class="[iconList[index]]"></i>
        </div>
        <div class="msg">{{ messageList[index] }}</div>
        <div class="i" v-if=" messageList[index] == '收藏' && (type == ('song' || 'songMy' || 'shareSong'))">
            <i class="iconfont icon-youjiantou"></i>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch,watchEffect,ref, nextTick,Ref } from 'vue'
const props = defineProps<{
    left:number
    top:number
    rightFlag:boolean
    type:string
    id:string
}>()
const flag = ref(false)
const rightBlockRef = ref<InstanceType<typeof HTMLElement>>()
watchEffect(()=>{
    if(rightBlockRef.value){
        flag.value = false
        rightBlockRef.value!.style.left = props.left + 10 + 'px'
        rightBlockRef.value!.style.top = props.top + 10 + 'px'
        nextTick(()=>{
            let {height,top,bottom,right,left,width}= rightBlockRef.value!.getBoundingClientRect();
            console.log(top,bottom);
            const windowHeight = window.innerHeight;
            const windowWidth = window.innerWidth;
            const visibleHeight = Math.min(bottom, windowHeight-70) - Math.max(top, 0);
            const visibleWidth = Math.min(right, windowWidth) - Math.max(left, 0);
            console.log(visibleHeight,visibleWidth);
            if(visibleHeight < height){
                rightBlockRef.value!.style.top = props.top - height - 10 + 'px'
            }
            if(visibleWidth < width){
                rightBlockRef.value!.style.left = props.left - width - 10 + 'px'
            }
            // rightBlockRef.value!.innerText = new Date().getTime() + '' 
        })
        flag.value = true
    }
})
const eventsHandle = ref([]) as Ref<Function[]> //事件
const eventLength = ref(0)  //长度
const ifBorderBottom = ref([]) as Ref<boolean[]>  //下划线
const messageList = ref([])as Ref<string[]>  //文字
const iconList = ref([])as Ref<string[]>  //前icon
const params = ref([]) as Ref<any[]>//参数
const more = ref([])as Ref<boolean[]> //更多
watch(()=>props.type,()=>{
    buildList()
})
watch(()=>props.id,()=>{
    buildList()
})

const buildList = ()=>{
    eventsHandle.value = []
    eventLength.value = 0
    ifBorderBottom.value = []
    messageList.value = []
    params.value = []
    iconList.value = []
    more.value = []
    console.log(props.type);
    if(props.type.startsWith('playList')){
        messageList.value.push(...['查看','播放','下一首播放','分享','下载'])
        ifBorderBottom.value.push(...[false,false,true,false,true])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-fenxiang1','icon-xiazai1'])
        if(props.type == 'playListMy'){
            messageList.value.push(...['编辑歌单信息','删除歌单'])
            ifBorderBottom.value.push(...[false,false])
            iconList.value.push(...['icon-bianji1','icon-lajixiang'])
        }else if(props.type == 'playListLike'){
            ifBorderBottom.value[4] = false
        }else if(props.type == 'playListStart'){
            messageList.value.push(...['删除歌单'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
        }else if(props.type == 'playListRank'){
            messageList.value.splice(3,2)
            ifBorderBottom.value.splice(3,2)
            iconList.value.splice(3,2)
            ifBorderBottom.value[2] = false
        }else if(props.type == 'playListSearchMy'){
            messageList.value.push(...['编辑歌单信息'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-bianji1'])
        }else{
            messageList.value.splice(3,0,'收藏')
            ifBorderBottom.value.splice(3,0,false)
            iconList.value.splice(3,0,'icon-tianjiawenjian')
            ifBorderBottom.value[5]=false
        }
    }else if(props.type == 'commentMy'){
        messageList.value.push(...['删除'])
        ifBorderBottom.value.push(...[false])
        iconList.value.push(...['icon-lajixiang'])
    }else if(props.type.startsWith('songHand')){
        messageList.value.push(...['查看'])
        ifBorderBottom.value.push(...[true])
        iconList.value.push(...['icon-chakan'])
        if(props.type == 'songHand'){
            messageList.value.push(...['收藏'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-tianjiawenjian'])
        }else{
            messageList.value.push(...['删除'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
        }
    }else if(props.type.startsWith('al')){
        messageList.value.push(...['查看专辑','播放','下一首播放','分享','下载全部'])
        ifBorderBottom.value.push(...[false,false,true,false,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-fenxiang1','icon-xiazai1'])
        if(props.type == 'al'){
            messageList.value.splice(3,0,'收藏专辑')
            ifBorderBottom.value.splice(3,0,false)
            iconList.value.splice(3,0,'icon-tianjiawenjian')
        }else{
            ifBorderBottom.value[4] = true
            messageList.value.push('删除专辑')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-lajixiang')
        }
    }else if(props.type == 'user'){
        messageList.value.push('查看用户')
        ifBorderBottom.value.push(false)
        iconList.value.push('icon-chakan')
    }else if(props.type.startsWith('share')){
        messageList.value.push(...['播放','下一首播放'])
        ifBorderBottom.value.push(...[false,false])
        iconList.value.push(...['icon-bofang_o','icon-nextplay'])
        if(props.type == 'shareMy'){
            messageList.value = ['删除']
            ifBorderBottom.value =[false]
            iconList.value = ['icon-lajixiang']
        }else if(props.type.endsWith('My')){
            ifBorderBottom.value[1] = true
            messageList.value.push(...['删除'])
            ifBorderBottom.value.push(...[false])
            iconList.value.push(...['icon-lajixiang'])
        }
    }else if(props.type == 'top50'){
        messageList.value.push(...['播放','下一首播放','全部收藏'])
        ifBorderBottom.value.push(...[false,false,false])
        iconList.value.push(...['icon-bofang_o','icon-nextplay','icon-tianjiawenjian'])
    }else if(props.type == 'FM'){
        messageList.value.push(...['收藏','分享','下载'])
        ifBorderBottom.value.push(...[false,false,false])
        iconList.value.push(...['icon-tianjiawenjian','icon-fenxiang1','icon-xiazai1'])
    }else if(props.type == 'songDownload'){
        messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享','打开文件所在目录','删除下载'])
        ifBorderBottom.value.push(...[false,false,true,false,false,true,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1','icon-wenjian','icon-lajixiang'])
    }else if(props.type.startsWith('songLocal')){
        messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享','打开文件所在目录','删除下载'])
        ifBorderBottom.value.push(...[false,false,true,false,false,true,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1','icon-wenjian','icon-lajixiang'])
        if(props.type.endsWith('nor')){
            messageList.value.push(...['播放','下一首播放','打开文件所在目录','删除下载'])
            iconList.value.push(...['icon-bofang_o','icon-nextplay','icon-wenjian','icon-lajixiang'])
            ifBorderBottom.value.push(...[false,true,true,false])
        }
    }else if(props.type.startsWith('song')){
        messageList.value.push(...['查看评论','播放','下一首播放','收藏','分享','下载'])
        ifBorderBottom.value.push(...[false,false,true,false,false,false])
        iconList.value.push(...['icon-chakan','icon-bofang_o','icon-nextplay','icon-tianjiawenjian','icon-fenxiang1','icon-xiazai1'])
        if(props.type == 'songMy'){
            messageList.value.push('删除')
            ifBorderBottom.value.push(false)
            iconList.value.push('icon-lajixiang')
        }
    }
    eventLength.value = messageList.value.length
}
</script>

<style scoped lang="less">
.rightBlock{
    height: auto;
    min-height: 43px;
    width: 230px;
    padding: 4px 0 4px 0;
    background-color: @my-dialog-bk;
    border-radius: .5em;
    // background-color: red;
    position: fixed;
    .op{
        height: 35px;
        box-sizing: border-box;
        user-select: none;
        display: flex;
        color: @font-color;
        align-items: center;
       
        .icon{
            width: 15px;
            padding:0 10px 0 10px;
            text-align: center;
        }
        .msg{
            width: calc(100% - 45px);
            font-size: 14px;
        }
        .i{
            padding-right: 10px;
            i{
                font-size: 10px;
            }
        }
        &:hover{
            background-color: @right-button-hover;
        }
    }
    .op-border{
        border-bottom: 1px solid @font-color;
    }
}
</style>