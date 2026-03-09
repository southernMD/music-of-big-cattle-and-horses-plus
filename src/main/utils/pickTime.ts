export const pickTime = (time: string) => {
    let hao = +time.split('.')[1]
    let shi = +time.split(':')[0]
    let feng = +time.split(':')[1]
    let miao = +time.split(':')[2].split('.')[0]

    return +(shi * 60 * 60 * 100 + feng * 60 * 100 + miao * 100 + hao).toFixed(2)
}