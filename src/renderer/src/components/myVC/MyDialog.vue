<template>
    <el-dialog v-model="flagC" align-center draggable class="downloadDialog" :close-on-click-modal="false"
        :before-close="closeDialog" :destroy-on-close="destroy" z-index="99">
        <template #header>
            <slot name="header"></slot>
        </template>
        <slot name="midle"></slot>
        <template #footer v-if="button">
            <el-button @click="confirm" class="go">{{ confirmName }}</el-button>
            <el-button type="primary" @click="cancel" class="fa" style="color: var(--fontColor);">{{ cancelName }}</el-button>
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
    },
    confirmName:{
        type: String,
        default: '确认'
    },
    destroy:{
        type: Boolean,
        default:false
    },
    button:{
        type: Boolean,
        default:true
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

:slotted(.title){
    font-weight: bolder;
}
:slotted(:deep(.main-slot)){
    height: 200px;
}

</style>