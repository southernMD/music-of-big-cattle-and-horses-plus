<template>
    <div class="editPlayList">
        <div class="title">{{ title }}</div>
        <div class="main">
            <slot name="form"></slot>
            <div class="img">
                <el-image style="width: 150px; height: 150px" :src="imgUrl"></el-image>
                <div class="btns" @click="openPic">
                    <span>{{ imgTitle }}</span>
                </div>
            </div>
        </div>
    </div>
    <MyDialog :flag="picFlag" confirmName="保存并关闭" cancelName="重新选择" @confirm="confirm" @cancel="cancel"
        @close-dialog="closeDialog">
        <template #header>
            <div class="title">{{titleDialog}}</div>
        </template>
        <template #midle>
            <div class="img-pick">
                <div class="left">
                    <div class="bk">
                        <div class="img" ref="pickImgRef" :style="{ 'background-image': 'url(' + url + ')' }">
                            <div class="model" ref="modelRef"></div>
                            <div class="pick" ref="pickRef" @mousedown.stop.self="beginDarg">
                                <div class="point" ref="pointRef" @mousedown.stop.self="beginScale"></div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="right">
                    <div class="top">
                        <div class="bk">
                            <img class="img" id="adsas" ref="bigRef" :src="url">
                        </div>
                        <div class="txt"><span>大尺寸封面</span></div>
                    </div>
                    <div class="bottom">
                        <div class="bk">
                            <img class="img" ref="smallRef" :src="url">
                        </div>
                        <div class="txt"><span>小尺寸封面</span></div>
                    </div>
                </div>
            </div>
        </template>
    </MyDialog>
    <!-- <AddTipDialog ref="AddTipDialogRef" :index="+index"></AddTipDialog> -->
</template>
  
<script setup lang="ts">
import { reactive, ref, toRaw, Ref, nextTick, onMounted, watch, ComponentPublicInstance } from 'vue'
import { useRoute, useRouter } from 'vue-router';
import { useMain, useGlobalVar,useBasicApi,useNM } from '@renderer/store'
import MyDialog from '@renderer/components/myVC/MyDialog.vue'
import Loading from '@renderer/ImperativeComponents/Loading/Loading';
const $route = useRoute()
const index = ref($route.query.index as string)
const Main = useMain()
const NM = useNM()
const globalVar = useGlobalVar()
const BasicApi = useBasicApi()

const props = defineProps<{
    type:string
    title:string
    titleDialog:string
    imgTitle:string
    imgUrl:string
}>()


const picFlag = ref(false)
const url = ref("")
const openPic = () => {
    const result = window.electron.ipcRenderer.sendSync('detail-pic')
    if (!result) return
    url.value = `data:image/png;base64,${result}`
    picFlag.value = true
    // console.log(`data:image;base64,${result}`);
    //`data:${extMimeType};base64,${data.toString('base64')}`;
    nextTick(() => {
        getBgImageSize()
    })
}
const pickImgRef = ref<Element>()
const pickRef = ref<HTMLElement>()
const modelRef = ref<HTMLElement>()

