<template>
    <div class="commit" >
        <div class="wr-commit">
            <WriteCommit ref="WriteCommitRef" @getText="getText"></WriteCommit>
            <div class="submit" :class="{noDrag:!Main.dragMouse}" @click="subCommit">
                <span>评论</span>
            </div>
        </div>
        <slot name="now"></slot>
        <!-- <CommentList :id="routeId"></CommentList> -->
        <CommentList :commentFlag="commentFlag" :nowPage="nowPage"
        :hotComments="hotComments" :moreHot="moreHot" :total="total"
        :comments="comments" :totalPage="totalPage" :id="Number(routeId)"
        :type="CPtype"
        ></CommentList>
        <Teleport to="body" v-if="errorFlag">
            <Loading :type="typeError" :message="errorMassage" :width="loadingWidth"
             @close="errorFlag = false"
             :showTime="1500"
             ></Loading>
        </Teleport>
    </div>

</template>

<script setup lang="ts">
import {ref,toRef,watch,Ref,onMounted,getCurrentInstance,ComponentInternalInstance, computed, provide} from 'vue'
import {useRoute} from 'vue-router'
import {useMain} from '@renderer/store'
// import {regEmoji} from '@/utils/regEmoji'
const Main = useMain()
const $route = useRoute()
const $el = getCurrentInstance() as ComponentInternalInstance 
console.log($el);

let commitMessage = ref('')
const getText = (message:string)=>{
    commitMessage.value = message
}
let errorFlag = ref(false)
let errorMassage = ref('')
let typeError = ref('')
let loadingWidth = ref('')
const subCommit = async()=>{

    if(postByreplay.value){
        if(commitMessage.value.split(`回复${replayName.value}:`)[1].length == 0){
            typeError.value = 'error'
            errorFlag.value = true;
            errorMassage.value = '写点东西吧，内容不能为空哦！'
            loadingWidth.value = '300'
        }else{
            let obj:comment.sendComment = {
                t:2,
                type:$route.query.type == '歌单'?2:3,
                id:Number(routeId.value),
                content:commitMessage.value.split(`回复${replayName.value}:`)[1],
                commentId:replayId.value
            }
            console.log(obj);
            let result = (await Main.reqcomment(obj)).data;
            console.log(result);
            if(result.code == 200){
                typeError.value = ''
                errorFlag.value = true;
                errorMassage.value = '回复成功！'
                loadingWidth.value = '150'
                WriteCommitRef.value!.textarea = ''
            }else{
                typeError.value = 'error'
                errorFlag.value = true;
                errorMassage.value = '回复失败！'
                loadingWidth.value = '150'
            }
            let addComment = result.comment
            addComment['likedCount'] = 0;
            addComment['liked'] = false;
            addComment['timeStr'] = '刚刚'
            addComment['beReplied'] = [{
                user:{
                    userId:replayId.value,
                    nickname:replayName.value
                },
                content:replayContent.value
            }]
            comments.value.unshift(addComment)
        }
        
    }else{
        if(commitMessage.value == ''){
            typeError.value = 'error'
            errorFlag.value = true;
            errorMassage.value = '写点东西吧，内容不能为空哦！'
            loadingWidth.value = '300'
        }else{
            let obj:comment.sendComment = {
                t:1,
                type:$route.query.type == '歌单'?2:3,
                id:Number(routeId.value),
                content:commitMessage.value
            }
            let result = (await Main.reqcomment(obj)).data;
            if(result.code == 200){
                typeError.value = ''
                errorFlag.value = true;
                errorMassage.value = '评论成功！'
                loadingWidth.value = '150'
                WriteCommitRef.value!.textarea = ''
            }else{
                typeError.value = 'error'
                errorFlag.value = true;
                errorMassage.value = '评论失败！'
                loadingWidth.value = '150'
            }
            let addComment = result.comment
            addComment['likedCount'] = 0;
            addComment['liked'] = false;
            addComment['timeStr'] = '刚刚'
            addComment['beReplied'] = []
            comments.value.unshift(addComment)
        }
    }
}


let routeQuery = toRef($route,'query')
let routeId = ref(routeQuery.value.id) as Ref<string>
let Rn = toRef($route,'name')
watch(routeQuery,()=>{
    routeId.value = routeQuery.value.id as string
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
    let result
    if($route.query.type == '歌单') result = (await Main.reqCommentPlaylist(Number(routeId.value),20,0)).data
    else if($route.query.type == '专辑') result = (await Main.reqCommentAlbum(Number(routeId.value),20,0)).data
    else if($route.query.type == '歌曲') result = (await Main.reqCommentMusic(Number(routeId.value),20,0)).data
    hotComments.value = result.hotComments;
    comments.value = result.comments;
    total.value = result.total
    totalPage.value = Math.ceil((total.value) / 20)
    moreHot.value = result.moreHot
    commentFlag.value = true
    nowPage.value = 1;
}
onMounted(()=>{
    loadComment()
})

let reload = ref(false)

watch(routeId, async() => {
    reload.value = true
})
watch(Rn,async()=>{
    console.log(Rn.value);
    if(reload.value && Rn.value == 'commentPlaylist'){
        reload.value = false
        loadComment()
    }
})

const CPtype = computed(()=>{
    if($route.query.type == '歌单') return 2
    else if($route.query.type == '专辑') return 3
    else return 0
})

const replayFlag = ref(false)
const replayId = ref(0)
const replayName = ref('')
const postByreplay = ref(false)
const replayContent = ref('')
provide('replayFlag',replayFlag)
provide('replayId',replayId)
provide('replayName',replayName)
provide('replayContent',replayContent)
const WriteCommitRef = ref()
watch(replayFlag,()=>{
    if(replayFlag.value == true){
        postByreplay.value = true
        WriteCommitRef.value!.textarea = `回复${replayName.value}:`
        WriteCommitRef.value!.getFocus(WriteCommitRef.value!.textarea.length)
        replayFlag.value = false
    }
})

watch(commitMessage,()=>{
    if(postByreplay.value && !commitMessage.value.startsWith(`回复${replayName.value}:`)){
        postByreplay.value = false
    }
})

</script>

<style lang="less" scoped>
.noDrag{
    cursor: pointer;
}
    .wr-commit{
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
        margin-top: 20px;
        .commentList{
            width: 90%;
        }
        .comment-txt{
            margin-left: -20px;
        }
    }
</style>