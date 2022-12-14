import { isFunction, isOjbect } from "@vue/shared";
import { ReactiveEffect } from "./effect";
import { isReactive } from "./reactive";

//
function traversal(value,set = new Set()){//考虑如果对象中有循环引用的问题。
    // 第一步递归要有终结条件，不是对象就不递归了。
    if(!isOjbect) return value;
    if(set.has(value)) return value;
    set.add(value);
    for(let key in value){
        traversal(value[key]);
    }
    return value;
}
// source是用户传入的对象，cb是对应的用户的回调。
export function watch(source,cb){
    let getter;
    if(isReactive(source)){
        // 对用户传入的数据进行循环（递归循环，只要循环就会访问对象上的每一个属性，访问属性的时候会收集）
        getter = () => traversal(source);
    }else if(isFunction(source)){
        getter = source;
    }else{
        return;
    }
    let cleanup;
    const onCleanup = (fn) => {
        cleanup = fn;//保存用户的函数
    }
    let oldValue;
    const job = () => {
        if(cleanup) cleanup();//下一次watch开始触发上一次watch的清理。
        const newValue = effect.run();
        cb(newValue,oldValue,onCleanup);//第一次给了用户onCleanup函数，用户执行后传入来一个参数（是函数）后存起来，第二次则执行cleanup().
        oldValue = newValue;
    }
    // 在effect中访问属性就会依赖收集。
    const effect = new ReactiveEffect(getter,job);//监控自己构造的函数，变化后重新执行job
    oldValue = effect.run();
}