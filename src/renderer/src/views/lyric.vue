<template>
    <div class="lyric" ref="lyric" @mouseover="show" @mouseout="hide" @mousedown="moveBegin">
        <span class="option" v-show="flagOption">
            <span @click="showDetail">
                <i title="进入音乐详情页" class="iconfont icon-yinle" style="position: relative; top:-3px"></i>
            </span>
            <span @click="jia" title="歌词前进0.5s">
                <i class="iconfont icon-jiahao_o"
                    style="font-size: 10px; font-weight: bolder; position: relative; top: -2px;"></i>
                <i class="iconfont icon-xiaoshu" style="font-size: 20px;"></i>
                <span style="font-size: 14px;">s</span>
            </span>
            <span @click="jian" title="歌词后退0.5s">
                <i class="iconfont icon-jian"
                    style="font-size: 10px; font-weight: bolder; position: relative; top: -2px;"></i>
                <i class="iconfont icon-xiaoshu" style="font-size: 20px;"></i>
                <span style="font-size: 14px;">s</span>
            </span>
            <span>
                <i class="iconfont icon-shangyishou" @click="prev" title="上一首（Ctrl + Alt + Left）"></i>
            </span>
            <span @click="playOrStop" title="播放/暂停（Ctrl + Alt + P）">
                <i class="iconfont icon-zanting" v-if="playStatus == 'play'"></i>
                <i class="iconfont icon-gf-play" v-else></i>
            </span>
            <span>
                <i class="iconfont icon-xiayishou" @click="next" title="下一首（Ctrl + Alt + Right）"></i>
            </span>
            <span>
                <i class="iconfont icon-setting" title="设置（暂不可用）"></i>
            </span>
            <span>
                <i class="iconfont icon-suoding_o" @click="suo" title="锁定桌面歌词"></i>
            </span>
            <span>
                <i class="iconfont icon-guanbi_o" @click="close" title="关闭桌面歌词"></i>
            </span>
        </span>
        <div class="lrc" ref="lrcBlock" :class="{fill:fillHeight}">
            <span ref="lrc" v-if="lrcArr.length!==0" class="one" >
                <div class="i-bk" @mouseover="can" @mouseout="nocan" :class="{opacity:suoFlag && suoShowFlag}">
                    <i title="解锁桌面歌词" class="iconfont icon-jiesuo"  @click.self="jiesuo"></i>
                </div>
                <span>{{ lrcArr[indexLrc]?.time === 0 || lrcArr[indexLrc]?.lyric === '' ? title :
                lrcArr[indexLrc]?.lyric}}</span>
            </span>
            <span ref="lrc" class="one" v-if="lrcArr.length==0" >
                <div class="i-bk" @mouseover="can" @mouseout="nocan" :class="{opacity:suoFlag && suoShowFlag}" >
                    <i title="解锁桌面歌词" class="iconfont icon-jiesuo" @click.self="jiesuo"></i>
                </div>
                <span>{{title}}</span>
            </span>
            <span ref="roma" v-show="yinOryi[1] && romalrcArr.length != 0" class="two">
                <span>{{ lrcArr[indexLrc]?.time !== 0 && lrcArr[indexLrc]?.lyric !== '' ? romalrcArr[indexRm]?.lyric :
                ''}}</span>
            </span>
            <span ref="tly" v-show="yinOryi[0] && tlyricArr.length != 0" class="there">
                <span>{{ lrcArr[indexLrc]?.time !== 0 && lrcArr[indexLrc]?.lyric !== '' ? tlyricArr[indexTr]?.lyric :
                ''}}</span>
            </span>

        </div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, ref, Ref, nextTick, 
    watch, toRef, getCurrentInstance, ComponentInternalInstance,onUnmounted, computed } from 'vue';
import { useElectronToApp, useMain ,useGlobalVar} from '@renderer/store/index'
import { parseLyricLine } from '@renderer/utils/parseLyricLine'
const electronToApp = useElectronToApp();
const Main = useMain();
const $el = getCurrentInstance() as ComponentInternalInstance;

