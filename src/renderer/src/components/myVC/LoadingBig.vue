<template>
  <div class="LoadingBig" v-show="loadingMp4Bk">
    <div class="block">
      <div class="title">加载中</div>
      <div class="line-color">
        <div class="line" ref="line"></div>
        <span>{{number}}%</span>
      </div>
      <el-button @click="stopLoading">后台静默</el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { toRef ,ref,getCurrentInstance,ComponentInternalInstance } from 'vue';
import { useGlobalVar } from '@renderer/store';
const globalVar = useGlobalVar()
const $el = getCurrentInstance() as ComponentInternalInstance 
const loadingMp4Bk = toRef(globalVar, 'loadingMp4Bk')
const number = ref(0)
window.electron.ipcRenderer.on('loading-mp4',({},{p})=>{
  if(loadingMp4Bk.value == false) number.value = 0
  number.value = +p
  const line = $el.refs.line as HTMLElement
  line.style.width = p + '%'
  if(+p === 100){
    loadingMp4Bk.value = false
    number.value = 0
  }
})
const stopLoading = ()=>{
  loadingMp4Bk.value = false
  number.value = 0
}
</script>

<style scoped lang="less">
.LoadingBig {
  position: fixed;
  left: 0;
  top: 0;
  height: 100%;
  width: 100%;
  background-color: rgba(2, 2, 2, .2);
  z-index: 999;
  display: flex;
  justify-content: center;
  align-items: center;

  .block {
    height: 35%;
    width: 40%;
    background-color: @radio-bk-color;
    border-radius: .2em;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;

    .title {
      user-select: none;
      width: 100%;
      text-align: center;
      font-family: '方正准圆简体';
      font-size: 25px;
      font-weight: 550;
      color: @font-color;
      letter-spacing: 0.1em;
      height: 60px;
    }

    .line-color {
      width: 90%;
      height: 20px;
      border-radius: .5em;
      display: flex;
      justify-content: center;
      align-items: center;
      position: relative;
      border: 1px solid @commit-block-border-color;
      z-index: 0;
      .line {
        background-color: @primary-color;
        border-radius: .5em;
        position: absolute;
        left: 0;
        top: 0;
        width: 0%;
        height: 100%;
        z-index: 1;
      }

      span {
        user-select: none;
        color: @font-color;
        z-index: 2;
      }

    }
    .el-button{
      width: 50%;
      margin-top: 20px;
    }
  }
}</style>