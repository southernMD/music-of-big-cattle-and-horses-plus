import dayjs from 'dayjs'

export const dayjsStamp = (time:number)=>{
    return dayjs(time).format('YYYY-MM-DD')
}

export const dayjsMMSS = (time:number)=>{
   return dayjs(0).millisecond(time).format('mm:ss')
}
export const dayjsSMMSS = (time:number)=>{
    return dayjs(0).second(time).format('mm:ss')
}

export const dayjsCN = (time:number)=>{
    return dayjs(time).format('YYYY年M月D日 HH:ss')
}