let mainId = ref(undefined)
let t =setInterval(()=>{
    mainId.value = window.electron.ipcRenderer.sendSync('getWindowId', 'Main')
    if(mainId.value != undefined){
        console.log('得到mainid');
        clearInterval(t)
    }
},5000)

const fillHeight = computed(()=>{
    return !(yinOryi[1] && romalrcArr.value.length != 0) && !(yinOryi[0] && tlyricArr.value.length != 0)
})


let ok = false
let t2 = setInterval(()=>{
    if(ok) clearInterval(t2)
    // window.electron.ipcRenderer.sendTo(mainId.value,'lrc-ready')
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'lrc-ready',data:null})
},2000)

const yinOryi = ref([false,false])
window.electron.ipcRenderer.on('yin-or-yi',({},{data}:{data:boolean[]})=>{
    yinOryi.value = data
})


let lrc = ref('');
let romalrc = ref('');
let tlyric = ref('')
let lrcArr = ref([{ time: 0, lyric: '' }])
let romalrcArr = ref([{ time: 0, lyric: '' }])
let tlyricArr = ref([{ time: 0, lyric: '' }])
let lrcArry = toRef(electronToApp, 'lrcArry')
let playTime = ref(0)
let title = ref('大牛马音乐')
let indexLrc = ref(0)
let indexRm = ref(0)
let indexTr = ref(0)
let flagOption = ref(false)
let playStatus = ref('')
let eqi = ref(0) //歌词修正单位s
let suoFlag = ref(false)
let suoShowFlag = ref(false)
window.electron.ipcRenderer.on('to-Ci', ({}, {data}) => {
    console.log('to-ci窗口收到歌词————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————————');
    electronToApp.lrcArry = data
    indexLrc.value = 0
    indexRm.value = 0
    indexTr.value = 0
})


const showLrc = (array: Ref<any>, index: Ref<number>) => {
    // let arr = document.querySelectorAll('.move')
    for (let i = 0; i < array.value.length; i++) {
        if (array.value[i]?.time <= playTime.value && array.value[i + 1]?.time > playTime.value) {
            index.value = i;
            break;
        }
    }
    // console.log(array.value[array.value.length - 2]);

    if (playTime.value > array.value[array.value.length - 1]?.time) {
        index.value = array.value.length - 1
    }
    if (playTime.value == 0) {
        indexLrc.value = 0
        indexRm.value = 0
        indexTr.value = 0
    }
}

watch(indexRm, () => {
    let roma = $el.refs.roma as HTMLElement
    if (roma) {
        let child = roma.children[0] as HTMLElement
        child.style.removeProperty('transition')
        child.style.removeProperty('transform')
    }

})
watch(indexLrc, () => {
    let l = $el.refs.lrc as HTMLElement
    if (l) {
        let child = l.querySelector('span') as HTMLElement
        child.style.removeProperty('transition')
        child.style.removeProperty('transform')
    }
})
watch(indexTr, () => {
    let tly = $el.refs.tly as HTMLElement
    if (tly) {
        let child = tly.children[0] as HTMLElement
        child.style.removeProperty('transition')
        child.style.removeProperty('transform')
    }
})


