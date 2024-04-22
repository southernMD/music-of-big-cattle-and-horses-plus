export const modInput = (e:KeyboardEvent,inputRef:HTMLInputElement ,key:string):string=>{
    let st = inputRef.selectionStart || 0
    let end = inputRef.selectionEnd|| 0
    if(e.key.length == 1){
      if(inputRef.selectionStart!=inputRef.selectionEnd){
        key = key.slice(0, st) + e.key +key.slice(end);
        setTimeout(()=>{
          inputRef.focus()
          inputRef.setSelectionRange(st+1,st+1)
        })
      }else{
        key =key.slice(0, st) + e.key  + key.slice(st);
        setTimeout(()=>{
          inputRef.focus()
          inputRef.setSelectionRange(st+1,st+1)
        })
      }
    }else if(e.key == 'Backspace' || e.key == 'Delete'){
      if(st!=end){
        key = key.slice(0, st) + key.slice(end);
        setTimeout(()=>{
          inputRef.focus()
          inputRef.setSelectionRange(st,st)
        })
      }else{
        if(e.key == 'Backspace' && st > 0){
          key = key.slice(0, st - 1) + key.slice(st);
          setTimeout(()=>{
            inputRef.focus()
            inputRef.setSelectionRange(st-1,st-1)
          })
        }else if(e.key == 'Delete' && end < key.length){
          key = key.slice(0, st) + key.slice(st + 1);
          setTimeout(()=>{
            inputRef.focus()
            inputRef.setSelectionRange(st,st)
          })
        }
      }
  
    }else if(e.key == 'ArrowLeft' ){
      if(st != end){
        inputRef.setSelectionRange(st,st)
      }else{
        let p = st-1 <=0?0:st-1
        inputRef.setSelectionRange(p,p)
      }
      
    }else if(e.key == 'ArrowRight'){
      if(st != end){
        inputRef.setSelectionRange(end,end)
      }else{
        inputRef.setSelectionRange(st+1,st+1)
      }
    }
    return key
}
