<template>
    <el-dialog v-model="flagC" align-center draggable class="downloadDialog" :close-on-click-modal="false"
        :before-close="closeDialog" :destroy-on-close="destroy" z-index="99">
        <template #header>
            <slot name="header"></slot>
        </template>
        <slot name="midle"></slot>
        <template #footer v-if="button">
            <el-button @click="confirm" class="go">{{ confirmName }}</el-button>
            <el-button type="primary" @click="cancel" class="fa" style="color: var(--fontColor);">{{ cancelName
                }}</el-button>
        </template>
    </el-dialog>
</template>

<script setup lang="ts">
import { toRef, ref, watch } from 'vue'
const props = defineProps({
    flag: {
        type: Boolean,
        required: true
    },
    cancelName: {
        type: String,
        default: '取消'
    },
    confirmName: {
        type: String,
        default: '确认'
    },
    destroy: {
        type: Boolean,
        default: false
    },
    button: {
        type: Boolean,
        default: true
    }
})


// const flagC = toRef(props,"flag")

const flagC = ref(props.flag)
watch(() => props.flag, () => {
    flagC.value = props.flag
    console.log(flagC.value);
})
const $emit = defineEmits(['confirm', 'cancel', 'closeDialog'])
const confirm = () => {
    console.log('confirm');
    $emit('confirm')
}

const cancel = () => {
    console.log('cancel');
    $emit('cancel')
}

const closeDialog = (done: () => void) => {
    $emit('closeDialog', done)
}
</script>

<style lang="less">
.el-dialog {
    min-height: 270px;
    width: 500px;
    background-color: @my-dialog-bk;
    border-radius: .2em;

    .el-dialog__headerbtn {
        color: @font-color !important;
        width: auto;
        height: auto;
        text-shadow: none;
        right: 5px;

        .el-dialog__close {
            font-size: 25px;

            &:hover {
                color: @font-color !important;
            }

            :not(:hover) {
                color: @font-color !important;
            }
        }
    }

    header {
        text-align: center;
    }

    .title {
        color: @font-color;
        font-weight: bolder;
        width: 100%;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
    }

    .list {
        margin-left: 40px;
        flex-direction: column;
        align-items: start;
    }

    label {
        height: 25px;

        .el-radio__label {
            font-size: 13px;
            color: @font-color;
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

    footer {
        text-align: center;
    }

    .go {
        background-color: @primary-color;
        border: none;
        color: #fff;
        border-radius: 2em;
        width: 100px;

        &:hover {
            background-color: @play-all-button-hover ;
        }
    }

    .fa {
        background-color: rgba(0, 0, 0, 0);
        border: @split-line-color 1px solid;
        width: 100px;
        border-radius: 2em;

        &:hover {
            background-color: @span-color-hover !important;
        }
    }
}

.title {
    font-weight: bolder;
}

.add-playlist {
    .height-fix {
        .el-form-item__content {
            height: 32px;

            .el-tag {
                margin-right: 5px;
                --el-tag-bg-color: none;
                --el-tag-text-color: @primary-color;
                --el-tag-hover-color: @primary-color;
                border-color: @font-color;
            }
        }
    }

    .input-bk {
        position: relative;
        width: 100%;

        .el-textarea {
            --el-input-hover-border-color: none;
            --el-input-focus-border-color: none;
            width: 100%;
            font-size: 14px;
            border: 1px solid @commit-block-border-color;
            border-radius: 0.2em;
            background-color: @commit-block-color;
            padding-bottom: 5px;
            padding-top: 5px;

            .el-textarea__inner {
                background-color: @commit-block-color;
                box-shadow: none;
                color: @font-color;
                padding-bottom: 5px;
                padding-top: 5px;
                padding-right: 15px;

                &::-webkit-scrollbar {
                    height: 80%;
                }

                &::-webkit-scrollbar-button {
                    display: none;
                }

                &::-webkit-scrollbar {
                    width: 7px;
                    height: 90%;
                    background-color: @commit-block-scroll-line;
                }

                &::-webkit-scrollbar-thumb {
                    border-radius: 0.4em;
                    background: @commit-block-scroll-button;
                }
            }
        }

        .number {
            position: absolute;
            bottom: 7px;
            right: 6px;
            font-size: 12px;
            color: @font-color;
        }
    }

    .el-checkbox.el-checkbox--large {
        height: auto;
    }

    label {
        height: 25px;

        .el-checkbox__label {
            font-size: 13px;
            color: @font-color;
        }

        --el-checkbox-bg-color:@other-bk-color;
        --el-checkbox-input-border-color-hover:@primary-color;
        --el-checkbox-input-border:1px solid @border-color;
    }

    .is-checked {
        .el-el-checkbox__input {
            border-color: @primary-color;
            background-color: @primary-color;
        }

        --el-checkbox-checked-bg-color:@primary-color;
        --el-checkbox-checked-input-border-color:@primary-color;

        .el-checkbox__label {
            color: @primary-color;
        }
    }

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
}

.main-slot{
    height: 200px;
}
</style>