window.electron.ipcRenderer.on('to-currentTime', ({}, {data}:{data:number}) => {
    playTime.value = Math.floor(data * 1000) + eqi.value * 1000;
    if (lrcArry.value?.lrc) showLrc(lrcArr, indexLrc)
    // window.electron.ipcRenderer.sendTo(mainId.value,'Main-Menu-song-lrc',lrcArr.value[indexLrc.value]?.lyric)
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'Main-Menu-song-lrc',data:lrcArr.value[indexLrc.value]?.lyric})
    if (lrcArry.value?.romalrc) showLrc(romalrcArr, indexRm)
    if (lrcArry.value?.tlyric) showLrc(tlyricArr, indexTr)
    let dom = $el.refs.lyric as HTMLElement
    let l = $el.refs.lrc as HTMLElement
    let roma = $el.refs.roma as HTMLElement
    let tly = $el.refs.tly as HTMLElement
    if (l) {
        let child = l.querySelector('span') as HTMLElement
        if (l.scrollWidth > l.offsetWidth) {
            child.style.transform = 'translateX(' + -(l.scrollWidth - l.offsetWidth) + 'px' + ')'
            child.style.transition = 'transform ' + (lrcArr.value[indexLrc.value + 1].time - lrcArr.value[indexLrc.value].time + 200) + 'ms' + ' linear'
        }
    }

    if (roma) {
        console.log(roma.scrollWidth, roma.offsetWidth);
        let child = roma.children[0] as HTMLElement
        if (roma.scrollWidth > roma.offsetWidth) {
            child.style.transform = 'translateX(' + -(roma.scrollWidth - roma.offsetWidth) + 'px' + ')'
            child.style.transition = 'transform ' + (romalrcArr.value[indexRm.value + 1].time - romalrcArr.value[indexRm.value].time + 200) + 'ms' + ' linear'

        }
    }

    if (tly) {
        let child = tly.children[0] as HTMLElement
        if (tly.scrollWidth > dom.offsetWidth) {
            child.style.transform = 'translateX(' + -(tly.scrollWidth - tly.offsetWidth) + 'px' + ')'
            child.style.transition = 'transform ' + (tlyricArr.value[indexTr.value + 1].time - tlyricArr.value[indexTr.value].time + 200) + 'ms' + ' linear'
        }
    }

})

window.electron.ipcRenderer.on('to-title', ({}, {data}) => {
    title.value = data
})


watch(lrcArry, () => {
    console.log(lrcArry.value);
    lrc.value = lrcArry.value.lrc?.lyric
    romalrc.value = lrcArry.value.romalrc?.lyric
    tlyric.value = lrcArry.value.tlyric?.lyric

    if (lrcArry.value?.lrc) {
        lrcArr.value = parseLyricLine(lrc.value)
    } else {
        lrcArr.value = [{ time: 0, lyric: '' }]
    }
    if (lrcArry.value?.romalrc) {
        romalrcArr.value = parseLyricLine(romalrc.value)
    } else {
        romalrcArr.value = [{ time: 0, lyric: '' }]
    }
    if (lrcArry.value?.tlyric) {
        tlyricArr.value = parseLyricLine(tlyric.value)
    } else {
        tlyricArr.value = [{ time: 0, lyric: '' }]
    }
    if(lrcArr.value?.length == 0 && lrcArr.value){
        let temp = {
            time:6039000,
            lyric:'暂无歌词'
        }
        lrcArr.value.push(temp)
    }
    let obj = JSON.stringify({
        lrc:lrcArr.value,
        romalrc:romalrcArr.value,
        tlyric:tlyricArr.value
    })
    
    try {
     console.log(mainId.value,obj);
     let t = setInterval(()=>{
        if(mainId.value){
            console.log(mainId.value,obj);
            window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'resolved-lrc',data:obj})
            // window.electron.ipcRenderer.sendTo(mainId.value,'resolved-lrc',obj)
            clearInterval(t)
        }
     },100)
     
    } catch (error) {
        console.log(error);
        
    }


}, { immediate: true })
const resize = (obj)=>{
    let dom = $el.refs.lyric as HTMLElement
    let l = $el.refs.lrc as HTMLElement
    let roma = $el.refs.roma as HTMLElement
    let tly = $el.refs.tly as HTMLElement
    let lrcBlock = $el.refs.lrcBlock as HTMLElement
    console.log(baseFontSize.value);
    lrcBlock.style.fontSize = baseFontSize.value + 'px'
    // if (romalrcArr.value.length == 0 && tlyricArr.value.length == 0) {
    //     dom.style.height = 'calc(' + obj.y + 'px' + ' * 0.8)'
    // } else {
        dom.style.height = obj.y + 'px'
    // }
    dom.style.width = 'calc(' + obj.x + 'px + 16px )';
    if (l) {
        l.style.width = 'calc((' + obj.x + 'px + 16px ) * 0.9 )'
        l.style.height = 'calc(' + obj.y + 'px' + ' * 0.35)'
    }
    if (roma) {
        roma.style.width = 'calc((' + obj.x + 'px + 16px ) * 0.9 )'
        roma.style.height = 'calc(' + obj.y + 'px' + ' * 0.4)'
    }
    if (tly) {
        tly.style.width = 'calc((' + obj.x + 'px + 16px ) * 0.9 )'
        tly.style.height = 'calc(' + obj.y + 'px' + ' * 0.4)'
    }
}

