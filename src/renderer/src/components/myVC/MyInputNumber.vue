<template>
  <el-input-number class="my-input-number" v-bind="$attrs" />
</template>

<script setup lang="ts">
// 属性和事件自动通过 v-bind="$attrs" 穿透绑定到内层的 el-input-number
</script>

<style scoped lang="less">
.my-input-number {
    width: 120px;
    height: 30px;
    line-height: 28px;
    background-color: @quick-bk !important;
    border: 1px solid @split-line-color;
    border-radius: 6px;
    box-sizing: border-box;
    overflow: hidden;
    position: relative;
    display: inline-flex;
    align-items: center;
    transition: border-color 0.25s ease, box-shadow 0.25s ease;

    &:hover {
        border-color: @primary-color;
        :deep(.el-input-number__decrease) {
            border-right-color: @primary-color !important;
        }
        :deep(.el-input-number__increase) {
            border-left-color: @primary-color !important;
        }
    }

    &.is-focus, &:focus-within {
        border-color: @primary-color;
        box-shadow: 0 0 0 2px color-mix(in srgb, var(--primaryColor) 20%, transparent);
        :deep(.el-input-number__decrease) {
            border-right-color: @primary-color !important;
        }
        :deep(.el-input-number__increase) {
            border-left-color: @primary-color !important;
        }
    }

    :deep(.el-input) {
        width: 100%;
        height: 100%;
        display: flex;
        
        .el-input__wrapper {
            background-color: transparent !important;
            box-shadow: none !important;
            padding: 0 30px !important;
            height: 100%;
            display: flex;
            align-items: center;
        }

        .el-input__inner {
            text-align: center;
            color: @font-color-oneself !important;
            font-size: 13px;
            font-weight: 500;
            height: 100%;
            border: none;
            background: transparent;
            padding: 0;
        }
    }

    :deep(.el-input-number__decrease),
    :deep(.el-input-number__increase) {
        position: absolute;
        top: 0;
        width: 30px;
        height: 100%;
        background-color: transparent !important;
        color: @font-color-oneself !important;
        border: none !important;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        transition: background-color 0.2s ease, color 0.2s ease, border-color 0.25s ease;
        z-index: 1;

        &:hover:not(.is-disabled) {
            background-color: @line-color-hover !important;
            color: @primary-color !important;
        }

        &.is-disabled {
            color: @none-font !important;
            cursor: not-allowed;
            background-color: transparent !important;
        }
    }

    :deep(.el-input-number__decrease) {
        left: 0;
        border-right: 1px solid @split-line-color !important;
    }

    :deep(.el-input-number__increase) {
        right: 0;
        border-left: 1px solid @split-line-color !important;
    }
}
</style>
