<template>
    <div class="moreComment">
        <div class="title">精彩评论</div>
        <div class="comment-list" v-infinite-scroll="load">
            <Comment v-for="(value,index) in hotComments.length" :key="value"
                :userUrl="hotComments[index]?.user?.avatarUrl" :userNickname="hotComments[index]?.user?.nickname"
                :userId="hotComments[index]?.user?.userId" :content="hotComments[index]?.content"
                :time="hotComments[index]?.time" :timeStr="hotComments[index]?.timeStr"
                :liked="hotComments[index]?.liked" :beReplied="hotComments[index]?.beReplied"
                :likedCount="hotComments[index]?.likedCount"
                :commentId="hotComments[index]?.commentId"
                ></Comment>
        </div>
    </div>
</template>

<script lang='ts' setup>
import { onMounted, toRef, Ref, ref } from 'vue';
import { useRoute } from 'vue-router';
import { useMain } from '@renderer/store';
const $route = useRoute();
const Main = useMain();

let id = toRef($route.query, 'id') as unknown as Ref<string>
let type = toRef($route.query, 'type') as unknown as Ref<string>
let page = ref(0)
let hotComments = ref(new Array())
let more = ref(true)
const load = async()=>{
    if(more.value){
        page.value++;
        let result = (await Main.reqCommentHot(Number(id.value), Number(type.value), 20, (page.value - 1) * 20)).data
        let arr = result.hotComments as Array<any>
        hotComments.value.push(...arr)
        more.value = result.hasMore
    }
}
</script>

<style lang='less' scoped>
.moreComment {
    width: 95%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 30px 0px 30px 40px;
    .title{
        width: 100%;
        height: 60px;
        font-size: 20px;
        font-weight: bold;
        color: @font-color;
        user-select: none;
    }
    .comment-list{
        width: 95%;
    }
}
</style>