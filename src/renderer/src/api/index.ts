import {axios} from "./axiosInit"

export const qrKey = ()=>{
    //返回的是promise对象
    return axios({
        url:`/login/qr/key?time=${new Date().getTime()}`,
        method:'GET'
    })
}

export const QrImage = (key:string)=>{
    //返回的是promise对象
    return axios({
        url:`/login/qr/create?key=${key}&qrimg=200y200&time=${new Date().getTime()}`,
        method:'GET'
    })
}
export const QrCheck = (key:string)=>{
    //返回的是promise对象
    return axios({
        url:`/login/qr/check?key=${key}&time=${new Date().getTime()}`,
        method:'GET'
    })
}

//登陆状态检查
export const Login = (cookie:string)=>{
    //返回的是promise对象
    return axios({
        url:`/login/status?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie
        }
    })
}

export const getDetail = (uid:string)=>{
    //返回的是promise对象
    return axios({
        url:`/user/detail?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            uid
        }
    })
}

export const quitLogin = ()=>{
    //返回的是promise对象
    return axios({
        url:`/logout?time=${new Date().getTime()}`,
        method:'GET',
    })
}

export const userSubcount = ()=>{
    return axios({
        url:`/user/subcount?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//游客登陆
export const Anonimous = ()=>{
    return axios({
        url:`/register/anonimous`,
        method:'POST',
    })
}

//歌单列表获取包括收藏与创建
export const UserPlaylist = (uid:string)=>{
    return axios({
        url:`/user/playlist?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            uid,
            limit:999999,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//获取歌单详情
export const playlistDetail = (id:string | number)=>{
    return axios({
        url:`/playlist/detail?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            id,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//获取歌单全部歌曲
export const playlistTrackAll= (id:string | number,limit?:string | number,offset?:string | number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/playlist/track/all?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

export const PlaylistDetailDynamic = (id:number | string)=>{
    return axios({
        url:`/playlist/detail/dynamic?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            id,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//用户喜欢
export const UserLike = (id:number)=>{
    return axios({
        url:`/likelist?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            id,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//歌曲url
export const SongUrl = (id:number,level?:string)=>{
    if(!level)level = 'standard'
    return axios({
        url:`/song/url/v1?id=${id}&level=${level}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//获取歌词
export const Lyric = (id:number)=>{
    return axios({
        url:`/lyric?id=${id}`,
        method:'POST',
    })
}

//喜欢这首歌的人也听
export const simiSong = (id:number)=>{
    return axios({
        url:`/simi/song?id=${id}`,
        method:'POST',
    })
}
export const simiPlaylist = (id:number)=>{
    return axios({
        url:`/simi/playlist?id=${id}`,
        method:'POST',
    })
}

//一首歌的详情
export const songDetail = (ids:[number])=>{
    return axios({
        url:`/song/detail?ids=${ids.toString()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//歌曲评论
export const commentMusic = (id:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    if(before)t['before'] = before
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/music?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}
//歌单评论
export const commentPlaylist = (id:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    if(before)t['before'] = before
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/playlist?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

//热门评论
export const commentHot = (id:number,type:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit !=undefined)t['limit'] = limit
    if(offset !=undefined)t['offset'] = offset
    if(before !=undefined)t['before'] = before
    if(type !=undefined)t['type'] = type
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/hot?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

//新版接口
// id : 资源 id, 如歌曲 id,mv id
// type: 数字 , 资源类型 , 对应歌曲 , mv, 专辑 , 歌单 , 电台, 视频对应以下类型
// 0: 歌曲
// 1: mv
// 2: 歌单
// 3: 专辑
// 4: 电台节目
// 5: 视频
// 6: 动态
// 7: 电台
// 可选参数 :
// pageNo:分页参数,第 N 页,默认为 1
// pageSize:分页参数,每页多少条数据,默认 20
// sortType: 排序方式, 1:按推荐排序, 2:按热度排序, 3:按时间排序
// cursor: 当sortType为 3 时且页数不是第一页时需传入,值为上一条数据的 time
export const commentNew = (id:number,type:number,pageNo?:number,pageSize?:number,sortType?:number,cursor?:number)=>{
    let t:any = {id,type}
    if(pageNo)t['pageNo'] = pageNo
    if(pageSize)t['pageSize'] = pageSize
    if(sortType)t['sortType'] = sortType
    if(cursor)t['cursor'] = cursor
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/music?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

export const playlistTracks = (op:'add' | 'del',pid:number,tracks:number)=>{
    return axios({
        url:`/playlist/tracks?op=${op}&pid=${pid}&tracks=${tracks}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//调整歌曲顺序
export const songOrderUpdate = (pid:number,ids:[number])=>{
    return axios({
        url:`/song/order/update?pid=${pid}&ids=[${ids.toString()}]`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//调整歌单顺序
export const playlistOrderUpdate = (ids:[number])=>{
    return axios({
        url:`/playlist/order/update?ids=[${ids.toString()}]`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//心动模式
export const playmodeIntelligenceList = (id:number,pid:number,sid?:number)=>{
    return axios({
        url:`/playmode/intelligence/list?${sid?`sid=${sid}`:''}`,
        method:'POST',
        params:{
            pid,id
        },
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//喜欢歌曲
export const likeQ = (id:number,like:boolean)=>{
    return axios({
        url:`/like?t=${new Date().getTime()}`,
        method:'POST',
        params:{
            id,like
        },
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//评论和删除评论
export const comment = (obj:comment.delComment|comment.sendComment)=>{
    let {t,type,id,content,threadId} = obj;
    return axios({
        url:`/comment?time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
            t,type,id,content,threadId
        }
    })
}

//每日推荐音乐
export const recommendSongs = ()=>{
    return axios({
        url:`/recommend/songs?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

//每日推荐歌单
export const recommendPlayList = ()=>{
    return axios({
        url:`/recommend/resource?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

//推荐声音
export const programRecommend = ()=>{
    return axios({
        url:`/program/recommend?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

//热门声音

export const djProgramToplist = (limit = 100)=>{
    return axios({
        url:`/dj/program/toplist?limit=${limit}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

//私人FM
export const personal_fm = ()=>{
    return axios({
        url:`/personal_fm?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

export const fm_trash = (id:number)=>{
    return axios({
        url:`/fm_trash?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            id,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
    
}

export const userDj = (id:number)=>{
    return axios({
        url:`/user/audio?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            uid:id,
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

export const startDj = ()=>{
    return axios({
        url:`/dj/sublist?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
        }
    })
}

export const SongDlUrl = (id:number,br:number)=>{
    return axios({
        url:`/song/download/url?id=${id}&br=${br}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//搜索

export const Search = (key:string,type?:string,limit?:number,offset?:number)=>{
    return axios({
        url:`/cloudsearch?keywords=${key}`,
        method:'POST',
        params:{
            type,limit,offset,
        },
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}
// http://120.48.43.32:3000/search?keywords=114

//搜索建议
export const SearchSuggest = (keywords:string,type?:'mobile')=>{
    return axios({
        url:`/search/suggest?keywords=${keywords}`,
        method:'POST',
        params:{
            type
        }
    })
}

//创建歌单
export const PlayListCreate = (name:string,privacy?:number)=>{
    return axios({
        url:`/playlist/create?name=${name}&t=${new Date().getTime()}`,
        method:'POST',
        params:{
            privacy
        },
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//TAGS
export const playlistTags = ()=>{
    return axios({
        url:'/playlist/catlist',
        method:'GET'
    })
}

export const updatePlayList = (id:number,name:string,desc:string,tags:string)=>{
    return axios({
        url:`/playlist/update?id=${id}&name=${name}&desc=${desc}&tags=${tags}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

export const updatePlayListTags = (id:number,tags:string)=>{
    return axios({
        url:`/playlist/tags/update?id=${id}&tags=${tags}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

export const updatePlayListdesc = (id:number,desc:string)=>{
    return axios({
        url:`/playlist/desc/update?id=${id}&desc=${desc}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//上传歌单图片
export const uploadPlaylistPic = (id:number,formData:FormData,imgSize:number,imgX:number,imgY:number)=>{
    const url = `/playlist/cover/update?id=${id}&imgSize=${
        imgSize
      }&imgX=${imgX}&imgY=${imgY}&timestamp=${Date.now()}&cookie=${localStorage.getItem('cookieUser')}`
    return axios({
        url:url,
        method:'POST',
        data: formData,
    })
}