const bgWidth = ref(0)
const bgHeight = ref(0)
let initX = ref(0); //裁剪框坐标
let initY = ref(0);
const scale = ref(1)
const getBgImageSize = () => {
    const pickImgEl = pickImgRef.value;
    if (pickImgEl) {
        const bgImage = new Image();
        bgImage.src = getComputedStyle(pickImgEl).backgroundImage.replace(/url\(['"]?([^'"]*)['"]?\)/i, "$1");
        bgImage.onload = function () {
            const bgImageWidth = bgImage.width;
            const bgImageHeight = bgImage.height;
            const bgPosition = getComputedStyle(pickImgEl).backgroundPosition.split(" ");
            scale.value = Math.min(pickImgEl.clientWidth / bgImageWidth, pickImgEl.clientHeight / bgImageHeight);
            initX.value = (pickImgEl.clientWidth - bgImageWidth * scale.value) * parseFloat(bgPosition[0]) / 100;
            initY.value = (pickImgEl.clientHeight - bgImageHeight * scale.value) * parseFloat(bgPosition[1]) / 100;
            bgWidth.value = bgImageWidth * scale.value; //选框的大小
            bgHeight.value = bgImageHeight * scale.value;
            //   console.log(x,y,bgImageWidth * scale,bgImageHeight * scale);
            const WHValue = Math.min(bgWidth.value, bgHeight.value)
            pickRef.value!.style.left = initX.value + 'px'
            pickRef.value!.style.top = initY.value + 'px'
            pickRef.value!.style.width = WHValue + 'px'
            pickRef.value!.style.height = WHValue + 'px'
            pickRef.value!.style.backgroundImage = `url('${url.value}')`;
            pickRef.value!.style.backgroundSize = `${bgWidth.value}px ${bgHeight.value}px`
            pickRef.value!.style.backgroundPosition = '0px 0px'
            modelRef.value!.style.width = bgWidth.value + 'px'
            modelRef.value!.style.height = bgHeight.value + 'px'
            modelRef.value!.style.left = initX.value + 'px'
            modelRef.value!.style.top = initY.value + 'px'
            //   bigRef.value!.style.aspectRatio = `${bgWidth.value}/${bgHeight.value}`
            //   smallRef.value!.style.aspectRatio = `${bgWidth.value}/${bgHeight.value}`
            bigRef.value!.style.height = 90 + 'px'
            smallRef.value!.style.height = 60 + 'px'
            //   bigRef.value!.style.backgroundSize = `${WHValue}px ${WHValue}px`
            //   bigRef.value!.style.transform = `scale(1.2,1.2)`
            //   smallRef.value!.style.backgroundSize = `${WHValue}px ${WHValue}px`
            //   smallRef.value!.style.transform = `scale(${60/WHValue},${60/WHValue})`
        }
    }
}
const bigRef = ref<HTMLElement>()
const smallRef = ref<HTMLElement>()
// 监听窗口大小变化，重新计算背景图片的大小
window.addEventListener("resize", () => {
    getBgImageSize();
});
const pointRef = ref<HTMLElement>()
const MouseX = ref(0)
const MouseY = ref(0)
const beginScale = (e: MouseEvent) => {
    const pointEl = pointRef.value;
    if (pointEl) {
        MouseX.value = e.clientX
        MouseY.value = e.clientY
        window.addEventListener('mousemove', mouseMoving)
        window.addEventListener('mousemove', mouseDargMoving)
        window.addEventListener('mouseup', mouseUp)
    }
}
const mouseMoving = (e: MouseEvent) => {
    const WHValue = Math.min(bgWidth.value, bgHeight.value)
    let MouseVal = Math.max(Math.abs(e.clientX - MouseX.value), Math.abs(e.clientY - MouseY.value))
    if (e.clientX - MouseX.value < 0 || e.clientY - MouseY.value < 0) MouseVal = -MouseVal
    MouseX.value = e.clientX
    MouseY.value = e.clientY
    if (+pickRef.value!.style.width.split('px')[0] + MouseVal < 20 && MouseVal < 0) {
        pickRef.value!.style.width = 20 + 'px'
        pickRef.value!.style.height = 20 + 'px'
        bigRef.value!.style.height = WHValue / 20 * 90 + 'px'
        smallRef.value!.style.height = WHValue / 20 * 60 + 'px'
        // bigRef.value!.style.transform = `scale(${WHValue/20},${WHValue/20})`
        // smallRef.value!.style.transform = `scale(${WHValue/20},${WHValue/20})`
    } else if (+pickRef.value!.style.width.split('px')[0] + MouseVal > WHValue && MouseVal > 0) {
        pickRef.value!.style.width = WHValue + 'px'
        pickRef.value!.style.height = WHValue + 'px'
        bigRef.value!.style.height = 90 + 'px'
        smallRef.value!.style.height = 60 + 'px'
        // bigRef.value!.style.transform = `scale(${1},${1})`
        // smallRef.value!.style.transform = `scale(${1},${1})`
    } else {
        pickRef.value!.style.width = pickRef.value!.offsetWidth + MouseVal + 'px'
        pickRef.value!.style.height = pickRef.value!.offsetHeight + MouseVal + 'px'
        bigRef.value!.style.height = WHValue / (pickRef.value!.offsetWidth + MouseVal) * 90 + 'px'
        smallRef.value!.style.height = WHValue / (pickRef.value!.offsetHeight + MouseVal) * 60 + 'px'

        // bigRef.value!.style.transform = `scale(${WHValue/(pickRef.value!.offsetWidth + MouseVal)},${WHValue/(pickRef.value!.offsetHeight + MouseVal)})`
        // smallRef.value!.style.transform = `scale(${WHValue/(pickRef.value!.offsetWidth + MouseVal)},${WHValue/(pickRef.value!.offsetHeight + MouseVal)})`
    }
    // bigRef.value!.style.transform = `scale(${scaleX.value},${scaleY.value})`
    // smallRef.value!.style.transform = `scale(${scaleX.value},${scaleY.value})`
}
const mouseUp = () => {
    window.removeEventListener('mousemove', mouseMoving)
    window.removeEventListener('mousemove', mouseDargMoving)
    window.removeEventListener('mouseup', mouseUp)
}
const beginDarg = (e: MouseEvent) => {
    const pointEl = pointRef.value;
    if (pointEl) {
        MouseX.value = e.clientX
        MouseY.value = e.clientY
        window.addEventListener('mousemove', mouseDargMoving)
        window.addEventListener('mouseup', mouseDargUp)
    }
}
const mouseDargMoving = (e: MouseEvent) => {
    const x = e.clientX - MouseX.value
    const y = e.clientY - MouseY.value
    const nowWHValue = +pickRef.value!.style.width.split('px')[0]
    let flagX = false, flagY = false;
    if (+pickRef.value!.style.left.split('px')[0] - initX.value + x + nowWHValue >= bgWidth.value) {
        pickRef.value!.style.backgroundPositionX = -(bgWidth.value - nowWHValue) + 'px'
        bigRef.value!.style.left = -(bgWidth.value - nowWHValue) * (90 / nowWHValue) + 'px'
        smallRef.value!.style.left = -(bgWidth.value - nowWHValue) * (60 / nowWHValue) + 'px'
        pickRef.value!.style.left = bgWidth.value - nowWHValue + 'px'
        flagX = true
    }
    if (+pickRef.value!.style.top.split('px')[0] - initY.value + y + nowWHValue >= bgHeight.value) {
        pickRef.value!.style.backgroundPositionY = -(bgHeight.value - nowWHValue) + 'px'
        bigRef.value!.style.top = -(bgHeight.value - nowWHValue) * (90 / nowWHValue) + 'px'
        smallRef.value!.style.top = -(bgHeight.value - nowWHValue) * (60 / nowWHValue) + 'px'
        pickRef.value!.style.top = bgHeight.value - nowWHValue + initY.value + 'px'
        flagY = true
    }
    if (+pickRef.value!.style.left.split('px')[0] - initX.value + x <= 0) {
        pickRef.value!.style.backgroundPositionX = 0 + 'px'
        bigRef.value!.style.left = 0 + 'px'
        smallRef.value!.style.left = 0 + 'px'
        pickRef.value!.style.left = 0 + 'px'
        flagX = true
    }
    if (+pickRef.value!.style.top.split('px')[0] - initY.value + y <= 0) {
        pickRef.value!.style.backgroundPositionY = 0 + 'px'
        bigRef.value!.style.top = 0 + 'px'
        smallRef.value!.style.top = 0 + 'px'
        pickRef.value!.style.top = initY.value + 'px'
        flagY = true
    }

    if (!flagX) {
        pickRef.value!.style.backgroundPositionX = -(+pickRef.value!.style.left.split('px')[0] + x) + 'px'
        bigRef.value!.style.left = -(+pickRef.value!.style.left.split('px')[0] + x) * (90 / nowWHValue) + 'px'
        smallRef.value!.style.left = -(+pickRef.value!.style.left.split('px')[0] + x) * (60 / nowWHValue) + 'px'
        pickRef.value!.style.left = +pickRef.value!.style.left.split('px')[0] + x + 'px'
    }
    if (!flagY) {
        pickRef.value!.style.backgroundPositionY = -(+pickRef.value!.style.top.split('px')[0] + y - initY.value) + 'px'
        bigRef.value!.style.top = -(+pickRef.value!.style.top.split('px')[0] + y - initY.value) * (90 / nowWHValue) + 'px'
        smallRef.value!.style.top = -(+pickRef.value!.style.top.split('px')[0] + y - initY.value) * (60 / nowWHValue) + 'px'
        pickRef.value!.style.top = +pickRef.value!.style.top.split('px')[0] + y + 'px'
    }
    // pickRef.value!.style.backgroundPosition = `${x+Px}px ${x+Py}px`
    MouseX.value = e.clientX
    MouseY.value = e.clientY
}

