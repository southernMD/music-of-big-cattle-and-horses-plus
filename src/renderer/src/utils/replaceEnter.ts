export const replaceEnter = (str:string)=>{
    console.log(str);
    let reg = new RegExp(/\/n\/n/,'g');
    console.log(reg,'<br>');
    return str.replace(reg,'<br>')
}