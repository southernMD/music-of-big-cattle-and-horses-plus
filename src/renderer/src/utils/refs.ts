import { ref } from 'vue'

// 供全局读写使用的 背景图片及视频 DOM 引用
export const mainBackgroundRef = ref<HTMLImageElement | null>(null)
export const mainBackgroundVideoRef = ref<HTMLVideoElement | null>(null)

export const songDetailRef = ref<HTMLDivElement | null>(null)