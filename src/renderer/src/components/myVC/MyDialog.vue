<template>
    <el-dialog v-model="flagC" align-center draggable class="downloadDialog" :close-on-click-modal="false"
        @closed="cancel" :destroy-on-close="true">
        <template #header>
            <slot name="header"></slot>
        </template>
        <slot name="midle"></slot>
        <template #footer>
            <el-button @click="confirm" class="go">确认</el-button>
            <el-button type="primary" @click="cancel" class="fa">取消</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import {toRef} from 'vue'
const props = defineProps<{
    flag:boolean
}>()
const flagC = toRef(props,"flag")

const $emit = defineEmits(['confirm','cancel'])
const confirm = ()=>{
    $emit('confirm')
}

const cancel = ()=>{
    $emit('cancel')
}
</script>

<style scoped lang="less">

</style>