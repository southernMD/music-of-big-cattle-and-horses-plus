//引入路由对象
import { createRouter, createWebHistory, createWebHashHistory, createMemoryHistory, RouteRecordRaw } from 'vue-router'
 
//vue2 mode history vue3 createWebHistory
//vue2 mode  hash  vue3  createWebHashHistory
//vue2 mode abstact vue3  createMemoryHistory
 
//路由数组的类型 RouteRecordRaw
// 定义一些路由
// 每个路由都需要映射到一个组件。
const routes: Array<RouteRecordRaw> = [
    {
        path:'/app',
        name:'app',
        component:()=>import('@renderer/views/AppSmall.vue'),
        children:[
            {
                path:'FixRoute',
                name:'FixRoute',
                component:()=>import('@renderer/components/myVC/FixRoute.vue')
            },
            {
                path: 'findMusic',
                name:'findMusic',
                component:()=>import('@renderer/views/FindMusic/index.vue'),
                children:[
                    {
                        path:'find1',
                        name:'personalRecommend',
                        component:()=>import('@renderer/views/FindMusic/personalRecommend/index.vue'),
                    },
                    {
                        path:'find2',
                        name:'q1',
                        component:()=>import('@renderer/views/FindMusic/q1.vue'),
                    },
                    {
                        path:'find3',
                        name:'q2',
                        component:()=>import('@renderer/views/FindMusic/q2.vue'),
                    }
                ],
            },
            {
                path:`playlist`,
                name:'playlist',
                component:()=>import('@renderer/views/PlayList/index.vue'),
                children:[
                    {
                        path:'song',
                        name:'songPlaylist',
                        component:()=>import('@renderer/views/PlayList/Song/index.vue'),
                    },
                    {
                        path:'comment',
                        name:'commentPlaylist',
                        component:()=>import('@renderer/views/PlayList/Comment/index.vue'),
                    }, {
                        path:'whoStart',
                        name:'whoStartPlaylist',
                        component:()=>import('@renderer/views/PlayList/WhoStart/index.vue'),
                    },
                ],
            },
            {
                path:`personalFM`,
                name:'personalFM',
                component:()=>import('@renderer/views/PersonalFM/index.vue'),
                meta:{
                    keepAlive:true
                }
            },
            {
                path:'download',
                name:'download',
                component:()=>import('@renderer/views/Download/index.vue'),
                children:[
                    {
                        path:'manage',
                        name:'manage',
                        component:()=>import('@renderer/views/Download/Manage/index.vue'),
                        children:[
                            {
                                path:'downloaded',
                                name:'downloaded',
                                component:()=>import('@renderer/views/Download/Manage/Downloaded/index.vue'),
                            },
                            {
                                path:'downloading',
                                name:'downloading',
                                component:()=>import('@renderer/views/Download/Manage/Downloading/index.vue'),
                            }
                        ]
                    },
                    {
                        path:'local',
                        name:'local',
                        component:()=>import('@renderer/views/Download/Local/index.vue')
                    },
                ]
            },
            {
                path:`mydj`,
                name:'mydj',
                component:()=>import('@renderer/views/MyDj/index.vue'),

            },
            {
                path:`search`,
                name:'search',
                component:()=>import('@renderer/views/search/index.vue'),
                children:[
                    {
                        path:'1',
                        name:'1',
                        component:()=>import('@renderer/views/search/1/index.vue'),
                    },
                    {
                        path:'10',
                        name:'10',
                        component:()=>import('@renderer/views/search/10/index.vue'),
                    },
                    {
                        path:'100',
                        name:'100',
                        component:()=>import('@renderer/views/search/100/index.vue'),

                    },
                    {
                        path:'1000',
                        name:'1000',
                        component:()=>import('@renderer/views/search/1000/index.vue'),

                    },
                    {
                        path:'1002',
                        name:'1002',
                        component:()=>import('@renderer/views/search/1002/index.vue'),

                    },
                    {
                        path:'1006',
                        name:'1006',
                        component:()=>import('@renderer/views/search/1006/index.vue'),
                    },
                ]
            },
            {
                path: '/:pathMatch(.*)',
                component: ()=>import('@renderer/components/myVC/404.vue'),
            }
        ]
    },
    {
        path:'/lyric',
        name:'lyric',
        component:()=>import('@renderer/views/lyric.vue')
    },
    // {
    //     path:'/dragMessage',
    //     name:'dragMessage',
    //     component:()=>import('@/views/dragMessage.vue')
    // },
    {
        path:'/',
        redirect:`/app/findMusic/find1`
    }
]
 
 
 
const router = createRouter({
    // scrollBehavior(){
    //     return {top:0,left:0};
    // },
    history: createWebHashHistory(),
    routes,
})


//导出router
export default router