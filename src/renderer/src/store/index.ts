import { defineStore } from 'pinia'
// import { Names } from "./store-name";
import {
    qrKey, QrImage, QrCheck, Login,
    getDetail, quitLogin, userSubcount, Anonimous, UserPlaylist,
    playlistDetail, playlistTrackAll, PlaylistDetailDynamic, UserLike,
    SongUrl, Lyric, simiSong, simiPlaylist, songDetail, commentMusic, commentNew, commentHot,
    playlistTracks, songOrderUpdate, playlistOrderUpdate, playmodeIntelligenceList, likeQ, commentPlaylist,
    comment, recommendSongs, recommendPlayList, programRecommend, djProgramToplist,
    personal_fm, fm_trash, userDj, startDj, SongDlUrl,Search, SearchSuggest, PlayListCreate,playlistTags,
    updatePlayList,updatePlayListTags,updatePlayListdesc, 
    uploadPlaylistPic,MyEvent, MyEventComment, LikeResource,
    eventForward,
    shareResource,
    userUpdate,
    UploadAvatar,
    UserRecord,
    AlbumDetailDynamic,
    Album,
    AlbumTrackAll,
    commentAlbum,
    artists,
    artistAlbum,
    artistDesc,
    artistSublist,
    simiartist,
    albumSublist,
    userEvents,
    userFollows,
    userFolloweds,
    commentLike,
    CommentFloor,
    playlistSubscribers,
    PlaylistSubscribe,
    albumSub,
    follow,
    artistSub,
    playlistPrivacy,
    playlistDelete,
    eventDel,
    artistTopSong,
    Scrobble,
    checkMusic,
    djDetail,
    djProgram,
    djProgramDetail,
    commentDj,
    djSub,
    djsuber
} from '../api/index';
import { AxiosResponse } from 'axios';
import {cloneDeep} from 'lodash'
import { NMCheckNickname, NMCommentFloor, NMEvent, NMEventComment, NMLikeResource, NMLoginStatus, NMPlayListCreate, NMPlaylistDetailDynamic, NMPlaylistSubscribe, NMScrobble, NMSearch, NMUploadAvatar, NMUserLike, NMUserPlaylist, NMUserRecord, NMUserSubcount, NMalbumSub, NMalbumSublist, NMartistSub, NMartistSublist, NMcomment, NMcommentLike, NMcommentMusic, NMcommentPlaylist, NMeventDel, NMeventForward, NMfollow, NMgetDetail, NMlikeQ, NMplaylistDelete, NMplaylistDetail, NMplaylistOrderUpdate, NMplaylistPrivacy, NMplaylistSubscribers, NMplaylistTrackAll, NMplaylistTracks, NMrecommendPlayList, NMshareResource, NMsongOrderUpdate, NMupdatePlayList, NMupdatePlayListTags, NMuploadPlaylistPic, NMuserEvents, NMuserFolloweds, NMuserFollows, NMuserUpdate } from '@renderer/api/niuma';

interface E {
    ifToCloseWindow: boolean,
    lrcArry: any
}

export const useElectronToApp = defineStore("ElectronToApp", {
    state: (): E => {
        return {
            ifToCloseWindow: false,
            lrcArry: {},
        }
    },
    // getters{

    // },
    // actions:{

    // }
})

export const useMainMenu = defineStore("MainMenu", {
    state: () => {
        return {
            Height: 0,
            width: 0,
            mouseX: 0,
            mouseY: 0,
            moveFlag: false,
            model: false,
            colorBlock: '',
            iconSrc: '@/../icon.png',
            primaryColor: '',

        }
    },
    // getters{

    // },
    // actions:{

    // }
})

interface S {
    account: {
        [propName: string]: any;
    } | null,
    profile: {
        avatarUrl: string
        [propName: string]: any;
    } | null,
    everyDaySong: Array<any>
    everyDayPlayList: Array<any>
    DjSongRecommend: Array<any>
    hotDjProgram: Array<any>
    startDjArr: Array<any>
    createDjArr: Array<any>
    startSongHand: Array<any>
    startalbum:Array<any>
    tagsDetail:{
        sub:any[],
        categories:any[]
    },
    followsId:Array<number>
}

