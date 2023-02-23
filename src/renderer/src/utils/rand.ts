export const rand = (m:number,n:number,repeat:number = -1):number =>{
    return noRepeat(m,n,repeat);
}

function noRepeat(m:number,n:number,repeat:number = -1):number{
    let t = Math.ceil(Math.random() * (n-m+1)) + m-1;
    if(t == repeat){
        return noRepeat(m,n,repeat);
    }else{
        return t
    }
}