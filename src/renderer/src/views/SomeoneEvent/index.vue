<template>
  <div class="events">
    <div class="title">{{$route.query.name}}的动态</div>
    <div class="list" ref="listRef">
        <eventBlock v-for="item,index in otherList" 
        :val="list[index]" 
        :pics="item.pics"
        :type="item.type"
        :user="item.user"
        :time="item.showTime"
        :info="item.info"
        :threadId="item.threadId"
        :id="item.id"
        :key="item.id"
        ></eventBlock>
    </div>
  </div>
</template>

<script setup lang="ts">
import {nextTick, onActivated, onMounted, ref} from 'vue'
import { useRoute } from 'vue-router';
import { useMain,useNM } from '@renderer/store';
const Main = useMain();
const $route = useRoute();
const NM = useNM()
let list = ref(new Array())
let otherList = ref(new Array())
let more = ref(true)
const lasttime = ref(undefined)
const listRef = ref<(InstanceType<typeof HTMLElement>)>()
const load = async()=>{
    if(more.value){
        let result
        if(localStorage.getItem('NMcookie')){
            result = await NM.requserEvents(+$route.query.id!,lasttime.value)
        }else{
            result = await Main.requserEvents(+$route.query.id!,lasttime.value)
        }
        let event = result.events as Array<any>
        event.sort((a,b)=>{
            return b.showTime - a.showTime;
        })
        event.forEach((item,index)=>{
            list.value.push(JSON.parse(item.json))
            delete event[index].json
        })
        otherList.value.push(...event)
        more.value = result.more
        lasttime.value = result.lasttime
        observer.disconnect()
        nextTick(()=>{
            // 获取所有子元素
            const children = listRef.value!.querySelectorAll('.eventBlock')
            console.log(children);
            // 获取子元素数量
            const length = children.length;
            // 获取最后一个子元素
            const lastChild = children[length - 1];
            observer.observe(lastChild)
        })
    }
}
const observer = new IntersectionObserver(async(entries) => {
    console.log(entries);
    if (entries[0].isIntersecting) {
        console.log('元素已经出现在视口中');
        await load()
    } else {
        console.log('元素还未出现在视口中');
    }
});
onMounted(async()=>{
   await load()
})

</script>

<style scoped lang="less">
.events {
    width: 95%;
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
    margin: 30px 0px 30px 40px;
    .title{
        width: 100%;
        height: 60px;
        font-size: 20px;
        font-weight: bold;
        color: @font-color;
        user-select: none;
    }
    .list{
        width: 95%;
    }
}
</style>