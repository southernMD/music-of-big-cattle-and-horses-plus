<template>
    <div class="smallBlock" ref="smallBlock" @click.stop>
        <ul id="level-list" v-if="ifLevel">
            <li class="li" :data-index="index" v-for="(valueIndex, index) in maxHaveIndex" @click="changeLeve">
                <i class="iconfont icon-big-gou" v-show="clickLeve == index"></i>
                <span class="vip" v-show="index > maxLevelIndex">
                    <span class="txt">VIP</span>
                </span>
                <span class="cn" :class="{active: clickLeve == index}">{{ levelArrayName[index] }}</span>
            </li>
        </ul>
        <ul v-else class="speed">
            <li class="speed-li" v-for="(valueIndex,index) in 6">
                <span @click="changeSpeed(index)" :class="{active: speedPowerIndex == index}">{{speedList[index]}}</span>
                <i class="iconfont icon-big-gou" v-show="speedPowerIndex == index"></i>
            </li>
        </ul>
        <div class="snajiao"></div>
    </div>
</template>

<script lang="ts" setup>
import { onMounted, getCurrentInstance, ComponentInternalInstance, ref } from 'vue';
import useClickElsewhereToClose from '@renderer/hooks/useClickElsewhereToClose'
const $el = getCurrentInstance() as ComponentInternalInstance
const levelArray = ['standard', 'exhigh', 'lossless', 'hires'];
const levelArrayName = ['标准音质', '极高音质', '无损音质', 'Hi-Res音质'];
const speedList = ['2x','1.5x','1.25x','1x','0.75x','0.5x']
// const levelArray = new Map([['standard','标准音质'],['exhigh','极高音质'],['lossless','无损音质'],['hires','Hi-Res音质']])

defineProps<{
    width?: number,
    height?: number
    ifLevel?: boolean,
    maxLevel?: string,   //最大可用
    maxHave?: string,    //该音乐最高音质
    nowLevel?: string,   //选择的音质
    id: number,           //音乐id
    speedPower?:string   //加速倍率
}>()
let maxLevelIndex = ref(levelArray.indexOf($el.props.maxLevel as string))
let maxHaveIndex = ref(levelArray.indexOf($el.props.maxHave as string) + 1)
let clickLeve = ref(levelArray.indexOf($el.props.nowLevel as string))

if($el.props.maxLevel == 'higher') maxLevelIndex.value = 0
if($el.props.maxHave == 'higher') maxHaveIndex.value = 1
console.log($el.props.maxLevel);
console.log($el.props.maxHave);


function searchFather(d: HTMLElement): HTMLElement {
    if (d.classList.contains('li')) {
        return d;
    } else {
        d = d.parentNode as HTMLElement
        return searchFather(d);
    }
}

const $emit = defineEmits(['show', 'close'])
const changeLeve = (e: MouseEvent) => {
    console.log(e.target);
    let dom = e.target as HTMLElement
    let clickLi = searchFather(dom)
    if (Number(clickLi.getAttribute('data-index')) <= maxLevelIndex.value) {
        clickLeve.value = Number(clickLi.getAttribute('data-index'))
        $emit('show', levelArrayName[clickLeve.value].substring(0, levelArrayName[clickLeve.value].length - 2), levelArray[clickLeve.value])
        $emit('close')
    } else {
        ElMessage({
            type: 'error',
            message: 'vip暂不可用',
            duration: 1000
        })
    }

}

onMounted(() => {
    let dom = $el.refs.smallBlock as HTMLElement
    if ($el.props.width) {
        dom.style.width = $el.props.width + 'px'
    }
    if ($el.props.height) {
        dom.style.height = $el.props.height + 'px'
    }
    let father = dom?.parentNode as HTMLElement
    father.style.position = 'relative'
    let left = -(dom.offsetWidth / 2 - father.offsetWidth / 2)
    dom.style.left = left + 'px'
    dom.style.top = - dom.offsetHeight + -15 + 'px'

})

//加速
let speedPowerIndex = ref(speedList.indexOf($el.props.speedPower as string))
const changeSpeed = (index:number)=>{
    speedPowerIndex.value = index
    $emit('show',speedList[index])
    $emit('close')
}

//点击其他处关闭当前
let deleteDilog: any;
if ($el.props.ifLevel) {
    useClickElsewhereToClose(deleteDilog, $emit, 'playLevel');
} else {
    useClickElsewhereToClose(deleteDilog, $emit, 'playSpeed');
}

</script>

<style lang="less" scoped>
    .active{
        color: @font-color !important;
    }
.smallBlock {
    cursor: default;
    width: 180px;
    min-height: 40px;
    height: auto;
    border-radius: 0.5em;
    background-color: @mainban-bk-color;
    box-shadow: @shadow;
    position: absolute;
    top: 0px;
    z-index: 10;
    ul {
        margin: 10px 10px;

        li {
            display: block;
            margin: 5px auto;
            width: 80%;
            height: 20px;
            display: flex;
            align-items: center;
            cursor: pointer;
            position: relative;

            .cn {
                position: absolute;
                top: 3px;
                right: 10px;
                color: @small-font-color;
                &:hover{
                    color:@font-color;
                }
            }
            >* {
                margin: 0px 5px;
            }

            >i {
                transform: translate(-5px, -3px);
                color: @small-font-red;
                position: absolute;
                left: 0px;
            }

            .vip {
                height: 10px;
                width: 19px;
                border: 1px solid rgb(209, 84, 0);
                display: flex;
                position: absolute;
                justify-content: center;
                align-items: center;
                left: 25px;

                &>.txt {
                    color: rgb(209, 84, 0);
                    font-size: 9px;
                    font-weight: bolder;
                }
            }
        }

        li:nth-child(4) {
            >.cn {
                transform: translateX(13px);
            }
        }

        .speed-li {
            cursor: default;
            position: relative;
            display: flex;
            align-items: center;
            justify-content: center;
            &>span{
                cursor: pointer;
                color: @small-font-color;
                &:hover{
                    color:  @font-color;
                }
            }
            >i{
                position: absolute; 
                left: 57px;
                top: 5px;
            }
        }
    }

    .snajiao {
        border-right: 7px solid rgba(0, 0, 0, 0);
        border-top: 7px solid @mainban-bk-color;
        border-bottom: 7px solid rgba(0, 0, 0, 0);
        border-left: 7px solid rgba(0, 0, 0, 0);
        width: 0px;
        height: 0px;
        position: absolute;
        bottom: -14px;
        left: 0;
        right: 0;
        margin: 0 auto;
    }
}
</style>