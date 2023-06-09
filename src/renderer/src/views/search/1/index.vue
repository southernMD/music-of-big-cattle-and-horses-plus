<template>
    <!-- <div class="">1{{ $route.query.key }}</div> -->
    <div class="search-play-list" :class="{ 'search-play-list-oneself': globalVar.oneself == 1 }">
        <div class="song-name">
            <span>音乐标题</span>
        </div>
        <div class="song-hand">
            <span>歌手</span>
        </div>
        <div class="zhuanji">
            <span>专辑</span>
        </div>
        <div class="time">
            <span>时长</span>
        </div>
        <div class="hot">
            <span>热度</span>
        </div>
    </div>
    <div class="search-line-list" id="search-line-list">
        <LineMusic :id="val.id" :title="val.name" :zhuanji="val.al" :singer="val.ar" :show-index="true" :oneselfColor="true"
            :time="val.dt" :hot="true" :hot-value="val.pop" :index="index + 1 + 30*(nowPage-1)" :privilegeAndListSearchOnly="val"
            v-for="val, index in list.get(nowPage)"></LineMusic>
    </div>
    <div class="pagination">
        <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
            :total="total" :page-count="totalPage" v-model:currentPage="nowPage"></el-pagination>
    </div>
</template>

<script setup lang="ts">
import { ref, watch, Ref, toRef } from 'vue'
import { useRoute } from 'vue-router';
import { useGlobalVar, useMain } from '@renderer/store'
import LineMusic from '@renderer/components/myVC/LineMusic/index.vue'
const globalVar = useGlobalVar()
const $route = useRoute()
const Main = useMain()
const list: Ref<Map<number,any[]>> = ref(new Map())
list.value.set(1,await Main.reqSearch($route.query.key as string, '1', 30, 0))
watch(() => $route.query.key, async () => {
    if ($route.name === '1') {
        list.value.clear()
        list.value.set(1,await Main.reqSearch($route.query.key as string, '1', 30, 0))
        nowPage.value = 1
    }
})
const total = toRef(Main, 'searchNumber')
const totalPage = ref(Math.ceil(total.value / 30))
const nowPage = ref(1)
watch(total,()=>{
    totalPage.value = Math.ceil(total.value / 30)
})
watch(nowPage,async()=>{
    if(!list.value.has(nowPage.value)){
        list.value.set(nowPage.value,await Main.reqSearch($route.query.key as string, '1', 30, (nowPage.value - 1)*30)) 
    }else{
        globalVar.scrollToTop = true
    }
})
</script>

<style scoped lang="less">
.search-play-list {
    height: 35px;
    width: calc(100% - 8px);
    color: @small-font-color;
    display: flex;
    user-select: none;
    font-size: 14px;
    overflow: auto;
    align-items: center;
    // &:not(:first-child)>div {
    //     align-items: center;
    //     display: flex;
    //     position: relative;
    //     box-sizing: border-box;

    //     &>span {
    //         margin-left: 5px;
    //     }
    // }
    span {
        padding-left: 10px;
    }

    &>.song-name {
        margin-left: 105px;
        width: calc((100% - 110px) * 0.3);
        height: inherit;
    }

    &>.song-hand {
        width: calc((100% - 130px) * 0.2);
        height: inherit;
    }

    &>.zhuanji {
        width: calc((100% - 80px) * 0.265);
        height: inherit;

        >span {
            padding-left: 15px;
        }
    }

    &>.time {
        width: calc((100% - 100px) * 0.11);
        height: inherit;

        >span {
            padding-left: 12px;
        }
    }

    &>.hot {
        // width: calc((100% - 100px) * 0.2);
        width: 50px;
        height: inherit;

        >span {
            padding: 0;
        }
    }

}

.search-play-list-oneself {
    background-color: rgba(65, 65, 65, .7);
    color: rgb(150, 150, 150);

    &:not(:first-child)>div {
        &:not(:first-child):hover {
            background-color: rgb(55, 55, 55) !important;
        }
    }
    >div{
        display: flex;
        align-items: center;
    }

}

.search-line-list {
    .line-music {
        &>:deep(.song-name) {
            margin-left: 10px;
            width: calc((100% - 110px) * 0.4) !important;
            max-width: calc((100% - 110px) * 0.4) !important;
            height: inherit;
        }

        &>:deep(.song-hand) {
            width: calc((100% - 110px) * 0.15) !important;
            height: inherit;
        }

        &>:deep(.zhuanji) {
            width: calc((100% - 110px) * 0.2) !important;
            height: inherit;
        }

        &>:deep(.time) {
            width: calc((100% - 110px) * 0.1) !important;
            height: inherit;
        }

        &>:deep(.hot) {
            width: calc((100% - 100px) * 0.2) !important;
            height: inherit;
        }
    }
}

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