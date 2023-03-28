<template>
    <div class="left-block" :data-id="id" :data-index="index" :class="{
        changeBk:
        ($route.query.index as unknown as number == index && index !=undefined)  
        || ($route.query.name as unknown as string == name && name !=undefined)
        || (name !=undefined && $route.fullPath?.includes(name) ),
        'changeBk-oneself':
        (($route.query.index as unknown as number == index && index !=undefined)  
        || ($route.query.name as unknown as string == name && name !=undefined)
        || (name !=undefined && $route.fullPath?.includes(name) ) ) && globalVar.oneself == 1
        ,big:big == true && name !=undefined && ($route.query.name as unknown as string == name || $route.fullPath?.includes(name) ),
        dragMouseStyleAdd:MainPinia.dragMouse && id != undefined && index!=undefined && index <= MainPinia.createPlay && MainPinia.dragType == 'songMy' ,
        noDrag:!MainPinia.dragMouse ,
        dragMouseStyleCan:MainPinia.dragMouse && MainPinia.dragType.startsWith('playList') && name == undefined && index != undefined && 
        MainPinia.dragIndex != index && index != 0 && MainPinia.dragIndex != 0 &&
        (MainPinia.dragIndex <= MainPinia.createPlay? index <=MainPinia.createPlay: index >MainPinia.createPlay) && MainPinia.dragIndex != 0
        ,
        topColor:topColorFlag && MainPinia.dragIndex != 0,
        bottomColor:bottomColorFlag && MainPinia.dragIndex != 0,
        'left-block-oneself':globalVar.oneself == 1
        }" @click="go" @mousedown="movePlayListBegin"
        @mousemove="overMouse" @mouseout="outMouse"
        >
        <slot></slot>
        <div>{{ message }}</div>
        <slot name="jump"></slot>
        <Teleport to="body">
            <Loading :loading="true" v-if="replaceLoading" width="20" tra="10"></Loading>
        </Teleport>
    </div>
</template>

<script lang="ts" setup>
import { useMain,useGlobalVar } from '@renderer/store'
import { toRef, watch, ref, getCurrentInstance,ComponentInternalInstance } from 'vue';
// import $route from '@/router'
import { useRouter,useRoute } from 'vue-router';
const $router = useRouter();
const $route = useRoute();
const MainPinia = useMain();
const globalVar = useGlobalVar();
const $el = getCurrentInstance() as ComponentInternalInstance;
defineProps<{
    message: string   //标题信息
    big:boolean         //点击是否放大
    privacy?:number     //0 或 10 10为隐私歌单
    id?:number          //歌单id
    index?:number,       //下标
    name?:string        //路由名用于跳转样式
}>()
// const $emit = defineEmits([''])
// $emit('click')

let dragId = ref(-1)
let topColorFlag = ref(false)
let bottomColorFlag = ref(false)

const overMouse = (e:MouseEvent)=>{
    if(MainPinia.dragMouse == true && MainPinia.dragType.startsWith('playList') 
    && $el.props.name == undefined && $el.props.index != 0 && MainPinia.dragIndex != $el.props.index
    && (MainPinia.dragIndex <= MainPinia.createPlay? Number($el.props.index) <=MainPinia.createPlay: Number($el.props.index) >MainPinia.createPlay)
    ){
        if(e.offsetY >=20){
        bottomColorFlag.value = true
            topColorFlag.value = false
        }else{
            topColorFlag.value = true
            bottomColorFlag.value = false
        }
    }

}

const outMouse = (e:MouseEvent)=>{
    topColorFlag.value = false
    bottomColorFlag.value = false
}

const moveingPlayList = (e:MouseEvent)=>{
    if(Number($el.props.index) <= MainPinia.createPlay){
        MainPinia.dragMouse = true
        MainPinia.dragType = 'playListMy'
        MainPinia.dragIndex = Number($el.props.index)
        MainPinia.pageY = e.pageY
        MainPinia.dragMessage = $el.props.message as string
        dragId.value = $el.props.id as number
    }else{
        MainPinia.dragMouse = true
        MainPinia.dragType = 'playList'
        MainPinia.dragIndex = Number($el.props.index)
        MainPinia.pageY = e.pageY
        MainPinia.dragMessage = $el.props.message as string
        dragId.value = $el.props.id as number
    }
}

