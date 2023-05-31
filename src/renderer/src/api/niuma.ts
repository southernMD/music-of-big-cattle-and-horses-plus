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

export const NMLoginStatus = ()=>{
    return axios({
        url:`/regAndLog/login/status`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMUserPlaylist = (uid:number)=>{
    return axios({
        url:`/user/playlist`,
        method:'POST',
        data:{
            uid
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMUserLike = (uid:number)=>{
    return axios({
        url:`/likelist`,
        method:'POST',
        data:{
            uid
        }
    })
}

export const NMUserSubcount = ()=>{
    return axios({
        url:`user/subcount`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMartistSublist = ()=>{
    return axios({
        url:`user/artist/sublist`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}


export const NMalbumSublist = (limit)=>{
    return axios({
        url:`user/album/sublist`,
        method:'POST',
        data:{
            limit
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMuserFollows = (id,limit=30,offset=0)=>{
    return axios({
        url:`user/follows`,
        method:'POST',
        data:{
            limit,offset,uid:id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}


export const NMplaylistTracks = (op:'add' | 'del',pid:number,tracks:number[])=>{
    return axios({
        url:`/playlist/tracks`,
        method:'POST',
        data:{
            op,pid,tracks:tracks.join(',')
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMPlaylistDetailDynamic = (id:number)=>{
    return axios({
        url:`/playlist/detail/dynamic`,
        method:'POST',
        data:{
           id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMplaylistDetail = (id:number)=>{
    return axios({
        url:`/playlist/detail`,
        method:'POST',
        data:{
           id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMplaylistTrackAll = (id,limit,offset)=>{
    return axios({
        url:`/playList/track/all`,
        method:'POST',
        data:{
           id,limit,offset
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMPlayListCreate = (name:string,privacy)=>{
    return axios({
        url:`/playList/create`,
        method:'POST',
        data:{
            name,privacy
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

