<template>
    <div class="loading" @click.stop
     :style="{ maxWidth: width ? `${width}px` : `260px` }"
    >
        <div class="tra"  
         :style="{ transform: tra ? `translateX(${tra}px)` : `translateX(0px)` }"
        >
            <div class="moving" v-if="loading">
                <span :style="`--i:${i - 1}`" v-for="i in 13"></span>
            </div>
            <div class="error" v-if="type == 'error'">
                <i class="iconfont icon-cuowu"></i>
            </div>
        </div>
        <span class="message" 
        :class="{
            'error-red':type == 'error'
        }"
        :style="{ fontSize: size ? `${size}px` : `inherit` }"
        >{{ message }}</span>
    </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useGlobalVar } from '@renderer/store';
const $emit = defineEmits(['close'])
const globalVar = useGlobalVar()
const props = defineProps<{
    message?: string
    width?: string
    tra?: string
    loading?:boolean
    showTime?:number
    size?:string
    type?:string
}>()
onMounted(() => {
    if (props.showTime) {
        let t = setTimeout(()=>{
            globalVar.loadMessageDefaultType = ''
            $emit('close')
            clearTimeout(t)
        },props.showTime as number)
    }
})

</script>

<style lang="less" scoped>
.loading {
    user-select: none;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto auto;
    border-radius: 2em;
    height: 50px;
    min-width: 60px;
    max-width: 260px;
    width: auto;
    background-color: rgba(0, 0, 0, .8);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 999999;
    .message {
        color: white;
        margin-left: 5px;
    }
    .error-red{
        color: rgb(254, 57, 57);
    }
    .tra {
        .moving {
            position: relative;
            left: -10px;
            width: 10px;
            height: 10px;
            z-index: 999;
            animation: active 2s linear infinite;

            span {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                transform: rotate(calc(30deg*var(--i)));

                &::after {
                    content: '';
                    position: absolute;
                    right: 0;
                    top: calc(50% - 10px);
                    width: 2px;
                    height: 4px;
                    background: rgb(117, 117, 117);
                    border-radius: 2em;
                }

            }

            @keyframes active {
                0% {
                    transform: rotate(0deg);
                }

                100% {
                    transform: rotate(360deg);
                }
            }
        }
        .error{
            padding-left: 20px;
            position: relative;
            left: -10px;
            width: 10px;
            z-index: 999;
            i{
                color: rgb(254, 57, 57);
                font-size: 20px;
            }
        }
    }

}
</style>