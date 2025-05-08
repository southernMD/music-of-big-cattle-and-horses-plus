import { resolve } from 'path'
import { defineConfig, externalizeDepsPlugin, loadEnv } from 'electron-vite'
import vue from '@vitejs/plugin-vue'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'
import eslintPlugin from 'vite-plugin-eslint'
import { terser } from 'rollup-plugin-terser';
import vueJsx from '@vitejs/plugin-vue-jsx';

import { Env } from "./env";

export default defineConfig(({command, mode})=>{
  const getEnv = (name: keyof Env): string => {
    return loadEnv(mode, process.cwd())[name];
  };
  const webPort: number = Number(getEnv("VITE_WEB_PORT") || 5522);
  const servePort: number = Number(getEnv("VITE_SERVER_PORT") || 2233);
  console.log(command,webPort,servePort,"环境值");

  return {
    main: {
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          external: ['express']
        }
      },
    },
    preload: {
      plugins: [externalizeDepsPlugin()],
      build: {
        rollupOptions: {
          input: {
            index: resolve(__dirname, "src/preload/index.ts"),
          },
        },
      },
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
        vueJsx(),
        terser({
          compress: {
            drop_console: true
          }
        }),
        AutoImport({
          resolvers: [ElementPlusResolver()]
        }),
        Components({
          resolvers: [ElementPlusResolver()]
        })
      ],
      server: {
        port: webPort,
        proxy: {
          '/api': {
            target: `http://localhost:${servePort}`,
            changeOrigin: true,
            rewrite: (path) => path.replace(/^\/api/, "/api/"),
          }
        }
      }
    }
  }
})
