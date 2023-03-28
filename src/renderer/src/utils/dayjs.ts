import dayjs from 'dayjs'
import { format } from 'timeago.js';

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

export const Timeago = (timestamp:number)=>{
    const now = Date.now();
    const diff = now - timestamp;
    const ONE_WEEK = 7 * 24 * 60 * 60 * 1000;
    if (diff < ONE_WEEK) {
      return format(timestamp,'zh_CN');
    } else {
      return dayjs(timestamp).format('YYYY-MM-DD');
    }
}