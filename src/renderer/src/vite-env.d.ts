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
    threadId?:never    //动态专属id
  } | {
    t:0
    type:number
    id?:never
    threadId:string   //动态专属id
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
    threadId?:string    //动态专属id
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
    threadId?:string    //动态专属id
  } 
}

interface id3Message {
  title: string;
  album: string;
  artist: string;
  image: {
    mime: string;
    type: {
      id: number;
      name: string;
    };
    description?: string;
    imageBuffer: Uint8Array;
  };
  raw: {
    TIT2: string;
    TPE1: string;
    APIC: any;
    TALB: string;
    TXXX: {
      description: string;
      value: string;
    }[];
  };
  userDefinedText: [{
    description: 'song id';
    value: string;
  },{
    description: 'al id';
    value: string;
  },{
    description: 'ar ids';
    value: string;
  }];
  path:string
  time:number
  comment?:{
    language:string
    text:any
  }
}
declare module '@renderer/src/indexDB/db' {
  export const db: any; // 根据实际情况调整类型
}