//样式
const baseFontSize = ref(20)
onMounted(async () => {
    console.log('onMounted');
    let obj = window.electron.ipcRenderer.sendSync('get-child-x-y')
    resize(obj)
    window.electron.ipcRenderer.on('lyric-x-y', ({}, Obj: any) => {
        console.log('question1');
        resize(Obj)
        // dom.style.width = 'calc(' + Obj.x + 'px + 16px )';
        // dom.style.height = Obj.y + 'px'
        // if (l) {
        //     l.style.width = 'calc((' + Obj.x + 'px + 16px ) * 0.9 )'
        //     l.style.height = 'calc(' + Obj.y + 'px' + ' * 0.35)'
        // }
        // if (roma) {
        //     roma.style.width = 'calc((' + Obj.x + 'px + 16px ) * 0.9 )'
        //     roma.style.height = 'calc(' + Obj.y + 'px' + ' * 0.4)'
        // }
        // if (tly) {
        //     tly.style.width = 'calc((' + Obj.x + 'px + 16px ) * 0.9 )'
        //     tly.style.height = 'calc(' + Obj.y + 'px' + ' * 0.4)'
        // }
    })
})
let isDragging = false;
const moveBegin = (e: MouseEvent) => {
    if (!suoFlag.value) {
        let dom = $el.refs.lyric as HTMLElement
        dom.style.cursor = 'grabbing'
        flagOption.value = true
        dom.style.backgroundColor = 'rgba(0,0,0,.4)';
        window.addEventListener('mouseup', destoryMove);
        isDragging = true;
        window.electron.ipcRenderer.send('move-child', { mouseY: e.pageY, mouseX: e.pageX,width:dom.offsetWidth,height:dom.offsetHeight })
    }
}

const destoryMove = () => {
    let dom = $el.refs.lyric as HTMLElement
    dom.style.cursor = 'grab'
    window.electron.ipcRenderer.send('destory-move-child')
    window.removeEventListener('mouseup', destoryMove);
    isDragging = false;
}

const can = () => {

    if (suoFlag.value) window.electron.ipcRenderer.send('mouse-can')
    suoShowFlag.value = true


}

const nocan = () => {

    if (suoFlag.value) window.electron.ipcRenderer.send('mouse-no')
    suoShowFlag.value = false

}


let time1: any = null;
const show = () => {
    if (!suoFlag.value) {
        clearTimeout(time2)
        time1 = setTimeout(() => {
            flagOption.value = true
            let dom = $el.refs.lyric as HTMLElement
            dom.style.backgroundColor = 'rgba(0,0,0,.4)';
            clearTimeout(time1)
            time1 = null
        }, 1000)
    }
}

let time2: any = null;
const hide = () => {
    if (!suoFlag.value) {
        clearTimeout(time1)
        time2 = setTimeout(() => {
            flagOption.value = false
            let dom = $el.refs.lyric as HTMLElement
            dom.style.backgroundColor = 'rgba(0,0,0,.0)';
            clearTimeout(time2)
            time2 = null
        }, 1000)
    }
}
window.addEventListener('resize', async() => {
    if (!suoFlag.value && !isDragging) {
        let dom = $el.refs.lyric as HTMLElement
        dom.style.backgroundColor = 'rgba(0,0,0,.4)';
        flagOption.value = true
        //20 96
        let obj = window.electron.ipcRenderer.sendSync('get-child-x-y')
        let lrcBlock = $el.refs.lrcBlock as HTMLElement
        let size = (obj.y - 123)/(291 - 123) * (96 - 20) + 20
        lrcBlock.style.fontSize = size + 'px'
        baseFontSize.value = size
        window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'setting-size',data:size})
        // window.electron.ipcRenderer.sendTo(mainId.value,'setting-size',{size})
        //291 - 123 = 168
        //obj.y - 123 = ? 
        //size = ? / 168 nowSize /(96 - 20)
        // minHeight:123,
        // height:123,
        // maxHeight:291,
    }
})


