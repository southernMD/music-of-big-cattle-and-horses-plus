import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import {createPinia } from 'pinia'
import './assets/css/base.css'
import './assets/iconfont.css'
import { createPersistedState } from 'pinia-plugin-persistedstate'
const pinia = createPinia()
pinia.use(createPersistedState())
import PromiseQueue from 'p-queue'

//下载队列
const downloadQueue = new PromiseQueue({ concurrency: 5 })

createApp(App)
.use(pinia)
.provide('downloadQueue', downloadQueue)
.use(router).mount('#app')
