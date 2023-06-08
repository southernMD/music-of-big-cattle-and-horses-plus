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

export const NMupdatePlayList = (id,name,desc,tags)=>{
    return axios({
        url:'/playList/update',
        method:'POST',
        data:{
            id,name,desc,tags
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMupdatePlayListTags = (id,tags)=>{
    return axios({
        url:'/playlist/tags/update',
        method:'POST',
        data:{
            id,tags
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//上传歌单图片
export const NMuploadPlaylistPic = (id:number,formData:FormData,imgSize:number,imgX:number,imgY:number)=>{
    const url = `/playlist/cover/update?id=${id}&imgSize=${
        imgSize
      }&imgX=${imgX}&imgY=${imgY}`
    return axios({
        url:url,
        method:'POST',
        data: formData,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMplaylistOrderUpdate = (ids:[number])=>{
    return axios({
        url:`/playlist/order/update?ids=[${ids.toString()}]`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMuserUpdate = ({gender,birthday,nickname,province,city,signature})=>{
    return axios({
        url:`/user/update`,
        method:'POST',
        data:{
            gender,birthday,nickname,province,city,signature
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMUploadAvatar = (formData:FormData,imgSize:number,imgX:number,imgY:number)=>{
    const url = `user/avatar/upload?&imgSize=${
        imgSize
      }&imgX=${imgX}&imgY=${imgY}`
    return axios({
        url:url,
        method:'POST',
        data: formData,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}
//喜欢歌曲
export const NMlikeQ = (id:number,like:boolean)=>{
    return axios({
        url:`/like`,
        method:'POST',
        data:{
            id,like
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//调整歌曲顺序
export const NMsongOrderUpdate = (pid:number,ids:[number])=>{
    return axios({
        url:`/song/order/update?pid=${pid}&ids=[${ids.toString()}]`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//公开隐私歌单
export const NMplaylistPrivacy =(id)=>{
    const url = `/playlist/privacy`
    return axios({
        url,
        method:'POST',
        data:{
            id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//删除歌单
export const NMplaylistDelete = (id)=>{
    const url = `/playlist/delete`
    return axios({
        url,
        method:'POST',
        data:{
            id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMSearch = (key:string,type?:string,limit?:number,offset?:number)=>{
    return axios({
        url:`/search`,
        method:'POST',
        data:{
            type,limit,offset,keywords:key
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//收藏歌单
export const NMPlaylistSubscribe = (id,t)=>{
    const url = `/playlist/subscribe`
    return axios({
        url,
        method:'POST',
        data:{
            id,t
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMgetDetail = (uid)=>{
    return axios({
        url:`/user/detail`,
        method:'POST',
        data:{
            uid
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//歌单收藏者
export const NMplaylistSubscribers = (id,limit = 20,offset = 0)=>{
    const url = `/playlist/subscribers`
    return axios({
        url,
        method:'POST',
        data:{
            id,limit,offset
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//每日推荐歌单
export const NMrecommendPlayList = ()=>{
    return axios({
        url:`/recommend/resource`,
        method:'POST',
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//关注取关用户
export const NMfollow = (id,t)=>{
    const url = `/user/follow`
    return axios({
        url,
        method:'POST',
        data:{
            id,t
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMuserFolloweds = (id,limit=30,offset=0)=>{
    return axios({
        url:`/user/followeds`,
        method:'POST',
        data:{
            uid:id,limit,offset
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//收藏专辑
export const NMalbumSub = (id,t)=>{
    const url = `user/album/sub`
    return axios({
        url,
        method:'POST',
        data:{
            id,t
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//收藏歌手
export const NMartistSub = (id,t)=>{
    const url = `user/artist/sub`
    return axios({
        url,
        method:'POST',
        data:{
            id,t
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//评论和删除评论
export const NMcomment = (obj:comment.delComment|comment.sendComment)=>{
    let {t,type,id,content,commentId} = obj;
    let data 
    if(t == 2){
        data={
            t,type,id,content,commentId:commentId
        }
    }else if(t == 1){
        data={
            t,type,id,content
        }
    }else{
        data={
            t,type,id,commentId
        }
    }
    return axios({
        url:`/comment`,
        method:'POST',
        data,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//歌单评论
export const NMcommentPlaylist = (id:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    return axios({
        url:`/comment/playlist`,
        method:'POST',
        data:t,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//点赞评论
export const NMcommentLike = (cid:number,options: { id?: number; threadId?: string; },t:1 | 0,type:0|1|2|3|4|5|6|7)=>{
    const { id, threadId } = options;
    let url = `/comment/like`
    return axios({
        url,
        method:'POST',
        data:{
           cid,t,type,id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
} 

//歌曲评论
export const NMcommentMusic = (id:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    return axios({
        url:`/comment/music`,
        method:'POST',
        data:t,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMCommentFloor = (parentCommentId:number,id:number,type:number)=>{
    const url = `/comment/floor`
    return axios({
        url,
        data:{
            parentCommentId,id,type
        },
        method:'POST',
    })
} 

export const NMshareResource = (formData:FormData)=>{
    return axios({
        url:'/share/resource',
        method:'POST',
        data:formData,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMEvent = (lasttime = -1)=>{
    return axios({
        url:`/event`,
        method:'POST',
        data:{
            lasttime,
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMuserEvents = (id:number,lasttime?:number)=>{
    return axios({
        url:'/user/event',
        method:'POST',
        data:{
            uid:id,lasttime
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMeventDel = (id)=>{
    const url = `/event/del`
    return axios({
        url,
        method:'POST',
        data:{
            evId:id
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//资源点赞
//t: 操作,1 为点赞,其他为取消点赞
export const NMLikeResource = (id:string | number,t:1|any)=>{
    return axios({
        url:`/resource/like`,
        method:'POST',
        data:{
            id,t
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

//转发用户动态
export const NMeventForward = (uid:Number,evid:number,forwards:string)=>{
    return axios({
        url:`/event/forward`,
        method:'POST',
        data:{
            evId:evid,uid,forwards
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMEventComment = (threadId:string,limit?:number,offset?:number,before?:number)=>{
    let t:any = {threadId}
    if(limit !=undefined)t['limit'] = limit
    if(offset !=undefined)t['offset'] = offset
    return axios({
        url:`/comment/event?t=${new Date().getTime()}&threadId=${threadId}`,
        method:'POST',
        data:t,
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}

export const NMScrobble = (id,sourceid,time = 0)=>{
    return axios({
        url:`/scrobble`,
        method:'POST',
        data:{
            id,sourceid,time
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}


export const NMUserRecord = (uid:number,type:0|1)=>{
    const url = `/user/record`
    return axios({
        url:url,
        method:'POST',
        data:{
            uid,type
        },
        headers:{
            Authorization:localStorage.getItem('NMcookie')
        }
    })
}


// /album/sub
// /album/sublist
// /artist/sub
// /artist/sublist