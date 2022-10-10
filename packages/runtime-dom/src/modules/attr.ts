
export function patchAttr(el,key,nextValue){
    if(nextValue){
        el.setAttribute(el,nextValue)
    }else{
        el.removeAttribute(key);
    }   
}