<template>
  <div class="setting">
    <div class="normal">
        <div class="title">常规</div>
        <div class="font-choice">
            <div class="title">
                <span>字体选择: </span>
                <span>如果字体显示不清晰，请在控制面板一字体设置中启用系统Clear Type设置</span>   
            </div>
            <dropDown @change="changeFontFamily" :width="300" ref="dropDownYear" :list="fontList.filter(it=>/[\u4e00-\u9fa5]/.test(it.name))" :message="globalVar.setting.fontFamily"></dropDown>
        </div>
        <div class="start">
            <div class="title">
                <span>启动：</span>
            </div>
            <div class="st-bt">
                <el-checkbox @change="autoPlay" v-model="globalVar.setting.autoOpen" label="开机自动运行" size="large" />
            </div>
        </div>
        <div class="link">
            <div class="title">
                <span>关联：</span>
            </div>
            <div class="st-bt">
                <el-checkbox @change="link" v-model="globalVar.setting.defaultMusic" label="将大牛马音乐设置为默认播放器" size="large" />
            </div>
        </div>
        <div class="close">
            <div class="title">
                <span>关闭主面板：</span>
            </div>
            <el-radio-group v-model="globalVar.setting.quitmodel" class="ml-4">
                <el-radio :label="true" size="large">最小化系统托盘</el-radio>
                <el-radio :label="false" size="large">退出程序</el-radio>
            </el-radio-group>
        </div>
    </div>
    <div class="play">
        <div class="title">
            播放
        </div>
        <div class="play-way">
            <div class="title">
                <span>播放列表：</span>
            </div>
            <el-radio-group style="flex-direction: column; align-items: start;" v-model="globalVar.setting.playWay" class="ml-4">
                <el-radio :label="true" size="large">双击播放单曲时，用当前单曲所在的歌曲列表替换播放列表</el-radio>
                <el-radio :label="false" size="large">双击播放单曲时，仅把当前单曲添加到播放列表</el-radio>
            </el-radio-group>
        </div>
        <div class="play-canvas">
            <div class="title">
                <span>音频可视化：</span>
            </div>
            <div class="st-bt">
                <el-checkbox v-model="globalVar.setting.opencanvas" label="开启音频可视化" size="large" />
                <span>（关闭后可以加快加载速度）</span>
            </div>
            <div class="el">
                <el-radio-group  v-model="globalVar.setting.canvasColor" class="ml-4">
                    <el-radio :label="true" size="large"  :disabled="!globalVar.setting.opencanvas">颜色跟随主题</el-radio>
                    <el-radio :label="false" size="large" :disabled="!globalVar.setting.opencanvas" >自定义颜色</el-radio>
                </el-radio-group>
                <div v-show="!globalVar.setting.canvasColor">
                    <el-color-picker v-model="canvasColorRGB" color-format="rgb"  show-alpha :disabled="!globalVar.setting.opencanvas" />
                </div>
            </div>
        </div>
    </div>
    <div class="quick">
        <div class="title">快捷键</div>
        <div class="list">
            <div class="title1">
                <div class="t1">功能说明</div>
                <div class="t2">快捷键</div>
                <div class="t3">全局快捷键</div>
            </div>
            <div class="btns" v-for="val,index in wayList">
                <div class="name">{{ wayList[index] }}</div>
                <div class="quick-press" @click="focus(index)">
                    <div class="inpt">
                        <input
                         @blur="loseFocus(index)"
                         type="text" 
                         ref="quickinputRefs"
                        v-model="quick[index]">
                    </div>
                </div>
                <div class="quick-global " :class="{'stop':!closeGlWay}">
                    <div class="inpt" @click="focusGlobal(index)" :class="{'err':errGlobal[index]}">
                        <input
                         @blur="loseFocus(index)"
                         type="text" 
                         ref="quickGlobalyInputRefs"
                         :readonly="!closeGlWay"
                        v-model="quickGlobal[index]">
                    </div>
                </div>
            </div>
        </div>
        <div class="open">
            <el-checkbox v-model="closeGlWay" label="启用全局快捷键" size="large" />
            <span>（在后台也可以响应）</span>
        </div>
    </div>
    <div class="dwn">
        <div class="title">下载</div>
        <div class="ds">
            <div class="title">下载音质：</div>
            <el-radio-group v-model="globalVar.setting.downloadlevel" class="ml-4">
                <el-radio label="standard" size="large">标准</el-radio>
                <el-radio label="higher" size="large">较高</el-radio>
                <el-radio label="exhigh" size="large">极高</el-radio>
                <el-radio label="lossless" size="large">无损</el-radio>
            </el-radio-group>
        </div>
        <div class="ts">
            <div class="title">下载目录：</div>
            <div class="path">
                <div class="msg">{{ globalVar.setting.downloadPath }}</div>
                <div class="change" @click="changeDir">更改目录</div>
            </div>
        </div>
    </div>
    <div class="lrc">
        <div class="title">歌词</div>
        <div class="ls">
            <div class="title">启用：</div>
            <div class="ll">
                <div>
                    <el-checkbox v-model="showCi" label="启用歌词" size="large" />
                </div>
                <div >
                    <el-checkbox @click.stop="isClick(1)" v-model="yinOryi[1]" label="外文歌词显示音译" size="large" />
                </div>
                <div >
                    <el-checkbox @click.stop="isClick(0)" v-model="yinOryi[0]" label="外文歌词显示翻译" size="large" />
                </div>
            </div>
        </div>
        <div class="on-top">
            <div class="title">总在最前：</div>
            <el-checkbox @change="lrcPositionHandle" v-model="lrcPosition" label="启用总在最前" size="large" />
        </div>
        <div class="font-set">
            <div class="font-set-item">
                <div class="name">字体</div>
                <dropDown @change="changeLrcFamily" ref="dropDownYear" :list="fontList" :message="globalVar.setting.lrcFontFamily"></dropDown>
            </div>
            <div class="font-set-item">
                <div class="name">字号</div>
                <dropDown @change="changeLrcSize" ref="dropDownYear" :list="sizelist" :message="''+globalVar.setting.lrcSize"></dropDown>
            </div>
            <div class="font-set-item">
                <div class="name">字粗</div>
                <dropDown @change="changeLrcWeight" ref="dropDownYear" :list="lrcWeight" :message="globalVar.setting.lrcWeigth"></dropDown>
            </div>
            <div class="font-set-item">
                <div class="name">描边</div>
                <dropDown @change="changeLrcBorder" ref="dropDownYear" :list="lrcBorder" :message="globalVar.setting.lrcBorder"></dropDown>
            </div>
            <div class="font-set-item">
                <div class="name">颜色</div>
                <dropDown @change="changeLrcColor" ref="dropDownYear" :list="lrcColor" :message="globalVar.setting.lrcColor"></dropDown>
            </div>
            <div class="font-set-item color" >
                <div v-show="globalVar.setting.lrcColor == '自定义'">
                    <div class="name">渐变上</div>
                    <el-color-picker @change="topColorChange" v-model="globalVar.setting.topColor" color-format="rgb" />
                </div>
                <div v-show="globalVar.setting.lrcColor == '自定义'">
                    <div class="name">渐变下</div>
                    <el-color-picker @change="bottomColorChange" v-model="globalVar.setting.bottomColor" color-format="rgb" />
                </div>
                <div v-show="globalVar.setting.lrcBorder == '有描边'">
                    <div class="name">描边</div>
                    <el-color-picker @change="borderColorChange" v-model="globalVar.setting.borderColor" color-format="rgb" />
                </div>
            </div>
        </div>
        <div class="font-look">
            <div class="title">预览：</div>
            <div class="bk">
                <div class="txt" ref="txtRef">大牛马音乐</div>
            </div>
        </div>
    </div>
    <div class="about">
        <div class="title">关于</div>
        <div class="now-version">
            <div class="txt">当前版本：{{ version }}</div>
            <div class="btn">检测更新</div>
            <div class="btn" title="暂不可用">意见反馈</div>
        </div>
        <el-radio-group style="margin-top:0; flex-direction: column; align-items: start;" v-model="globalVar.setting.updataWay" class="ml-4">
            <el-radio :label="true" size="large">自动更新</el-radio>
            <el-radio :label="false" size="large">有新版本时提醒我</el-radio>
        </el-radio-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, toRef,ref, watch, watchEffect,toRaw} from 'vue'
