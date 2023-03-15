export const numberSimp = (number:number):string=>{
    if(number >= 100000000) return `${Math.floor(number/100000000)}亿`
    else if(number >= 10000) return `${Math.floor(number/10000)}万`
    else return `${number}`
}