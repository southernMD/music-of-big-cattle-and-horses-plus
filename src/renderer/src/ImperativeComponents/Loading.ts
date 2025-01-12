import LoadingVue from "@renderer/components/myVC/Loading.vue";
import { createApp } from "vue";
export default function Lodaing(msg){
   const app = createApp(LoadingVue,{msg})
   const div = document.createElement('div')
   document.body.appendChild(div)
   app.mount(div)
}