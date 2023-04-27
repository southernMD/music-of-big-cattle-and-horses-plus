<template>
    <editorPage type="user"
    title="编辑个人信息"
    titleDialog="上传头像"
    imgTitle="修改头像"
    :imgUrl="BasicApi.profile?.avatarUrl"
    >
        <template #form>
            <el-form :model="form" label-width="120px">
                <el-form-item label="昵称：">
                    <div class="input-bk">
                        <el-input v-model="form.name" />
                    </div>
                </el-form-item>
                <el-form-item label="简介：">
                    <div class="text-bk">
                        <el-input :rows="5" type="textarea" resize="none" ref="text" v-model="form.description"
                            maxlength="300" spellcheck="false" />
                        <span class="limit">{{ 300 - form.description.length }}</span>
                    </div>
                </el-form-item>
                <el-form-item label="性别：">
                    <el-radio-group v-model="form.sex">
                        <el-radio :label="0" size="large">保密</el-radio>
                        <el-radio :label="1" size="large">男</el-radio>
                        <el-radio :label="2" size="large">女</el-radio>
                    </el-radio-group>
                </el-form-item>
                <el-form-item label="生日：">
                    <div class="dropdownList">
                        <dropDown  ref="dropDownYear" @change="getYear"  :list="yearList" :message="form.year + '年'" @qclick="del1"></dropDown>
                        <dropDown  ref="dropDownMonth" @change="getMonth" :list="monthList" :message="form.month + '月'" @qclick="del2"></dropDown>
                        <dropDown  ref="dropDownDay" @change="getDay" :list="dayList" :message="form.day + '日'" @qclick="del3"></dropDown>
                    </div>
                </el-form-item>
                <el-form-item label="地区：">
                    <div class="dropdownList">
                        <dropDown ref="dropDownPro" @change="getPro"  :list="provinceList" :message="provinceName" @qclick="del4"></dropDown>
                        <dropDown  ref="dropDownCity" @change="getCity"  :list="cityList" :message="cityName" @qclick="del5"></dropDown>
                    </div>
                </el-form-item>
                <el-form-item >
                    <div class="ptns">
                        <div @click="onSubmit">保存</div>
                        <div @click="back">取消</div>
                    </div>
                </el-form-item>
            </el-form>
        </template>
    </editorPage>
</template>

<script setup lang="ts">
import {Ref, reactive,ref,toRaw,watch} from 'vue'
import { useBasicApi,useMain,useGlobalVar } from '@renderer/store';
import dropDown from '@renderer/components/myVC/dropDown.vue';
import { useRouter } from 'vue-router';
const BasicApi = useBasicApi()
const globalVar = useGlobalVar()
const Main = useMain()
const $router = useRouter()
const form = reactive({
    name: toRaw(BasicApi.profile)?.nickname,
    description: toRaw(BasicApi.profile)?.signature,
    sex:toRaw(BasicApi.profile)?.gender,
    year:new Date(toRaw(BasicApi.profile)?.birthday).getFullYear(),
    month:new Date(toRaw(BasicApi.profile)?.birthday).getMonth() + 1,
    day:new Date(toRaw(BasicApi.profile)?.birthday).getDate(),
    city:+toRaw(BasicApi.profile)?.city,
    province:+toRaw(BasicApi.profile)?.province,
})
const citys:any[] = await Main.reqCitys()
const citysMap = ref(new Map())
citys.forEach((it)=>{
    citysMap.value.set(+it.code,new Map([[+it.code,it.name],...it.children.map((item)=>{return [+item.code,item.name]} )]))
})
// console.log(citysMap);
const provinceName = ref(citysMap.value.get(form.province)?.get(form.province))
const cityName = ref(citysMap.value.get(form.province)?.get(form.city))
const provinceList:Ref<any[]> = ref([])
citysMap.value.forEach((val:Map<any,any>,key)=>{
    provinceList.value.push({code:key,name:val.get(key)})
})
const cityList:Ref<any[]> = ref([])
const t:Map<any,any> = citysMap.value.get(form.province)
t.delete(form.province)
t.forEach((val,key)=>{
    cityList.value.push({name:val,code:key})
})
// console.log(cityList.value,provinceList.value);
watch(()=>form.province,()=>{
    cityList.value = []
    const t:Map<any,any> = citysMap.value.get(form.province)
    t.delete(form.province)
    t.forEach((val,key)=>{
        cityList.value.push({name:val,code:key})
    })
    cityName.value = cityList.value[0].name
    form.city = cityList.value[0].code
})
const yearList:Ref<any[]> = ref([])
for(let i = 1920 ;i<=new Date().getFullYear();i++){
    yearList.value.push({name:i + '年'})
}
const monthList:Ref<any[]> = ref([])
for(let i = 1;i<=12;i++){
    monthList.value.push({name:i + '月'})
}
const dayList:Ref<any[]> = ref([])
for(let i = 1;i<=new Date(form.year, form.month, 0).getDate();i++){
    dayList.value.push({name:i + '日'})
}
watch(()=>form.year,()=>{
    dayList.value = []
    for(let i = 1;i<=new Date(form.year, form.month, 0).getDate();i++){
        dayList.value.push({name:i + '日'})
    }
    form.month = 1
    form.day = 1
},{deep:true})