let replaceLoading = ref(false)
const moveingPlayListEnd = async()=>{
    let dom = document.querySelector('.topColor')
    if(!dom) dom = document.querySelector('.bottomColor')
    if(dom){
        let addInde = Number(dom.getAttribute('data-index'))
        let del = MainPinia.playListId.splice(MainPinia.dragIndex,1)
        MainPinia.playListId.splice(addInde,0,del[0])
        del = MainPinia.playList.splice(MainPinia.dragIndex,1)
        MainPinia.playList.splice(addInde,0,del[0])
        replaceLoading.value = true
        await MainPinia.reqPlaylistOrderUpdate(MainPinia.playListId as [number])
        replaceLoading.value = false
        go()
    }
    
    MainPinia.dragMouse = false
    dragId.value = -1
    window.removeEventListener('mouseup',moveingPlayListEnd)
    window.removeEventListener('mousemove',moveingPlayList)
}

const movePlayListBegin = ()=>{
    window.addEventListener('mousemove',moveingPlayList)
    window.addEventListener("mouseup",moveingPlayListEnd)
}

let clickFlag = ref(false)
const go = async () => {
    console.log('触发go事件');
    console.log($el.props.name,'&^$&*%^(*&)*(&*&*^&%&*())');
    clickFlag.value = true;
    if(!localStorage.getItem('cookieUser') && !$el.props.name){
        globalVar.flagLogin = true
    }
    if($el.props.id){
        let id = $el.props.id as number
        $router.push({
            name:'songPlaylist',
            query:{
                id,index:$el.props.index as number,my:'true'
            }
        })
        console.log($el.props.index);
        
        if(Number($el.props.index) <= MainPinia.createPlay) MainPinia.isMyCreate = true
        else MainPinia.isMyCreate = false
    }else if($el.props.name){
        if($el.props.name == 'findMusic'){
            $router.push({
                path:`/app/${$el.props.name}/find1`,
                query:{
                    name:`${$el.props.name}`
                }
            })
        }else{
            $router.push({
                name:`${$el.props.name}`,
                query:{
                    name:`${$el.props.name}`
                }
            })
        }

    }

}
</script>

<style lang="less" scoped>
.dragMouseStyleCan{
    cursor: url('@renderer/assets/point.png'),auto;
    div,span{
        cursor: url('@renderer/assets/point.png'),auto;
    }
}
.dragMouseStyleMyself{
    cursor: url('@renderer/assets/stop.png'),auto;
    div,span{
        cursor: url('@renderer/assets/stop.png'),auto;
    }
}
.noDrag{
    cursor: pointer;
}
.dragMouseStyleAdd{
    cursor: url('@renderer/assets/add.png'),pointer;
}
.noDrag{
    cursor: pointer;
}

.changeBk{
    background-color:@left-click-color
    // color: red;
}
.changeBk-oneself{
    background-color:@leftClickColorOneself;
    // color: red;
}
.big{
    font-size: 18px !important;
    font-weight: bold;
}
.topColor{
    position: relative;
    &::before{
        content: '';
        width: 105%;
        height: 2px;
        background-color: @primary-color;
        position: absolute;
        top: 0;
        left: -10px;
    }
}
.bottomColor{
    position: relative;
    &::after{
        content: '';
        width: 105%;
        height: 2px;
        background-color: @primary-color;
        position: absolute;
        left: -10px;
        top: 40px;
    }
}
.left-block {
    width: 180px;
    height: 40px;
    display: flex;
    font-size: 14px;
    align-items: center;


    div {
        display: inline-block;
        padding-left: 7px;
        font-weight: inherit;
        font-size: inherit;
        width: 125px;
        white-space:nowrap;
        overflow: hidden; 
        text-overflow: ellipsis;
        line-height: 40px;
        height: 40px;
        user-select: none;
    }

    &:hover {
        background-color: @left-click-color !important;
    }
}
.left-block-oneself{
    &:hover{
        background-color:  @leftClickColorOneself!important;
    }
}

</style>