<template>
    <el-input @keydown.enter="goSearch" 
     @focus="inputFn"
     @blur="inputRemove" 
     @input="clearValid"
     v-model="searchInputC" 
     ref="searchInputRef" 
     :placeholder="placeholder">
    </el-input>
</template>

<script setup lang="ts">
import { modInput } from '@renderer/utils/modInput'
import { ref, watch } from 'vue'
const searchInputRef = ref()
const props = defineProps({
    placeholder: {
        type: String,
        default: '搜索'
    },
    modelValue: {
        type: String,
        default: ''
    }
})

const searchInputC = ref(props.modelValue)
watch(() => props.modelValue, () => {
    searchInputC.value = props.modelValue
    console.log(searchInputC.value,props.modelValue);
})
const onKeyDown = async (event: KeyboardEvent) => {
    searchInputC.value = await modInput(event, searchInputRef.value.ref, searchInputC.value);
    $emit('update:modelValue', searchInputC.value);
}

const inputFn = () => {
    window.addEventListener('keydown', onKeyDown)
}

const inputRemove = () => {
    window.removeEventListener('keydown', onKeyDown)
}
const $emit = defineEmits(['search','update:modelValue'])
const goSearch = () => {
    $emit('search', searchInputC.value)
}
const clearValid = ()=>{
    $emit('update:modelValue', searchInputC.value);
}
</script>

<style scoped lang="less">
.el-input {

    :deep(.el-input__wrapper) {
        --el-input-hover-border-color: @split-line-color;
        --el-input-focus-border-color: @split-line-color;
        --el-border-color: @split-line-color;
        border-radius: .2em;
        background-color: rgba(0, 0, 0, 0);
        border: @split-line-color 1px solid;
        box-shadow: none;

        input {
            color: @font-color;
        }
    }
}
</style>