//option
//关闭
const close = async () => {
    flagOption.value = false
    let dom = $el.refs.lyric as HTMLElement
    dom.style.backgroundColor = 'rgba(0,0,0,.0)';
    window.electron.ipcRenderer.send('open-lyric', false)
    // window.electron.ipcRenderer.sendTo(mainId.value, 'to-close-ci', false);
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'to-close-ci',data:false})
}
//播放状态
window.electron.ipcRenderer.on('play-status', ({}, {data}:{data:string}) => {
    playStatus.value = data
})
//暂停/播放
const playOrStop = () => {
    console.log('playOrStop');
    // window.electron.ipcRenderer.sendTo(mainId.value, 'play-or-stop')
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'play-or-stop',data:null})
}

//上一首
const prev = () => {
    console.log('prev');
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'prev-song',data:null})
    // window.electron.ipcRenderer.sendTo(mainId.value, 'prev-song')
    playStatus.value = 'play'
}
//下一首
const next = () => {
    console.log('next',mainId.value);
    // window.electron.ipcRenderer.sendTo(mainId.value, 'next-song')
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'next-song',data:null})
    playStatus.value = 'play'
}

//加0.5
const jia = () => {
    eqi.value += 0.5
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'lyric-offset',data:eqi.value})
    // window.electron.ipcRenderer.sendTo(mainId.value, 'lyric-offset', eqi.value)
}

//减0.5
const jian = () => {
    eqi.value -= 0.5
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'lyric-offset',data:eqi.value})
    // window.electron.ipcRenderer.sendTo(mainId.value, 'lyric-offset', eqi.value)
}

//偏移主修改
window.electron.ipcRenderer.on('lyric-offset-ci',({},{data}:{data:number})=>{
    console.log('偏移主修改',data);
    eqi.value = data
})


//锁定
const suo = () => {
    suoFlag.value = true
    suoShowFlag.value = false
    flagOption.value = false
    let dom = $el.refs.lyric as HTMLElement
    dom.style.cursor = 'default'
    dom.style.backgroundColor = 'rgba(0,0,0,.0)';
    clearTimeout(time1)
    clearTimeout(time2)
    window.electron.ipcRenderer.send('no-resizable')
    window.electron.ipcRenderer.send('mouse-no')
}

//解锁
const jiesuo = () => {
    suoFlag.value = false
    suoShowFlag.value = true
    flagOption.value = true
    let dom = $el.refs.lyric as HTMLElement
    dom.style.cursor = 'grab'
    dom.style.backgroundColor = 'rgba(0,0,0,.4)';
    window.electron.ipcRenderer.send('can-resizable')
    window.electron.ipcRenderer.send('mouse-can')
}

//打开音乐详情页
const showDetail = ()=>{
    console.log('lrc-open-playDetail');
    window.electron.ipcRenderer.send('transpond-window-message', {to:mainId.value,name:'lrc-open-playDetail',data:null})
    // window.electron.ipcRenderer.sendTo(mainId.value,'lrc-open-playDetail')
    window.electron.ipcRenderer.send('lrc-open-playDetail')
}

window.electron.ipcRenderer.on('lrc-fontFamily',({},{data})=>{
    document.documentElement.style.setProperty('--fontFamily', data);
})

