<template>
    <div class="whoStart">
        <div class="list" ref="listRef" v-if="list.length != 0">
            <messageCard v-for="val in list" 
            :name="val.nickname"
            :id="val.userId"
            :des="val.signature"
            :src="val.avatarUrl"
            type="other"
            ></messageCard>
        </div>
        <div class="g" v-else>
            <span>暂无收藏者</span>
        </div>
    </div>
</template>

<script setup lang="ts">
  import messageCard from '@renderer/components/myVC/messageCard.vue';
  import {ref ,nextTick,onMounted, watch} from 'vue'
  import { useMain,useNM } from '@renderer/store';
  import { useRoute } from 'vue-router';
  const $route = useRoute()
  const Main = useMain();
  let list = ref(new Array())
  let more = ref(true)
  const NM = useNM()
  const listRef = ref<(InstanceType<typeof HTMLElement>)>()
  const limit = ref(20)
  const offset = ref(0)
  const id = ref(+$route.query.id!)
  const time = ref(0)
  const load = async()=>{
    if(more.value){
      let result
      if($route.query.nm == 'true'){
        result = await NM.reqPlaylistSubscribers(id.value,limit.value,offset.value)
      }else{
        if($route.query.type == '播客'){
          result = await Main.reqdjsuber(id.value,limit.value,time.value)
          time.value = result.time
        }else{
          result = await Main.reqPlaylistSubscribers(id.value,limit.value,offset.value)
        }
      }
      console.log(result);
      offset.value+=limit.value
      more.value = result.more
      let lists = result.list ?? result.subscribers as Array<any>
      list.value.push(...lists)
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
  watch(()=>$route.name,async()=>{
    console.log($route.name,id.value ,+$route.query.id!);
    if($route.name == 'whoStartPlaylist' && id.value != +$route.query.id!){
        id.value = +$route.query.id!
        offset.value = 0
        more.value = true
        list.value = []
        await load()
    }
  })

</script>

<style lang="less" scoped>
.whoStart{
    width: 100%;
    justify-content: center;
    align-items: center;
    display: flex;
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
    .g{
        user-select: none;
        height: 100px;
        display: flex;
        justify-content: center;
        align-items: center;
        width: 100%;
    }
}


</style>