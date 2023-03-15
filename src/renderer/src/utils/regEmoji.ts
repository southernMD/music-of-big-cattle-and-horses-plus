import {getAssetsFile} from './importSVG'
const emojiName=[
    ['[大笑]','[星星]'],
    ['[可爱]','[生气]'],
    ['[憨笑]','[便便]'],
    ['[色]','[强]'],
    ['[亲亲]','[弱]'],
    ['[惊恐]','[拜]'],
    ['[流泪]','[牵手]'],
    ['[亲]','[跳舞]'],
    ['[呆]','[禁止]'],
    ['[哀伤]','[这边]'],
    ['[呲牙]','[爱意]'],
    ['[吐舌]','[示爱]'],
    ['[撇嘴]','[嘴唇]'],
    ['[怒]','[狗]'],
    ['[奸笑]','[猫]'],
    ['[汗]','[猪]'],
    ['[痛苦]','[兔子]'],
    ['[惶恐]','[小鸡]'],
    ['[生病]','[公鸡]'],
    ['[口罩]','[幽灵]'],
    ['[大哭]','[圣诞]'],
    ['[晕]','[外星]'],
    ['[发怒]','[钻石]'],
    ['[开心]','[礼物]'],
    ['[鬼脸]','[男孩]'],
    ['[皱眉]','[女孩]'],
    ['[流感]','[蛋糕]'],
    ['[爱心]','[18]'],
    ['[心碎]','[圈]'],
    ['[钟情]','[叉]']
]
let i = 0
export const regEmoji = (str:string):string=>{
    if(str){
        let reg = new RegExp(/\[[0-9\u4e00-\u9fa5]{1,2}\]/,'g');
        let regOne = new RegExp(/\[[0-9\u4e00-\u9fa5]{1,2}\]/);
        let arr = str.match(reg);
        const map:Array<string | number> = [];
        if(arr){
            arr.forEach((value,index)=>{
                map.push(searchIndex(value))
            })
            for (let j = 0;j<map.length;j++){
                str = str.replace(regOne,repValue(map))
            }
        }
        i = 0
        return str
    }else{
        return ''
    }

}

const searchIndex = (str:string):number | string=>{
    console.log(str);
    
    for(let i = 0;i<emojiName.length;i++){
       if(emojiName[i][0] == str){
            return i + 1
       }else if(emojiName[i][1] == str){
            return i + 30 + 1
       }
    }
    return str
}

const repValue = (map:Array<string | number>):string=>{
    if(typeof map[i] == 'string'){
        return map[i++] as string
    }else{
        console.log(map[i]);
      let t = getAssetsFile(`emoji_${map[i]}.svg`)
      i++
      return `<img src="${t}" draggable="false" style="transform: translateY(5px);  ">`
    }
}