import {useGlobalVar} from '@renderer/store'
import dropDown from '@renderer/components/myVC/dropDown.vue'
const globalVar = useGlobalVar()
const fontList = toRef(globalVar,'fontList')

const closeGlWay = toRef(globalVar.setting,'closeGlWay')
const quick = toRef(globalVar.setting,'quick')
const quickGlobal = toRef(globalVar.setting,'quickGlobal')
const errGlobal = toRef(globalVar.setting,'errGlobal')
const showCi = toRef(globalVar.setting,'showCi')
const yinOryi = toRef(globalVar.setting,'yinOryi')
const lrcPosition = toRef(globalVar.setting,'lrcPosition')
const sizelist = ref(Array.from({ length:  76 }, (_, index) => index + 20).map(it=>{return {name:it}}))
const lrcWeight = ref([{name:'标准'},{name:'加粗'}])
const lrcBorder = ref([{name:'有描边'},{name:'无描边'}])
const lrcColor = ref([{name:'默认'},{name:'自定义'}])
console.log(quick.value,quickGlobal.value);
const version = ref('1.0.0')
version.value = window.electron.ipcRenderer.sendSync('app-version')
const changeFontFamily = (ms)=>{
    console.log(ms.name);
    document.documentElement.style.setProperty('--fontFamily', ms.name);
    globalVar.setting.fontFamily = ms.name
    globalVar.loadMessageDefault = '设置已更新'
    globalVar.loadMessageDefaultFlag = true
}
const link = async()=>{
    //true添加注册表
   let flag = await window.electron.ipcRenderer.invoke('to-link-local',globalVar.setting.defaultMusic)
   if(flag){
    globalVar.loadMessageDefault = '设置已更新'
    globalVar.loadMessageDefaultFlag = true
   }else{
    globalVar.setting.autoOpen = false
   }
}

