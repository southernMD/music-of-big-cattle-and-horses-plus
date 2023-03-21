<template>
    <el-dialog v-model="flagC" align-center draggable class="downloadDialog" :close-on-click-modal="false"
        :before-close="closeDialog">
        <template #header>
            <slot name="header"></slot>
        </template>
        <slot name="midle"></slot>
        <template #footer>
            <el-button @click="confirm" class="go">确认</el-button>
            <el-button type="primary" @click="cancel" class="fa">{{ cancelName }}</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import {toRef,ref,watch} from 'vue'
const props = defineProps({
    flag: {
        type: Boolean,
        required: true
    },
    cancelName: {
        type: String,
        default: '取消'
    }
})


// const flagC = toRef(props,"flag")

const flagC = ref(props.flag)
watch(()=>props.flag,()=>{
    flagC.value = props.flag
    console.log(flagC.value);
})
const $emit = defineEmits(['confirm','cancel','closeDialog'])
const confirm = ()=>{
    console.log('confirm');
    $emit('confirm')
}

const cancel = ()=>{
    console.log('cancel');
    $emit('cancel')
}

const closeDialog = (done: () => void)=>{
    $emit('closeDialog',done)
}
</script>

<style scoped lang="less">

</style>