const mouseDargUp = () => {
    window.removeEventListener('mousemove', mouseDargMoving)
    window.removeEventListener('mouseup', mouseDargUp)
}
const confirm = async () => {
    //保存
    const { destory } = Loading({
        loading:true,
        width:20,
        tra:20
    })
    const nowWHValue = +pickRef.value!.style.width.split('px')[0]
    let imgX = +pickRef.value!.style.left.split('px')[0] - initX.value
    let imgY = +pickRef.value!.style.top.split('px')[0] - initY.value
    if (imgX < 0) imgX = 0
    if (imgY < 0) imgY = 0
    const formData = new FormData()
    const file = base64ImgtoFile(url.value, 'imgFile')
    formData.append('imgFile', file)
    try {
        if(props.type == 'playList'){
            if(localStorage.getItem('NMcookie')){
                let result = await NM.reqUploadPlaylistPic(Main.playList[+index.value].id, formData, Math.ceil(nowWHValue / scale.value), Math.floor(imgX / scale.value), Math.floor(imgY / scale.value))
                Main.playList[index.value].coverImgUrl = result + `?t=${new Date().getTime()}`
            }else{
                let result = await Main.reqUploadPlaylistPic(Main.playList[+index.value].id, formData, Math.ceil(nowWHValue / scale.value), Math.floor(imgX / scale.value), Math.floor(imgY / scale.value))
                Main.playList[index.value].coverImgUrl = result
            }
        }else if(props.type == 'user'){
            if(localStorage.getItem('NMcookie')){
                let result = await NM.reqUploadAvatar(formData, Math.ceil(nowWHValue / scale.value), Math.floor(imgX / scale.value), Math.floor(imgY / scale.value))
                if(result.length != 0){
                    BasicApi.profile!.avatarUrl = result
                    for(let i=0;i<=Main.createPlay;i++){
                        Main.playList[i].creator.avatarUrl = result
                    }
                }
            }else{
                let result = await Main.reqUploadAvatar(formData, Math.ceil(nowWHValue / scale.value), Math.floor(imgX / scale.value), Math.floor(imgY / scale.value))
                if(result.length != 0)BasicApi.profile!.avatarUrl = result + `?t=${new Date().getTime()}`
            }
        }
        picFlag.value = false
        destory()
        Loading({
            message: '保存成功',
            showTime: 1000
        })
    } catch (error) {
        destory()
        Loading({
            type: 'error',
            message: '保存失败',
            showTime: 1000
        })
    }

}
const cancel = () => {
    openPic()
}
const closeDialog = (done: () => void) => {
    done()
    picFlag.value = false
}
function base64ImgtoFile(dataurl, filename = 'file') {
    let arr = dataurl.split(',')
    let mime = arr[0].match(/:(.*?);/)[1]
    let bstr = atob(arr[1])
    let n = bstr.length
    let u8arr = new Uint8Array(n)
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n)
    }
    return new File([u8arr], `${filename}.jpg`, {
        type: mime
    })
}
</script>
  
