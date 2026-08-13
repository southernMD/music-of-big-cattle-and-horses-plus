import { createApp, shallowRef } from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia } from 'pinia'
import './assets/css/base.css'
import './assets/iconfont.css'
import 'animate.css';
import { createPersistedState } from 'pinia-plugin-persistedstate'
import MyDialogVue from './components/myVC/MyDialog.vue'
const pinia = createPinia()
pinia.use(createPersistedState())
import PromiseQueue from 'p-queue'
import { useGlobalVar } from './store'

//下载队列
const downloadQueue = shallowRef(new PromiseQueue({ concurrency: 5 }))

const globalVar = useGlobalVar(pinia)
if (globalVar.setting.concurrency) {
  downloadQueue.value.concurrency = globalVar.setting.concurrency
}

globalVar.$subscribe((_mutation, state) => {
  if (state.setting.concurrency) {
    downloadQueue.value.concurrency = state.setting.concurrency
  }
})

createApp(App)
.use(pinia)
.provide('downloadQueue', downloadQueue)
.component('MyDialogVue',MyDialogVue)
.use(router).mount('#app')
