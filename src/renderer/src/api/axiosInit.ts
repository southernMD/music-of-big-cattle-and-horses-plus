import request from "axios";

const axios = request.create({
    baseURL:'http://cloud-music.pl-fe.cn/',
}) 

//请求拦截器，在发起请求前做一些事情
axios.interceptors.request.use((config)=>{
    //包含请求头headers
    return config;
})

//相应拦截器
axios.interceptors.response.use((response) =>{
    return response;
  },  (error)=>{
    return Promise.reject(error);
});

const niuMaAxios = request.create({
    // baseURL:'http://localhost:3000'
    baseURL: (await request.get('https://app-update-address.glitch.me/axios_path')).data
})


//请求拦截器，在发起请求前做一些事情
niuMaAxios.interceptors.request.use((config)=>{
    //包含请求头headers
    return config;
})

//相应拦截器
niuMaAxios.interceptors.response.use((response) =>{
    return response;
  },  (error)=>{
    return Promise.reject(error);
});
export  {axios,niuMaAxios}