const autoPlay = async()=>{
   let flag = await window.electron.ipcRenderer.invoke('auto-open',globalVar.setting.autoOpen)
   if(flag){
    globalVar.loadMessageDefault = '设置已更新'
    globalVar.loadMessageDefaultFlag = true
   }else{
    globalVar.setting.autoOpen = false
   }
}

watch(()=>globalVar.setting,()=>{
    // globalVar.loadMessageDefault = '设置已更新'
    // globalVar.loadMessageDefaultFlag = true
},{deep:true})



//快捷键
const wayList = ['播放/暂停','上一首','下一首','音量加','音量减','喜欢/取消喜欢歌曲','打开/关闭歌词']
const quickinputRefs = ref<(InstanceType<typeof HTMLInputElement>[])>([]);
const quickGlobalyInputRefs = ref<(InstanceType<typeof HTMLInputElement>[])>([]);
const focus = (index)=>{
    quickinputRefs.value[index].focus()
    quickinputRefs.value[index].addEventListener('keydown', fn1);
    quickinputRefs.value[index].addEventListener('keyup',fn2)
    focusIndex.value = index
    flag = false
}
const focusGlobal = (index)=>{
    if(!closeGlWay) return
    quickGlobalyInputRefs.value[index].focus()
    quickGlobalyInputRefs.value[index].addEventListener('keydown', fn1);
    quickGlobalyInputRefs.value[index].addEventListener('keyup',fn2)
    focusIndex.value = index
    flag = true
}
let string = ''
let focusIndex = ref(-1)
let flag = true
let flag2 = false
const canvasColorRGB = toRef(globalVar.setting,'canvasColorRGB')

