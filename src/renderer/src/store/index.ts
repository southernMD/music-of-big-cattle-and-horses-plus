import { defineStore } from 'pinia'
// import { Names } from "./store-name";
import {
    qrKey, QrImage, QrCheck, Login,
    getDetail, quitLogin, userSubcount, Anonimous, UserPlaylist,
    playlistDetail, playlistTrackAll, PlaylistDetailDynamic, UserLike,
    SongUrl, Lyric, simiSong, simiPlaylist, songDetail, commentMusic, commentNew, commentHot,
    playlistTracks, songOrderUpdate, playlistOrderUpdate, playmodeIntelligenceList, likeQ, commentPlaylist,
    comment, recommendSongs, recommendPlayList, programRecommend, djProgramToplist,
    personal_fm, fm_trash, userDj, startDj, SongDlUrl,Search, SearchSuggest
} from '../api/index';
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
            primaryColor: ''
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
            createDjArr: []
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
            let result2: any = await this.reqDetail()
            this.profile = result2.data.profile
            return new Promise((resolve) => {
                resolve(this.account)
            })
        },
        //获取详细信息
        async reqDetail() {
            let result = await getDetail(this.account?.id);
            return new Promise((resolve) => {
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
                alert('error')
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
                alert('error')
            }
        }
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
            searchHistory:[]
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
            if (result.data.code == 200) {
                this.playList = result.data.playlist
                this.playList.forEach((element) => {
                    this.playListId.push(element.id)
                })
            }
            return new Promise((resolve) => {
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
        //获取歌单全部的歌曲
        async reqPlaylistTrackAll(id: number | string, limit?: string | number, offset?: string | number): Promise<any> {
            console.log(id, limit, offset);
            let result = await playlistTrackAll(id, limit, offset);
            console.log(result);

            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                alert('error');
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
                alert('error')
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
                alert('error')
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
                alert('error')
            }
        },
        async reqSimiPlaylist(id: number): Promise<any> {
            let result = await simiPlaylist(id);
            if (result.data.code == 200) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
            }
        },
        //对歌单添加或删除歌曲
        async reqPlaylistTracks(op: 'add' | 'del', pid: number, tracks: number): Promise<any> {
            let result = await playlistTracks(op, pid, tracks);
            if (result.data.body.code == 200 || result.data.body.code == 502) {
                return new Promise((resolve) => {
                    resolve(result)
                })
            } else {
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
                alert('error')
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
            if(this.searchNumber != 0){
                return new Promise<any>((resolve, reject) => {
                    if(type=='1')resolve(result.data.result.songs)
                    if(type=='100')resolve(result.data.result.artists)
                    if(type=='10')resolve(result.data.result.albums)
                    if(type=='1000')resolve(result.data.result.playlists)
                    if(type=='1006')resolve(result.data.result.songs)
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
        paths: ['localListPath', 'localListPathFlag','searchHistory'],
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
    downloadId: number[]    //下载id
    loadingValue: Map<number, [number, number]> //下载值
    downLoadAll: number //全下指标
    downloadList: { id: number, name: string, level?: string, br?: number, controller: AbortController ,ifcancel:boolean,url:string}[]
    initDownloadButton: boolean
    musicPick:Map<number,Uint8Array[]>
    searchKey:string
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
            downloadId: [],
            loadingValue: new Map(),
            downLoadAll: 0,
            downloadList: [],
            initDownloadButton: false,
            musicPick:new Map(),
            searchKey:''
        }
    }
})