watch(()=>form.month,()=>{
    dayList.value = []
    for(let i = 1;i<=new Date(form.year, form.month, 0).getDate();i++){
        dayList.value.push({name:i + '日'})
    }
},{deep:true})

watch(form,()=>{
    console.log(form);
},{deep:true})

const getYear = (ms:any)=>{
    form.year = +ms.name.split('年')[0]
}
const getMonth = (ms:any)=>{
    form.month = +ms.name.split('月')[0]
}
const getDay = (ms:any)=>{
    form.day = +ms.name.split('日')[0]
}
const dropDownYear = ref<InstanceType<typeof dropDown>>()
const dropDownMonth = ref<InstanceType<typeof dropDown>>()
const dropDownDay= ref<InstanceType<typeof dropDown>>()
const dropDownPro= ref<InstanceType<typeof dropDown>>()
const dropDownCity= ref<InstanceType<typeof dropDown>>()
const del1 = ()=>{
    dropDownMonth.value!.showListFlag = false
    dropDownDay.value!.showListFlag = false
    dropDownPro.value!.showListFlag = false
    dropDownCity.value!.showListFlag = false
}
const del2 = ()=>{
    dropDownYear.value!.showListFlag = false
    dropDownDay.value!.showListFlag = false
    dropDownPro.value!.showListFlag = false
    dropDownCity.value!.showListFlag = false
}
const del3 = ()=>{
    dropDownMonth.value!.showListFlag = false
    dropDownYear.value!.showListFlag = false
    dropDownPro.value!.showListFlag = false
    dropDownCity.value!.showListFlag = false
}
const del4 = ()=>{
    dropDownMonth.value!.showListFlag = false
    dropDownYear.value!.showListFlag = false
    dropDownDay.value!.showListFlag = false
    dropDownCity.value!.showListFlag = false
}
const del5 = ()=>{
    dropDownMonth.value!.showListFlag = false
    dropDownYear.value!.showListFlag = false
    dropDownDay.value!.showListFlag = false
    dropDownPro.value!.showListFlag = false
}

const getPro = (ms:any)=>{
    form.province = ms.code
}

const getCity = (ms:any)=>{
    form.city = ms.code
}

const back = () => { 
    $router.go(-1)
}

const onSubmit = async()=>{
    const t = {
        gender:form.sex,
        birthday:new Date(form.year, form.month - 1, form.day).getTime(),
        nickname:form.name,
        province:form.province,
        city:form.city,
        signature:form.description
    }
    console.log(t);
    globalVar.loadDefault = true
    if(await Main.reqUserUpdate(t)){
        await BasicApi.reqLogin(localStorage.getItem('cookieUser') as string)
        globalVar.loadDefault = false
        globalVar.loadMessageDefault = '保存成功!'
        globalVar.loadMessageDefaultFlag = true
    }else{
        globalVar.loadDefault = false
        globalVar.loadMessageDefault = '保存失败!'
        globalVar.loadMessageDefaultFlag = true
    }
}
</script>

<style scoped lang="less"></style>