import {niuMaAxios as axios} from './axiosInit'

export const NMlogin = (data:any)=>{
    //返回的是promise对象
    return axios({
        url:`/regAndLog/login`,
        method:'POST',
        data
    })
}


export const NMCode = (data:any)=>{
    //返回的是promise对象
    return axios({
        url:`/regAndLog/email`,
        method:'POST',
        data
    })
}

export const NMReg= (data:any)=>{
    //返回的是promise对象
    return axios({
        url:`/regAndLog/register`,
        method:'POST',
        data
    })
}