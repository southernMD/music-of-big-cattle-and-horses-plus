<template>
  <div class="setting">
    <div class="normal">
        <div class="title">常规</div>
        <div class="font-choice">
            <div class="title">
                <span>字体选择: </span>
                <span>如果字体显示不清晰，请在控制面板一字体设置中启用系统Clear Type设置</span>   
            </div>
            <dropDown @change="changeFontFamily" :width="300" ref="dropDownYear" :list="fontList" :message="globalVar.setting.fontFamily"></dropDown>
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
    </div>
    <div class="quick">
        <div class="title">快捷键</div>
        <div class="list">
            <div class="title1">
                <div class="t1">功能说明</div>
                <div class="t2">快捷键</div>
                <div class="t3">全局快捷键</div>
            </div>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {onMounted, toRef,ref, watch} from 'vue'
import {useGlobalVar} from '@renderer/store'
import dropDown from '@renderer/components/myVC/dropDown.vue'
const globalVar = useGlobalVar()
const fontList = toRef(globalVar,'fontList')
onMounted(()=>{
    document.body.style.fontFamily = '方正隶书繁体  !important';
})

const changeFontFamily = (ms)=>{
    console.log(ms.name);
    document.documentElement.style.setProperty('--fontFamily', ms.name);
    globalVar.setting.fontFamily = ms.name
}
const link = async()=>{
    //true添加注册表
   let flag = await window.electron.ipcRenderer.invoke('to-link-local',globalVar.setting.defaultMusic)
   if(flag){
   }else{
    globalVar.setting.autoOpen = false
   }
}

const autoPlay = async()=>{
   let flag = await window.electron.ipcRenderer.invoke('auto-open',globalVar.setting.autoOpen)
   if(flag){
   }else{
    globalVar.setting.autoOpen = false
   }
}

watch(()=>globalVar.setting,()=>{
    globalVar.loadMessageDefault = '设置已更新'
    globalVar.loadMessageDefaultFlag = true
},{deep:true})
</script>

<style scoped lang="less">
.setting{
    user-select: none;
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
        .font-choice,.start,.link,.close,.play-way{
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
        .start,.link{
            .st-bt{
                margin-top:10px;
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
    height: auto;
    color: @font-color !important;
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
</style>