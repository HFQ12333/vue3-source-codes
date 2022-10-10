import { isOjbect } from "@vue/shared";
import { mutableHandlers, ReactiveFlags } from "./baseHandler";
// 将数据转化成响应式的数据，只能做对象的代理。
const reactiveMap = new WeakMap();//key只能是对象

// 将数据通过Proxy进行代理
// 实现同一个对象代理多次，返回同一个代理。
// 代理对象被再次调用，可以直接返回。
export function isReactive(value){
    return !!(value && value[ReactiveFlags.IS_REACTIVE])
}
export function reactive(target:any){
    if(!isOjbect(target)){
        return
    }
    if(target[ReactiveFlags.IS_REACTIVE]){ //如果目标是一个代理对象，那么一定被代理过了，会走get
        return target
    }
    // 并没有重新定义属性，只是代理，在取值的时候会调用get，当赋值的时候会调用set
    let exisitingProxy = reactiveMap.get(target)
    if(exisitingProxy){
        return exisitingProxy
    }
    // 第一次普通对象代理，我们会通过new Proxy代理一次
    // 下一次你传递的是proxy我们可以看一下他有没有代理过，如果访问这个proxy，有get方法的时候说明就访问过了
    const proxy = new Proxy(target,mutableHandlers)
    reactiveMap.set(target,proxy)
    return proxy
}