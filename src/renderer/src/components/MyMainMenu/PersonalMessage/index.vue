<template>
    <div class="bk" id="bkUserMessage" ref="bkUserMessageRef"
    :style="{'left':l + 'px'}"
    >
        <div class="top">
            <div class="dongtai" @click="goEvents">
                <div class="number">{{ BasicApi.profile?.eventCount }}</div>
                <div class="txt">动态</div>
            </div>
            <div class="guanzhu" @click="goLike">
                <div class="number">{{ BasicApi.profile?.follows }}</div>
                <div class="txt">关注</div>
            </div>
            <div class="fans" @click="goFans">
                <div class="number">{{ BasicApi.profile?.followeds }}</div>
                <div class="txt">粉丝</div>
            </div>
        </div>
        <el-divider />
        <div class="main">
            <div>
                <div class="message" @click="editorPersonal">
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
import {  Ref, ref, } from 'vue';
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose';
import {useBasicApi,useMain,useGlobalVar} from '@renderer/store'
import { useRouter } from 'vue-router';
const BasicApi = useBasicApi();
const Main = useMain();
const globalVar = useGlobalVar()
const $router = useRouter() 

defineProps<{
    l: number
}>()
const bkUserMessageRef = ref()


//点击其他处关闭
let deleteDilog: any;
const $emit = defineEmits(['close'])
useClickElsewhereToClose(deleteDilog,$emit,bkUserMessageRef);

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
    if(!localStorage.getItem('NMcookie')){
        let result:any
        LoadingFlag.value = true
        result = await BasicApi.reqQuitLogin();
        if(result.data.code == 200){
            BasicApi.account=null;
            BasicApi.profile=null;
            BasicApi.everyDaySong = []
            BasicApi.everyDayPlayList = []
            BasicApi.startalbum = []
            BasicApi.startSongHand = []
            Main.init()
            globalVar.loginQuit = true
            localStorage.removeItem('cookieUser');
            const p1 = BasicApi.reqRecommendSongs()
            const p2 = BasicApi.reqRecommendPlayList()  
            await Promise.allSettled([p1,p2])
            LoadingFlag.value = false
            $router.replace({
                name:`FixRoute`,
                query:{
                    path:'/app/findMusic/find1'
                }
            });
            destroyVC();
        }
    }else{
        BasicApi.account=null;
        BasicApi.profile=null;
        BasicApi.everyDaySong = []
        BasicApi.everyDayPlayList = []
        BasicApi.startalbum = []
        BasicApi.startSongHand = []
        Main.init()
        globalVar.loginQuit = true
        localStorage.removeItem('NMcookie');
        const p1 = BasicApi.reqRecommendSongs()
        const p2 = BasicApi.reqRecommendPlayList()  
        await Promise.allSettled([p1,p2])
        LoadingFlag.value = false
        $router.replace({
            name:`FixRoute`,
            query:{
                path:'/app/findMusic/find1'
            }
        });
        destroyVC();
    }
}
const editorPersonal = ()=>{
    $router.push({
        name:'editPersonal'
    })
    destroyVC()
}

const goEvents = ()=>{
    $router.push({
        name:'SomeoneEvent',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
    destroyVC()
}
const goLike = ()=>{
    $router.push({
        name:'SomeoneLike',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
    destroyVC()
    
}
const goFans = ()=>{
    $router.push({
        name:'SomeoneFans',
        query:{
            id:BasicApi.profile!.userId,
            name:BasicApi.profile!.nickname
        }
    })
    destroyVC()
}

</script>

<style lang="less" scoped>
.bk {
    float: left;
    position: absolute;
    top: 60px;
    right: 0;
    height: 200px;
    background-color: @mainban-bk-color;
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