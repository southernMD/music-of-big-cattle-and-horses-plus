<template>
  <!-- <div class="">1000{{ $route.query.key }}</div> -->
  <HBlock  dataType="user" type="searchUser" :id="val.userId" :Name="val.nickname" 
  :url="val.avatarUrl" :signature="val.signature" v-for="val in list.get(nowPage)" @click="goDetail(val.userId)"></HBlock>
  <div class="pagination">
      <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
          :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
  </div>
</template>

<script setup lang="ts">
import {ref,Ref,watch,toRef} from 'vue'
import { useRoute,useRouter } from 'vue-router';
import { useGlobalVar, useMain } from '@renderer/store'
import HBlock from '@renderer/components/myVC/HBlock.vue'
const list: Ref<Map<number,any[]>> = ref(new Map())
const $route = useRoute()
const $router = useRouter()
const Main = useMain()
const globalVar = useGlobalVar()
list.value.set(1,await Main.reqSearch($route.query.key as string, '1002', 20, 0))
console.log(list.value.get(1));
watch(() => $route.query.key, async () => {
    if ($route.name === '1002') {
      list.value.clear()
      list.value.set(1,await Main.reqSearch($route.query.key as string, '1002', 20, 0))
      nowPage.value = 1
    }
})
const total = toRef(Main, 'searchNumber')
const totalPage = ref(Math.ceil(total.value / 20))
const nowPage = ref(1)
watch(total,()=>{
    totalPage.value = Math.ceil(total.value / 20)
})
watch(nowPage,async()=>{
    if(!list.value.has(nowPage.value)){
        list.value.set(nowPage.value,await Main.reqSearch($route.query.key as string, '1002', 20, (nowPage.value - 1)*20)) 
    }else{
        globalVar.scrollToTop = true
    }
})

const goDetail = (id)=>{
    $router.push({
        name:'PersonalCenter',
        query:{
            id,
        }
    })
}

</script>

<style scoped lang="less">

.pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 20px;
    margin-top: 20px;
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
</style>