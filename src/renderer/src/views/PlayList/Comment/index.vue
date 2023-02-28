<template>
    <div class="commit" >
        <div class="wr-commit">
            <WriteCommit @getText="getText"></WriteCommit>
            <div class="submit" :class="{noDrag:!Main.dragMouse}" @click="subCommit">
                <span>评论</span>
            </div>
        </div>
        <!-- <CommentList :id="routeId"></CommentList> -->
        <CommentList :commentFlag="commentFlag" :nowPage="nowPage"
        :hotComments="hotComments" :moreHot="moreHot" :total="total"
        :comments="comments" :totalPage="totalPage" :id="Number(routeId)" :type="2"
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
import {ref,toRef,watch,Ref,onMounted,getCurrentInstance,ComponentInternalInstance} from 'vue'
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
    if(commitMessage.value == ''){
        typeError.value = 'error'
        errorFlag.value = true;
        errorMassage.value = '写点东西吧，内容不能为空哦！'
        loadingWidth.value = '300'
    }else{
        let obj:comment.sendComment = {
            t:1,
            type:2,
            id:Number(routeId.value),
            content:commitMessage.value
        }
        let result = (await Main.reqcomment(obj)).data;
        if(result.code == 200){
            typeError.value = ''
            errorFlag.value = true;
            errorMassage.value = '评论成功！'
            loadingWidth.value = '150'
            Main.clearText = true
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
    //匹配emoji


    // console.log(regEmoji(commitMessage.value));
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
    let result = (await Main.reqCommentPlaylist(Number(routeId.value),20,0)).data
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