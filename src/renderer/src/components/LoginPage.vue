<template>
    <div class="LoginPage" @mousedown="move" @mouseup="moveEnd">
        <i class="iconfont icon-guanbi_o" @click="destroyVC"></i>
        <div v-show="otherLogin">
            <div class="title">扫码登陆</div>
            <div class="img imgHover" v-if="!okFlag">
                <div class="r">
                    <el-image draggable="false" v-show="phoneFlag && showPhoneFlag" ref="imgPhone"
                        class="imgPhone animate__animated animate__fadeInRight" :src="p1"
                        fit="cover"></el-image>
                </div>
                <div class="animate__animated animate__fadeInLeft">
                    <div class="qrimg">
                        <el-image draggable="false" ref="imgQr" :src="qrimg" fit="fill" class="qrimgI"></el-image>
                        <div class="blank" id="blank">使用<a ref="a" @click="sendUrl" href="https://music.163.com/#/download"
                                target="_blank">网易云音乐APP</a>扫码登陆</div>
                        <div class="mask" v-show="maskFlag">
                            <span>二维码已失效</span>
                            <el-button @click="updateQr">点击更新</el-button>
                        </div>
                    </div>
                </div>
            </div>
            <div class="ok" v-if="okFlag">
                <el-image :src="p2"></el-image>
                <span>请在手机上确认登陆</span>
            </div>
        </div>
        <div v-show="!otherLogin">
            <div class="title">大牛马登录</div>
            <el-form :model="formLabelAlign" style="max-width: 460px" ref="ruleFormRef" :rules="rules"  @mousedown.stop>
                <el-form-item prop="name">
                    <el-input :placeholder="wayName" v-model="formLabelAlign.name" />
                </el-form-item>
                <el-form-item prop="password">
                    <el-input placeholder="密码" show-password type="password" v-model="formLabelAlign.password" @input="clearValid('password')" />
                </el-form-item>
                <el-form-item prop="code">
                    <el-input placeholder="验证码" v-model="formLabelAlign.code" v-show="way" class="yanzhen" @input="clearValid('code')">
                        <template #prepend style="font-size: 12px;">
                            <div @click="sendCode(ruleFormRef)" style="width:60px; text-align: center;">{{ autoTime }}</div>
                        </template>
                    </el-input>
                </el-form-item>
            </el-form>
            <el-button class="login-button" @click="submit(ruleFormRef)">{{ way ? '注册' : '登录' }}</el-button>
            <div class="reg-button" @click="way = !way">{{ way ? '登录' : '注册' }}</div>
        </div>
        <div class="other" v-if="!okFlag" @click="changeLoginWay">{{ otherLogin ? '选择其他登陆方式 >' : '网易云音乐扫码登录 >' }}</div>
        <Teleport to="body">
            <Loading v-show="LoadingFlag" :loading="true" width="50" tra="10"></Loading>
        </Teleport>
    </div>
</template>

<script setup lang="ts">
import { useBasicApi, useMain, useGlobalVar,useNM } from '../store'
import { getCurrentInstance, ComponentInternalInstance, ref, Ref, onMounted, watch, toRef, onUnmounted, reactive } from 'vue'
import { useRouter } from 'vue-router';
import {NMCode,NMReg,NMlogin} from '@renderer/api/niuma'
import type { FormInstance, FormRules } from 'element-plus'
import p1 from '@renderer/assets/image/XW8rcLxOev.png'
import p2 from '@renderer/assets/image/SgCjDdGyLg.png'
const BasicApi = useBasicApi();
const Main = useMain();
const NM = useNM();
const $router = useRouter()
const globalVar = useGlobalVar()
let key: any = await BasicApi.reqQrKey()
let imgBase64: any = await BasicApi.reqQrImage(key.data.data.unikey)
// 轮询开始
let time = setInterval(async () => {
    let result: any = await BasicApi.reqCheck(key.data.data.unikey)
    if (result.data.code == 800) { //过期
        maskFlag.value = true
        document.querySelector('.img')?.classList.add('imgHoverNo')
    } else if (result.data.code == 802) {
        okFlag.value = true
    } else if (result.data.code == 803) {
        clearInterval(time);
        localStorage.setItem('cookieUser', result.data.cookie)
        login();
    }
}, 1500)
onUnmounted(() => {
    clearInterval(time);
})
let qrimg = imgBase64.data.data.qrimg

const $el = getCurrentInstance() as ComponentInternalInstance;
let showPhoneFlag: Ref<boolean> = ref(true)
let dom1: any
let dom2: any
let moveFlag: Ref<boolean> = ref(false)
let maskFlag: Ref<boolean> = ref(false)
let okFlag: Ref<boolean> = ref(false)
onMounted(() => {
    dom1 = $el.refs.imgPhone as ComponentInternalInstance
    dom2 = $el.refs.imgQr as ComponentInternalInstance
    dom1 = dom1.$el
    dom2 = dom2.$el
})

