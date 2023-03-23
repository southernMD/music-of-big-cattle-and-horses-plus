<template>
    <div class="tag" ref="tag" :class="{
        noDrag:!Main.dragMouse,
        active:ifClick || $route.name == name,
        disActive:!ifClick || $route.name != name,
        big:(ifClick || $route.name == name) && big,
        'tag-oneself':oneself && globalVar.oneself
    }">
        <span  class="message" ref="message">{{message}}</span>
        <div class="line" ref="line"></div>
    </div>
</template>

<script lang="ts" setup>
import { getCurrentInstance, onMounted,ComponentInternalInstance,ref, toRef, watch,nextTick } from 'vue';
import {useMainMenu,useMain,useGlobalVar} from '@renderer/store'
import {useRouter,useRoute} from 'vue-router'
// const $router = useRouter()
const $route = useRoute()
const MainMenu = useMainMenu();
const globalVar = useGlobalVar();
const Main = useMain();
const $el:ComponentInternalInstance = getCurrentInstance() as ComponentInternalInstance
defineProps<{
    message:string
    big?:boolean
    ifClick:boolean
    size?:number
    name?:string
    oneself?:number
}
>()
onMounted(()=>{
    nextTick(()=>{
        if($el.props.size){
            let dom = $el.refs.message as HTMLElement
            console.log(dom);
            dom.style.fontSize = Number($el.props.size) + 'px'
        }
    })
})

// let color = toRef(MainMenu,'primaryColor')
// watch(color,(newValue)=>{
//     let doms:any
//     doms = document.querySelectorAll('.line') 
//     doms.forEach((element:HTMLElement) => {
//         if(element.style.backgroundColor !== 'rgba(0, 0, 0, 0)' && element.style.backgroundColor !== ''){
//             element.style.backgroundColor = newValue
//         }
//     });
// })

// onMounted(()=>{
//     if($el.props.ifClick){
//         let dom = $el.refs.tag as HTMLElement
//         let arr:HTMLElement[] = dom.children as unknown as HTMLElement[]
//         arr[0].style.fontWeight = 'bolder' 
//         arr[1].style.backgroundColor = color.value
//     }
// })


// const $emit = defineEmits(['jump'])
// const scale = (e:any)=>{
//     let dom:HTMLElement = $el.refs.tag as HTMLElement
//     let list = dom.parentNode;
//     let arr:any = list?.children
//     console.log(arr,'&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&&');
    
//     for(let i = 0 ;i<arr.length;i++){
//         arr[i].children[0].style.fontWeight = 'normal'
//         arr[i].children[0].style.fontSize = '14px'
//         arr[i].children[1].style.backgroundColor = 'rgba(0,0,0,0)'
//     }
//     dom.style.fontWeight = 'bolder' 
//     let line = $el.refs.line as HTMLElement
//     line.style.backgroundColor = color.value
//     if($el.props.big){
//         dom.style.fontSize = '20px' 
//     }
//     $emit('jump')
// }

</script>

<style lang="less" scoped>
    
.dragMouseStyleNo{
    cursor: url('@/assets/stop.png'),auto;
}
.noDrag{
    cursor: pointer;
}
    .disActive{
        >.message{
            font-weight: normal;
            font-size: 14px;
        }
        >.line{
            background-color:rgba(0,0,0,0) ;
        }
    }
    .active{
        >.message{
            font-weight: bolder;
            font-size: 14px;
        }
        >.line{
            background-color:@primary-color ;
        }
    }
    .big{
        >.message{
            font-weight: bolder;
            font-size: 20px !important;
        }
    }
    .tag{
        min-width: 40px;
        height: 30px;
        overflow: hidden;
        color: @font-color;
        display: flex;
        justify-content: center;
        align-items: center;
        flex-direction: column;
        font-size: 14px;
       

        :hover{
            color: @font-color-hover;
        }
        span{
            display: inline-block;
            order: 1;
            user-select: none;
        }
        .line{
            order: 2;
            height: 2px;
            width: 70%;
            margin: 0 auto;
            margin-top: 5px;
            font-size: inherit;
        }
    }
    .tag-oneself{
        :hover{
            color:rgb(255,255,255);
        }
    }
</style>