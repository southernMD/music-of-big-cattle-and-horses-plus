//歌曲fee字段
// 0: 免费或无版权 | 1: VIP 歌曲 | 4: 购买专辑 | 8: 非会员可免费播放低音质，会员可播放高音质及下载
//暂时不处理 8 
//对1 4 进行处理
//需要对reqSongDlUrl和reqSongUrl接口进行修改
import express, { type Request, type Response } from 'express';
import { getKuwoSongUrl } from './kw';
import log from '../../utils/log';
import { getNeteaseOnlineSearchUrl } from './vSong';

const initUnlockApi = () => {
    const router = express.Router();
    router.get('/', async (req: Request<{ [key: string]: string } >, res: Response) => {
        const { keyword,id,level = 'standard' } = req.query
        if(!keyword || !id){
            res.send({code: 400, message: '参数错误'})
            return
        }
        const url = await getNeteaseOnlineSearchUrl(id as string,level as string) ?? await getKuwoSongUrl(keyword as string);
        log.info("获取到解锁链接"+url)
        res.send({code: 200, url})
        return
    });
    return router;
}

export default initUnlockApi;
 