let phoneFlag: Ref<boolean> = ref(true)

const sendUrl = (e: Event) => {
    e.preventDefault();
    let t: HTMLElement = e.target as HTMLElement
    window.electron.ipcRenderer.send('new-window', t.getAttribute('href'))
}
let flagLogin: Ref<boolean> = toRef(globalVar, 'flagLogin')

const destroyVC = () => {
    flagLogin.value = false
}
let X = 0;
let Y = 0;
let WX = 0;
let WY = 0;
let dom: HTMLElement
let Listener = (e: MouseEvent) => {
    if (moveFlag.value) {
        let dom: HTMLElement = document.querySelector('.LoginPage') as HTMLElement
        dom.style.left = WX + (e.pageX - X) + 'px';
        dom.style.top = WY + (e.pageY - Y) + 'px';
    }
}
const move = (e: MouseEvent) => {
    moveFlag.value = true
    X = e.pageX;
    WX = dom.offsetLeft;
    Y = e.pageY;
    WY = dom.offsetTop;
    dom.style.margin = '0 0';
    window.addEventListener('mousemove', Listener)
}
const moveEnd = () => {
    moveFlag.value = false
    window.removeEventListener('mousemove', Listener)
}
onMounted(() => {
    dom = document.querySelector('.LoginPage') as HTMLElement
    window.electron.ipcRenderer.send('get-screen-X-Y')
    window.electron.ipcRenderer.on('there-X-Y', ({}, obj: any) => {
        let { width, height } = obj;
        dom.style.top = (height - dom.offsetHeight) / 2 + 'px';
        dom.style.left = (width - dom.offsetWidth) / 2 + 'px';
    })
})

//重新获取二维码
const updateQr = async () => {
    key = await BasicApi.reqQrKey()
    imgBase64 = await BasicApi.reqQrImage(key.data.data.unikey)
    qrimg = imgBase64.data.data.qrimg
    maskFlag.value = false
    document.querySelector('.img')?.classList.remove('imgHoverNo')
}
// 登陆
let LoadingFlag: Ref<boolean> = ref(false)
const login = async () => {
    let cookie = localStorage.getItem('cookieUser') as string
    localStorage.removeItem('NMcookie')
    LoadingFlag.value = true
    BasicApi.reqLogin(cookie).then(async (account: any) => {
        const p1 = new Promise<string>((resolve) => {
            Main.reqUserPlaylist(account.id).then(()=>{//获取用户创建歌单以及用户收藏歌单
                resolve('ok')
            })   
        })
        const p2 = new Promise<string>((resolve) => {
            Main.reqUserLike(BasicApi.account?.id).then(()=>{//调用此接口 , 传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)
                resolve('ok')
            })  
        })
        const p3 = new Promise<string>((resolve) => {//获取用户信息 , 歌单，收藏，mv, dj 数量 是歌单数
            Main.reqUserSubcount().then(()=>{
                resolve('ok')
            })  
        })
        const p4 = new Promise<string>((resolve) => {
            BasicApi.reqRecommendSongs().then(()=>{//每日推荐
                resolve('ok')
            })   
        }) 
        const p5 = new Promise<string>((resolve) => {
            BasicApi.reqRecommendPlayList().then(()=>{//每日推荐歌单
                resolve('ok')
            })  
        })
        const p6 = new Promise<string>((resolve) => {//推荐声音
            BasicApi.reqProgramRecommend().then(()=>{
                resolve('ok')
            })  
        })
        const p7 = new Promise<string>((resolve) => {
            BasicApi.reqalbumSublist().then(()=>{
                resolve('ok')
            })
        })
        const p8 = new Promise<string>((resolve) => {
            BasicApi.requserFollows(BasicApi.account!.id).then(()=>{
                resolve('ok')
            })
        })
        const p9 = new Promise<string>((resolve) => {
            BasicApi.reqartistSublist().then(()=>{
                resolve('ok')
            })
        })
        Promise.all([p1,p2,p3,p4,p5,p6,p7,p8,p9]).then(()=>{
            LoadingFlag.value = false
            destroyVC();
            $router.replace({
                name: `FixRoute`,
                query: {
                    path: '/app/findMusic/find1'
                }
            });
        })
    })
}

