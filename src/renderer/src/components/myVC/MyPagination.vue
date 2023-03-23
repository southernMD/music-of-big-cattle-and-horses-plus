<template>
    <div class="pagination">
        <el-pagination :pager-count="9" :hide-on-single-page="true" small background layout="prev, pager, next"
            :total="total" :page-count="totalPage" v-model:currentPage="currentPage"></el-pagination>
    </div>
</template>

<script setup lang="ts">
import { watch, ref } from 'vue'
const props = defineProps<{
    nowPage: number
    totalPage: number
    total: number
}>()
const currentPage = ref(props.totalPage)
watch(() => props.nowPage, () => {
    currentPage.value = props.nowPage
})
defineExpose({currentPage})
</script>

<style scoped lang="less">
.pagination {
    display: flex;
    justify-content: center;
    margin-bottom: 130px;

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