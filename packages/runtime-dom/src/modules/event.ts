// 实现缓存，只更改不卸载。（性能好）
function createInvoker(callback){
    const invoker = (e) => invoker.value(e);
    invoker.value = callback;
    return invoker;
}

export function patchEvent(el,eventName,nextValue){
    let invokers = el._vei || (el._vei = {});
    let exits = invokers[eventName];
    if(exits && nextValue){
        exits.value = nextValue; //没有卸载函数，只是改了invoker.value属性。
    }else{
        let event = eventName.slice(2).toLowerCase();
        if(nextValue){
            const invoker = invokers[eventName] = createInvoker(nextValue);
            el.addEventListener(event,invoker)
        }else if(exits){//如果有老值，需要将老的绑定事件移除掉。
            el.removeEventListener(event,exits);
            invokers[eventName] = undefined;
        }
    }
}