const loginNM = async ()=>{
    NM.reqLogin().then(async ()=>{
        const p1 = NM.reqUserPlaylist(BasicApi.profile?.userId)
        const p2 = NM.reqUserLike(BasicApi.profile?.userId)
        const p3 = NM.reqUserSubcount()
        const p4 = NM.reqartistSublist()
        const p5 = NM.reqalbumSublist()
        const p6 = NM.requserFollows(BasicApi.profile?.userId,99999999,0)
        const p7 = NM.reqRecommendPlayList()
        await Promise.allSettled([p1,p2,p3,p4,p5,p6,p7]).then(()=>{
            LoadingFlag.value = false
            destroyVC();
            $router.replace({
                name: `FixRoute`,
                query: {
                    path: '/app/findMusic/find1'
                }
            });
        })
    })

}
//大牛马登录
const otherLogin = ref(true)
const changeLoginWay = () => {
    otherLogin.value = !otherLogin.value
}

const formLabelAlign = reactive({
    name: '',
    password: '',
    code: '',
})
const way = ref(false)
const wayName = ref('邮箱')
watch(way, () => {
    ruleFormRef.value!.clearValidate('name')
    ruleFormRef.value!.clearValidate('password')
    ruleFormRef.value!.clearValidate('code')
    if (!way.value) wayName.value = '邮箱'
    else wayName.value = '邮箱'
})
const autoTime = ref('获取验证码')
const number = ref(60)
const sendCode = async (formEl: FormInstance | undefined) => {
    //表单验证
    //发送/
    //倒计时
    if (number.value == 60) {
        rules.name = rulseSendCode.name
        rules.password = rulseSendCode.password
        rules.code = rulseSendCode.code
        if (!formEl) return
        await formEl.validate((valid) => {
            if (valid) {
                NMCode({email:formLabelAlign.name}).then((data)=>{
                    if(data.data.status != 200){
                        clearInterval(time)
                        autoTime.value = '获取验证码'
                        number.value = 60
                        ElMessage({
                            showClose: true,
                            message: data.data.message,
                            type: 'error',
                            duration:1000
                        })
                    }
                })
                autoTime.value = number.value + 's'
                let time = setInterval(() => {
                    autoTime.value = (--number.value) + 's'
                    if (number.value == 0) {
                        clearInterval(time)
                        autoTime.value = '获取验证码'
                        number.value = 60
                    }
                }, 1000)
            }
        })
    }

}
const ruleFormRef = ref<FormInstance>()
let rules = reactive<FormRules>({name:[],password:[],code:[]})
const rulesReg = reactive<FormRules>({
    name: [
        { required: true,message: '请填写邮箱'}, 
        {type:'email',message:'请填写正确格式的邮箱'}
    ],
    password: [
        { required: true,message: '请输入密码' }
    ],
    code: [
        { required: true,message: '请输入验证码'  }
    ]
})
const rulseSendCode = reactive<FormRules>({
    name: [
        { required: true,message: '请填写邮箱' },
        {type:'email',message:'请填写正确格式的邮箱'}
    ],
    password:[],
    code:[]
})
const rulesLogin = reactive<FormRules>({
    name: [
        { required: true,message: '请填写邮箱'}, 
        {type:'email',message:'请填写正确格式的邮箱'}
    ],
    password: [
        { required: true,message: '请输入密码' }
    ],
    code:[]
})
const submit = async(formEl: FormInstance | undefined)=>{
    if(way.value){
        //注册
        rules.name = rulesReg.name
        rules.password = rulesReg.password
        rules.code = rulesReg.code
        if (!formEl) return
        await formEl.validate((valid) => {
            if (valid) {
                NMReg({email:formLabelAlign.name,code:formLabelAlign.code,password:formLabelAlign.password}).then((data)=>{
                    if(data.data.status !=200){
                        ElMessage({
                            showClose: true,
                            message: data.data.message,
                            type: 'error',
                            duration:1000
                        })
                    }else{
                        NMlogin({nickname:formLabelAlign.name,password:formLabelAlign.password}).then(async (data)=>{
                            if(data.data.status !=200){
                                ElMessage({
                                    showClose: true,
                                    message: data.data.message,
                                    type: 'error',
                                    duration:1000
                                })
                            }else{
                                localStorage.setItem('NMcookie',data.data.data.token)
                                localStorage.removeItem('cookieUser')
                                try {
                                    await loginNM()
                                    globalVar.loadMessageDefault = '登录成功'
                                    globalVar.loadMessageDefaultFlag = true
                                } catch (error) {
                                    globalVar.loadMessageDefault = '登录失败'
                                    globalVar.loadMessageDefaultFlag = true
                                    LoadingFlag.value = false
                                    destroyVC();
                                }
                            }
                        })
                    }
                })
            }
        })
    }else{
        rules.name = rulesLogin.name
        rules.password = rulesLogin.password
        rules.code = rulesLogin.code
        if (!formEl) return
        await formEl.validate((valid) => {
            if (valid) {
                NMlogin({nickname:formLabelAlign.name,password:formLabelAlign.password}).then(async (data)=>{
                    if(data.data.status !=200){
                        ElMessage({
                            showClose: true,
                            message: data.data.message,
                            type: 'error',
                            duration:1000
                        })
                    }else{
                        localStorage.setItem('NMcookie',data.data.data.token)
                        localStorage.removeItem('cookieUser')
                        try {
                            await loginNM()
                            globalVar.loadMessageDefault = '登录成功'
                            globalVar.loadMessageDefaultFlag = true
                        } catch (error) {
                            globalVar.loadMessageDefault = '登录失败'
                            globalVar.loadMessageDefaultFlag = true
                            LoadingFlag.value = false
                            destroyVC();
                        }
                    }
                })
            }
        })
    }
}
const clearValid = (str:string)=>{
    ruleFormRef.value?.clearValidate(str)
}
</script>

