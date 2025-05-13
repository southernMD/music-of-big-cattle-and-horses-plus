/*
    from 
    https://github.com/UnblockNeteaseMusic/server/blob/enhanced/src/provider/kuwo.js
*/

import log from "../../utils/log";
import { encryptQuery } from "./kwDES";
import stringSimilarity from "string-similarity";
const getKuwoSongId = async (keyword: string): Promise<string | null> => {
    try {
        const result = await fetch(`http://search.kuwo.cn/r.s?&correct=1&stype=comprehensive&encoding=utf8&rformat=json&mobi=1&show_copyright_off=1&searchapi=6&all=${keyword}`).then(res => res.json()).catch((err) => console.log(err))
        log.info("获取到酷我搜索结果" + result)
        if (
            !result ||
            result.content.length < 2 ||
            !result.content[1].musicpage ||
            result.content[1].musicpage.abslist.length < 1
        ) {
            return null;
        }
        // 获取歌曲信息
        const songId:string = result.content[1].musicpage.abslist[0].MUSICRID;
        const songName:string = result.content[1].musicpage.abslist[0]?.SONGNAME;
        const originalName = keyword?.split("-") ?? keyword;
        log.info("歌曲名",songName,"原歌曲名",originalName[0],"相似度",stringSimilarity.compareTwoStrings(songName, originalName[0]))
        if (!songName && stringSimilarity.compareTwoStrings(songName, originalName[0]) < 0.50 && !songName.includes(originalName[0]) && !originalName[0].includes(songName)) return null;
        return songId.slice("MUSIC_".length);
    } catch (error) {
        return null;
    }
};

export const getKuwoSongUrl = async (keyword: string): Promise<string | null> => {
    try {
        keyword = keyword.replaceAll(" - ","-")
        if (!keyword) return null;
        const songId = await getKuwoSongId(keyword);
        log.info("获取到songId", songId);
        if (!songId) return null;
        // 请求地址
        const PackageName = "kwplayer_ar_5.1.0.0_B_jiakong_vh.apk";
        const url =
            "http://mobi.kuwo.cn/mobi.s?f=kuwo&q=" +
            encryptQuery(
                `corp=kuwo&source=${PackageName}&p2p=1&type=convert_url2&sig=0&format=mp3` +
                "&rid=" +
                songId,
            );
        const result = await fetch(url, {
            headers: {
                "User-Agent": "okhttp/3.10.0",
            },
        })
            .then((response) => {
                return response.text()
            })
            .then((data) => {
                return data.match(/http[^\s$"]+/)?.[0]
            })
            .catch((err) => {
                log.info("解锁失败", err)
                return null;
            });
        log.info("解锁完后的结果是", result)
        if (result) return result
        return null
    } catch (error) {
        console.info(error)
        return null
    }
};
