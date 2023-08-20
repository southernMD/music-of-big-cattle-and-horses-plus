<template>
    <div class="comment" ref="offsetVal">
        <div class="commentList" v-show="commentFlag">
            <div class="hot" v-show="nowPage == 1 && hotComments.length != 0">
            <div class="hot-title">
                <span :class="{'oneself-color':oneself && globalVar.oneself}">最热评论({{hotComments.length}})</span>
            </div>
            <div class="hot-list">
                <Comment v-for="(value,index) in hotComments" :key="value"
                :userUrl="hotComments[index]?.user?.avatarUrl" :userNickname="hotComments[index]?.user?.nickname"
                :userId="hotComments[index]?.user?.userId" :content="hotComments[index]?.content"
                :time="hotComments[index]?.time" :timeStr="hotComments[index]?.timeStr"
                :liked="hotComments[index]?.liked" :beReplied="hotComments[index]?.beReplied"
                :likedCount="hotComments[index]?.likedCount"
                :commentId="hotComments[index]?.commentId"
                :resourceId="threadId ?? id"
                :type="type"
                :oneselfComment="oneself && globalVar.oneself"
                ></Comment>
            </div>
            </div>
            <div class="more" v-show="hotComments.length != 0 && type!=6" @click="goMoreComment" :class="{opacity:!moreHot}">
            <div class="bk">
                <span>更多精彩评论&nbsp;></span>
            </div>
            </div>
            <div class="new">
              <div class="new-title" >
                  <span :class="{'oneself-color':oneself && globalVar.oneself}">最新评论({{total}})</span>
              </div>
              <div class="new-list">
                  <Comment v-for="(value,index) in comments" :key="value" :userUrl="comments[index]?.user?.avatarUrl"
                  :userNickname="comments[index]?.user?.nickname" :userId="comments[index]?.user?.userId"
                  :content="comments[index]?.content" :time="comments[index]?.time" :timeStr="comments[index]?.timeStr"
                  :liked="comments[index]?.liked" :beReplied="comments[index]?.beReplied"
                  :likedCount="comments[index]?.likedCount"
                  :commentId="comments[index]?.commentId"
                  :resourceId="threadId ?? id"
                  :type="type"
                  :oneselfComment="oneself && globalVar.oneself"
                  ></Comment>
              </div>
            </div>
            <div class="pagination">
            <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
                :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
            </div>
        </div>
        <div class="commentList" v-show="!commentFlag" style="color:var(--fontColor)">
            加载中
        </div>
    </div>
</template>

<script lang='ts' setup>
import {watchEffect} from 'vue'
import {useMain} from '@renderer/store'
import {useRouter,useRoute} from 'vue-router';
import { useGlobalVar,useNM } from '@renderer/store';
import {getCurrentInstance, watch,ComponentInternalInstance,toRef,Ref,ref, onMounted, nextTick } from 'vue'
const $el = getCurrentInstance() as ComponentInternalInstance 
const $router = useRouter()
const globalVar = useGlobalVar()
const $route = useRoute()
const Main = useMain()
const NM = useNM()
const props = defineProps<{
    commentFlag:boolean
    nowPage:number
    hotComments:Array<any>
    moreHot:boolean
    comments:Array<any>
    total:number
    totalPage:number
    id?:number
    type:number
    threadId?:any
    oneself:number
}>()

let nowPage = toRef($el.props,'nowPage') as Ref<number>
let commentFlag = toRef($el.props,'commentFlag')
let id = toRef($el.props,'id') as Ref<number>
let threadId = toRef($el.props,'threadId') as Ref<any>
let type = toRef($el.props,'type') as Ref<number>
let comments = toRef($el.props,'comments') as Ref<Array<any>>
const goMoreComment = () => {
    Main.detailStatus = "close";
    let {index,my} = $route.query;
    const temp = {
        name: 'moreComment',
        path: 'moreComment',
        component: () => import(`@renderer/views/MoreComment.vue`)
    }
    $router.addRoute("app", temp);
    $router.push({
        name: 'moreComment',
        query: {
          id:id.value, type: type.value,index,my
        }
    })
}

const $emait = defineEmits(['scroll'])
const offsetVal = ref<InstanceType<typeof HTMLElement>>()


//更多评论

// function searchFather(d: HTMLElement | undefined): HTMLElement | undefined{
//     if(d == undefined) return undefined
//     console.log(d,d.offsetParent,d.offsetTop);
//     console.log(d);
    