<style scoped lang="less">
.editPlayList {
    .title {
        // width: 93%;
        margin: 0 auto;
        margin-top: 20px;
        margin-left: 30px;
        display: flex;
        align-items: center;
        user-select: none;
        font-size: 18px;
        font-weight: bolder;
        margin-bottom: 20px;
    }

    .main {
        display: flex;

         :deep(.el-form-item) {
            margin-bottom: 5px;

            &>:first-child {
                color: @font-color;
            }
            & .tips {
                display: flex;
                width: auto;
                align-items: center;

                .tip {
                    width: 40px;
                    height: 20px;
                    border: 1px solid @border-color;
                    font-size: 12px;
                    color: @small-font-color;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    border-radius: 2em;
                    margin-right: 10px;
                    background-color: @left-click-color;
                    user-select: none;
                }

                .add {
                    user-select: none;
                    color: @url-color;
                    font-size: 13px;
                    cursor: pointer;

                    &:hover {
                        color: @url-color-hover;
                    }
                }
            }

            & .input-bk {
                width: 400px;
                & .el-input{
                    height: 30px;
                    font-size: 12px;
                    margin-bottom: 10px;
                    --el-input-focus-border-color: @border-color;
                    --el-input-bg-color: @left-click-color;
                    --el-input-border-color: @border-color;
                    --el-input-hover-border-color: @border-color;

                    & input {
                        color: @font-color !important;
                    }

                    & input::placeholder {
                        color: @small-font-color !important;
                    }
                }
            }

            & .text-bk {
                width: 400px;
                margin-right: 30px;
                position: relative;

                & .el-textarea {
                    --el-input-hover-border-color: none;
                    --el-input-focus-border-color: none;
                    width: 100%;
                    font-size: 12px;
                    border: 1px solid @commit-block-border-color;
                    border-radius: 0.3em;
                    background-color: @commit-block-color;
                    padding-bottom: 5px;
                    padding-top: 5px;

                    & .el-textarea__inner {
                        background-color: @commit-block-color;
                        box-shadow: none;
                        color: @font-color;
                        padding-bottom: 5px;
                        padding-top: 5px;
                        padding-right: 15px;

                        &::-webkit-scrollbar {
                            height: 80%;
                        }

                        &::-webkit-scrollbar-button {
                            display: none;
                        }

                        &::-webkit-scrollbar {
                            width: 7px;
                            height: 90%;
                            background-color: @commit-block-scroll-line;
                        }

                        &::-webkit-scrollbar-thumb {
                            border-radius: 0.4em;
                            background: @commit-block-scroll-button;
                        }
                    }
                }

                & .limit {
                    font-size: 12px;
                    user-select: none;
                    position: absolute;
                    right: 10px;
                    bottom: 0;
                    color: @small-font-color;
                }
            }

            & .ptns{
                display: flex;
                margin-top: 20px;

                >div {
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    user-select: none;
                    border-radius: 2em;
                    cursor: pointer;
                    margin-right: 20px;
                }

                &>:first-child {
                    width: 80px;
                    height: 30px;
                    background-color: @primary-color;

                    &:hover {
                        background-color: @play-all-button-hover;
                    }
                }

                &>:last-child {
                    width: 80px;
                    height: 30px;
                    border: 1px solid @border-color;

                    &:hover {
                        background-color: @left-click-color;
                    }
                }
            }
            & .el-radio-group{
                label {
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
            & .dropdownList{
                display: flex;
            }
        }

        .img {
            display: flex;
            align-items: center;
            margin-left: 20px;
            flex-direction: column;

            :deep(.el-image) {
                border-radius: .2em;
            }

            >.btns {
                width: 100px;
                height: 30px;
                display: flex;
                justify-content: center;
                align-items: center;
                border: 1px solid @border-color;
                border-radius: 2em;
                margin-top: 20px;
                user-select: none;
                cursor: pointer;
            }
        }
    }
}

.img-pick {
    display: flex;
    justify-content: center;
    align-items: center;
    user-select: none;

    .left {
        .bk {
            height: 235px;
            width: 235px;
            background-color: @pick-bk-color;
            border-radius: .2em;
            border: 1px solid black;
            // transform: scale();
        }

        .img {
            width: 100%;
            height: 100%;
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
            position: relative;
            z-index: 0;

            .pick {
                position: absolute;
                box-sizing: border-box;
                border: 1px dotted #00ff00;
                z-index: 2;
                background-origin: border-box;
                background-repeat: no-repeat;
                cursor: move;

                .point {
                    background-origin: border-box;
                    height: 6px;
                    width: 5px;
                    position: absolute;
                    background-color: black;
                    z-index: 3;
                    right: -3px;
                    bottom: -4px;
                    cursor: nw-resize;
                }
            }

            .model {
                position: absolute;
                background-color: rgba(0, 0, 0, .4);
                box-sizing: border-box;
                z-index: 1;
            }

        }
    }

    .right {
        display: flex;
        flex-direction: column;
        margin-left: 30px;

        .top {
            height: 130px;
            width: 110px;
            display: flex;
            flex-direction: column;
            margin-bottom: 10px;

            .bk {
                height: 90px;
                width: 90px;
                overflow: hidden;
                border-radius: .2em;
                aspect-ratio: auto;
                position: relative;

                img {
                    position: absolute;
                }
            }

            .txt {
                height: 40px;
                width: 100%;
                display: flex;
                align-items: center;
            }
        }

        .bottom {
            height: 100px;
            width: 80px;
            display: flex;
            flex-direction: column;

            .bk {
                height: 60px;
                width: 60px;
                overflow: hidden;
                border-radius: .2em;
                aspect-ratio: auto;
                position: relative;

                img {
                    position: absolute;
                }
            }

            .txt {
                height: 40px;
                width: 100%;
                display: flex;
                align-items: center;
            }
        }
    }
}
</style>
  <!--90 60 235  -->