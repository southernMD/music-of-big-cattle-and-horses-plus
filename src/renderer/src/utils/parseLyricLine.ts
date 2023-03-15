
type T = {
    time: number;
    lyric: any
};

export const parseLyricLine = (str: string = ''): Array<T> => {
    if (str != '') {
        console.log(str);

        let lrc: Array<T> = []
        const timeExp = /(\[(\d{2}):(\d{2}).?(\d{0,3})\])/g;
        str.split("\n")
            .filter((value) => {
                return value.trim() !== "";
            }).map((value) => {
                let t = value.trim().match(timeExp) as RegExpMatchArray
                if (t) {
                    t.forEach((element) => {
                        let result = element.match(/\[(\d{2}):(\d{2}).?(\d{0,3})\]/);
                        if (result) {
                            let time = Number(result[1]) * 60 * 1000 + Number(result[2]) * 1000 + Number(result[3])
                            let lyric = value.substring(value.lastIndexOf(']') + 1)
                            let obj = {
                                time, lyric
                            }
                            lrc.push(obj);
                        }
                    })
                }
            })
        lrc.sort((a, b) => {
            return a.time - b.time;
        })
        return lrc
    } else {
        return []
    }

}