//     if (d!.id == 'mainWindow') {
//         return d;
//     } else {
//         d = d?.parentNode as HTMLElement
//         return searchFather(d);
//     }
// }
watch(nowPage, async () => {
    if(type.value == 0){
        commentFlag.value = false
        let result
        if(localStorage.getItem('NMcookie')){
          result = (await NM.reqCommentMusic(id.value, 20, (nowPage.value - 1) * 20)).data
        }else{
          result = (await Main.reqCommentMusic(id.value, 20, (nowPage.value - 1) * 20)).data
        }
        comments.value = result.comments;
        commentFlag.value = true
        if(nowPage.value == 1){
          globalVar.scrollToTop = true
        }else{
          globalVar.changeMainScroll = -(globalVar.mainScroll - offsetVal.value!.offsetTop)
        }
    }else if(type.value == 2){
        commentFlag.value = false
        let result
        if(localStorage.getItem('NMcookie')){
          result = (await NM.reqCommentPlaylist(id.value, 20, (nowPage.value - 1) * 20)).data
        }else{
          result = (await Main.reqCommentPlaylist(id.value, 20, (nowPage.value - 1) * 20)).data
        }
        comments.value = result.comments;
        commentFlag.value = true
    }else if(type.value == 6){
      commentFlag.value = false
      let result
      if(localStorage.getItem('NMcookie')){
        result = (await NM.reqMyEventComment(threadId.value, 20, (nowPage.value - 1) * 20))
      }else{
        result = (await Main.reqMyEventComment(threadId.value, 20, (nowPage.value - 1) * 20))
      }
      comments.value = result.comments;
      commentFlag.value = true
      $emait('scroll')
    }else if(type.value == 3){
      commentFlag.value = false
      let result = (await Main.reqCommentAlbum(id.value, 20, (nowPage.value - 1) * 20)).data
      comments.value = result.comments;
      commentFlag.value = true
    }else if(type.value == 4){
      commentFlag.value = false
      let result = (await Main.reqCommentDj(id.value, 20, (nowPage.value - 1) * 20)).data
      comments.value = result.comments;
      commentFlag.value = true
      if(nowPage.value == 1){
        globalVar.scrollToTop = true
      }else{
        globalVar.changeMainScroll = -(globalVar.mainScroll - offsetVal.value!.offsetTop)
      }
    }
})


defineExpose({nowPage})
</script>

<style lang='less' scoped>
  .comment {
    height: auto;
    width: 100vw;
    margin-bottom: 200px;

    // background-color: blue;
    .commentList {
      width: 50%;
      height: auto;
      min-height: 500px;
      margin: 0 auto;

      // background-color: yellow;
      .hot,
      .new {

        >.hot-title,
        >.new-title {
          display: flex;
          align-items: center;
          justify-content: flex-start;
          height: 30px;
          margin-bottom: -5px;

          >span {
            user-select: none;
            color: @font-color;
            font-weight: bolder;
            font-size: 15px;
          }
        }

        >.hot-list,
        >.new-list {
          width: 100%;
        }
      }

      .new {
        margin-bottom: 50px !important;
      }

      .more {
        height: 30px;
        width: 130px;
        margin: 0 auto;
        margin-top: 40px;
        margin-bottom: 40px;
        cursor: pointer;

        >.bk {
          height: 30px;
          width: 130px;
          border: 1px solid @split-line-color;
          text-align: center;
          line-height: 30px;
          border-radius: 2em;

          >span {
            user-select: none;
            color: @font-color;
            font-size: 13px;

            &:hover {
              color: @font-color-hover;
            }
          }
        }
      }

      .opacity {
        opacity: 0;
      }
    }

    .pagination {
      display: flex;
      justify-content: center;
      margin-bottom: 110px;
      padding-bottom: 20px;
      :deep(.el-pagination) {
        --el-pagination-hover-color: @font-color;

        li,
        .btn-prev,
        .btn-next {
          box-sizing: border-box;
          border-radius: 3px !important;
          background-color: rgba(0, 0, 0, 0);
          border: 1px solid @split-line-color;
          font-weight: normal;
          margin: 2px;
          width: 25px;
          height: 25px;
          color: @pagin-font;
        }

        .btn-prev,
        .btn-next {
          background-color: @pagin-bk-btn-color !important;
          font-weight: bold;

        }

        li:not(.is-disabled).is-active {
          background-color: @primary-color !important;
          color: rgb(255, 255, 255) !important;
        }

        li:hover,
        .btn-prev:not(:disabled):hover,
        .btn-next:not(:disabled):hover {
          background-color: @pagin-bk-hover-color !important;
        }

        button:disabled {
          cursor: default !important;
          color: @pagin-disable-font-color !important;
        }
      }
    }

  }
.oneself-color{
  color: @font-color-oneself !important;
}
</style>