<template>
    <div class="SomeoneLike">
      <div class="title">{{ $route.query.name }}的粉丝</div>
      <div class="list" ref="listRef">
        <messageCard v-for="val in list" 
        :name="val.nickname"
        :id="val.userId"
        :fans="val.followeds"
        :playlistnum="val.playlistCount"
        :followed="val.followed"
        :des="val.signature"
        :src="val.avatarUrl"
        type="fan"
        ></messageCard>
      </div>
  
    </div>
  </template>
  
  <script setup lang="ts">
  import messageCard from '@renderer/components/myVC/messageCard.vue';
  import {ref ,nextTick,onMounted} from 'vue'
  import { useMain } from '@renderer/store';
  import { useRoute } from 'vue-router';
  const $route = useRoute()
  const Main = useMain();
  let list = ref(new Array())
  let more = ref(true)
  const listRef = ref<(InstanceType<typeof HTMLElement>)>()
  const limit = ref(30)
  const offset = ref(0)
  const load = async()=>{
    if(more.value){
      let result = await Main.requserFolloweds(+$route.query.id!,limit.value,offset.value)
      offset.value+=limit.value
      let follows = result.followeds as Array<any>
      list.value.push(...follows)
      observer.disconnect()
      nextTick(()=>{
          // 获取所有子元素
          const children = listRef.value!.querySelectorAll('.card')
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
  .SomeoneLike {
    height: auto;
    display: flex;
    flex-direction: column;
    justify-content: center;
  
    .title {
      padding: 20px;
      padding-bottom: 0;
      height: 40px;
      font-size: 20px;
      font-weight: bold;
      color: @font-color;
      user-select: none;
    }
  
    .list {
      width: 100%;
      margin: 0 auto;
      display: flex;
      justify-content: space-around;
      flex-wrap: wrap;
      align-items: self-start;
      display: grid;
      grid-template-columns: repeat(auto-fill, 350px);
      >div:last-child {
        margin-right: auto;
      }
    }
  }</style>