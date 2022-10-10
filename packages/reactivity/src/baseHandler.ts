import { isOjbect } from "@vue/shared";
import { track,trigger } from "./effect";
import { reactive } from "./reactive";

export const enum ReactiveFlags {
    IS_REACTIVE = '__v_isReactive'
}
export const mutableHandlers = {
    get(target,key,receiver){
        if(key === ReactiveFlags.IS_REACTIVE){
            return true;
        }
        track(target,'get',key)
        let res =  Reflect.get(target,key,receiver);
        if(isOjbect(res)){
            return reactive; //深度代理实现，性能好，取值就可以代理
        }
        return  // Reflect处理this指向问题，让this指向Proxy代理对象
    },
    set(target,key,value,receiver){
        let oldValue = target[key];
        let result = Reflect.set(target,key,value,reactive);
        if(value !== oldValue){//值变化了
            // 要更新
            trigger(target,'set',key,value,oldValue)
        }
        return result
    }
}