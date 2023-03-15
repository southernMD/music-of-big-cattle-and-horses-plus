<template>
    <div class="bk" @dblclick.stop  id="bkUserMessage" >
        <div class="top">
            <div class="dongtai">
                <div class="number">114</div>
                <div class="txt">动态</div>
            </div>
            <div class="guanzhu">
                <div class="number">514</div>
                <div class="txt">关注</div>
            </div>
            <div class="fans">
                <div class="number">810</div>
                <div class="txt">粉丝</div>
            </div>
        </div>
        <el-divider />
        <div class="main">
            <div>
                <div class="message">
                    <i class="iconfont icon-gerenzhongxin-wodexinxi h"></i>
                    <span>个人信息设置</span>
                    <i class="iconfont icon-arrow-right-bold  f"></i>
                </div>
            </div>
            <div>
                <div class="quit" @click="quitLogin">
                    <i class="iconfont icon-guanji d"></i>
                    <span>退出登陆</span>
                </div>
            </div>
            <Teleport to="body">
                <Loading  v-show="LoadingFlag" :loading="true" width="50" tra="10"></Loading>
            </Teleport>
        </div>
    </div>
</template>

<script setup lang="ts">
import { watch, Ref, ref, getCurrentInstance,
 ComponentInternalInstance, onMounted, toRef,  } from 'vue';
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose';
import {useBasicApi,useMain,useGlobalVar} from '@renderer/store'
import { useRouter } from 'vue-router';
const BasicApi = useBasicApi();
const Main = useMain();
const globalVar = useGlobalVar()
const $el = getCurrentInstance() as ComponentInternalInstance;
const $router = useRouter() 

defineProps<{
    l: number
}>()

let left: Ref<any> = toRef($el.props, 'l')

watch(left, (newValue, oldValue) => {
    let dom: HTMLElement = document.querySelector('.bk') as HTMLElement
    dom.style.left = newValue + 'px'
})

onMounted(() => {
    let dom: HTMLElement = document.querySelector('.bk') as HTMLElement
    dom.style.left = left.value + 'px'
})

//点击其他处关闭
let deleteDilog: any;
const $emit = defineEmits(['close'])
useClickElsewhereToClose(deleteDilog,$emit,'bkUserMessage');

//退出登陆
let LoadingFlag: Ref<boolean> = ref(false)
// async function login (){
//     let cookie = localStorage.getItem('youkeCookie') as string
//     let result: any
//     let t = setInterval(() => {
//         if (result) {
//             console.log('关闭');
//             LoadingFlag.value = false
//             clearInterval(t);
//             destroyVC();
//         } else {
//             console.log('显示');
//             LoadingFlag.value = true
//         }
//     }, 100)
//     result = await BasicApi.reqLogin(cookie)
// }

const destroyVC = () => {
    $emit('close')
}

const quitLogin = async()=>{
    let result:any
    LoadingFlag.value = true
    result = await BasicApi.reqQuitLogin();
    if(result.data.code == 200){
        BasicApi.account=null;
        BasicApi.profile=null;
        BasicApi.everyDaySong = []
        Main.init()
        globalVar.loginQuit = true
        localStorage.setItem('cookieUser','');
        LoadingFlag.value = false
        $router.replace({
            name:`FixRoute`,
            query:{
                path:'/app/findMusic/find1'
            }
        });
        destroyVC();
    }


    // let t = setInterval(() => {
    //     if (result) {
    //         console.log('关闭');
            
    //         BasicApi.account=null;
    //         BasicApi.profile=null;
    //         BasicApi.everyDaySong = []
    //         Main.init()
    //         clearInterval(t);
    //     } else {
    //         console.log('显示');
            
    //     }
    // }, 100)
    // if(result.data.code == 200){
    //     localStorage.setItem('cookieUser','');
    //     Main.init();
    //     $router.replace({
    //         name:`FixRoute`,
    //         query:{
    //             path:'/app/findMusic/find1'
    //         }
    //     });
    // }
}


</script>

<style lang="less" scoped>
.bk {
    float: left;
    position: absolute;
    top: 60px;
    right: 0;
    height: 200px;
    background-color: @mianban-bk-color;
    box-shadow: @shadow;
    width: 280px;
    transform: translate(-40px, 2px);
    display: flex;
    flex-direction: column;
    user-select: none;
    z-index: 9999;
    .top {
        width: auto;
        height: 115px;
        display: flex;
        justify-content: center;
        align-items: center;

        .number {
            font-size: 18px;
            transform: translateY(-5px);
            font-weight: bolder;
            color: @font-color;
        }

        .txt {
            font-size: 13px;
            color: @font-color;
        }

        &>div {
            margin: 5px auto;
            display: flex;
            flex-direction: column;
            align-items: center;
            transform: translateY(-10px);
            cursor: pointer;

            &:hover .txt,
            .number {
                color: @font-color-hover !important;
            }
        }
    }

    :deep(.el-divider) {
        margin: 0 auto;
        width: 80%;
    }

    .main {
        &>div {
            width: 100%;
            position: relative;
            cursor: pointer;
            >:hover {
                background-color: @span-color-hover;
            }

            &>div {
                height: 40px;
                line-height: 40px;
                padding-left: 20px;
                width: calc(100%-20px) ;

                >:first-child {
                    display: inline-block;
                    font-size: 20px;
                    transform: translateY(2px);
                    margin-right: 5px;
                }

                span {
                    font-size: 14px;
                    color: @font-color;
                }
            }
        }


        .d {
            color: @font-color !important;
        }
        .f{
            position: absolute;
            right: 8%;
            color: @font-color;
        }
        .h{
            color: @font-color !important;
        }
    }
}
</style>