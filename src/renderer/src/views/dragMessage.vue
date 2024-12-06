<template>
  <div ref="dragMessage" class="dragMessage">
    <div ref="dd">{{ ms }}</div>
  </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, ref, ComponentInternalInstance, watch, nextTick, onMounted } from 'vue'
const ms = ref('')
const $el = getCurrentInstance() as ComponentInternalInstance

window.electron.ipcRenderer.on('drageMessage', () => {})
window.electron.ipcRenderer.on('send-to-drag-Message', (e: any, { data }) => {
  console.log(data)
  ms.value = data
  nextTick(() => {
    const messageDom = $el.refs.dd as HTMLElement
    window.electron.ipcRenderer.send('change-drag-width', { width: messageDom.offsetWidth })
  })
})
window.electron.ipcRenderer.on('send-to-drag-end', (e: any) => {
  ms.value = ''
})
window.electron.ipcRenderer.on('send-to-drag-bkColor', (e: any, { data: { backGroundColor, fontColor} }) => {
  console.log({ backGroundColor, fontColor })
  const dom = $el.refs.dragMessage as HTMLElement
  dom.style.backgroundColor = backGroundColor
  const messageDom = $el.refs.dd as HTMLElement
  messageDom.style.color = fontColor
  if (backGroundColor == 'rgb(43,43,43)') {
    dom.style.borderColor = 'rgb(66,66,66)'
    dom.style.backgroundColor = 'rgb(62,62,62,0.5)'
  } else {
    dom.style.borderColor = 'rgb(216,216,216)'
    dom.style.backgroundColor = 'rgb(253,253,253,0.5)'
  }
  //414141
  //216216216
})
</script>

<style lang="less" scoped>
.dragMessage {
  width: auto;
  height: 23px;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgb(216, 216, 216);
  border-radius: 0.2em;
  opacity: 0.6;
  > div {
    white-space: nowrap;
    display: inline-flex;
    width: auto;
    padding-left: 3px;
    padding-right: 3px;
    font-size: 12px;
  }
}
</style>
