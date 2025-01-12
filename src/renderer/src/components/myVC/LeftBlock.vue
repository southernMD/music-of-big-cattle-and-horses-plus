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
        dragMouseStyleAdd:MainPinia.dragMouse && id != undefined && index!=undefined && index <= MainPinia.createPlay && MainPinia.dragType.startsWith('song'),
        noDrag:!MainPinia.dragMouse ,
        dragMouseStyleCan:MainPinia.dragMouse && MainPinia.dragType.startsWith('playList') && name == undefined && index != undefined && 
        MainPinia.dragIndex != index && index != 0 && MainPinia.dragIndex != 0 &&
        (MainPinia.dragIndex <= MainPinia.createPlay? index <=MainPinia.createPlay: index >MainPinia.createPlay) && MainPinia.dragIndex != 0
        ,
        topColor:topColorFlag && MainPinia.dragIndex != 0,
        bottomColor:bottomColorFlag && MainPinia.dragIndex != 0,
        'left-block-oneself':globalVar.oneself == 1
        }" @click="go" @mousedown="movePlayListBegin"
        @mouseover="overMouse" @mouseout="outMouse"
        >
        <slot></slot>
        <div>{{ message }}</div>
        <slot name="jump"></slot>
    </div>
</template>

<script lang="ts" setup>
import LoadingPageImper from '@renderer/ImperativeComponents/LoadingPage';
import { useMain,useGlobalVar, useBasicApi,useNM } from '@renderer/store'
import { toRef, watch, ref, getCurrentInstance,ComponentInternalInstance } from 'vue';
// import $route from '@/router'
import { useRouter,useRoute } from 'vue-router';
const $router = useRouter();
const $route = useRoute();
const MainPinia = useMain();
const globalVar = useGlobalVar();
const BasicApi = useBasicApi()
const NM = useNM()
const props = defineProps<{
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
    && props.name == undefined && props.index != 0 && MainPinia.dragIndex != props.index
    && (MainPinia.dragIndex <= MainPinia.createPlay? Number(props.index) <=MainPinia.createPlay: Number(props.index) >MainPinia.createPlay)
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
    if(Number(props.index) <= MainPinia.createPlay){
        MainPinia.dragMouse = true
        MainPinia.dragType = 'playListMy'
        MainPinia.dragIndex = Number(props.index)
        MainPinia.pageY = e.pageY
        MainPinia.dragMessage = props.message as string
        dragId.value = props.id as number
    }else{
        MainPinia.dragMouse = true
        MainPinia.dragType = 'playList'
        MainPinia.dragIndex = Number(props.index)
        MainPinia.pageY = e.pageY
        MainPinia.dragMessage = props.message as string
        dragId.value = props.id as number
    }
}

const moveingPlayListEnd = async()=>{
    MainPinia.dragMouse = false
    window.removeEventListener('mouseup',moveingPlayListEnd)
    window.removeEventListener('mousemove',moveingPlayList)
    let dom = document.querySelector('.topColor')
    if(!dom) dom = document.querySelector('.bottomColor')
    if(dom){
        const copyPlayList = Array.from(MainPinia.playList)
        let addInde = Number(dom.getAttribute('data-index'))
        let del = MainPinia.playListId.splice(MainPinia.dragIndex,1)
        MainPinia.playListId.splice(addInde,0,del[0])
        del = copyPlayList.splice(MainPinia.dragIndex,1)
        copyPlayList.splice(addInde,0,del[0])
        globalVar.loadDefault = true
        if(!localStorage.getItem('NMcookie')){
            await MainPinia.reqPlaylistOrderUpdate(MainPinia.playListId as [number])
        }else{
            await NM.reqPlaylistOrderUpdate(MainPinia.playListId as [number])
        }
        globalVar.loadDefault = false
        MainPinia.playList = copyPlayList
        //你现在浏览的是要拖动的        
        if($route.query.id == del[0].id){
            $router.push({
                name:'songPlaylist',
                query:{
                    id:del[0].id,
                    index:addInde as number,
                    my:MainPinia.playList[props.index!].creator.userId 
                    == BasicApi.profile!.userId?'true':'false',
                    type:'歌单'
                }
            })
        }
    }
    
    dragId.value = -1
}

const movePlayListBegin = (e:MouseEvent)=>{
    if(e.button !== 0)return
    window.addEventListener('mousemove',moveingPlayList)
    window.addEventListener("mouseup",moveingPlayListEnd)
}

let clickFlag = ref(false)
const go = async () => {
    console.log('触发go事件');
    console.log(props.name,'&^$&*%^(*&)*(&*&*^&%&*())');
    clickFlag.value = true;
    if(!localStorage.getItem('cookieUser') && !localStorage.getItem('NMcookie') && !props.name ){
        LoadingPageImper()
    }
    if(props.id){
        let id = props.id as number
        let query = {
            id,
            index:props.index as number,
            my:MainPinia.playList[props.index!].creator.userId 
            == BasicApi.profile!.userId?'true':'false',
            type:'歌单',
        }
        if(localStorage.getItem('NMcookie')){
            query = Object.assign(query,{nm:'true'})
        }
        $router.push({
            name:'songPlaylist',
            query
        })
        console.log(props.index);
        
        if(Number(props.index) <= MainPinia.createPlay) MainPinia.isMyCreate = true
        else MainPinia.isMyCreate = false
    }else if(props.name){
        if(props.name == 'findMusic'){
            $router.push({
                path:`/app/${props.name}/find1`,
                query:{
                    name:`${props.name}`
                }
            })
        }else if(props.name == 'follow' && BasicApi.profile == null){
            LoadingPageImper()
        }else{
            $router.push({
                name:`${props.name}`,
                query:{
                    name:`${props.name}`
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