import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, bytecodePlugin } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import eslintPlugin from 'vite-plugin-eslint'
export default defineConfig({
  main: {
    plugins: [externalizeDepsPlugin(),bytecodePlugin()],
    build: {
      rollupOptions: {
        external: ['express'],
      }
    }
  },
  preload: {
    plugins: [externalizeDepsPlugin(),bytecodePlugin()]
  },
  renderer: {
    resolve: {
      alias: {
        '@renderer': resolve('src/renderer/src')
      }
    },
    css: {
      preprocessorOptions: {
        less: {
          charset: false,
          javascriptEnabled: true,
          // 这样就能全局使用 src/assets/styles/mixins.less 定义的 变量
          additionalData: `@import "${resolve('./src/renderer/src/assets/css/mixins.less')}";`
        }
      }
    },
    plugins: [
      vue(),
      // eslintPlugin({
      //   include: ['src/**/*.ts', 'src/**/*.vue', 'src/*.ts', 'src/*.vue'],
      //   lintOnStart: false
      // }),
      AutoImport({
        resolvers: [ElementPlusResolver()]
      }),
      Components({
        resolvers: [ElementPlusResolver()]
      })
    ]
  }
})