export const useBasicApi = defineStore('BaseApi', {
    state: (): S => {
        return {
            account: null,
            profile: null,
            everyDaySong: [],
            everyDayPlayList: [],
            DjSongRecommend: [],
            hotDjProgram: [],
            startDjArr: [],
            createDjArr: [],
            startSongHand:[],
            startalbum:[],
            tagsDetail:{
                sub:[],
                categories:[]
            },
            followsId:[]
        }
    },
    actions: {
        //二维码先驱key
        async reqQrKey() {
            let result = await qrKey();
            return new Promise((res) => {
                res(result)
            })
        },
        //二维码base64
        async reqQrImage(key: any) {
            let result = await QrImage(key);
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //二维码轮询
        async reqCheck(key: any) {
            let result = await QrCheck(key);
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //登陆  这个方法的目的登陆并获取用户的详细信息
        async reqLogin(cookie: string) {
            let result = await Login(cookie as string);
            this.account = result.data.data.account
            let result2: any = await this.reqDetail(this.account?.id)
            this.profile = result2.data.profile
            return new Promise((resolve) => {
                resolve(this.account)
            })
        },
        //获取详细信息
        async reqDetail(id) {
            let result = await getDetail(id);
            return new Promise<AxiosResponse>((resolve) => {
                resolve(result)
            })
        },
        //退出登陆
        async reqQuitLogin() {
            let result = await quitLogin();
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //游客登陆
        async reqAnonimous() {
            let result = await Anonimous();
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //每日推荐
        async reqRecommendSongs() {
            let result = await recommendSongs();
            if (result.data.code == 200) {
                this.everyDaySong = result.data.data.dailySongs
                return new Promise((resolve) => {
                    resolve(result.data.data.dailySongs)
                })
            }

        },
        //每日推荐歌单
        async reqRecommendPlayList() {
            let result = await recommendPlayList();
            console.log(result.data);
            if (result.data.code == 200) {
                this.everyDayPlayList = result.data.recommend
                return new Promise((resolve) => {
                    resolve(result.data.recommend)
                })
            }

        },
        //推荐声音
        async reqProgramRecommend() {
            let result = await programRecommend();
            console.log(result.data.programs);
            if (result.data.code == 200) {
                this.DjSongRecommend = result.data.programs
                return new Promise((resolve) => {
                    resolve(result.data)
                })
            }
        },
        //热门声音
        async reqDjProgramToplist(limit = 100) {
            let result = await djProgramToplist(limit);
            if (result.data.code == 200) {
                this.hotDjProgram = result.data.toplist
                return new Promise((resolve) => {
                    resolve(result.data.toplist)
                })
            }
        },
        //我创建的dj
        async reqCreateDj(id: number): Promise<any> {
            let result = await userDj(id)
            if (result.data.code == 200) {
                this.createDjArr = result.data.djRadios
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //我收藏的dj
        async reqStartDj(): Promise<any> {
            let result = await startDj()
            if (result.data.code == 200) {
                this.startDjArr = result.data.djRadios
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //歌曲的tags
        async reqPlayListTags(){
            let result = await playlistTags()
            if(result.data.code == 200){
                return new Promise<{sub:any[],categories:any[]}>((resolve, reject) => {
                    this.tagsDetail.sub = result.data.sub
                    this.tagsDetail.categories = Object.values(result.data.categories)
                    resolve({
                        sub:result.data.sub,
                        categories:Object.values(result.data.categories)
                    })
                })
            }else{
                return new Promise<{sub:any[],categories:any[]}>((resolve, reject) => {
                    this.tagsDetail.sub = []
                    this.tagsDetail.categories = []
                    resolve({
                        sub:[],
                        categories:[]
                    })
                })
            }
        },
        //我的收藏歌手
        async reqartistSublist(){
            try {
                let result = await artistSublist()
                this.startSongHand = []
                this.startSongHand.unshift(...result.data.data ?? [])
            } catch (error) {
                this.startSongHand.unshift(...[])
            }
        },
        //我的收藏专辑
        async reqalbumSublist(limit?:number){
            try {
                let result = await albumSublist(limit)
                if(result.data.code == 200){
                    this.startalbum.unshift(...result.data.data ?? [])
                }   
            } catch (error) {
                this.startalbum.unshift(...[])
            }

        },
        //我的关注列表
        async requserFollows(id){
            let result = await userFollows(id,99999999,0)
            console.log(result);
            if (result.data.code == 200) {
                this.followsId = result.data.follow.map(item=>item.userId)
            }
        },
    }
})
interface T {
    leftClickColor: string,
    startDj: number
    createDj: number
    createPlay: number
    startPlay: number
    likes: Array<any>
    FMList: Array<any>
    FMListPrivileges: Array<any>
    FMindex: number
    playList: Array<any>
    playListId: Array<any>
    searchList: Array<any>
    playingList: Array<any> //正在播放的列表
    playingPrivileges: Array<any>   //权限信息
    originalList: Array<any>        //心动原列
    originalPrivileges: Array<any>
    originalsongIndex: number
    playing: number          //正在播放的歌id
    playingindex: number     //正在播放的歌在列表中的下标 + 1
    beforePlayListId: number //上一个播放的歌单id(限自己的歌单暂时)，在开始播放后会变成正在播放的歌单
    //0已下载 -1默认状态 -2本地  -3最近 -4私人FM -5个人排行 -6 top50
    playStatus: string
    detailStatus: string
    isMy: string     //是否是我的歌单
    isMyCreate: boolean
    dragMouse: boolean  //是否拖动
    dragType: string    //拖拽类型
    dragMessage: string //拖拽信息
    dragIndex: number //下标+1
    pageY: number
    mouseDragOnIndex: number //鼠标在哪一个上拖动
    openPlayListId: [number] | []//打开的歌单的单曲id
    heartJump: boolean
    wayIndex: number //播放模式
    likeChange: string   //喜欢列表及时修改
    emojiName: Array<Array<string>>
    clearText: boolean,
    songType: string
    localListPath:string[]
    localListPathFlag:boolean[]
    searchNumber:number
    // immheart:boolean
    searchHistory:string[]
    latelyPlay:any[]
    ciId:number | undefined
    mainId:number | undefined
    dragMessageId:number | undefined
}
export const useMain = defineStore('Main', {
    state: (): T => {
        return {
            leftClickColor: '',
            startDj: 0,
            createDj: 0,
            createPlay: 0,
            startPlay: 0,
            likes: [],
            playList: [],
            playListId: [],
            FMList: [],
            FMListPrivileges: [],
            FMindex: 0,
            searchList: [],
            playingList: [],
            playingPrivileges: [],
            originalList: [],
            originalPrivileges: [],
            originalsongIndex: -1,
            isMy: 'true',
            isMyCreate: false,
            playing: -99999,
            playingindex: -1,
            beforePlayListId: -1,   //0下载 -2本地 -3最近播放 -4私人FM
            playStatus: 'stop',
            detailStatus: 'close',
            dragMouse: false,
            dragType: 'song',
            dragIndex: 0,
            dragMessage: '',
            pageY: 0,
            mouseDragOnIndex: -2,
            openPlayListId: [],
            heartJump: false,
            wayIndex: 0,
            likeChange: ' , ',
            emojiName: [
                ['[大笑]', '[星星]'],
                ['[可爱]', '[生气]'],
                ['[憨笑]', '[便便]'],
                ['[色]', '[强]'],
                ['[亲亲]', '[弱]'],
                ['[惊恐]', '[拜]'],
                ['[流泪]', '[牵手]'],
                ['[亲]', '[跳舞]'],
                ['[呆]', '[禁止]'],
                ['[哀伤]', '[这边]'],
                ['[呲牙]', '[爱意]'],
                ['[吐舌]', '[示爱]'],
                ['[撇嘴]', '[嘴唇]'],
                ['[怒]', '[狗]'],
                ['[奸笑]', '[猫]'],
                ['[汗]', '[猪]'],
                ['[痛苦]', '[兔子]'],
                ['[惶恐]', '[小鸡]'],
                ['[生病]', '[公鸡]'],
                ['[口罩]', '[幽灵]'],
                ['[大哭]', '[圣诞]'],
                ['[晕]', '[外星]'],
                ['[发怒]', '[钻石]'],
                ['[开心]', '[礼物]'],
                ['[鬼脸]', '[男孩]'],
                ['[皱眉]', '[女孩]'],
                ['[流感]', '[蛋糕]'],
                ['[爱心]', '[18]'],
                ['[心碎]', '[圈]'],
                ['[钟情]', '[叉]']
            ],
            clearText: false,
            songType: 'song',
            localListPath:[],
            localListPathFlag:[],
            searchNumber:0,
            searchHistory:[],
            latelyPlay:[],
            ciId:undefined,
            mainId:undefined,
            dragMessageId:undefined,
        }
    },
    actions: {
        //获取用户信息 , 歌单，收藏，mv, dj 数量 是歌单数
        async reqUserSubcount() {
            let result = await userSubcount();
            if (result.data.code == 200) {
                this.startDj = result.data.djRadioCount
                this.createDj = result.data.createDjRadioCount
                this.createPlay = result.data.createdPlaylistCount - 1
                this.startPlay = result.data.subPlaylistCount
                return new Promise((resolve) => {
                    resolve(result)
                })
            }
        },
        //获取用户创建歌单以及用户收藏歌单
        async reqUserPlaylist(uid: string) {
            let result = await UserPlaylist(uid);
            if (result.data.code == 200 && uid == useBasicApi()!.profile!.userId) {
                this.playList = result.data.playlist.map((item,index)=>{
                    item['index'] = index
                    return item 
                })
                this.playListId = []
                this.playList.forEach((element) => {
                    this.playListId.push(element.id)
                })
            }
            return new Promise<AxiosResponse>((resolve) => {
                resolve(result)
            })
        },
        //获取歌单详情页
        async reqPlaylistDetail(id: number | string): Promise<any> {
            let result = await playlistDetail(id);
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        async reqRecursion(id, limit, offset, res) {
            let result = await playlistTrackAll(id, limit, offset);
            console.log(res, limit, offset);
            if (result.data.code === 200) {
              res.data.songs.push(...result.data.songs);
              res.data.privileges.push(...result.data.privileges);
              offset += limit;
              if (result.data.songs.length != 0) {
                return await this.reqRecursion(id, limit, offset, cloneDeep(res));
              } else {
                console.log(res);
                return res;
              }
            } else {
              console.log(res);
              return res;
            }
        },
        //获取歌单全部的歌曲
        async reqPlaylistTrackAll(id: number | string, limit?: string | number, offset?: string | number): Promise<any> {
            console.log(id, limit, offset);
            let result
            if(limit == undefined && offset == undefined){
                result = await this.reqRecursion(id, 1000, 0, {data:{songs:[],privileges:[],code:200}})
                console.log(result);
            }else{
                result = await playlistTrackAll(id, limit, offset);
            }

            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error');
            }
        },
        //调用后可获取歌单详情动态部分,如评论数,是否收藏,播放数
        async reqPlaylistDetailDynamic(id: number | string): Promise<any> {
            let result = (await PlaylistDetailDynamic(id)).data;
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //调用此接口 , 传入用户 id, 可获取已喜欢音乐 id 列表(id 数组)
        async reqUserLike(id: number) {
            let result = (await UserLike(id)).data;
            this.likes = result.ids
            return new Promise((resolve) => {
                resolve(result)
            })
        },
        //获取音乐 url
        async reqSongUrl(id: number, level?: string) {
            let result = await SongUrl(id, level);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //获取歌词
        async reqLyric(id: number): Promise<any> {
            let result = await Lyric(id);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //喜欢这首歌的人也听
        async reqSimiSong(id: number): Promise<any> {
            let result = await simiSong(id);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        async reqSimiPlaylist(id: number): Promise<any> {
            let result = await simiPlaylist(id);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        ///song/detail获取一首歌的详情
        async reqSongDetail(ids: [number]): Promise<any> {
            let result = await songDetail(ids);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //获取歌曲评论
        async reqCommentMusic(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await commentMusic(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //获取歌单评论
        async reqCommentPlaylist(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await commentPlaylist(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //热门评论
        async reqCommentHot(id: number, type: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await commentHot(id, type, limit, offset, before);

            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //新版评论接口
        async reqCommentNew(id: number, type: number, pageNo?: number, pageSize?: number, sortType?: number, cursor?: number): Promise<any> {
            let result = await commentNew(id, type, pageNo, pageSize, sortType, cursor);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //对歌单添加或删除歌曲
        async reqPlaylistTracks(op: 'add' | 'del', pid: number, tracks: number[]): Promise<any> {
            let result = await playlistTracks(op, pid, tracks);
            if (result.data.body.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                return new Promise((resolve) => {
                    resolve(result)
                })
            }
        },
        //调整单曲顺序
        async reqSongOrderUpdate(pid: number, ids: [number]): Promise<any> {
            let result = await songOrderUpdate(pid, ids);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //调整歌单顺序
        async reqPlaylistOrderUpdate(ids: [number]): Promise<any> {
            let result = await playlistOrderUpdate(ids);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //心动模式
        async reqPlaymodeIntelligenceList(id: number, pid: number, sid?: number): Promise<any> {
            let result = await playmodeIntelligenceList(id, pid, sid);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //喜欢歌曲
        async reqLike(id: number, like: boolean): Promise<any> {
            try {
                let result = await likeQ(id, like);
                if (result.data.code == 200) {
                    return new Promise((resolve: any) => {
                        resolve(result)
                    })
                }
            } catch (error) {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            code: '405'
                        }
                    })
                })
            }
        },
        //评论/删除
        async reqcomment(obj: comment.delComment | comment.sendComment): Promise<any> {
            try {
                let result = await comment(obj);
                if (result.data.code == 200) {
                    return new Promise((resolve: any) => {
                        resolve(result)
                    })
                }
            } catch (error) {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            code: '300'
                        }
                    })
                })
            }
        },
        //私人FM
        async reqPersonal_fm(): Promise<any> {
            let result = await personal_fm();
            let arr = result.data.data
            let idArr: any = []
            arr.forEach((val: any) => {
                idArr.push(val.id)
            })
            console.log(idArr);
            result = await this.reqSongDetail(idArr)
            let Need = result.data
            this.FMList.push(...Need.songs)
            this.FMListPrivileges.push(...Need.privileges)
            //缓存图片
            this.FMList.forEach((val: any) => {
                let img = new Image()
                console.log(val.al.picUrl);

                img.src = val.al.picUrl
            })
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //垃圾桶
        async reqFm_trash(id: number): Promise<any> {
            let result = await fm_trash(id)
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //下载url
        async reqSongDlUrl(id: number, br: number) {
            let result = await SongDlUrl(id, br);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //search
        async reqSearch(key:string,type?:string,limit?:number,offset?:number){
            let result = await Search(key,type,limit,offset)
            console.log(result);
            if(type=='1')this.searchNumber = result.data.result.songCount
            if(type=='100')this.searchNumber = result.data.result.artistCount
            if(type=='10')this.searchNumber = result.data.result.albumCount
            if(type=='1000')this.searchNumber = result.data.result.playlistCount
            if(type=='1006')this.searchNumber = result.data.result.songCount
            if(type=='1002')this.searchNumber = result.data.result.userprofileCount
            if(type=='1009')this.searchNumber = result.data.result.djRadiosCount
            if(type=='2000')this.searchNumber = result.data.data.totalCount
            if(this.searchNumber != 0){
                return new Promise<any>((resolve, reject) => {
                    if(type=='1')resolve(result.data.result.songs)
                    if(type=='100')resolve(result.data.result.artists)
                    if(type=='10')resolve(result.data.result.albums)
                    if(type=='1000')resolve(result.data.result.playlists)
                    if(type=='1006')resolve(result.data.result.songs)
                    if(type=='1002')resolve(result.data.result.userprofiles)
                    if(type=='1009')resolve(result.data.result.djRadios)
                    if(type=='2000')resolve(result.data.data.resources)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve([])
                })
            }

        },
        //search suggest
        async reqSearchSuggest(key:string,type?:'mobile'){
            let result = await SearchSuggest(key,type)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data.result)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //创建歌单
        async reqPlayListCreate(name:string,privacy?:number){
            let result = await PlayListCreate(name,privacy)
            if(result.data.code == 200){
                result = await this.reqPlaylistDetail(result.data.id)
                if(result.data.code == 200){
                    return new Promise<any>((resolve, reject) => {
                        resolve(result.data.playlist)
                    })
                }else{
                    return new Promise<any>((resolve, reject) => {
                        resolve({})
                    })
                }
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //修改歌单信息
        async reqUpdatePlayList(index:string,id:number,name:string,desc:string,tags:string){
            let result = await updatePlayList(id,name,desc,tags)
            console.log(result.data['/api/playlist/desc/update'].code);
            console.log(result.data['/api/playlist/tags/update'].code);
            console.log(result.data['/api/playlist/update/name'].code);
            if(
                result.data['/api/playlist/desc/update'].code == 200 &&
                result.data['/api/playlist/tags/update'].code == 200 &&
                result.data['/api/playlist/update/name'].code == 200 
            ){
                let result2 = await this.reqPlaylistDetail(id)
                console.log(result2.data.playlist);
                const playinglist = result2.data.playlist
                delete playinglist['tracks']
                delete playinglist['trackIds']
                this.playList[index] = playinglist
                new Promise<boolean>((resolve, reject) => {
                    resolve(result2)
                })
            }else{
                new Promise<boolean>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqUpdatePlayListTags(index:number,id:number,tags:string){
            let result = await updatePlayListTags(id,tags)
            if(result.data.code == 200){
                this.playList[index].tags = tags.split(';')
                return new Promise<boolean>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<boolean>((resolve, reject) => {
                    reject(false)
                })
            }
        },
        async reqUploadPlaylistPic(id:number,formData:FormData,imgSize:number,imgX:number,imgY:number){
            let result = await uploadPlaylistPic(id,formData,imgSize,imgX,imgY)
            console.log(result.data.data.url);
            console.log(result.data.data);
            console.log(result.data);
            if(result.data.data.code == 200){
                return new Promise<string>((resolve, reject) => {
                    resolve(result.data.data.url)
                })
            }else{
                return new Promise<string>((resolve, reject) => {
                    resolve('')
                })
            }
        },
        //关注动态
        async reqMyEvent(lasttime = -1){
            let result = await MyEvent(lasttime);
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //动态评论
        async reqMyEventComment(threadId:string,limit?:number,offset?:number,before?:number){
            let result = await MyEventComment(threadId,limit,offset,before)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //资源点赞
        async reqLikeResource(id:string | number,type :number,t:1 | any){
            let result = await LikeResource(id,type,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //转发动态
        async reqEventForward(uid:number,evid:number,forwards:string){
            let result = await eventForward(uid, evid, forwards)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //分享
        async reqShareResource(type:string,id:number,msg:string){
            let result = await shareResource(id,type,msg)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }
        },
        //获取城市数据
        async reqCitys(){
            let result = await import('@renderer/assets/level.json');
            console.log(result.default); // json数据
            return new Promise<any>((resolve, reject) => {
                resolve(result.default)
            })
        },
        //修改个人信息
        async reqUserUpdate(form:any){
            let result = await userUpdate(form)
            if(result.data.code == 200){
                return new Promise<boolean>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<boolean>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //头像上传
        async reqUploadAvatar(formData:FormData,imgSize:number,imgX:number,imgY:number){
            let result = await UploadAvatar(formData,imgSize,imgX,imgY)
            console.log(result.data.data.url);
            console.log(result.data.data);
            console.log(result.data);
            if(result.data.data.code == 200){
                return new Promise<string>((resolve, reject) => {
                    resolve(result.data.data.url)
                })
            }else{
                return new Promise<string>((resolve, reject) => {
                    resolve('')
                })
            }
        },
        //
        async reqUserRecord(uid:number,type:1 | 0){
            let result = await UserRecord(uid,type)
            if(result.data.code != 200){
                return new Promise<any[]>((resolve, reject) => {
                    resolve([])
                })
            }else{
                return new Promise<any[]>((resolve, reject) => {
                    resolve(result.data.allData ?? result.data.weekData ?? [])
                })
            }
        },
        async reqAlbumDetailDynamic(id:number){
            let result = await AlbumDetailDynamic(id)
            return new Promise<any>((resolve) => {
                resolve(result)
            })
        },
        async reqAlbum(id:number){
            let result = await Album(id)
            return new Promise<any>((resolve) => {
                resolve(result)
            })
        },
        //详细音乐
        async reqAlbumTrackAll(id: number | string): Promise<any> {
            console.log(id);
            let result = await AlbumTrackAll(id);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error');
            }
        },
        //获取专辑评论
        async reqCommentAlbum(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await commentAlbum(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //歌手及其热门歌曲
        async reqArtists(id:number){
            let result = await artists(id)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        async reqartistAlbum(id:number,limit:number,offset:number){
            let result = await artistAlbum(id,limit,offset)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //歌手描述
        async reqartistDesc(id:number){
            let result = await artistDesc(id)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //相似歌手
        async reqsimiartist(id:number){
            let result = await simiartist(id)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //用户动态
        async requserEvents(id:number,lasttime?:number){
            let result = await userEvents(id,lasttime)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve([])
                })
            }
        },
        //用户关注
        async requserFollows(id,limit,offser){
            let result = await userFollows(id,limit,offser)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve([])
                })
            }
        },
        //用户粉丝
        async requserFolloweds(id,limit,offser){
            let result = await userFolloweds(id,limit,offser)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve([])
                })
            }
        },
        //点赞
        async reqcommentLike (cid:number,options: { id?: number; threadId?: string; },t:1 | 0,type:0|1|2|3|4|5|6|7){
            let result = await commentLike(cid,options,t,type)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(200)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve(400)
                })
            }
        },
        //楼层评论
        async reqCommentFloor(parentCommentId:number,id:number,type:number){
            let result = await CommentFloor(parentCommentId,id,type)
            if(result.data.code == 200){
                return new Promise<{fa:any,time:number,ch:any[]}>((resolve, reject) => {
                    resolve({
                        fa:result.data.data.ownerComment,
                        ch:result.data.data.comments,
                        time:result.data.data.time
                    })
                })
            }else{
                return new Promise<{fa:any,time:number,ch:any[]}>((resolve, reject) => {
                    resolve({
                        fa:{},
                        ch:[],
                        time:0
                    })
                })
            }
        },
        //歌单收藏者
        async reqPlaylistSubscribers(id,limit,offset){
            let result = await playlistSubscribers(id,limit,offset)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        more:result.data.more,
                        list:result.data.subscribers
                    })
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        more:false,
                        list:[]
                    })
                })
            }
        },
        //收藏取消收藏歌单
        async reqPlaylistSubscribe(t:1|2,id:number){
            let result = await PlaylistSubscribe(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //收藏专辑
        async reqAlbumSub(t:1|2,id:number){
            let result = await albumSub(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //关注取关用户
        async reqFollow(id,t){
            let result = await follow(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //收藏歌手
        async reqArtistSub(id,t){
            let result = await artistSub(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //公开隐私歌单
        async reqPlaylistPrivacy (id){
            let result = await playlistPrivacy(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //删除歌单
        async reqPlaylistDelete(id){
            let result = await playlistDelete(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //删除动态
        async reqEventDel(id){
            let result = await eventDel(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //热门top50
        async reqArtistTopSong(id){
            let result = await artistTopSong(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data.songs)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve([])
                })
            }

        },
        //听歌打卡
        async reqScrobble(id,sourceid,time){
            let result = await Scrobble(id,sourceid,time)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqCheckMusic(id,br){
            try {
                let result = await checkMusic(id,br)
                console.log(result,'我是result');
                if(result.data == null){
                    return new Promise<any>((resolve, reject) => {
                        resolve(true)
                    })
                }else{
                    return new Promise<any>((resolve, reject) => {
                        resolve(result.data.success)
                    })
                }
            } catch (error:any) {
                if(error.message == 'Request failed with status code 404'){
                    return new Promise<any>((resolve, reject) => {
                        resolve(true)
                    })
                }
            }
        },
        //电台详情
        async reqDjDetail(rid){
            let result = await djDetail(rid)
            return new Promise<any>((resolve, reject) => {
                resolve(result.data.data)
            })
        },
        //电台列表
        async reqdjProgram(rid,limit,offset){
            let result = await djProgram(rid,limit,offset)
            return new Promise<any>((resolve, reject) => {
                resolve(result.data.programs)
            })
        },
        async djProgramDetail(id){
            let result = await djProgramDetail(id)
            return new Promise<any>((resolve, reject) => {
                resolve(result.data.program)
            })
        },
        //获取DJ评论
        async reqCommentDj(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await commentDj(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //收藏dj
        async reqdjSub(id,t){
            let result = await djSub(id,t)
            if (result.data.code == 200) {
                return new Promise<boolean>((resolve) => {
                    resolve(true)
                })
            } else {
                return new Promise<boolean>((resolve) => {
                    resolve(false)
                })
            }
        },
        async reqdjsuber(id,limit,time){
            let result = await djsuber(id,limit,time)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve({
                        more:result.data.hasMore,
                        list:result.data.subscribers,
                        time:result.data.time
                    })
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve({
                        more:result.data.hasMore,
                        list:result.data.subscribers,
                        time:result.data.time
                    })
                })
            }
        },
        init() {
            this.leftClickColor = '',
                this.startDj = 0,
                this.createDj = 0,
                this.createPlay = 0,
                this.startPlay = 0,
                this.likes = [],
                this.playList = [],
                this.playListId = [],
                this.searchList = [],
                this.playingList = [],
                this.playingPrivileges = [],
                this.originalList = [],
                this.originalPrivileges = [],
                this.originalsongIndex = -1,
                this.isMy = 'true',
                this.isMyCreate = false,
                this.playing = -99999,
                this.playingindex = -1,
                this.beforePlayListId = -1,
                this.playStatus = 'play',
                this.detailStatus = 'close',
                this.dragMouse = false,
                this.dragType = 'song',
                this.dragIndex = 0,
                this.dragMessage = '',
                this.pageY = 0,
                this.mouseDragOnIndex = -2,
                this.openPlayListId = [],
                this.heartJump = false,
                this.wayIndex = 0,
                this.likeChange = ' , '
        }
    },
    persist: [{
        paths: ['localListPath', 'localListPathFlag','searchHistory','latelyPlay'],
    }]
})

interface V {
    oneself: 0 | 1
    loadingMp4Bk: boolean
    closePointOut: boolean   //全局播放提示
    closePointOutMessage: string
    flagLogin: boolean //登录页面
    currentTime: number
    lyricOffset: number
    changeTimeFlag: boolean //修改播放时间
    timeValue: number
    mainScroll: number //主滚动
    scrollToTop: boolean //主滚动条跳转
    lrcScrollSuo: boolean //阻止歌词以滚动的方式跳转
    rubishFlag: boolean //点击垃圾桶
    loginQuit: boolean//退出登录
    downloadFlag: boolean
    downloadLevel: { play: string, download: string, songName: string, id: number }
    loadDefault: boolean
    loadMessageDefaultFlag:boolean //全局提示文本
    loadMessageDefault:string //全局提示文本
    loadMessageDefaultType:'error' | '' //全局提示文本类型
    downloadId: number[]    //下载id
    loadingValue: Map<number, [number, number]> //下载值
    downLoadAll: number //全下指标
    downloadList: { id: number, name: string, level?: string, br?: number, controller: AbortController ,ifcancel:boolean,url:string}[]
    initDownloadButton: boolean
    musicPick:Map<number,Uint8Array[]>
    searchKey:string
    changeMainScroll:number //修改主右滚动条
    addPlayFlag:boolean
    shareDialogFlag:boolean,
    addPlayId:number[] //添加歌曲到新歌单
    share:{
        imgUrl:string
        name:string
        message:string
        type:'song' | 'playlist' | 'mv' | 'djradio' | 'djprogram' | 'artist'| 'noresource' | 'album' | 'comment',
        id:number,
        txt:string,
    },
    delcommentId:number //删除评论id
    playLoacalIndex:number//本地播放下标+1
    delMyPlayListSongIndex:number//右键删除歌单内单曲
    fontList:{name:string}[]
    setting:{
        fontFamily:string
        autoOpen:boolean
        defaultMusic:boolean
        quitmodel:boolean
        playWay:boolean
        quick:string[]
        quickGlobal:string[]
        closeGlWay:boolean
        errGlobal:boolean[]
        opencanvas:boolean
        canvasColor:boolean
        canvasColorRGB:string
        downloadlevel:string
        downloadPath:string
        showCi:boolean
        yinOryi:[boolean,boolean]
        lrcPosition:boolean
        lrcFontFamily:string
        lrcSize:number
        lrcWeigth:'标准' | '加粗'
        lrcBorder:'有描边' | '无描边'
        lrcColor:'默认' | '自定义'
        topColor:string
        bottomColor:string
        borderColor:string
        updataWay:boolean
        updateFlag:boolean
        version:string
        updataUrl:string
        newVersion:string
    }
    clearList:boolean
    radioReady:boolean
    lrcFlag:boolean
    rightClick:boolean //取消左键点击的右键
    delVideo:{
        flag:boolean
        videoId:number
    } //删除视频
    editVideo:{
        flag:boolean
        videoId:number
    }//编辑视频
}
//已开始播放
export const useGlobalVar = defineStore('globalVar', {
    state: (): V => {
        return {
            oneself: 0,
            loadingMp4Bk: false,
            closePointOut: false,
            closePointOutMessage: '',
            flagLogin: false,
            currentTime: 0,
            lyricOffset: 0,
            changeTimeFlag: false,
            timeValue: 0,
            mainScroll: 0,
            scrollToTop: false,
            lrcScrollSuo: false,
            rubishFlag: false,
            loginQuit: false,
            downloadFlag: false,
            downloadLevel: { play: '', download: '', songName: '', id: -1 },
            loadDefault: false,
            loadMessageDefaultFlag:false,
            loadMessageDefault:'',
            loadMessageDefaultType:'',
            downloadId: [],
            loadingValue: new Map(),
            downLoadAll: 0,
            downloadList: [],
            initDownloadButton: false,
            musicPick:new Map(),
            searchKey:'',
            changeMainScroll:0,
            addPlayFlag:false,
            addPlayId:[],
            shareDialogFlag:false,
            share:{
                imgUrl:'',
                message:'',
                type:'noresource',
                id:-1,
                txt:'',
                name:'',
            },
            delcommentId:-1,
            playLoacalIndex:0,
            delMyPlayListSongIndex:-1,
            fontList:[],
            setting:{
                fontFamily:'默认',
                autoOpen:false,
                defaultMusic:false,
                quitmodel:false,
                playWay:false,
                quick:['Ctrl + P','Ctrl + Left','Ctrl+ Right','Ctrl + Up','Ctrl + Down','Ctrl + M','Ctrl + L','Ctrl + D'],
                quickGlobal:['Ctrl + Alt + P','Ctrl + Alt + Left','Ctrl + Alt + Right','Ctrl + Alt + Up','Ctrl + Alt + Down','Ctrl + Alt + M','Ctrl + Alt + L','Ctrl + Alt + D'],
                closeGlWay:false,
                errGlobal:[],
                opencanvas:true,
                canvasColor:true,
                canvasColorRGB:'',
                downloadlevel:'lossless',
                downloadPath:'',
                showCi:false,
                yinOryi:[true,false],
                lrcPosition:true,
                lrcFontFamily:'默认',
                lrcSize:35,
                lrcWeigth:'标准',
                lrcBorder:'无描边',
                lrcColor:'默认',
                topColor:'rgb(255,0,0)',
                bottomColor:'rgb(255,255,0)',
                borderColor:'unset',
                updataWay:true,
                updateFlag:false,
                version:'',
                updataUrl:'',
                newVersion:''
            },
            clearList:false,
            radioReady:false,
            lrcFlag:false,
            rightClick:false,
            delVideo:{
                flag:false,
                videoId:0
            },
            editVideo:{
                flag:false,
                videoId:0
            },
        }
    },
    actions:{

    },
    persist:{
        paths: ['setting'],
    } 
})


export const useNM = defineStore('NM',{
    state: ()=> {
        return {
        }
    },
    actions:{
        async reqLogin() {
            const BaseApi = useBasicApi()
            return new Promise<any>(async(resolve, reject) => {
                try {
                    let res = await NMLoginStatus()
                    if(res.data.code == 200){
                        BaseApi.profile = res.data.profile
                        resolve('ok')
                    }
                } catch (error) {
                    reject(error)
                }
            })
        },
        async reqUserPlaylist(uid) {
            const BaseApi = useBasicApi()
            const Main = useMain()
            return new Promise<any>(async(resolve, reject) => {
                try {
                    let res = await NMUserPlaylist(uid)
                    console.log( res.data,uid, BaseApi!.profile!.userId);
                    
                    if(res.data.code == 200 && uid == BaseApi!.profile!.userId){
                        Main.playList = res.data.playlist.map((item,index)=>{
                            item['index'] = index
                            return item 
                        })
                        Main.playListId = []
                        Main.playList.forEach((element) => {
                            Main.playListId.push(element.id)
                        })
                    }
                    console.log(Main.playList);
                    resolve(res)
                } catch (error) {
                    reject(error)
                }
            })
        },
        async reqUserLike(uid){
            return new Promise<any>(async (resolve, reject) => {
                try {
                    let result = (await NMUserLike(uid)).data;
                    useMain().likes = result.ids
                    resolve(result)
                } catch (error) {
                    reject(error)
                }
            })
        },
        async reqUserSubcount(){
            return new Promise<any>(async(resolve, reject) => {
                try {
                    let result = await NMUserSubcount()
                    const Main = useMain()
                    if (result.data.code == 200) {
                        Main.startDj = 0
                        Main.createDj = 0
                        Main.createPlay = result.data.createdPlaylistCount - 1
                        Main.startPlay = result.data.subPlaylistCount
                        resolve(result)
                    }
                } catch (error) {
                    reject(error)
                }
            })
        },
        async reqartistSublist(){
            const BaseApi = useBasicApi()
            try {
                let result = await NMartistSublist()
                BaseApi.startSongHand = []
                BaseApi.startSongHand.unshift(...result.data.data ?? [])
            } catch (error) {
                BaseApi.startSongHand.unshift(...[])
            }
        },
        async reqalbumSublist(limit?:number){
            const BaseApi = useBasicApi()
            try {
                let result = await NMalbumSublist(limit)
                if(result.data.code == 200){
                    BaseApi.startalbum.unshift(...result.data.data ?? [])
                }   
            } catch (error) {
                BaseApi.startalbum.unshift(...[])
            }
        },
        async requserFollows(id,limit,offset){
            return new Promise<any>(async (resolve, reject) => {
                try {
                    let result = await NMuserFollows(id,limit,offset)
                    if (result.data.code == 200 && limit == 99999999) {
                        useBasicApi().followsId = result.data.follow.map(item=>item.userId)
                    }
                    resolve(result.data)
                } catch (error) {
                    reject(error)
                }
            })
        },
        //对歌单添加或删除歌曲
        async reqPlaylistTracks(op: 'add' | 'del', pid: number, tracks: number[]): Promise<any> {
            let result = await NMplaylistTracks(op, pid, tracks);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                return new Promise((resolve) => {
                    resolve(result)
                })
            }
        },
        //歌单详情动态
        async reqPlaylistDetailDynamic(id){
            return new Promise<any>(async (resolve, reject) => {
                try {
                    let result = await NMPlaylistDetailDynamic(id)
                    if (result.data.code == 200 ) {
                        resolve(result.data)
                    }
                } catch (error) {
                    reject(error)
                }
            })
        },
        async reqPlaylistDetail(id){
            return new Promise<any>(async(resolve,reject) => {
                try {
                    let result = await NMplaylistDetail(id);
                    if(result.data.code == 200){
                        resolve(result)
                    }else{
                        resolve({})
                    }
                } catch (error) {
                    reject(error)
                }

            })
        },
        async reqRecursion(id, limit, offset, res) {
            let result = await NMplaylistTrackAll(id, limit, offset);
            console.log(res, limit, offset);
            if (result.data.code === 200) {
              res.data.songs.push(...result.data.songs);
              res.data.privileges.push(...result.data.privileges);
              offset += limit;
              if (result.data.songs.length != 0) {
                return await this.reqRecursion(id, limit, offset, cloneDeep(res));
              } else {
                console.log(res);
                return res;
              }
            } else {
              console.log(res);
              return res;
            }
        },
        async reqPlaylistTrackAll(id,limit?,offset?){
            console.log(id, limit, offset);
            let result
            if(limit == undefined && offset == undefined){
                result = await this.reqRecursion(id, 1000, 0, {data:{songs:[],privileges:[],code:200}})
                console.log(result);
            }else{
                result = await NMplaylistTrackAll(id, limit, offset);
            }

            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error');
            }
        },
        async reqPlayListCreate(name:string,privacy?:number){
            let result = await NMPlayListCreate(name,privacy)
            if(result.data.code == 200){
                result = await this.reqPlaylistDetail(result.data.id)
                if(result.data.code == 200){
                    return new Promise<any>((resolve, reject) => {
                        resolve(result.data.playlist)
                    })
                }else{
                    return new Promise<any>((resolve, reject) => {
                        resolve({})
                    })
                }
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //修改歌单信息
        async reqUpdatePlayList(index:string,id:number,name:string,desc:string,tags:string){
            let result = await NMupdatePlayList(id,name,desc,tags)
            if(result.data.code == 200){
                let result2 = await this.reqPlaylistDetail(id)
                console.log(result2.data.playlist);
                const playinglist = result2.data.playlist
                useMain().playList[index] = playinglist
                new Promise<boolean>((resolve, reject) => {
                    resolve(result2)
                })
            }else{
                new Promise<boolean>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqUpdatePlayListTags(index:number,id:number,tags:string){
            let result = await NMupdatePlayListTags(id,tags)
            if(result.data.code == 200){
                useMain().playList[index].tags = tags.split(';')
                return new Promise<boolean>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<boolean>((resolve, reject) => {
                    reject(false)
                })
            }
        },
        async reqUploadPlaylistPic(id:number,formData:FormData,imgSize:number,imgX:number,imgY:number){
            let result = await NMuploadPlaylistPic(id,formData,imgSize,imgX,imgY)
            console.log(result.data.data.url);
            console.log(result.data.data);
            console.log(result.data);
            if(result.data.data.code == 200){
                return new Promise<string>((resolve, reject) => {
                    resolve(result.data.data.url)
                })
            }else{
                return new Promise<string>((resolve, reject) => {
                    resolve('')
                })
            }
        },
        async reqPlaylistOrderUpdate(ids: [number]): Promise<any> {
            let result = await NMplaylistOrderUpdate(ids);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        async reqUserUpdate(form:any){
            let result = await NMuserUpdate(form)
            if(result.data.code == 200){
                return new Promise<boolean>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<boolean>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqUploadAvatar(formData:FormData,imgSize:number,imgX:number,imgY:number){
            let result = await NMUploadAvatar(formData,imgSize,imgX,imgY)
            console.log(result.data.data.url);
            console.log(result.data.data);
            console.log(result.data);
            if(result.data.data.code == 200){
                return new Promise<string>((resolve, reject) => {
                    resolve(result.data.data.url)
                })
            }else{
                return new Promise<string>((resolve, reject) => {
                    resolve('')
                })
            }
        },
        //喜欢歌曲
        async reqLike(id: number, like: boolean): Promise<any> {
            try {
                let result = await NMlikeQ(id, like);
                if (result.data.code == 200) {
                    return new Promise((resolve: any) => {
                        resolve(result)
                    })
                }
            } catch (error) {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            code: '405'
                        }
                    })
                })
            }
        },
        async reqSongOrderUpdate(pid: number, ids: [number]): Promise<any> {
            let result = await NMsongOrderUpdate(pid, ids);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
            }
        },
        //公开隐私歌单
        async reqPlaylistPrivacy (id){
            let result = await NMplaylistPrivacy(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //删除歌单
        async reqPlaylistDelete(id){
            let result = await NMplaylistDelete(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqSearch(key:string,type?:string,limit?:number,offset?:number){
            const Main = useMain()
            let result = await NMSearch(key,type,limit,offset)
            console.log(result);
            if(type=='1000')Main.searchNumber = result.data.result.playlistCount
            if(type=='1002')Main.searchNumber = result.data.result.userprofileCount
            if(Main.searchNumber != 0){
                return new Promise<any>((resolve, reject) => {
                    if(type=='1000')resolve(result.data.result.playlists)
                    if(type=='1002')resolve(result.data.result.userprofiles)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve([])
                })
            }

        },
        async reqPlaylistSubscribe(t:1|2,id:number){
            let result = await NMPlaylistSubscribe(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqDetail(id){
            let result = await NMgetDetail(id);
            return new Promise<AxiosResponse>((resolve) => {
                resolve(result)
            })
        },
        async reqPlaylistSubscribers(id,limit,offset){
            let result = await NMplaylistSubscribers(id,limit,offset)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        more:result.data.more,
                        list:result.data.subscribers
                    })
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({
                        more:false,
                        list:[]
                    })
                })
            }
        },
        //每日推荐歌单
        async reqRecommendPlayList() {
            let result = await NMrecommendPlayList();
            console.log(result.data);
            if (result.data.code == 200) {
                useBasicApi().everyDayPlayList = result.data.recommend
                return new Promise((resolve) => {
                    resolve(result.data.recommend)
                })
            }
        },
        async reqFollow(id,t){
            let result = await NMfollow(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async requserFolloweds(id,limit,offser){
            let result = await NMuserFolloweds(id,limit,offser)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve([])
                })
            }
        },
        async reqArtistSub(id,t){
            let result = await NMartistSub(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //收藏专辑
        async reqAlbumSub(t:1|2,id:number){
            let result = await NMalbumSub(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //评论/删除
        async reqcomment(obj: comment.delComment | comment.sendComment): Promise<any> {
            try {
                let result = await NMcomment(obj);
                if (result.data.code == 200) {
                    return new Promise((resolve: any) => {
                        resolve(result)
                    })
                }
            } catch (error) {
                return new Promise((resolve, reject) => {
                    resolve({
                        data: {
                            code: '300'
                        }
                    })
                })
            }
        },
        //获取歌单评论
        async reqCommentPlaylist(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await NMcommentPlaylist(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //点赞
        async reqcommentLike (cid:number,options: { id?: number; threadId?: string; },t:1 | 0,type:0|1|2|3|4|5|6|7){
            let result = await NMcommentLike(cid,options,t,type)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(200)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve(400)
                })
            }
        },
        async reqCommentMusic(id: number, limit?: number, offset?: number, before?: number): Promise<any> {
            let result = await NMcommentMusic(id, limit, offset, before);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                // alert('error')
                console.log(result);
            }
        },
        //楼层评论
        async reqCommentFloor(parentCommentId:number,id:number,type:number){
            let result = await NMCommentFloor(parentCommentId,id,type)
            if(result.data.code == 200){
                return new Promise<{fa:any,time:number,ch:any[]}>((resolve, reject) => {
                    resolve({
                        fa:result.data.data.ownerComment,
                        ch:[],
                        time:0
                    })
                })
            }else{
                return new Promise<{fa:any,time:number,ch:any[]}>((resolve, reject) => {
                    resolve({
                        fa:{},
                        ch:[],
                        time:0
                    })
                })
            }
        },
        async reqShareResource(formData:FormData){
            let result = await NMshareResource(formData)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }
        },
        //关注动态
        async reqMyEvent(lasttime = -1){
            let result = await NMEvent(lasttime);
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        async requserEvents(id:number,lasttime?:number){
            let result = await NMuserEvents(id,lasttime)
            if (result.data.code == 200) {
                return new Promise<any>((resolve) => {
                    resolve(result.data)
                })
            } else {
                return new Promise<any>((resolve) => {
                    resolve([])
                })
            }
        },
        //删除动态
        async reqEventDel(id){
            let result = await NMeventDel(id)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //资源点赞
        async reqLikeResource(id:string | number,t:1 | any){
            let result = await NMLikeResource(id,t)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        //转发动态
        async reqEventForward(uid:number,evid:number,forwards:string){
            let result = await NMeventForward(uid, evid, forwards)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //动态评论
        async reqMyEventComment(threadId:string,limit?:number,offset?:number,before?:number){
            let result = await NMEventComment(threadId,limit,offset,before)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(result.data)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve({})
                })
            }
        },
        //听歌打卡
        async reqScrobble(id,sourceid,time){
            let result = await NMScrobble(id,sourceid,time)
            if(result.data.code == 200){
                return new Promise<any>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<any>((resolve, reject) => {
                    resolve(false)
                })
            }
        },
        async reqUserRecord(uid:number,type:1 | 0){
            let result = await NMUserRecord(uid,type)
            if(result.data.code != 200){
                return new Promise<any[]>((resolve, reject) => {
                    resolve([])
                })
            }else{
                return new Promise<any[]>((resolve, reject) => {
                    resolve(result.data.allData ?? result.data.weekData ?? [])
                })
            }
        },
        async reqCheckNickname(nickname:string){
            let result = (await NMCheckNickname(nickname)).data
            if(result.code == 200){
                return new Promise<boolean>((resolve, reject) => {
                    resolve(true)
                })
            }else{
                return new Promise<boolean>((resolve, reject) => {
                    resolve(false)
                })
            }
        }
    }
})

export const useVideo = defineStore('video', {
    state: () => {
        return {
            loadingVideoId:0,
            loadingVideoFolderId:0
        }
    },
    actions:{

    },
    persist:{

    } 
})
