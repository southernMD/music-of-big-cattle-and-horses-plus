// form GD音乐台(music.gdstudio.xyz)

import log from "../../utils/log"

const br = (str: string) => {
    if (str == 'standard') return 128
    else if (str == 'higher') return 192
    else if (str == 'exhigh') return 320
    else return 999
}
export const getNeteaseOnlineSearchUrl = async (id:string,level:string):Promise<null | string>=>{
    try {
        if (!id) return null;
        const result = await fetch(`https://music-api.gdstudio.xyz/api.php?types=url&id=${id}&br=${br(level)}`).then((data)=>data.json()).catch((e)=>console.log(e));
        log.info("获取到本站链接",result)
        return !result.url ? null : result.url
      } catch (error) {
        return null
      }
}