<template>
    <Teleport to="body">
        <MyDialog @confirm="confirmAddDialog" @cancel="cancelAddDialog" :flag="flag" @closeDialog="cancelAddDialog">
            <template #header>
                <div class="title">选择下载分P</div>
            </template>
            <template #midle>
                <div>
                <el-radio-group v-model="choiceIndexC" class="ml-4">
                    <el-radio  v-for="val,index in pageSize" :key="val" :label="val">{{ val }}</el-radio>
                </el-radio-group>
                </div>
            </template>
        </MyDialog>
    </Teleport>
</template>

<script setup lang="ts">
import {ref,watch } from 'vue'
const $emit = defineEmits(['update:choicePageFlag','update:choiceIndex'])
const props = defineProps({
    choicePageFlag:{
        type:Boolean,
        default: false
    },
    pageSize:{
        type:Number,
        default: 0
    },
    choiceIndex:{
        type:Number,
        default: 1
    }
})
const flag = ref(props.choicePageFlag)
watch(()=>props.choicePageFlag,()=>{
    flag.value = props.choicePageFlag
})
const choiceIndexC = ref(props.choiceIndex)
watch(()=>choiceIndexC.value,()=>{
    $emit('update:choiceIndex',choiceIndexC.value)
},{deep:true})

watch(()=>props.pageSize,()=>{
    if(props.pageSize === 0){
        $emit('update:choicePageFlag',false)
    }
},{immediate:true})


const confirmAddDialog = ()=>{
    $emit('update:choicePageFlag',false)
}
const cancelAddDialog = ()=>{
    $emit('update:choiceIndex',-1)
    $emit('update:choicePageFlag',false)
}
</script>

<style lang="less">
    .el-radio-group {
        label {
            --el-radio-input-border: var(--smallFontColor) 1px solid;
            --el-radio-input-bg-color: none;
            --el-radio-input-border-color-hover: @font-color-hover;
            height: 25px;

            .el-radio__label {
                font-size: 13px;
                color: @font-color-oneself;
            }

        }

        .is-checked {
            .el-radio__inner {
                border-color: @primary-color;
                background-color: @primary-color;
            }

            .el-radio__label {
                color: @primary-color;
            }
        }
    }
</style>