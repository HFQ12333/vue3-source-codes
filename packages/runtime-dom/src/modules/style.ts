export function patchStyle(el,prveValue,nextValue = {}){
    for(let key in nextValue){
        //用新的直接覆盖。
        el.style[key] = nextValue[key]
    }
    if(prveValue){
        for(let key in prveValue){
            if(nextValue[key] === null){
                el.style[key] = null;
            }
        }
    }
}