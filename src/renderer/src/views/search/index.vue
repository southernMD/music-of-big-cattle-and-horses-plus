<template>
  <div class="search">
    <div class="search-key">搜索 {{ $route.query.key }}</div>
    <div class="router-change">
      <div class="tags-list">
        <Tag v-for="val, index in TagList" :message="val" :if-click="false" :big="true" :name="TagName[index]"
          @click="goSearch(TagName[index])"></Tag>
      </div>
      <div class="number">找到{{ Main.searchNumber }}首{{ TagList[TagName.indexOf($route.name as string)] }}</div>
    </div>
    <RouterView></RouterView>
  </div>
</template>

<script setup lang="ts">
import { } from 'vue'
import Tag from '@renderer/components/myVC/Tag.vue'
import { useRoute, useRouter, RouteParamsRaw } from 'vue-router';
import { useMain } from '@renderer/store';
// const TagList = ['单曲','歌手','专辑','歌单','歌词','播客','声音','用户']
const TagList = ['单曲', '歌手', '专辑', '歌单', '歌词', '用户']
const TagName = ['1', '100', '10', '1000', '1006', '1002']
//1: 单曲, 10: 专辑, 100: 歌手, 1000: 歌单, 1002: 用户, 1006: 歌词, 1009: 电台, 1014: 视频, 1018:综合, 2000:声音
const $router = useRouter()
const $route = useRoute()
const Main = useMain()
const goSearch = (type: string) => {
  $router.push({
    name: type,
    query: {
      key: $route.query.key
    }
  })
}
</script>

<style scoped lang="less">
.search {
  // margin: 30px;
  font-size: 18px;

  .search-key {
    font-weight: bolder;
    margin: 30px;
  }

  .router-change {
    margin: 30px;
    display: flex;
    flex-direction: row;
    justify-content: space-between;

    .tags-list {
      display: flex;
      flex-direction: row;

      :first-child {
        margin-left: 0;
      }

      >div {
        margin-right: 20px;
      }
    }

    .number {
      font-size: 12px;
      color: @small-font-color;
    }
  }
}


</style>