<style lang="less" scoped>
.yanzhen {
    :deep(.el-input-group__prepend) {
        padding-left: 5px;
        padding-right: 5px;
        font-size: 12px;
        cursor: pointer;
    }
}

.LoginPage {
    user-select: none;
    height: 530px;
    width: 350px;
    background-color: white;
    position: relative;
    font-size: 14px;
    color: #666666;
    position: fixed;
    top: 0;
    left: 0;
    box-shadow: 0px 0px 5px rgba(0, 0, 0, .4);
    z-index: 99999;

    &>div {
        display: flex;
        flex-direction: column;
        align-items: center;
    }

    i {
        position: absolute;
        top: 10px;
        right: 10px;
        font-size: 25px;
        color: #333333;
        cursor: pointer;
    }

    .title {
        font-size: 30px;
        margin-bottom: 10px;
        color: #333333;
        margin-top: 100px;
    }

    .el-form {
        margin-top: 20px;
        width: 60%;
    }

    .login-button {
        width: 60%;
        background-color: @primary-color;
        height: 40px;
        color: #ffffff;
    }

    .reg-button {
        margin-top: 10px;
        border-bottom: 1px solid #000;
        padding-bottom: 1px;
        cursor: pointer;
    }

    .blankAdd {
        left: -70px;
    }

    .img {
        display: flex;
        flex-direction: row;
        justify-content: center;
        align-items: center;

        // min-height: 323px;
        .r {
            transition: all 0.6s linear;
        }

        .imgPhone {
            z-index: 1;
        }

        .qrimg {
            z-index: 2;
            position: relative;
            transition: transform 0.4s linear;

            :deep(.mask) {
                position: absolute;
                top: 0;
                left: 0;
                width: 140px;
                height: 140px;
                background-color: rgba(0, 0, 0, .8);
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                transform: translate(20px, 20px);

                >span {
                    color: white;
                    font-size: 14px;
                    transform: translateY(-8px);
                }

                .el-button {
                    color: white;
                    width: 80px;
                    height: 30px;
                    background-color: #0c73c2;
                    border: none;
                    transform: translateY(8px);
                }
            }

            .qrimgI {
                margin-bottom: 10px;
                transition: transform 0.4s linear;
                transform: scale(0.9, 0.9);
                clip-path: inset(15px 15px 15px 15px);
            }

        }
    }

    .imgHover {
        &:not(:hover) .qrimg {
            transform: translateX(-70px);
        }

        &:not(:hover) .qrimg>.el-image {
            transform: scale(1.2, 1.2)
        }

        &:not(:hover) .r {
            transform: translateX(100px);
            opacity: 0;
        }

        &:not(:hover) .mask {
            width: 180px;
            height: 180px;
            transform: translate(0px, 0px);
        }

        &:hover .mask {
            width: 140px;
            height: 140px;
        }
    }

    .imgHoverNo {
        &:hover .qrimg {
            transform: translateX(-70px);
        }

        &:hover .qrimg>.el-image {
            transform: scale(1.2, 1.2)
        }

        &:hover .r {
            transform: translateX(100px);
            opacity: 0;
        }

        &:hover .mask {
            width: 180px;
            height: 180px;
            transform: translate(0px, 0px);
        }

        &:not(hover) .mask {
            width: 140px;
            height: 140px;
        }
    }

    .blank {
        position: relative;

        a {
            color: #0c73c2;
        }
    }

    .ok {
        display: flex;
        flex-direction: column;
        align-items: center;

        >span {
            color: black;
            font-size: 16px;
        }
    }

    .other {
        margin-top: 50px;
        cursor: pointer;
    }
}
</style>