onMounted(()=>{
    if(globalVar.setting.canvasColor){
        canvasColorRGB.value = getComputedStyle(document.documentElement).getPropertyValue('--primaryColor')
    }
})
const specialCharactersMap = new Map([
    ['Digit1', '1'],
    ['Digit2', '2'],
    ['Digit3', '3'],
    ['Digit4', '4'],
    ['Digit5', '5'],
    ['Digit6', '6'],
    ['Digit7', '7'],
    ['Digit8', '8'],
    ['Digit9', '9'],
    ['Digit0', '0'],
    ['Minus', '-'],
    ['Equal', '='],
    ['Backquote', '`'],
    ['BracketLeft', '['],
    ['BracketRight', ']'],
    ['Backslash', '\\'],
    ['Semicolon', ';'],
    ['Quote', '\''],
    ['Comma', ','],
    ['Period', '.'],
    ['Slash', '/'],
]);
const fn1 = (event) => {
    event.preventDefault()
    flag2 = false
    let s:string[] = []
    if(['Enter','Process','Meta','Backspace','Delete','Insert','Pause','ScrollLock','Tab','CapsLock',' ','Cancel'].includes(event.key))return
    console.log(event.code);
    // 更新按键状态
    if(event.ctrlKey)s.push('Ctrl')
    if(event.shiftKey)s.push('Shift')
    if(event.altKey)s.push('Alt')

    // 检查组合键是否被按下
    if (!(['Control','Shift','Alt'].includes(event.key)) && s.length!=0) {
        s.push(event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code)?specialCharactersMap.get(event.code):event.key.slice(0,1).toUpperCase() + event.key.slice(1).toLowerCase()))
        string = s.join(' + ')
        //remove
        // window.removeEventListener('keydown',fn1)
        // window.removeEventListener('keyup',fn2)
    }else if(s.length==0){
        if(flag){
            string ='Ctrl + Alt + ' + event.key.slice(0,1).toUpperCase() + event.key.slice(1).toLowerCase()
        }else{
            string = event.key.split('Arrow')[1] ?? (specialCharactersMap.has(event.code)?specialCharactersMap.get(event.code):event.key.slice(0,1).toUpperCase() + event.key.slice(1).toLowerCase())
        }
        globalVar.loadMessageDefault = '设置已更新'
        globalVar.loadMessageDefaultFlag = true
        // window.removeEventListener('keydown',fn1)
        // window.removeEventListener('keyup',fn2)
    }else if(s.length!=0){
        string = s.join(' + ')
        string+=' + '
    }
    if(flag){
        if(!quickGlobal.value.includes(string)){
            quickGlobal.value[focusIndex.value] = string
        }
    }
    else {
        console.log(quick.value.includes(string));
        if(!quick.value.includes(string)){
            quick.value[focusIndex.value] = string
        }
    }
}
const fn2 =(event)=>{
    event.preventDefault()
    if(!['Control','Shift','Alt','Enter','Process',,'Meta','Backspace','Delete','Insert','Pause','ScrollLock','Tab','CapsLock',' ','Cancel'].includes(event.key)){
        if(flag){
            if(!quickGlobal.value.includes(string)){
                quickGlobal.value[focusIndex.value] = string
            }
        }
        else {
            console.log(quick.value.includes(string));
            if(!quick.value.includes(string)){
                quick.value[focusIndex.value] = string
            }
        }
        flag2 = true
        globalVar.loadMessageDefault = '设置已更新'
        globalVar.loadMessageDefaultFlag = true
        return
    }
    if(!event.ctrlKey && !event.shiftKey && !event.altKey && !flag2){
        string='空'
        globalVar.loadMessageDefault = '设置已更新'
        globalVar.loadMessageDefaultFlag = true
    }
    else if(!flag2){
        let s:string[] = []
        if(event.ctrlKey)s.push('Ctrl')
        if(event.shiftKey)s.push('Shift')
        if(event.altKey)s.push('Alt')
        string = s.join(' + ')
        if(!string.endsWith('+ '))string+=' + '
    }
    if(flag){
        if(!quickGlobal.value.includes(string)){
            quickGlobal.value[focusIndex.value] = string
        }
    }
    else {
        if(!quick.value.includes(string)){
            quick.value[focusIndex.value] = string
        }
    }
}

const loseFocus =(index)=>{
    if(!flag){
        quickinputRefs.value[index].removeEventListener('keydown', fn1);
        quickinputRefs.value[index].removeEventListener('keyup',fn2)
    }else{
        quickGlobalyInputRefs.value[index].removeEventListener('keydown', fn1);
        quickGlobalyInputRefs.value[index].removeEventListener('keyup',fn2)
    }

}

const changeDir = ()=>{
    window.electron.ipcRenderer.invoke('add-local-dir').then(({canceled, path})=>{
        if(!canceled){
            globalVar.setting.downloadPath = path[0]
        }
    })
}

let flagsuo = true
const isClick = (index:number) => {
    if(flagsuo){
        flagsuo = false
        return 
    }
    if(index == 0){ 
      yinOryi.value[0] = !yinOryi.value[0] 
      if(yinOryi.value[1] && yinOryi.value[0])yinOryi.value[1] = false
    }else{
      yinOryi.value[1] = !yinOryi.value[1]
      if( yinOryi.value[0] && yinOryi.value[1])yinOryi.value[0] = false
    }
    flagsuo = true
}
let ciId = ref(0)
let t =setInterval(()=>{
    ciId.value = window.electron.ipcRenderer.sendSync('getWindowId', 'Ci')
    if(ciId.value != undefined){
        clearInterval(t)
    }
},100)

