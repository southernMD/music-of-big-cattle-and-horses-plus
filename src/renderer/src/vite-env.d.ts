/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
  
}

// declare const electronIpc: {
//   ipcOn:(name:string,callback:any)=>any
//   ipcOnce:(name:string,callback:any)=>void
//   ipcRemove:(name:string,callback:any)=>void
//   ipcInvoke:(name:string | null |undefined,message?:string)=>Promise<boolean>
//   ipcSend:(name:string,message?:string | Array)=>void
//   ipcSendSync:(name:string,message?:string | Array)=>any
//   ipcSendTo:(id:number | string,channel:string,...args:any[])=>void
// };

// declare const electronShell:{
//   shellOpenExternal:(url:string)=>void
// }

declare const require: (str)=> any;

declare interface Window {
  define: any
}

declare namespace electronType{
  type dragMessage = {
    message:string
  }
  type dragColor={
    backGroundColor:string
    fontColor:string
  }
}
declare namespace comment{
  type delComment = {
    t:0
    type:number
    id:number
    content:string
    threadId?:never    //动态专属id
  } | {
    t:0
    type:number
    id?:never
    content:string
    threadId:number   //动态专属id
  }
  
  type sendComment ={
    t:1
    type:number
    id:number
    content:string
    commentId?:never
    threadId?:never    //动态专属id
  } | {
    t:1
    type:number
    id?:never
    content:string
    commentId?:never
    threadId?:number    //动态专属id
  } |{
    t:2
    type:number
    id:number
    content:string
    commentId:number
    threadId?:never    //动态专属id
  } |{
    t:2
    type:number
    id:number
    content:string
    commentId:number
    threadId?:number    //动态专属id
  } 
}