window.electron.ipcRenderer.on('lrc-fontSize',({},{data})=>{
    console.log('我拿到值'); 
    if(!ok)baseFontSize.value = data
    ok = true
    const y = (data - 20) / (96 - 20) * (291 - 123) + 123
    console.log(y,data,'重设');
    window.electron.ipcRenderer.sendSync('send-child-y',y)
    let dom = $el.refs.lyric as HTMLElement
    let lrcBlock = $el.refs.lrcBlock as HTMLElement
    lrcBlock.style.fontSize = data + 'px'
    dom.style.height = y + 'px'
    let obj = window.electron.ipcRenderer.sendSync('get-child-x-y')
    resize(obj)
})
window.electron.ipcRenderer.on('lrc-fontWeight',({},{data})=>{
    let str = ''
    if(data == '标准'){
        str = 'normal'
        document.documentElement.style.setProperty('--lrcColorBorderWidth', '0.02em');
    }
    else{
        str = 'bolder'
        document.documentElement.style.setProperty('--lrcColorBorderWidth', '0.005em');
    }
    document.documentElement.style.setProperty('--lrcfontWeight', str);
//     @lrc-color-border-color:var(--lrcColorBorderColor,unset);
// @lrc-font-weight:var(--lrcfontWeight,normal);
})
window.electron.ipcRenderer.on('lrc-LrcBorder',({},{data})=>{
    let str = ''
    if(data == '有描边'){
      if(getComputedStyle(document.documentElement).getPropertyValue('--lrcfontWeight') == 'bolder')  str = '0.005em'
      else str = '0.02em'
    }
    else str = 'unset'
    document.documentElement.style.setProperty('--lrcColorBorderWidth', str);
})
window.electron.ipcRenderer.on('lrc-changeLrcColor',({},{data:{top,bottom}})=>{
    document.documentElement.style.setProperty('--lrcColorTop', top);
    document.documentElement.style.setProperty('--lrcColorBottom', bottom);
})

window.electron.ipcRenderer.on('lrc-changeLrcborderColor',({},{data})=>{
    document.documentElement.style.setProperty('--lrcColorBorderColor', data);
})
</script>

<style lang="less" scoped>


.opacity{
    opacity: 1 !important;
    // font-weight: bolder;
}
.lyric {
    cursor: grab;
    user-select: none;
    height: 150px;
    width: calc(600px + 16px);
    background-color: rgba(0, 0, 0, .0);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    position: relative;


    .lrc {
        width: 100vw;
        display: flex;
        flex-direction: column;
        padding-top: 40px;
        position: relative;
        font-size: 20px;
        .i-bk{
            width: 20%;
            height: 30px;
            position: absolute;
            left: 0;
            right: 0;
            margin: 0 auto;
            top: 0;
            opacity: 0;
        }
        .icon-jiesuo {
            color: white;
            position: absolute;
            width: 40px;
            left: 0;
            right: 0;
            margin: 0 auto;
            cursor: pointer;
            display: inline-block;
            font-size: 30px;
        }

        >span {
            overflow: hidden;
            margin: 0 auto;

            >span {
                margin: 0 auto;
                -webkit-text-stroke-width:var(--lrcColorBorderWidth);
                -webkit-text-stroke-color:var(--lrcColorBorderColor);
                font-weight: var(--lrcfontWeight);
                // -webkit-text-stroke: 4px navy;
                text-align: center;
                display: inline-block;
                white-space: nowrap;
                background-image: @lrc-color;
                background-clip: text;
                -webkit-background-clip: text;
                color: transparent;
                -webkit-text-fill-color: transparent;
                font-size: inherit;
                height: auto;
            }
        }

        .one {
            margin: 0 auto;
            margin-top: 10px;
            text-align: center;
        }

        .two,
        .there {
            margin: 0 auto;
            text-align: center;
        }
    }
    
    .fill{
        height: 100% !important;
        display: flex !important;
        justify-content: center !important;
        align-items: center !important;
    }

    .option {
        cursor: default;
        width: 100%;
        transform: translateX(-12px);
        display: flex;
        justify-content: center;
        position: absolute;
        margin-top: 10px;
        z-index: 10;

        >span {
            cursor: pointer;
            margin: 0 5px;
            color: white;

            >i {
                font-size: 25px;
            }
        }
    }
}
</style>