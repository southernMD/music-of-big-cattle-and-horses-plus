import { createApp, defineAsyncComponent, h, ref, watch } from 'vue';
import Loading from '@renderer/components/myVC/Loading.vue';
// import LoginPage from '@renderer/components/LoginPage.vue'
import {Suspense,Teleport} from 'vue'
import { ElMessage } from 'element-plus';
// 定义异步组件
const AsyncLoginPage = defineAsyncComponent(() => import('@renderer/components/LoginPage.vue'));
export default function LoadingPageImper() {
    const container = document.createElement('div');
    document.body.appendChild(container);

    const app = createApp({
        errorCaptured(err, vm, info) {
            if((err as Error).message === "request code error"){
                ElMessage.error("获取登录窗口失败")
                app.unmount();
                document.body.removeChild(container);
            }
        },
        setup() {
            return () => 
                h(Teleport,{ to: 'body' },
                    h(Suspense,null,{
                        fallback: () => h(Loading, { loading: true, message: '正在加载登陆页，请稍后' }),
                        default: () => h(AsyncLoginPage, {
                            onClose(){
                                app.unmount();
                                document.body.removeChild(container);
                              },
                          }),
                      }
                    )
                );
        },
    });

    app.mount(container);

    return {
        destroy() {
            app.unmount(); // 卸载 Vue 应用
            document.body.removeChild(container); // 清理挂载的 DOM 元素
        },
    };
}