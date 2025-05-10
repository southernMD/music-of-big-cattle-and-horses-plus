import {axios, port} from "./axiosInit"

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
    const cookie_MUSIC_U = cookie.split(";").find(item=>item.startsWith("MUSIC_U"))
    return axios({
        url:`/login/status?time=${new Date().getTime()}&cookie=${encodeURIComponent(cookie_MUSIC_U!)}`,
        method:'POST',
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
    console.log("是我妈");
    
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
        url:`/comment/new?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

export const playlistTracks = (op:'add' | 'del',pid:number,tracks:number[])=>{
    return axios({
        url:`/playlist/tracks?op=${op}&pid=${pid}&tracks=${tracks.join(',')}&t=${new Date().getTime()}`,
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
    let data 
    if(t == 2){
        if( type == 6){
            data={
                cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
                // @ts-ignore
                t,type,threadId,content,commentId:obj.commentId
            }
        }else{
            data={
                cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
                // @ts-ignore
                t,type,id,content,commentId:obj.commentId
            }
            console.log(data);
        }

    }else{
        data={
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie'),
            t,type,id,content,threadId,commentId:obj.commentId
        }
    }
    return axios({
        url:`/comment?time=${new Date().getTime()}`,
        method:'POST',
        data
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
    let url
    if(type != '2000')url = `/cloudsearch?keywords=${key}`
    else url = `/search?keywords=${key}`
    return axios({
        url,
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

//关注动态
export const MyEvent = (lasttime = -1)=>{
    return axios({
        url:`/event?t=${new Date().getTime()}&lasttime=${lasttime}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//动态评论
export const MyEventComment = (threadId:string,limit?:number,offset?:number,before?:number)=>{
    let t:any = {threadId}
    if(limit !=undefined)t['limit'] = limit
    if(offset !=undefined)t['offset'] = offset
    if(before !=undefined)t['before'] = before
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/event?t=${new Date().getTime()}&threadId=${threadId}`,
        method:'POST',
        data:t
    })
}

//资源点赞
//t: 操作,1 为点赞,其他为取消点赞
export const LikeResource = (id:string | number,type:number,t:1|any)=>{
    let url = ''
    if(typeof id == 'string'){
        url = `/resource/like?t=${t}&type=${type}&threadId=${id}&time=${new Date().getTime()}`
    }else{
        url = `/resource/like?t=${t}&type=${type}&id=${id}&time=${new Date().getTime()}`
    }
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//转发用户动态
export const eventForward = (uid:Number,evid:number,forwards:string)=>{
    return axios({
        url:`/event/forward?evId=${evid}&uid=${uid}&forwards=${forwards}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

export const shareResource = (id:number,type:string,msg:string)=>{
    let url = ''
    if(type == 'noresource')url = `/share/resource?type=${type}&msg=${msg}`
    else url = `/share/resource?type=${type}&msg=${msg}&id=${id}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}


//更新用户信息
export const userUpdate = ({gender,birthday,nickname,province,city,signature})=>{
    return axios({
        url:`/user/update?gender=${gender}&signature=${signature}&city=${city}&nickname=${nickname}&birthday=${birthday}&province=${province}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//上传头像
export const UploadAvatar = (formData:FormData,imgSize:number,imgX:number,imgY:number)=>{
    const url = `/avatar/upload?imgSize=${
        imgSize
      }&imgX=${imgX}&imgY=${imgY}&timestamp=${Date.now()}&cookie=${localStorage.getItem('cookieUser')}`
    return axios({
        url:url,
        method:'POST',
        data: formData,
    })
}

//获取播放排行
export const UserRecord = (uid:number,type:0|1)=>{
    const url = `/user/record?uid=${uid}&type=${type}`
    return axios({
        url:url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//专辑动态信息 
export const AlbumDetailDynamic = (id:number)=>{
    const url = `/album/detail/dynamic?id=${id}&t=${new Date().getTime()}`
    return axios({
        url:url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

//专辑
export const Album = (id:number)=>{
    const url = `/album?id=${id}`
    return axios({
        url:url,
        method:'POST',
    })
}

//获取专辑全部歌曲
export const AlbumTrackAll= (id:string | number)=>{
    return axios({
        url:`/album?id=${id}&time=${new Date().getTime()}`,
        method:'POST',
    })
}

//专辑评论
export const commentAlbum= (id:number,limit?:number,offset?:number,before?:number)=>{
    let t:any = {id}
    if(limit)t['limit'] = limit
    if(offset)t['offset'] = offset
    if(before)t['before'] = before
    t['cookie'] = localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
    return axios({
        url:`/comment/album?time=${new Date().getTime()}`,
        method:'POST',
        data:t
    })
}

//歌手
export const artists = (id)=>{
    return axios({
        url:`/artists?id=${id}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}
//歌手专辑
export const artistAlbum = (id:number,limit:number,offset:number)=>{
    return axios({
        url:`/artist/album?id=${id}&limit=${limit}&offset=${offset}`,
        method:'POST'
    })
}
//歌手描述
export const artistDesc = (id:number)=>{
    return axios({
        url:`/artist/desc?id=${id}`,
        method:'POST'
    })
}
export const artistSublist = ()=>{
    return axios({
        url:`/artist/sublist?t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

export const simiartist = (id:number)=>{
    return axios({
        url:`/simi/artist?id=${id}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser') || sessionStorage.getItem('youkeCookie')
        }
    })
}

export const albumSublist=(limit = 999999)=>{
    return axios({
        url:`/album/sublist?limit=${limit}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
    
}

export const userEvents=(id:number,lasttime?:number)=>{
    const url = lasttime?`/user/event?uid=${id}&lasttime=${lasttime}&t=${new Date().getTime()}`:`/user/event?uid=${id}&t=${new Date().getTime()}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
    
}

export const userFollows = (id,limit=30,offset=0)=>{
    return axios({
        url:`/user/follows?uid=${id}&limit=${limit}&offset=${offset}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

export const userFolloweds = (id,limit=30,offset=0)=>{
    return axios({
        url:`/user/followeds?uid=${id}&limit=${limit}&offset=${offset}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//点赞评论
export const commentLike = (cid:number,options: { id?: number; threadId?: string; },t:1 | 0,type:0|1|2|3|4|5|6|7)=>{
    const { id, threadId } = options;
    let url = `/comment/like?cid=${cid}&t=${t}&type=${type}&time=${new Date().getTime()}`
    if(id){
        url+=`&id=${id}`
    }else{
        url+=`&threadId=${threadId}`
    }
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
} 

export const CommentFloor = (parentCommentId:number,id:number,type:number)=>{
    const url = `/comment/floor?parentCommentId=${parentCommentId}&id=${id}&type=${type}`
    return axios({
        url,
        method:'POST',
    })
} 

//歌单收藏者
export const playlistSubscribers = (id,limit = 20,offset = 0)=>{
    const url = `/playlist/subscribers?id=${id}&limit=${limit}&offset=${offset}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//收藏歌单
export const PlaylistSubscribe = (id,t)=>{
    const url = `/playlist/subscribe?id=${id}&t=${t}&time=${new Date().getTime()}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//收藏专辑
export const albumSub = (id,t)=>{
    const url = `/album/sub?id=${id}&t=${t}&time=${new Date().getTime()}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//关注取关用户
export const follow = (id,t)=>{
    const url = `/follow?id=${id}&t=${t}&time=${new Date().getTime()}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//收藏歌手
export const artistSub = (id,t)=>{
    const url = `/artist/sub?id=${id}&t=${t}&time=${new Date().getTime()}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//公开隐私歌单
export const playlistPrivacy =(id)=>{
    const url = `/playlist/privacy?id=${id}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//删除歌单
export const playlistDelete = (id)=>{
    const url = `/playlist/delete?id=${id}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}


export const eventDel = (id)=>{
    const url = `/event/del?evId=${id}`
    return axios({
        url,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//歌手热门50曲
export const artistTopSong = (id)=>{
    const url = `/artist/top/song?id=${id}`
    return axios({
        url,
        method:'POST',
    })
}

//听歌打卡
export const Scrobble = (id,sourceid,time = 0)=>{
    return axios({
        url:`/scrobble?id=${id}&sourceid=${sourceid}&time=$${time}&t=${new Date().getTime()}`,
        method:'POST',
    })
}

export const checkMusic = (id,br = 999000)=>{
    return axios({
        url:`/check/music?id=${id}&br=${br}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}

//检测更新
export const githubUpdate = ()=>{
    try {
        // 获取最新发布的信息
        return fetch('https://app-update-address.glitch.me')
        .then(response => response.json())
        .then(data => {
            return data;
        });
    } catch (error) {
        return null
    }
}
//电台详情
export const djDetail = (rid)=>{
    return axios({
        url:`/dj/detail?rid=${rid}&time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//电台列表
export const djProgram = (rid,limit,offset)=>{
    return axios({
        url:`/dj/program?rid=${rid}&limit=${limit}&offset=${offset}&time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//节目详情
export const djProgramDetail = (id)=>{
    return axios({
        url:`/dj/program/detail?id=${id}&time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//节目评论
export const commentDj = (id:number,limit?:number,offset?:number,before?:number)=>{
    let baseUrl = `/comment/dj?time=${new Date().getTime()}`
    if(limit)baseUrl+=`&limit=${limit}`
    if(offset)baseUrl+=`&offset=${offset}`
    if(before)baseUrl+=`&before=${before}`
    if(id)baseUrl+=`&id=${id}`
    return axios({
        url:baseUrl,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')|| sessionStorage.getItem('youkeCookie')
        }
    })
}

//收藏电台
export const djSub = (id,t:0|1)=>{
    return axios({
        url:`/dj/sub?rid=${id}&t=${t}&time=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
}
//电台订阅者
export const djsuber = (id,limit,time)=>{
    return axios({
        url:`/dj/subscriber?id=${id}&time=${time}&limit=${limit}&t=${new Date().getTime()}`,
        method:'POST',
        data:{
            cookie:localStorage.getItem('cookieUser')
        }
    })
    
}

//解锁歌曲


export const unlockSong = (keyword:string)=>{
    const url = import.meta.env.MODE === 'development' ? `/api/unlock` : `http://localhost:${port}/api/unlock`
    return fetch(`${url}?keyword=${keyword}`,{
        method:'GET',
    }).then(res=>res.json())
}