const lrcPositionHandle = ()=>{
    window.electron.ipcRenderer.send('change-lrc-position',lrcPosition.value)
}

const txtRef = ref()
const changeLrcFamily = (ms)=>{
    globalVar.setting.lrcFontFamily = ms.name
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-fontFamily',ms.name)
    txtRef.value.style.setProperty('--fontFamilyLrc',  ms.name);
}

const changeLrcSize = (ms)=>{
    globalVar.setting.lrcSize = +ms.name
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-fontSize',+ms.name)
    txtRef.value.style.setProperty('--fontSizeLrc',  ms.name + 'px');
}


const changeLrcWeight = (ms)=>{
    globalVar.setting.lrcWeigth = ms.name
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-fontWeight',ms.name)
    if(ms.name == "标准")txtRef.value.style.setProperty('--fontWeightLrc', 'normal');
    else txtRef.value.style.setProperty('--fontWeightLrc', 'bolder');
    
}

const changeLrcBorder = (ms)=>{
    globalVar.setting.lrcBorder = ms.name
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-LrcBorder',ms.name)
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-changeLrcborderColor',toRaw(globalVar.setting.borderColor))
    let str = ''
    if(ms.name == '有描边'){
      if(getComputedStyle(document.documentElement).getPropertyValue('--lrcfontWeight') == 'bolder')  str = '0.005em'
      else str = '0.02em'
    }
    else str = 'unset'
    document.documentElement.style.setProperty('--lrcColorBorderWidth', str);
    document.documentElement.style.setProperty('--lrcColorBorderColor', toRaw(globalVar.setting.borderColor));
}

const changeLrcColor = (ms)=>{
    globalVar.setting.lrcColor = ms.name
    let t = {
        top:'rgb(255,255,0)',
        bottom:'rgb(255,0,0)'
    }
    if(ms.name != '默认'){
        t.top = toRaw(globalVar.setting.topColor)
        t.bottom = toRaw(globalVar.setting.bottomColor)
    }
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-changeLrcColor',t)
    document.documentElement.style.setProperty('--lrcColorTop', t.top);
    document.documentElement.style.setProperty('--lrcColorBottom', t.bottom);
}

const topColorChange = ()=>{
    let t = {
        top:toRaw(globalVar.setting.topColor),
        bottom:toRaw(globalVar.setting.bottomColor)
    }
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-changeLrcColor',t)
    document.documentElement.style.setProperty('--lrcColorTop', t.top);
    document.documentElement.style.setProperty('--lrcColorBottom', t.bottom);
}
const bottomColorChange = ()=>{
    let t = {
        top:toRaw(globalVar.setting.topColor),
        bottom:toRaw(globalVar.setting.bottomColor)
    }
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-changeLrcColor',t)
    document.documentElement.style.setProperty('--lrcColorTop', t.top);
    document.documentElement.style.setProperty('--lrcColorBottom', t.bottom);
}

const borderColorChange = ()=>{
    window.electron.ipcRenderer.sendTo(ciId.value,'lrc-changeLrcborderColor',toRaw(globalVar.setting.borderColor))
    document.documentElement.style.setProperty('--lrcColorBorderColor', toRaw(globalVar.setting.borderColor));
}
onMounted(()=>{
    document.documentElement.style.setProperty('--lrcColorBorderColor', toRaw(globalVar.setting.borderColor));
    let t = {
        top:'rgb(255,255,0)',
        bottom:'rgb(255,0,0)'
    }
    if(globalVar.setting.lrcColor != '默认'){
        t.top = toRaw(globalVar.setting.topColor)
        t.bottom = toRaw(globalVar.setting.bottomColor)
    }
    document.documentElement.style.setProperty('--lrcColorTop', t.top);
    document.documentElement.style.setProperty('--lrcColorBottom', t.bottom);
    document.documentElement.style.setProperty('--lrcColorBorderColor', toRaw(globalVar.setting.borderColor));

    let str = ''
    if(globalVar.setting.lrcBorder == '有描边'){
      if(getComputedStyle(document.documentElement).getPropertyValue('--lrcfontWeight') == 'bolder')  str = '0.005em'
      else str = '0.02em'
    }
    else str = 'unset'
    document.documentElement.style.setProperty('--lrcColorBorderWidth', str);


    if(globalVar.setting.lrcWeigth == "标准")txtRef.value.style.setProperty('--fontWeightLrc', 'normal');
    else txtRef.value.style.setProperty('--fontWeightLrc', 'bolder');

    txtRef.value.style.setProperty('--fontSizeLrc',  globalVar.setting.lrcSize + 'px');

    txtRef.value.style.setProperty('--fontFamilyLrc',  globalVar.setting.lrcFontFamily);

})

