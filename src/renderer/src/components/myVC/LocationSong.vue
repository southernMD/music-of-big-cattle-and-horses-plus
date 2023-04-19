<template>
    <div class="locationSong" :class="{'shade-black':MainMenu.colorBlock == 'NMred'
    ,'shade-white':MainMenu.colorBlock == 'NMblack'}" @click="scroolToSong">
        <i class="iconfont icon-dingwei"></i>
    </div>
</template>

<script lang='ts' setup>
import { useMainMenu,useMain } from '@renderer/store';
const MainMenu = useMainMenu();
const Main = useMain();

const $emit = defineEmits(['scroolToSong'])
const scroolToSong = ()=>{
    if(!Main.heartJump){
        $emit('scroolToSong')
    }
}

</script>

<style lang='less' scoped>
.locationSong {
    position: fixed;
    right: 70px;
    bottom: 95px;
    height: 35px;
    width: 35px;
    border-radius: 50%;
    background-color: @radio-bk-color;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    i {
        color: @small-font-color;
        font-size: 25px;
    }
}

.shade-black {
    box-shadow: @shadow;
}

.shade-white {
    box-shadow: 0px 0px 5px rgba(255, 255, 255, .6);
}
</style>