window.electron.ipcRenderer.on('setting-size',({},size)=>{
    globalVar.setting.lrcSize = parseInt(size)
})
</script>

<style scoped lang="less">
.setting{
    user-select: none;
    margin-bottom: 80px;
    >div{
        width: 100%;
        margin: 0 25px;
        padding-top: 20px;
        padding-bottom: 20px;
        border-top: 1px solid @split-line-color;
        border-bottom: 1px solid @split-line-color;
        >.title{
            font-size: 15px;
            font-weight: bolder;
        }
        >div:not(.title){
            margin: 20px 0;
        }
    }
    .normal,.play{
        .font-choice,.start,.link,.close,.play-way,.play-canvas,.dwn{
            user-select: none;
            >.title{
                font-size: 12px;
                color: @small-font-color;
                margin-bottom: 5px;
                >span:first-child{
                    font-weight: bolder;
                }
            }

        }
        .start,.link,.play-canvas{
            .st-bt{
                margin-top:10px;
            }
        }
        .play-canvas{
            .el{
                display: flex;
                align-items: center;
                margin-top: 5px;
            }
            .st-bt{
                display: flex;
                align-items: center;
                color: @small-font-color;
                font-size: 12px;
            }
        }
    }
    .quick{
        .list{
            display: flex;
            flex-direction: column;
            width: 550px;
            .title1{
                display: flex;
                color: @small-font-color;
                font-weight: bolder;
                font-size: 12px;
                margin-bottom: 10px;
                >div{
                    flex-basis: 40%;
                }
                >div:first-child{
                    flex-basis: 20%;
                }
            }
            .btns{
                height: 30px;
                display: flex;
                align-items: center;
                font-size: 12px;
                margin-bottom: 10px;
                >div{
                    flex-basis: 40%;
                }
                >div:first-child{
                    flex-basis: 20%;
                }
                .quick-press{
                    >.inpt{
                        border: 1px solid @split-line-color;
                        height: 30px;
                        background-color: @quick-bk;
                        display: flex;
                        align-items: center;
                        width: 80%;
                        input{
                            background-color:transparent;
                            width: 100%;
                            margin-left: 1em;
                            color: @font-color;
                        }
                    }
                }
                .quick-global{
                    >.inpt{
                        border: 1px solid @split-line-color;
                        height: 30px;
                        background-color: @quick-bk;
                        display: flex;
                        align-items: center;
                        text-indent: 1em;
                        width: 80%;
                        input{
                            background-color:transparent;
                            margin-left: 1em;
                            width: 100%;
                            color: @font-color;
                        }
                    }
                    .err{
                        border: 1px solid @red-line;
                        position: relative;
                        &::after{
                            position: absolute;
                            right: -80px;
                            content: '热键被占用';
                            color: @small-font-red;
                        }
                    }
                }
                .stop{
                    >.inpt{
                        background-color: @quick-bk-stop;
                        input{
                            color: @small-font-color;
                        }
                    }
                }
            }
        }
        .open{
            display: flex;
            align-items: center;
            margin-top: 0px;
            >span{
                font-size: 12px;
                color: @small-font-color;
            }
        }
    }
    .dwn{
        .ds{
            .title{
                font-weight: bolder;
                font-size: 12px;
                color: @small-font-color;
            }
        } 
        .ts{
            .title{
                font-size: 12px;
                color: @small-font-color;
            }
            .path{
                margin-top: 10px;
                display: flex;
                align-items: center;
                font-size: 12px;
                .title{
                    font-weight: bolder;
                    font-size: 12px;
                    color: @small-font-color;
                }
                .msg{
                    width: 400px;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    overflow: hidden;
                    margin-right: 15px;
                }
                .change{
                    width: 120px;
                    height: 20px;
                    border-radius: 2em;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    cursor: pointer;
                    border: 1px solid @split-line-color;
                }
            }
        }
    }
    .lrc{
        .ls{
            .title{
                font-weight: bolder;
                font-size: 12px;
                color: @small-font-color;
            }
            .ll{
                display: flex;
                flex-direction: column;
                margin-top: 10px;
                >div{
                    margin-top: 10px;
                }
            }
        } 
        .on-top,.font-look{
            .title{
                font-weight: bolder;
                font-size: 12px;
                color: @small-font-color;
                margin-bottom: 20px;
            }
        }
        .font-set{
            display: flex;
            width: 600px;
            flex-wrap: wrap;
            .font-set-item{
                margin-bottom: 10px;
                :deep(.el-color-picker){
                    margin-left: 0;
                    margin-right: 20px;
                    width: 120px;
                    .el-color-picker__mask{
                        width: 120px;
                    }
                    .el-color-picker__trigger{
                        width: 120px;
                    }
                }
                .name{
                    font-weight: bolder;
                    font-size: 12px;
                    color: @small-font-color;
                    margin-bottom: 10px;
                }
            }
            .color{
                display: flex;
            }
        }
        .font-look{
            .bk{
                width: 600px;
                height: 150px;
                border: 1px solid @split-line-color;
                display: flex;
                justify-content: center;
                align-items: center;
                .txt{
                    --fontSizeLrc:20px;
                    --fontFamilyLrc:默认;
                    --fontWeightLrc:normal;
                    margin: 0 auto;
                    -webkit-text-stroke-width:var(--lrcColorBorderWidth);
                    -webkit-text-stroke-color:var(--lrcColorBorderColor);
                    font-weight: var(--fontWeightLrc);
                    // -webkit-text-stroke: 4px navy;
                    // font-weight: bolder;
                    text-align: center;
                    display: inline-block;
                    white-space: nowrap;
                    background-image: @lrc-color;
                    background-clip: text;
                    -webkit-background-clip: text;
                    color: transparent;
                    -webkit-text-fill-color: transparent;
                    font-size: var(--fontSizeLrc);
                    height: auto;
                    font-family: var(--fontFamilyLrc);
                }
            }
        }
    }
    .about{
        .btn{
            width: 60px;
            height: 20px;
            border-radius: 2em;
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            border: 1px solid @split-line-color;
            margin-left:10px;
            font-size:12px;
        }
        .now-version{
            display:flex;
            align-items:center;
            .txt{
                font-size:12px;
            }
        }
    }
}
:deep(.el-checkbox){
    --el-checkbox-input-border:var(--smallFontColor) 1px solid;
    --el-checkbox-checked-text-color:@font-color;
    --el-checkbox-bg-color:@commit-block-color;
    --el-checkbox-checked-input-border-color:@primary-color;
    --el-checkbox-checked-bg-color:@primary-color;
    --el-checkbox-input-border-color-hover:@small-font-color;
    --el-disabled-bg-color: @quick-bk-stop !important;
    --el-text-color-disabled:: @small-font-color !important;
    --el-disabled-border-color: @quick-bk-stop;
    height: auto;
    color: @font-color;
    .el-checkbox__label{
        font-size: 12px;
    }
}
:deep(.el-radio-group){
    label {
        --el-radio-input-border:var(--smallFontColor) 1px solid;
        --el-radio-input-bg-color:none;
        --el-radio-input-border-color-hover:@font-color-hover;
        height: 25px;
        .el-radio__label {
            font-size: 13px;
            color: @font-color;
        }

    }

    .is-checked {
        .el-radio__inner {
            border-color: @primary-color;
            background-color: @primary-color;
        }

        .el-radio__label {
            color: @primary-color;
        }
    }
}
:deep(.el-color-picker ){
    margin-left: 50px;
    .el-color-picker__mask{
        height: 20px;
        width: 100px;
        top: 3px;
        left: 0px;
        background-color: @leftClickColorOneself;
    }
    .el-color-picker__trigger{
        .el-color-picker__color{
            background-image: none;
        }
        height: 20px;
        width: 100px;
        i{
            display: none;
        }
    }
}


</style>